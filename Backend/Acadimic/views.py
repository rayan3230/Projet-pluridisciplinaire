from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry
)
from .serializers import (
    ClassroomSerializer, SpecialitySerializer, PromoSerializer, SectionSerializer,
    BaseModuleSerializer, VersionModuleSerializer, SemesterSerializer, ExamSerializer,
    TeacherModuleAssignmentSerializer, ScheduleEntrySerializer
)

# We might want different permission levels later, but start with IsAdminUser for safety
# or IsAuthenticatedOrReadOnly if public read is ok.
# For now, let's assume only authenticated users can interact.
# from rest_framework.permissions import IsAdminUser, IsAuthenticated

class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer
    # permission_classes = [IsAdminUser] # Or other permission

class PromoViewSet(viewsets.ModelViewSet):
    queryset = Promo.objects.all()
    serializer_class = PromoSerializer
    # Filter based on speciality if needed:
    # def get_queryset(self):
    #     queryset = Promo.objects.all()
    #     speciality_id = self.request.query_params.get('speciality')
    #     if speciality_id is not None:
    #         queryset = queryset.filter(speciality_id=speciality_id)
    #     return queryset

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    # Filter based on promo if needed:
    # def get_queryset(self):
    #     queryset = Section.objects.all()
    #     promo_id = self.request.query_params.get('promo')
    #     if promo_id is not None:
    #         queryset = queryset.filter(promo_id=promo_id)
    #     return queryset

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

class BaseModuleViewSet(viewsets.ModelViewSet):
    queryset = BaseModule.objects.all()
    serializer_class = BaseModuleSerializer

class VersionModuleViewSet(viewsets.ModelViewSet):
    queryset = VersionModule.objects.all()
    serializer_class = VersionModuleSerializer
    # Filter based on base module if needed:
    # def get_queryset(self):
    #     queryset = VersionModule.objects.all()
    #     base_module_id = self.request.query_params.get('base_module')
    #     if base_module_id is not None:
    #         queryset = queryset.filter(base_module_id=base_module_id)
    #     return queryset

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    # Add filtering by semester or module if needed

class TeacherModuleAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherModuleAssignment.objects.all()
    serializer_class = TeacherModuleAssignmentSerializer
    # Add filtering by teacher, promo, or module

class ScheduleEntryViewSet(viewsets.ModelViewSet):
    queryset = ScheduleEntry.objects.all()
    serializer_class = ScheduleEntrySerializer
    # Add filtering by section, teacher, semester, etc.
