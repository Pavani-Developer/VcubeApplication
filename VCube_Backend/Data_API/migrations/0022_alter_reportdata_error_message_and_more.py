# Generated by Django 5.0.6 on 2024-09-20 10:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0021_rename_batch_id_permissionsdata_batchid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportdata',
            name='Error_Message',
            field=models.TextField(default='N/A'),
        ),
        migrations.AlterField(
            model_name='reportdata',
            name='Error_Type',
            field=models.TextField(default='N/A'),
        ),
    ]
