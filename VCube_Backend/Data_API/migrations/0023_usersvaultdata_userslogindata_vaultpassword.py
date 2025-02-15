# Generated by Django 5.0.6 on 2024-09-20 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Data_API', '0022_alter_reportdata_error_message_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UsersVaultData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Username', models.CharField(default='N/A', max_length=255)),
                ('Email', models.EmailField(default='N/A', max_length=255)),
                ('Course', models.CharField(default='N/A', max_length=255)),
                ('Folder', models.CharField(default='N/A', max_length=255)),
                ('FileName', models.CharField(default='N/A', max_length=255)),
                ('File', models.TextField(default='N/A')),
                ('Size', models.CharField(default='N/A', max_length=255)),
                ('Date', models.CharField(default='N/A', max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='userslogindata',
            name='VaultPassword',
            field=models.CharField(default='N/A', max_length=255),
        ),
    ]
