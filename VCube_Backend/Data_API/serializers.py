from rest_framework.serializers import ModelSerializer
from .models import (
    UsersLoginData,BatchData,StudentData,
    BatchMessagesData,StudentMessagesData,
    SendMail,CoursesData,CourseFeedbackData,
    StudentAttendance,BatchAttendance,SendOTP,
    PlacementFeedbackData,PlacementPosts,AdminMessages,
    BatchToStudentMessagesData,AssessmentQuestionsData,
    ClassRecordingsData,StudentWatchTimeData,PermissionsData,
    FeedbackFormLists,ReportData,UsersDriveData,StudentWeeklyTestResults,StudentRequests
)
class LoginDataSerializer(ModelSerializer):
    class Meta:
        model = UsersLoginData
        fields = '__all__'
        
class BatchDataSerializer(ModelSerializer):
    class Meta:
        model = BatchData
        fields = '__all__'
        
class BatchAttendanceSerializer(ModelSerializer):
    class Meta:
        model = BatchAttendance
        fields = '__all__'
        
class StudentDataSerializer(ModelSerializer):
    class Meta:
        model = StudentData
        fields = '__all__'

class StudentAttendanceSerializer(ModelSerializer):
    class Meta:
        model = StudentAttendance
        fields = '__all__'

class CourseDataSerializer(ModelSerializer):
    class Meta:
        model = CoursesData
        fields = '__all__'
        
class BatchMessagesDataSerializer(ModelSerializer):
    class Meta:
        model = BatchMessagesData
        fields = '__all__'
        
class StudentMessagesDataSerializer(ModelSerializer):
    class Meta:
        model = StudentMessagesData
        fields = '__all__'
  
class AdminMessagesSerializer(ModelSerializer):
    class Meta:      
        model = AdminMessages
        fields = '__all__'
        
class BatchToStudentMessagesDataSerializer(ModelSerializer):
    class Meta:
        model = BatchToStudentMessagesData
        fields = '__all__'
        
class SendMailSerializer(ModelSerializer):
    class Meta:
        model = SendMail
        fields = '__all__'

class SendOTPSerializer(ModelSerializer):
    class Meta:
        model = SendOTP
        fields = '__all__'
        
class AssessmentQuestionsDataSerializer(ModelSerializer):
    class Meta:
        model = AssessmentQuestionsData
        fields = '__all__'
        
class CourseFeedbackDataSerializer(ModelSerializer):
    class Meta:
        model = CourseFeedbackData
        fields = '__all__'
        
class PlacementFeedbackDataSerializer(ModelSerializer):
    class Meta:
        model = PlacementFeedbackData
        fields = '__all__'
        
class PlacementPostsDataSerializer(ModelSerializer):
    class Meta:
        model = PlacementPosts
        fields = '__all__'
        
class ClassRecordingsDataSerializer(ModelSerializer):
    class Meta:
        model = ClassRecordingsData
        fields = '__all__'
        
class StudentWatchTimeDataSerializer(ModelSerializer):
    class Meta:
        model = StudentWatchTimeData
        fields = '__all__'
        
class PermissionsDataSerializer(ModelSerializer):
    class Meta:
        model = PermissionsData
        fields = '__all__'
        
class FeedbackFormListsSerializer(ModelSerializer):
    class Meta:
        model = FeedbackFormLists
        fields = '__all__'
        
class ReportDataSerializer(ModelSerializer):
    class Meta:
        model = ReportData
        fields = '__all__'
        
class UsersDriveDataSerializer(ModelSerializer):
    class Meta:
        model = UsersDriveData
        fields = '__all__'
        
class StudentWeeklyTestResultsSerializer(ModelSerializer):
    class Meta:
        model = StudentWeeklyTestResults
        fields = '__all__'
        
class StudentRequestsSerializer(ModelSerializer):
    class Meta:
        model = StudentRequests
        fields = '__all__'