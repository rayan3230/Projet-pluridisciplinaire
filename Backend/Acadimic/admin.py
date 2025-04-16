from django.contrib import admin
from .models import (
    Speciality, Promo, Section, Classroom,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry, ExamPeriod,
    Location, ExamSurveillance, AcademicYear,
    PromoModuleSemester, TeacherBaseModuleAssignment
)

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'has_projector', 'computers_count', 'location')
    list_filter = ('location', 'type', 'has_projector')
    search_fields = ('name', 'location__name')

@admin.register(Speciality)
class SpecialityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 0
    fields = ('semester_number', 'start_date', 'end_date')
    readonly_fields = ('semester_number',)
    show_change_link = True

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('year_start', 'year_end')
    list_filter = ('year_start',)
    search_fields = ('year_start', 'year_end')
    inlines = [SemesterInline]

@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ('name', 'speciality', 'academic_year')
    list_filter = ('speciality', 'academic_year')
    search_fields = ('name', 'speciality__name', 'academic_year__year_start')

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
    list_display = ('academic_year', 'semester_number', 'start_date', 'end_date')
    list_filter = ('academic_year', 'semester_number')
    search_fields = ('academic_year__year_start', 'academic_year__year_end')
    autocomplete_fields = ('academic_year',)

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'semester', 'exam_date', 'duration_minutes')
    list_filter = ('semester', 'module__base_module')
    search_fields = ('name', 'module__base_module__name', 'semester__academic_year__year_start')
    date_hierarchy = 'exam_date'

@admin.register(TeacherModuleAssignment)
class TeacherModuleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'module')
    list_filter = ('teacher', 'module__base_module')
    search_fields = ('teacher__full_name', 'module__base_module__name', 'module__version_name')
    autocomplete_fields = ['teacher', 'module']
    ordering = ('teacher', 'module')

@admin.register(TeacherBaseModuleAssignment)
class TeacherBaseModuleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'base_module')
    list_filter = ('teacher', 'base_module')
    search_fields = ('teacher__full_name', 'base_module__name')
    autocomplete_fields = ['teacher', 'base_module']
    ordering = ('teacher', 'base_module')

@admin.register(ScheduleEntry)
class ScheduleEntryAdmin(admin.ModelAdmin):
    list_display = ('section', 'module', 'entry_type', 'teacher', 'day_of_week', 'start_time', 'end_time', 'classroom', 'semester')
    list_filter = ('semester', 'section__promo__speciality', 'section__promo', 'section', 'teacher', 'module__base_module', 'day_of_week', 'entry_type', 'classroom')
    search_fields = ('section__name', 'module__base_module__name', 'teacher__full_name', 'classroom__name')
    autocomplete_fields = ('section', 'semester', 'module', 'teacher', 'classroom')

@admin.register(ExamPeriod)
class ExamPeriodAdmin(admin.ModelAdmin):
    list_display = ('semester', 'start_date', 'end_date')
    list_filter = ('semester', 'start_date', 'end_date')
    search_fields = ('semester__academic_year__year_start', 'semester__academic_year__year_end')
    date_hierarchy = 'start_date'
    autocomplete_fields = ['semester']

@admin.register(ExamSurveillance)
class ExamSurveillanceAdmin(admin.ModelAdmin):
    list_display = ('exam', 'teacher')
    list_filter = ('exam__semester', 'teacher')
    search_fields = ('exam__name', 'teacher__full_name')
    autocomplete_fields = ['exam', 'teacher']

@admin.register(PromoModuleSemester)
class PromoModuleSemesterAdmin(admin.ModelAdmin):
    list_display = ('promo', 'module', 'semester')
    list_filter = ('promo__speciality', 'promo', 'semester')
    search_fields = ('promo__name', 'module__base_module__name', 'semester__academic_year__year_start')
    autocomplete_fields = ('promo', 'module', 'semester')
