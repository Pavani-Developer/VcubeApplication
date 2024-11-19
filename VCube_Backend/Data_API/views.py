import json
import os
import random
from django.core.mail import send_mail
from rest_framework import status
from django.conf import settings
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
load_dotenv()
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UsersLoginData, SendOTP    
from .serializers import SendOTPSerializer
from rest_framework.response import Response
from rest_framework import status
from django.middleware.csrf import get_token
from django.http import JsonResponse


def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
def User_Count(request):
    if request.method == 'GET':
        count = UsersLoginData.objects.count()
        return Response({'users_count' : count},status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        

@method_decorator(csrf_exempt, name='dispatch')
class ValidateOTPView(APIView):

    def post(self, request, user_id):
        try:
            users = SendOTP.objects.filter(User_Id=user_id)

            if not users.exists():
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            total_users = users.count()

            if total_users > 1:
                newest_user = users.order_by('-id').first()

                users.exclude(id=newest_user.id).delete()
                
            user = SendOTP.objects.filter(User_Id=user_id).first()

            if request.data.get('OTP') == user.OTP:
                user.delete()
                return Response(status=status.HTTP_202_ACCEPTED)
            else:
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        except Exception as e:
            user.delete()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
    
        
@method_decorator(csrf_exempt, name='dispatch')
class SendMailView(APIView):

    def post(self, request):
        try:
            data = json.loads(request.body)
            Title = data.get('Title')
            Mail = data.get('Mail')
            if data.get('Method') == 'OTP':
                OTP = str(random.randint(100000, 999999))
            else:
                OTP = data.get('OTP')
            Name = data.get('Name')

            otp_data = {
                'User_Id': data.get('User_Id'),
                'OTP': OTP
            }

            if data.get('Method') == 'OTP':
                otp_records = SendOTP.objects.filter(User_Id=otp_data['User_Id'])
    
                if otp_records.exists():
                    otp_records.delete()
                    
                serializer = SendOTPSerializer(data=otp_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            if Title == 'OTP for Resetting Your Account Password':
                msg = os.getenv('DJANGO_MAIL_FORGOT_PASSWORD_MESSAGE')
            elif Title == 'Your Username for Account Access':
                msg = os.getenv('DJANGO_MAIL_FORGOT_USERNAME_MESSAGE')
            elif Title == 'OTP for to Create Super User':
                msg = os.getenv('DJANGO_MAIL_CREATE_SUPER_USER_OTP_MESSAGE')
            elif Title == 'OTP for Authentication Access':
                msg = os.getenv('DJANGO_MAIL_STUDENT_AUTH_OTP_MESSAGE')
            elif Title == 'OTP for Login Authentication':
                msg = os.getenv('DJANGO_MAIL_STUDENT_LOGIN_OTP_MESSAGE')
            elif Title == 'OTP for Creating Your Drive Password':
                msg = os.getenv('DJANGO_MAIL_CREATE_VAULT_PASSWORD_MESSAGE')
            elif Title == 'New Message From VCube Software Solutions':
                msg = os.getenv('DJANGO_MAIL_STUDENT_MESSAGE_MAIL')
            elif Title == 'Your Performance Overview Report is Here.':
                msg = os.getenv('DJANGO_MAIL_STUDENT_REPORT_MAIL')
            else:
                return Response({"error": "Invalid title provided."}, status=status.HTTP_400_BAD_REQUEST)

            if Title == 'New Message From VCube Software Solutions':
                Message = f'''Dear {Name},
                
{msg.split('~')[0]}{OTP.split('~')[0]}

{msg.split('~')[1]} 
            
{msg.split('~')[2]} 

{msg.split('~')[3]} 

{msg.split('~')[4]} 
{msg.split('~')[5]}
'''
            elif Title == 'Your Performance Overview Report is Here.':
                Message = f'''Dear {Name},
                
{msg.split('~')[0]}

{msg.split('~')[1]} 

{OTP.split('~')[0]}
            
{msg.split('~')[2]} 

{msg.split('~')[3]} 

{msg.split('~')[4]} 
{msg.split('~')[5]}
'''
            else:
                Message = f'''Dear {Name},
            
{msg.split('~')[0]}

Your Code: {OTP.split('~')[0]}

{msg.split('~')[1]} 
            
{msg.split('~')[2]} 

{msg.split('~')[3]} 
{msg.split('~')[4]}
'''
                
            send_mail(
                Title,
                Message,
                settings.EMAIL_HOST_USER,
                [Mail],
                fail_silently=False
            )
            return Response(status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
