# Generated by Django 5.0.6 on 2024-08-30 10:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0009_rename_studentid_studentattendance_studentid'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentattendance',
            name='Name',
            field=models.CharField(default='N/A', max_length=255),
        ),
    ]
