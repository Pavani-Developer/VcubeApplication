from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken
from django.utils import timezone
from datetime import timedelta
from .models import StudentData, PermissionsData, SendOTP
from .serializers import StudentDataSerializer, SendOTPSerializer
from .decorators import token_required
from cryptography.fernet import Fernet
from django.http import JsonResponse
import mysql.connector
from mysql.connector import Error
import os
import json
from dotenv import load_dotenv
load_dotenv()
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
import random
import string


cipher_suite = Fernet(os.getenv('STUDENT_CONFIG_KEY'))

def encrypt_data(data):
    json_data = json.dumps(data)
    return cipher_suite.encrypt(json_data.encode())

class StudentLoginView(APIView):

    def post(self, request):
        email = request.data.get('Username')
        course = request.data.get('Course')

        if not email:
            return Response({"error": "Username required"}, status=status.HTTP_400_BAD_REQUEST)

        if StudentData.objects.count() == 0:
            return Response({"error": "No students found"}, status=status.HTTP_404_NOT_FOUND)

        filter_criteria = Q(Course=course) & Q(Email=email)
        student_query = StudentData.objects.filter(filter_criteria).first()
        if student_query:
            try:
                if student_query.Permission == 'Access':
                    if student_query.Status == 'Active':
                        refresh = RefreshToken.for_user(student_query)
                        access_token = str(refresh.access_token)
                        csrfToken = get_token(request)
                        return Response({
                            'user': student_query.id,
                            'access': access_token,
                            'csrf': csrfToken
                        }, status=status.HTTP_202_ACCEPTED)
                    else:
                        return Response({'error':'Account discontinued'}, status=status.HTTP_406_NOT_ACCEPTABLE) 
                else:
                    return Response({'error':'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            except json.JSONDecodeError:
                return Response({"error": "Error decoding JSON data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"error": "Invalid Details"}, status=status.HTTP_401_UNAUTHORIZED)

class CheckStudentMailView(APIView):
    
    def post(self, request):
        username = request.data.get('Username')
        course = request.data.get('Course')

        if not course:
            return Response({'error': 'Course is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not username:
            return Response({'error': 'Username (email or phone) is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            filter_criteria = Q(Course=course) & (
                Q(Email=username) | Q(Phone=username)
            )
            
            student = StudentData.objects.filter(filter_criteria).first()
            
            if student:
                if student.Status == 'Active':
                    if student.Permission == 'Access':
                        student_data = {
                            'Batchname': student.BatchName,
                            'Email': student.Email
                        }
                        return Response(student_data, status=status.HTTP_200_OK)
                    else:
                        return Response({'error':'Access denied'}, status=status.HTTP_403_FORBIDDEN)
                else:
                    return Response({'error':'Account discontinued'}, status=status.HTTP_406_NOT_ACCEPTABLE) 
            else:
                return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(token_required, name='dispatch')
class StudentDataListView(APIView):

    def post(self, request, id):
        try:
            student = StudentData.objects.get(id=id)
 
            serializer = StudentDataSerializer(student)
            
            return Response({"studentDetails": serializer.data}, status=status.HTTP_200_OK)
        
        except StudentData.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
class StudentDataUpdateView(APIView):
    
    def put(self, request, id):
        try:
            student = StudentData.objects.get(id=id)
        except StudentData.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            personal_info = json.loads(student.Personal_Info)
            joining_date_str = personal_info.get('Joining_Date')
            if not joining_date_str:
                return Response({"error": "Joining_Date not found in student data"}, status=status.HTTP_400_BAD_REQUEST)

            joining_date = timezone.datetime.strptime(joining_date_str, '%d-%b-%Y').date()
        except (json.JSONDecodeError, ValueError) as e:
            return Response({"error": "Error parsing Joining_Date"}, status=status.HTTP_400_BAD_REQUEST)

        update_end_date = joining_date + timedelta(days=90)

        today = timezone.now().date()
        if today > update_end_date:
            return Response({"error": "Access denied: Updates are only allowed within 3 months from Joining_Date"}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentDataSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Student updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
@method_decorator(token_required, name='dispatch')
class CheckStudentAuthView(APIView):
    
    def post(self, request):
        token = request.headers.get('Authorization')
                
        if not token or not token.startswith('Bearer '):
            return Response({'detail': 'Token not provided or invalid format.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = token.split(' ')[1]
        try:
            AccessToken(token)
        except Exception as e:
            return Response({'is_authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

        csrf_token_from_request = request.headers.get('X-CSRFToken')

        if  csrf_token_from_request is None:
            return Response({'detail': 'Invalid CSRF token.'}, status=status.HTTP_403_FORBIDDEN)
        
        id = request.data.get('id')
        
        student = StudentData.objects.get(id=id)
        permission = PermissionsData.objects.get(Course=student.Course, BatchName=student.BatchName)
        
        if permission.Login_Access != 'Access':
            return Response({'detail': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        if student.Permission != 'Access' or student.Status != 'Active':
            return Response({'detail': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'is_authenticated': True}, status=status.HTTP_200_OK)
    

@method_decorator(token_required, name='dispatch')    
class StudentConfigDataView(APIView):

    def post(self, request, id, *args, **kwargs):
        config_data = request.data.get('student_config')

        if not id or not config_data:
            return JsonResponse({"status": "error", "message": "Student ID and configuration data are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        required_fields = ['host', 'database', 'username', 'password', 'port']
        missing_fields = [field for field in required_fields if field not in config_data or not config_data[field]]

        if missing_fields:
            return JsonResponse({"status": "error", "message": f"All fields are required. Please fill all fields: {', '.join(missing_fields)}."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print('First')
            conn_params = {
                'host': config_data.get('host'),
                'database': config_data.get('database'),
                'user': config_data.get('username'),
                'password': config_data.get('password'),
                'port': config_data.get('port', 3306)
            }

            try:
                connection = mysql.connector.connect(**conn_params)
                if connection.is_connected():
                    connection.close()
                else:
                    print('Failed to connect to the database')
                    return JsonResponse({"status": "error", "message": "Failed to connect to the database"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Error as e:
                print(str(e))
                return JsonResponse({"status": "error", "message": f"Database connection error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(str(e))
            return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            print('Last')
            student_data = StudentData.objects.get(id=id)
            if student_data:
                encrypted_config = encrypt_data(config_data)
                student_data.Student_Config = encrypted_config
                student_data.save()
                return JsonResponse({"status": "success", "message": "Configuration saved successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": "error", "message": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(str(e))
            return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
