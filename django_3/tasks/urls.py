from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register('projects', views.ProjectViewSet)
router.register('tasks', views.TaskViewSet, basename='task')
router.register('comments', views.CommentViewSet, basename='comment')
router.register('users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
]
