from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .decorators import token_required
from django.shortcuts import get_object_or_404
from .models import (
    BatchData,
    BatchAttendance,
    StudentData,
    StudentAttendance,
    CoursesData,
    AdminMessages,
    BatchMessagesData,
    StudentMessagesData,
    CourseFeedbackData,
    PlacementFeedbackData,
    PlacementPosts,
    BatchToStudentMessagesData,
    AssessmentQuestionsData,
    ClassRecordingsData,
    StudentWatchTimeData,
    PermissionsData,
    FeedbackFormLists,
    ReportData,
    StudentWeeklyTestResults,
    StudentRequests
)
from .serializers import (
    BatchDataSerializer,
    BatchAttendanceSerializer,
    StudentDataSerializer,
    StudentAttendanceSerializer,
    CourseDataSerializer,
    AdminMessagesSerializer,
    BatchMessagesDataSerializer,
    StudentMessagesDataSerializer,
    CourseFeedbackDataSerializer,
    PlacementFeedbackDataSerializer,
    PlacementPostsDataSerializer,
    BatchToStudentMessagesDataSerializer,
    AssessmentQuestionsDataSerializer,
    ClassRecordingsDataSerializer,
    StudentWatchTimeDataSerializer,
    PermissionsDataSerializer,
    FeedbackFormListsSerializer,
    ReportDataSerializer,
    StudentWeeklyTestResultsSerializer,
    StudentRequestsSerializer
)



@method_decorator(token_required, name='dispatch')
class ManagingDataView(APIView):

    model_mapping = {
        'batch_data': (BatchData, BatchDataSerializer),
        'batch_attendance': (BatchAttendance, BatchAttendanceSerializer),
        'student_data': (StudentData, StudentDataSerializer),
        'student_attendance': (StudentAttendance, StudentAttendanceSerializer),
        'courses_data': (CoursesData, CourseDataSerializer),
        'admin_messages': (AdminMessages, AdminMessagesSerializer),
        'batch_messages': (BatchMessagesData, BatchMessagesDataSerializer),
        'student_messages': (StudentMessagesData, StudentMessagesDataSerializer),
        'course_feedback': (CourseFeedbackData, CourseFeedbackDataSerializer),
        'placement_feedback': (PlacementFeedbackData, PlacementFeedbackDataSerializer),
        'placements_posts': (PlacementPosts, PlacementPostsDataSerializer),
        'batch_to_student_messages': (BatchToStudentMessagesData, BatchToStudentMessagesDataSerializer),
        'assessment_questions': (AssessmentQuestionsData, AssessmentQuestionsDataSerializer),
        'class_recordings' : (ClassRecordingsData, ClassRecordingsDataSerializer),
        'student_watchtime' : (StudentWatchTimeData, StudentWatchTimeDataSerializer),
        'permissions_data' : (PermissionsData, PermissionsDataSerializer),
        'feedbackforms-list' : (FeedbackFormLists, FeedbackFormListsSerializer),
        'report-data' : (ReportData, ReportDataSerializer),
        'weekly-test-results' : (StudentWeeklyTestResults, StudentWeeklyTestResultsSerializer),
        'weekly-test-requests' : (StudentRequests, StudentRequestsSerializer)
    }

    def get_model_and_serializer(self, model_name):
        return self.model_mapping.get(model_name)

    
    def get(self, request, model_name=None, id=None, course=None):
        model, serializer_class = self.get_model_and_serializer(model_name)
        
        if not model:
            return Response({"detail": "Model not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if id is not None:
            try:
                if model_name in ['student_attendance', 'student_watchtime', 'batch_to_student_messages','weekly-test-results','weekly-test-requests']:
                    instances = model.objects.filter(StudentId=id)
                elif model_name == 'batch_attendance':
                    instances = model.objects.filter(BatchID=id)
                else:
                    instance = model.objects.get(pk=id)
                    instances = [instance]
                serializer = serializer_class(instances, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except model.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if course:
            queryset = model.objects.filter(Course=course)
        else:
            queryset = model.objects.all()

        serializer = serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, model_name):
        model, serializer_class = self.get_model_and_serializer(model_name)

        if not model:
            return Response({"detail": "Model not found."}, status=status.HTTP_404_NOT_FOUND)

        if isinstance(request.data, dict):
            data = [request.data]
        elif isinstance(request.data, list):
            data = request.data
        else:
            return Response({"detail": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)

        serializers = [serializer_class(data=item) for item in data]
        errors = []

        for serializer in serializers:
            if serializer.is_valid():
                serializer.save()
                if model_name == 'batch_data':
                    res = addBatchPermissions(serializer.validated_data)
                    if not res:
                        errors.append({"detail": f"Failed to add permissions for {serializer.validated_data}."})
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "All items created successfully."}, status=status.HTTP_201_CREATED)

    def put(self, request, model_name):
        model, serializer_class = self.get_model_and_serializer(model_name)
        
        if not model:
            return Response({"detail": "Model not found."}, status=status.HTTP_404_NOT_FOUND)

        if isinstance(request.data, dict):
            data = [request.data]
        elif isinstance(request.data, list):
            data = request.data
        else:
            return Response({"detail": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        updated_instances = []

        for item in data:
            object_id = item.get('id')
            if object_id is None:
                errors.append({"detail": "ID not provided."})
                continue
            
            instance = get_object_or_404(model, pk=object_id)
            serializer = serializer_class(instance=instance, data=item)

            if serializer.is_valid():
                serializer.save()
                updated_instances.append(serializer.data)
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"updated_instances": updated_instances}, status=status.HTTP_200_OK)

    def patch(self, request, model_name):
        model, serializer_class = self.get_model_and_serializer(model_name)

        if not model:
            return Response({"detail": "Model not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if isinstance(request.data, dict):
            data = [request.data]
        elif isinstance(request.data, list):
            data = request.data
        else:
            return Response({"detail": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        updated_instances = []

        for item in data:
            object_id = item.get('id')
            if object_id is None:
                errors.append({"detail": "ID not provided."})
                continue
            
            instance = get_object_or_404(model, pk=object_id)
            serializer = serializer_class(instance, data=item, partial=True)

            if serializer.is_valid():
                serializer.save()
                updated_instances.append(serializer.data)
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"updated_instances": updated_instances}, status=status.HTTP_200_OK)

    def delete(self, request, model_name, id=None):
        model, serializer_class = self.get_model_and_serializer(model_name)

        if not model:
            return Response({"detail": "Model not found."}, status=status.HTTP_404_NOT_FOUND)

        if id is not None:
            try:
                instance = get_object_or_404(model, pk=id)
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(request.data, dict):
            data = [request.data]
        elif isinstance(request.data, list):
            data = request.data
        else:
            return Response({"detail": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        deleted_ids = []
        
        for item in data:
            object_id = item.get('id')
            if object_id is None:
                errors.append({"detail": "ID not provided."})
                continue

            try:
                instance = get_object_or_404(model, pk=object_id)
                instance.delete()
                deleted_ids.append(object_id)
            except Exception as e:
                errors.append({"id": object_id, "detail": str(e)})

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"deleted_ids": deleted_ids}, status=status.HTTP_204_NO_CONTENT)



@method_decorator(token_required, name='dispatch')
class ManageStudentData(APIView):
    
    def post(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({'error': 'Data must be a list of students'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StudentDataSerializer(data=data, many=True)
        if serializer.is_valid():
            students = [StudentData(**item) for item in serializer.validated_data]
            StudentData.objects.bulk_create(students)
            return Response({'status': 'Students uploaded successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        course = request.data.get('Course')
        batch = request.data.get('BatchName')
        if not course or not batch:
            return Response({'error': 'Course and BatchName are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        students = StudentData.objects.filter(Course=course, BatchName=batch)
        stdAtt = StudentAttendance.objects.filter(Course=course, BatchName=batch)
        stdWatchTime = StudentWatchTimeData.objects.filter(Course=course, BatchName=batch)
        stdMsg = StudentMessagesData.objects.filter(Course=course, BatchName=batch)
        
        if students.exists():
            deleted_count, _ = students.delete()
            if stdAtt.exists():
                stdAtt.delete()
            if stdWatchTime.exists():
                stdWatchTime.delete()
            if stdMsg.exists():
                stdMsg.delete()
        else:
            return Response({'status' : 'Students data not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'status': f'{deleted_count} students deleted.'}, status=status.HTTP_204_NO_CONTENT)
    

@method_decorator(token_required, name='dispatch')
class ManageStdAttandanceData(APIView):
    
    def delete(self, request, id):

        if not id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        stdData = StudentAttendance.objects.filter(StudentId=id)
        stdWatchTime = StudentWatchTimeData.objects.filter(StudentId=id)
        stdMsg = StudentMessagesData.objects.filter(StudentId=id)
        std_Msgs = BatchToStudentMessagesData.objects.filter(StudentId=id)
        
        if stdData.exists():
            stdData.delete()
        if stdWatchTime.exists():
            stdWatchTime.delete()
        if stdMsg.exists():
            stdMsg.delete()
        if std_Msgs.exists():
            std_Msgs.delete()
            
        return Response({'status': 'Students attandance data deleted.'}, status=status.HTTP_204_NO_CONTENT)
    
@method_decorator(token_required, name='dispatch')
class ManageBatchAttandanceData(APIView):
    
    def delete(self, request, id):

        if not id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        batchData = BatchAttendance.objects.filter(BatchID=id)
        
        if not batchData.exists():
                return Response({'status': 'No records found for the provided id.'}, status=status.HTTP_404_NOT_FOUND)
            
        get_data = batchData.first()
        
        batchMsg = BatchMessagesData.objects.filter(BatchID=id)
        batch_Msgs = BatchToStudentMessagesData.objects.filter(BatchID=id)
        batch_std_Msgs = BatchToStudentMessagesData.objects.filter(Course=get_data.Course, BatchName=get_data.BatchName)
        batch_permissions = PermissionsData.objects.filter(Course=get_data.Course, BatchName=get_data.BatchName)
        
        batchData.delete()
        if batchMsg.exists():
            batchMsg.delete()
        if batch_Msgs.exists():
            batch_Msgs.delete()
        if batch_std_Msgs.exists():
            batch_std_Msgs.delete()
        if batch_permissions.exists():
            batch_permissions.delete()
            
        return Response({'status': 'Students attandance data deleted.'}, status=status.HTTP_204_NO_CONTENT)
    
def addBatchPermissions(data):
    try:
        batchData = BatchData.objects.get(Course=data.get('Course'), BatchName=data.get('BatchName'))
    except BatchData.DoesNotExist:
        return False

    permission = {
        "BatchID": batchData.id,
        "Course": batchData.Course,
        "BatchName": batchData.BatchName
    }

    serializer = PermissionsDataSerializer(data=permission)
    if serializer.is_valid():
        serializer.save()
        return True
    else:
        print(serializer.errors)
        batchData.delete()
        return False
