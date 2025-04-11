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
router.register(r'assignments', views.TeacherModuleAssignmentViewSet, basename='teachermoduleassignment')
router.register(r'schedule-entries', views.ScheduleEntryViewSet, basename='scheduleentry')

urlpatterns = [
    path('', include(router.urls)),
]
