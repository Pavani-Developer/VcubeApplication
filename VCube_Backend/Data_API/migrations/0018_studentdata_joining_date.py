# Generated by Django 5.0.6 on 2024-09-15 12:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0017_batchdata_date_coursesdata_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentdata',
            name='Joining_Date',
            field=models.CharField(default='N/A', max_length=255),
        ),
    ]
