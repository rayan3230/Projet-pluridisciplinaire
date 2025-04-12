from django.contrib import admin
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry
)

# Basic registration first, customization can be added later

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'has_projector', 'computers_count')
    list_filter = ('type', 'has_projector')
    search_fields = ('name',)

@admin.register(Speciality)
class SpecialityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ('name', 'speciality', 'year_start', 'year_end', 'semester')
    list_filter = ('speciality', 'year_start', 'semester')
    search_fields = ('name', 'speciality__name')
    filter_horizontal = ('modules',)

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'promo')
    list_filter = ('promo__speciality', 'promo')
    search_fields = ('name', 'promo__name')

@admin.register(BaseModule)
class BaseModuleAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(VersionModule)
class VersionModuleAdmin(admin.ModelAdmin):
    list_display = (
        'base_module', 'version_name', 
        'coefficient', 'cours_hours', 'td_hours', 'tp_hours'
    )
    list_filter = ('base_module',)
    search_fields = ('base_module__name', 'version_name')

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    search_fields = ('name',)

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'semester', 'exam_date', 'duration_minutes')
    list_filter = ('semester', 'module__base_module')
    search_fields = ('name', 'module__base_module__name', 'semester__name')
    date_hierarchy = 'exam_date'

@admin.register(TeacherModuleAssignment)
class TeacherModuleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'module', 'promo')
    list_filter = ('promo__speciality', 'promo', 'module__base_module', 'teacher')
    search_fields = ('teacher__full_name', 'teacher__scope_email', 'module__base_module__name', 'promo__name')
    autocomplete_fields = ('teacher', 'module', 'promo') # Makes selection easier for large lists

@admin.register(ScheduleEntry)
class ScheduleEntryAdmin(admin.ModelAdmin):
    list_display = ('section', 'module', 'entry_type', 'teacher', 'day_of_week', 'start_time', 'end_time', 'classroom', 'semester')
    list_filter = ('semester', 'section__promo__speciality', 'section__promo', 'section', 'teacher', 'module__base_module', 'day_of_week', 'entry_type', 'classroom')
    search_fields = ('section__name', 'module__base_module__name', 'teacher__full_name', 'classroom__name')
    autocomplete_fields = ('section', 'semester', 'module', 'teacher', 'classroom')
