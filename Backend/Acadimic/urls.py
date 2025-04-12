from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'specialities', views.SpecialityViewSet, basename='speciality')
router.register(r'promos', views.PromoViewSet, basename='promo')
router.register(r'sections', views.SectionViewSet, basename='section')
router.register(r'classrooms', views.ClassroomViewSet, basename='classroom')
router.register(r'base-modules', views.BaseModuleViewSet, basename='basemodule')
router.register(r'version-modules', views.VersionModuleViewSet, basename='versionmodule')
router.register(r'semesters', views.SemesterViewSet, basename='semester')
router.register(r'exams', views.ExamViewSet, basename='exam')
router.register(r'exam-periods', views.ExamPeriodViewSet, basename='examperiod')
router.register(r'assignments', views.TeacherModuleAssignmentViewSet, basename='teachermoduleassignment')
router.register(r'schedule-entries', views.ScheduleEntryViewSet, basename='scheduleentry')
router.register(r'locations', views.LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
    path('generate-exam-schedule/', views.generate_exam_schedule_view, name='generate-exam-schedule'),
    path('generate-class-schedule/', views.generate_class_schedule_view, name='generate-class-schedule'),
    path('export-schedule-pdf/', views.export_schedule_pdf, name='export-schedule-pdf'),
    path('export-schedule-excel/', views.export_schedule_excel, name='export-schedule-excel'),
]
