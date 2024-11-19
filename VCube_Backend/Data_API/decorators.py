from functools import wraps
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework import status
from django.utils.decorators import method_decorator


def token_required(view_func):
    if hasattr(view_func, 'view_class'):

        @method_decorator(token_required)
        def dispatch(self, request, *args, **kwargs):
            return view_func(self, request, *args, **kwargs)
        return dispatch
    
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):

        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return JsonResponse({'detail': 'Token not provided or invalid format.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = token.split(' ')[1]
        
        try:
            AccessToken(token)
        except Exception:
            return JsonResponse({'detail': 'Invalid or expired access token.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        csrf_token_from_request = request.headers.get('X-CSRFToken') or request.META.get('HTTP_X_CSRFTOKEN')
        if csrf_token_from_request is None:
            return JsonResponse({'detail': 'Invalid CSRF token.'}, status=status.HTTP_403_FORBIDDEN)
        
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view



def csrf_required(view_func):
    
    def _wrapped_view(request, *args, **kwargs):
        csrf_token_from_request = request.headers.get('X-CSRFToken')

        if csrf_token_from_request is None:
            return JsonResponse({'detail': 'Invalid or missing CSRF token.'}, status=status.HTTP_403_FORBIDDEN)

        return view_func(request, *args, **kwargs)
    
    return _wrapped_view