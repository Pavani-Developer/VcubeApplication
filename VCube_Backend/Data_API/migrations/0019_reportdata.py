# Generated by Django 5.0.6 on 2024-09-16 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0018_studentdata_joining_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Date', models.CharField(default='N/A', max_length=255)),
                ('Error_Type', models.CharField(default='N/A', max_length=255)),
                ('Error_Message', models.CharField(default='N/A', max_length=255)),
            ],
        ),
    ]
