# Generated by Django 5.0.6 on 2024-10-04 11:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0026_remove_studentwatchtimedata_vediodetails_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assessmentquestionsdata',
            name='WeeklyAssignment',
            field=models.CharField(default='No', max_length=255),
        ),
    ]
