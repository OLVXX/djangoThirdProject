from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Project, Task, Comment
from .serializers import (
    ProjectSerializer, TaskSerializer, CommentSerializer,
    UserSerializer, ProjectCreateSerializer, TaskCreateSerializer,
    CommentCreateSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.owner == request.user

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
            project.members.add(user)
            return Response({"status": "User added to project"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
            project.members.remove(user)
            return Response({"status": "User removed from project"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'due_date', 'status', 'priority']
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        assigned_to = self.request.query_params.get('assigned_to')
        
        queryset = Task.objects.all()
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        if priority:
            queryset = queryset.filter(priority=priority)
            
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
            
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, pk=project_id)
        
        # Verify that the user is a member of the project or the owner
        if self.request.user != project.owner and self.request.user not in project.members.all():
            self.permission_denied(self.request)
            
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign_task(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
            # Check if user is a member of the project
            if user not in task.project.members.all() and user != task.project.owner:
                return Response({"error": "User is not a member of the project"}, status=status.HTTP_400_BAD_REQUEST)
                
            task.assigned_to = user
            task.save()
            return Response({"status": "Task assigned successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return Comment.objects.filter(task_id=task_id)
        return Comment.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        task_id = self.request.data.get('task')
        task = get_object_or_404(Task, pk=task_id)
        
        # Verify that the user is a member of the project or the owner
        if self.request.user != task.project.owner and self.request.user not in task.project.members.all():
            self.permission_denied(self.request)
            
        serializer.save(author=self.request.user, task=task)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
