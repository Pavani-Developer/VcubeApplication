from django.contrib import admin
from .models import *

admin.site.register(UsersLoginData)
admin.site.register(UsersDriveData)
admin.site.register(SendOTP)

admin.site.register(BatchAttendance)
admin.site.register(BatchToStudentMessagesData)
admin.site.register(ClassRecordingsData)
admin.site.register(PermissionsData)
admin.site.register(ReportData)

# Register your models here.
