from django.db import models
from django.contrib.postgres.fields import JSONField
from django.utils import timezone

# Create your models here.

class UsersLoginData(models.Model):
    Image = models.JSONField(default=dict)
    Username = models.CharField(max_length=255, unique=True)
    Email = models.EmailField(unique=True)
    Phone = models.CharField(max_length=255, unique=True)
    Password = models.CharField(max_length=255)
    Course = models.CharField(max_length=255, default='N/A')
    User = models.CharField(max_length=255, default='User')
    Permission = models.CharField(max_length=255, default='Access')
    AddedBy = models.CharField(max_length=255, default='Self')
    Joined_At = models.DateTimeField(default=timezone.now)
    DrivePassword = models.CharField(max_length=255, default='N/A')

class BatchData(models.Model):
    BatchName = models.CharField(max_length=25, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=225, default='N/A')

class BatchAttendance(models.Model):
    BatchID = models.ForeignKey(BatchData, on_delete=models.CASCADE, related_name='attendances',null=True)
    BatchName = models.CharField(max_length=25, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')
    Attendance_Type = models.CharField(max_length=255, default='N/A')
    
class PermissionsData(models.Model):
    BatchID = models.ForeignKey(BatchData, on_delete=models.CASCADE, related_name='permissions',null=True)
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    Edit_Access = models.CharField(max_length=25, default='Denied')
    Login_Access = models.CharField(max_length=25, default='Access')        

class StudentData(models.Model):
    Name = models.CharField(max_length=255, default='N/A')
    Email = models.CharField(max_length=255, default='N/A')
    Phone = models.CharField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    BatchName = models.CharField(max_length=255, default='N/A')
    Personal_Info = models.JSONField(default=dict)
    Educational_Info = models.JSONField(default=dict)
    Placement_Info = models.JSONField(default=dict)
    Student_Config = models.BinaryField(default=b'')
    Status = models.CharField(max_length=255, default='Active')
    Permission = models.CharField(max_length=25, default='Access')
    Joining_Date = models.CharField(max_length=255, default='N/A')

class StudentAttendance(models.Model):
    StudentId = models.ForeignKey(StudentData, on_delete=models.CASCADE, related_name='attendances',null=True)
    Name = models.CharField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    BatchName = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')
    Attendance_Type = models.CharField(max_length=255, default='N/A')

class StudentWeeklyTestResults(models.Model):
    StudentId = models.ForeignKey(StudentData, on_delete=models.CASCADE, related_name='weekly_test_results',null=True)
    Image = models.TextField(default='N/A')
    Name = models.CharField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    BatchName = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')
    Status = models.CharField(max_length=255, default='N/A')
    Score = models.CharField(max_length=255, default='0')
    Time = models.CharField(max_length=255, default='0')
    
class StudentWatchTimeData(models.Model):
    StudentId = models.ForeignKey(StudentData, on_delete=models.CASCADE, related_name='watchtime',null=True)
    Name = models.CharField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    BatchName = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')
    WatchTime = models.CharField(max_length=255, default='N/A')

class CoursesData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    Tutors = models.CharField(max_length=100,default='N/A')
    Date = models.CharField(max_length=225, default='N/A')
    
class BatchToStudentMessagesData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255)
    StudentId = models.IntegerField(null=True)
    BatchMessage = models.JSONField(default=dict)

class BatchMessagesData(models.Model):
    BatchID = models.ForeignKey(BatchData, on_delete=models.CASCADE, related_name='batch_messages',null=True)
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    BatchMessage = models.JSONField(default=dict)
    
class StudentMessagesData(models.Model):
    StudentId = models.ForeignKey(StudentData, on_delete=models.CASCADE, related_name='student_messages',null=True)
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    StudentMessage = models.JSONField(default=dict)
    
class AdminMessages(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    AdminMessage = models.JSONField(default=dict)
    
class PlacementPosts(models.Model):
    File = models.JSONField(default=dict)
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    Company_Name = models.CharField(max_length=255,default='N/A')
    Post_Link = models.CharField(max_length=255,default='N/A')
    From_Date = models.CharField(max_length=255)
    To_Date = models.CharField(max_length=255)
    Description = models.JSONField(default=dict)
    
class CourseFeedbackData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    FeedbackData = models.JSONField(default=dict)
    
class PlacementFeedbackData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    FeedbackData = models.JSONField(default=dict)
    
class FeedbackFormLists(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    FeedbackData = models.JSONField(default=dict)
    Selected = models.BooleanField(default=False)
    
class AssessmentQuestionsData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    Question = models.JSONField(default=dict)
    Test_Cases = models.JSONField(default=dict)
    Examples = models.JSONField(default=dict)
    Level = models.CharField(max_length=50)
    WeeklyAssignment = models.CharField(max_length=255,default='No')
    
class ClassRecordingsData(models.Model):
    Course = models.CharField(max_length=255,default='N/A')
    BatchName = models.CharField(max_length=255,default='N/A')
    Title = models.CharField(max_length=255,default='N/A')
    Date = models.CharField(max_length=255,default='N/A')
    Vedio_URL = models.TextField()
    
class SendOTP(models.Model):
    User_Id = models.CharField(max_length=255)
    OTP = models.CharField(max_length=6)
    
class SendMail(models.Model):
    Email = models.CharField(max_length=255)
    OTP = models.JSONField(default=dict)

class ReportData(models.Model):
    Date = models.CharField(max_length=255, default='N/A')
    Error_Type = models.TextField(default='N/A')
    Error_Message = models.TextField(default='N/A')
    Status = models.CharField(max_length=255, default='UnSolved')
    
class UsersDriveData(models.Model):
    Username = models.CharField(max_length=255, default='N/A')
    Email = models.EmailField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    Folder = models.CharField(max_length=255, default='N/A')
    FileName = models.CharField(max_length=255, default='N/A')
    File = models.TextField(default='N/A')
    Size = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')
    
class StudentRequests(models.Model):
    StudentId = models.ForeignKey(StudentData, on_delete=models.CASCADE, related_name='weekly_test_request',null=True)
    Name = models.CharField(max_length=255, default='N/A')
    Course = models.CharField(max_length=255, default='N/A')
    BatchName = models.CharField(max_length=255, default='N/A')
    Date = models.CharField(max_length=255, default='N/A')