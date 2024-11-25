from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response
from .models import UsersLoginData, SendOTP, UsersDriveData
from .serializers import LoginDataSerializer, UsersDriveDataSerializer
from .decorators import token_required
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token


class CheckUsernameView(APIView):

    def post(self, request):
        username = request.data.get('Username')
        print(username)
        
        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_exists = UsersLoginData.objects.filter(Username=username).exists()
            print(user_exists)
            user = UsersLoginData.objects.get(Username=username)
            print(user)

            if user_exists:
                print(1111)
                return Response({'email': user.Email}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Username does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        except UsersLoginData.DoesNotExist:
            return Response({'message': 'Username does not exist.'},status=status.HTTP_404_NOT_FOUND)


class CheckEmailView(APIView):
 
    def post(self, request):
        email = request.data.get('Email')
        print(email)
        type = request.data.get('Type')
        
        if not email:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_exists = UsersLoginData.objects.filter(Email=email).exists()
        print(user_exists)
        user = UsersLoginData.objects.get(Email=email)
        print(user)
        if user_exists:
            if type == 'get':
                return Response({'username': user.Username}, status=status.HTTP_200_OK)
            else:
                return Response({'username': 'Found'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Username does not exist.'}, status=status.HTTP_404_NOT_FOUND)


class LoginView(APIView):

    def post(self, request):
        email = request.data.get('Email')
        password = request.data.get('Password')
        try:
            user = UsersLoginData.objects.get(Email=email)
            if check_password(password, user.Password):
                if user.Permission == 'Access':
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    csrfToken = get_token(request)
                    user_data = {
                        'Image' : user.Image,
                        'Username': user.Username,
                        'Email': user.Email,
                        'Phone': user.Phone,
                        'Course': user.Course,
                        'User': user.User,
                        'Permission': user.Permission,
                        'AddedBy': user.AddedBy,
                        'Joined_At': user.Joined_At,
                        'Drive': 'Not Registered' if user.DrivePassword == 'N/A' else 'Registered'
                    }
                    return Response({
                        'user' : user_data,
                        'access': access_token,
                        'csrf' : csrfToken
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'error':'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except UsersLoginData.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(token_required, name='dispatch')
class CheckAuthView(APIView):
    
    def post(self, request):
        token = request.headers.get('Authorization')
                
        if not token or not token.startswith('Bearer '):
            return Response({'detail': 'Token not provided or invalid format.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = token.split(' ')[1]
        try:
            AccessToken(token)
        except Exception as e:
            return Response({'is_authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

        csrf_token_from_request = request.headers.get('X-CSRFToken')

        if  csrf_token_from_request is None:
            return Response({'detail': 'Invalid CSRF token.'}, status=status.HTTP_403_FORBIDDEN)
  
        user = UsersLoginData.objects.get(Username=request.data.get('Username'),Email=request.data.get('Email'))
        
        if user.Permission != 'Access':
            return Response({'detail': 'Access Denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'is_authenticated': True}, status=status.HTTP_200_OK)
    
    
class UserRegisterView(APIView):
    
    def get(self, request):
        users = UsersLoginData.objects.all()
        serializer = LoginDataSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user_count = UsersLoginData.objects.count()

        if user_count == 0:
            request_data = request.data.copy()
            request_data['Password'] = make_password(request_data.get('Password'))
            serializer = LoginDataSerializer(data=request_data)

            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
            


@method_decorator(token_required, name='dispatch')
class NewUserCreate(APIView):
    def post(self, request):
        request_data = request.data.copy()
        request_data['Password'] = make_password(request_data.get('Password'))
        print(request_data['Password'])
        serializer = LoginDataSerializer(data=request_data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
   
   
@method_decorator(token_required, name='dispatch')
class UserDelete(APIView):
    def delete(self, request):
        id = request.data.get('id')
        
        if id is None:
            return Response({"detail": "ID not provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UsersLoginData.objects.get(id=id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UsersLoginData.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
   
@method_decorator(token_required, name='dispatch')
class UserDetailUpdate(APIView):
    
    def patch(self, request):
        user = UsersLoginData.objects.filter(Username=request.data.get('Username')).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        request_data = request.data.copy()
        
        if request_data.get('Password'):
            request_data['Password'] = make_password(request_data.get('Password'))
        
        serializer = LoginDataSerializer(user, data=request_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_data = {
                'Image': serializer.data.get('Image'),
                'Username': serializer.data.get('Username'),
                'Email': serializer.data.get('Email'),
                'Phone': serializer.data.get('Phone'),
                'Course': serializer.data.get('Course'),
                'User': serializer.data.get('User'),
                'Permission': serializer.data.get('Permission'),
                'AddedBy': serializer.data.get('AddedBy'),
                'Joined_At': serializer.data.get('Joined_At'),
            }
            return Response(user_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
   
@method_decorator(token_required, name='dispatch')  
class ChangeUserPermission(APIView):
    
    def patch(self, request):
        id = request.data.get('id')
        
        instance = UsersLoginData.objects.get(id=id)
        
        serializer = LoginDataSerializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
           
@method_decorator(token_required, name='dispatch')
class UsersListView(APIView):

    def get(self, request, course=None):
        
        if course:
            users = UsersLoginData.objects.filter(Course=course)
        else:
            users = UsersLoginData.objects.all()

        serializer = LoginDataSerializer(users, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        

@method_decorator(token_required, name='dispatch')
class CheckUserPassword(APIView):

    def post(self, request):
        username = request.data.get('Username')
        password = request.data.get('Password')
        
        try:
            user = UsersLoginData.objects.get(Username=username)
            
            if user.Permission == 'Access':
                if check_password(password, user.Password):
                    return Response(status=status.HTTP_200_OK)
                else:
                    return Response(status=status.HTTP_401_UNAUTHORIZED)
            else:
                Response(status=status.HTTP_423_LOCKED)
            
        except UsersLoginData.DoesNotExist:
            return Response({'error': 'User not exists'}, status=status.HTTP_404_NOT_FOUND)
   

@method_decorator(token_required, name='dispatch')
class CheckUser(APIView):

    def post(self, request):
        user = request.data.get('User')
        course = request.data.get('Course')

        filtered_data = UsersLoginData.objects.filter(Course=course)
        
        if not filtered_data.exists():
            if 'Admin' in user:
                return Response(status=status.HTTP_202_ACCEPTED)
            else:
                return Response({'message': 'Admin need to be assigned first'}, status=status.HTTP_406_NOT_ACCEPTABLE)  
            
        if 'Admin' in user:
            if filtered_data.filter(User=user).exists():
                return Response({'message': f'{user} already has been assigned'}, status=status.HTTP_226_IM_USED)
            else:
                return Response(status=status.HTTP_202_ACCEPTED)
        
        elif 'Placements' in user:
            if filtered_data.filter(User='Placements Admin').exists():
                return Response(status=status.HTTP_202_ACCEPTED)
            else:
                return Response({'message': 'Placements Admin need to be assigned first'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        
        else:
            if filtered_data.filter(User='Admin').exists():
                return Response(status=status.HTTP_202_ACCEPTED)
            else:
                return Response({'message': 'Admin need to be assigned first'}, status=status.HTTP_406_NOT_ACCEPTABLE)
            

@method_decorator(token_required, name='dispatch')
class CheckUserDetails(APIView):
    
    def post(self, request):
        username = request.data.get('Username')
        email = request.data.get('Email')
        phone = request.data.get('Phone')
        
        if UsersLoginData.objects.filter(Username=username).exists():
            return Response({"message" : "Username exists"}, status=status.HTTP_226_IM_USED)
        if UsersLoginData.objects.filter(Email=email).exists():
            return Response({"message" : "Email exists"}, status=status.HTTP_226_IM_USED)
        if UsersLoginData.objects.filter(Phone=phone).exists():
            return Response({"message" : "Phone exists"}, status=status.HTTP_226_IM_USED)
        
        return Response(status=status.HTTP_202_ACCEPTED)

@method_decorator(token_required, name='dispatch')
class UserPasswordChangeView(APIView):
    
    def post(self, request, id):
        old_password = request.data.get('Old_Password')
        new_password = request.data.get('New_Password')
        if id:
            try:
                user = UsersLoginData.objects.get(id=id)

                if check_password(old_password, user.Password):
                    user.Password = make_password(new_password)
                    serializer = LoginDataSerializer(user, data={'Password': user.Password}, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
                    else:
                        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except UsersLoginData.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Invalid user ID.'}, status=status.HTTP_400_BAD_REQUEST)
    

@method_decorator(token_required, name='dispatch')
class UsersDriveDataView(APIView):

    def authenticate_user(self, email, username, course, password):
        try:
            user = UsersLoginData.objects.get(Course=course, Username=username, Email=email)
        except UsersLoginData.DoesNotExist:
            return None, {'message': 'User not found'}, status.HTTP_404_NOT_FOUND

        if user.Permission != 'Access':
            return None, {'error': 'Access denied'}, status.HTTP_403_FORBIDDEN

        if not check_password(retrieve_digits_from_positions(password), user.DrivePassword):
            return None, {'error': 'Invalid credentials'}, status.HTTP_401_UNAUTHORIZED

        return user, None, None

    def put(self, request, username, course):
        password = request.data.get('DrivePassword')
        email = request.data.get('Email')

        user, error_response, status_code = self.authenticate_user(email, username, course, password)
        if error_response:
            return Response(error_response, status=status_code)

        data = UsersDriveData.objects.filter(Course=course, Username=username, Email=email)

        serializer = UsersDriveDataSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, username, course):
        if request.data[0].get('Shared'):
            Email = request.data[0].get('UserEmail')
        else:
            Email = request.data[0].get('Email')
        user, error_response, status_code = self.authenticate_user(Email, username, course, request.data[0].get('DrivePassword'))
        if error_response:
            return Response(error_response, status=status_code)

        data = request.data
        if not isinstance(data, list):
            return Response({'error': 'Data must be a list of students'}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in request.data:
            if 'DrivePassword' in item:
                item.pop('DrivePassword')
                
        serializer = UsersDriveDataSerializer(data=request.data, many=True)
        if serializer.is_valid():
            driveData = [UsersDriveData(**item) for item in serializer.validated_data]
            UsersDriveData.objects.bulk_create(driveData)

            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, username, course, drive_id=None):
        if isinstance(request.data, list):
            password = request.data[0].get('DrivePassword')
            email = request.data[0].get('Email')
        else:
            password = request.data.get('DrivePassword')
            email = request.data.get('Email')

        user, error_response, status_code = self.authenticate_user(email, username, course, password)
        if error_response:
            return Response(error_response, status=status_code)

        if drive_id is not None:
            try:
                drive_data = UsersDriveData.objects.get(id=drive_id, Course=course, Username=username, Email=email)
                serializer = UsersDriveDataSerializer(drive_data, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except UsersDriveData.DoesNotExist:
                return Response({'message': 'Drive data not found'}, status=status.HTTP_404_NOT_FOUND)
        
        
        if isinstance(request.data, list):
            updated_data = []
            for item in request.data:
                try:
                    drive_data = UsersDriveData.objects.get(Course=course, Username=username, Email=email, id=item.get('id'))
                    serializer = UsersDriveDataSerializer(drive_data, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        updated_data.append(serializer.data)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                except UsersDriveData.DoesNotExist:
                    return Response({'message': f'Drive data with ID {item.get("id")} not found'}, status=status.HTTP_404_NOT_FOUND)
            
            return Response(updated_data, status=status.HTTP_200_OK)
        
        return Response({'message': 'Invalid data format. Expected a list for batch update.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, username, course, drive_id=None):
        if isinstance(request.data, list):
            password = request.data[0].get('DrivePassword')
            email = request.data[0].get('Email')
            foldername = request.data[0].get('Folder')
        else:
            password = request.data.get('DrivePassword')
            email = request.data.get('Email')
            foldername = request.data.get('Folder')

        user, error_response, status_code = self.authenticate_user(email, username, course, password)
        if error_response:
            return Response(error_response, status=status_code)

        try:
            if drive_id is not None:
                drive_data = UsersDriveData.objects.get(id=drive_id, Course=course, Username=username, Email=email)
                drive_data.delete()
            else:
                drive_data = UsersDriveData.objects.filter(Course=course, Username=username, Email=email, Folder=foldername)
                deleted_count, _ = drive_data.delete()

                if deleted_count == 0:
                    return Response({'message': 'No drive data found for the specified folder'}, status=status.HTTP_404_NOT_FOUND)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except UsersDriveData.DoesNotExist:
            return Response({'message': 'Drive data not found'}, status=status.HTTP_404_NOT_FOUND)

 
def retrieve_digits_from_positions(random_number_string):
    positions = [7, 13, 25, 37, 43, 55]
    if len(random_number_string) != 60:
        raise ValueError("Input must be a 60-character string.")
    retrieved_digits = [random_number_string[pos] for pos in positions]
    return ''.join(retrieved_digits)    

@method_decorator(token_required, name='dispatch')
class CreateUserDrivePassword(APIView):

    def patch(self, request, course, username):
        email = request.data.get('Email')
        password = request.data.get('Password')
        new_drive_password = request.data.get('DrivePassword')
  
        res = validateResetOTP(request.data.get('User_Id'), request.data.get('OTP'))
        if res == 'Invalid':
            return Response({'message': 'Invalid OTP'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        elif res == 'Error':
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UsersLoginData.objects.get(Course=course, Username=username, Email=email)
        except UsersLoginData.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.Permission != 'Access':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        if not check_password(password, user.Password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if new_drive_password:
            user.DrivePassword = make_password(new_drive_password)
            user.save(update_fields=['DrivePassword'])
            
            return Response({'message': 'Drive password updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'New DrivePassword not provided'}, status=status.HTTP_400_BAD_REQUEST)
        

class PasswordResetView(APIView):

    def post(self, request):
        email = request.data.get('Email')
        password = request.data.get('Password')
        user_id = request.data.get('User_Id')
        otp = request.data.get('OTP')
        validate = validateResetOTP(user_id, otp)
        if validate == 'Valid':
            try:
                user = UsersLoginData.objects.get(Email=email)
                user.Password = make_password(password)
                user.save()
                return Response({'message':'Password Reset Success'}, status=status.HTTP_201_CREATED)
            except UsersLoginData.DoesNotExist:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        elif validate == 'Invalid':
            return Response({'message':'Invalid OTP'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


def validateResetOTP(user_id,otp):
    try:
        users = SendOTP.objects.filter(User_Id=user_id)

        if not users.exists():
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        total_users = users.count()
        if total_users > 1:
            newest_user = users.order_by('-id').first()
            users.exclude(id=newest_user.id).delete()
            
        user = SendOTP.objects.filter(User_Id=user_id).first()

        if otp == user.OTP:
            user.delete()
            return 'Valid'
        else:
            return 'Invalid'

    except Exception as e:
        user.delete()
        return 'Error'