from django.contrib import admin
from .models import Project, Task, Comment

class TaskInline(admin.TabularInline):
    model = Task
    extra = 0

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    list_filter = ('owner', 'created_at')
    search_fields = ('name', 'description')
    inlines = [TaskInline]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'priority', 'assigned_to', 'due_date')
    list_filter = ('project', 'status', 'priority', 'assigned_to', 'due_date')
    search_fields = ('title', 'description')
    inlines = [CommentInline]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    list_filter = ('author', 'created_at')
    search_fields = ('text',)
