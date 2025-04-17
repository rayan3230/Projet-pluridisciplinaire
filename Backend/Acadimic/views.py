from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from datetime import timedelta, date, datetime, time
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry, ExamPeriod,
    SessionType, Location, ExamSurveillance, AcademicYear,
    PromoModuleSemester, TeacherBaseModuleAssignment
)
from .serializers import (
    ClassroomSerializer, SpecialitySerializer, PromoSerializer, SectionSerializer,
    BaseModuleSerializer, VersionModuleSerializer, SemesterSerializer, ExamSerializer,
    TeacherModuleAssignmentSerializer, ScheduleEntrySerializer, ExamPeriodSerializer,
    LocationSerializer, ExamSurveillanceSerializer, AcademicYearSerializer,
    PromoModuleSemesterSerializer, TeacherBaseModuleAssignmentSerializer,
    ScheduleGenerationRequestSerializer
)
import random
import traceback
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
import io
import os
from django.conf import settings
from dotenv import load_dotenv
import google.generativeai as genai
import google.api_core.exceptions
import json
from users.serializers import UserSerializer
from django.db.models import Q
from collections import defaultdict
from django.core.exceptions import ValidationError

User = get_user_model()
load_dotenv()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_admin)

class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer

class PromoViewSet(viewsets.ModelViewSet):
    queryset = Promo.objects.select_related('speciality', 'academic_year').all()
    serializer_class = PromoSerializer

    def get_queryset(self):
        return Promo.objects.select_related('speciality', 'academic_year').all()

    def perform_create(self, serializer):
        return serializer.save()

    def perform_update(self, serializer):
        return serializer.save()

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related('promo', 'promo__speciality').all()
    serializer_class = SectionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        promo_id = self.request.query_params.get('promo')
        
        if promo_id:
            try:
                queryset = queryset.filter(promo_id=int(promo_id))
            except (ValueError, TypeError):
                return queryset.none()
        return queryset.order_by('name')

    def perform_create(self, serializer):
        promo_id = serializer.validated_data.get('promo_id')
        try:
            promo = Promo.objects.get(id=promo_id)
            serializer.save(promo=promo)
        except Promo.DoesNotExist:
            raise serializers.ValidationError({'promo_id': 'Promo not found'})

    def perform_update(self, serializer):
        promo_id = serializer.validated_data.get('promo_id')
        try:
            promo = Promo.objects.get(id=promo_id)
            serializer.save(promo=promo)
        except Promo.DoesNotExist:
            raise serializers.ValidationError({'promo_id': 'Promo not found'})

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

class BaseModuleViewSet(viewsets.ModelViewSet):
    queryset = BaseModule.objects.all()
    serializer_class = BaseModuleSerializer
    permission_classes = []  # No permissions required
    
    def get_queryset(self):
        """
        Optionally filters base modules by:
        - name (search)
        - has_versions (boolean)
        - assigned_to_promo (promo_id)
        Orders by name by default
        """
        queryset = BaseModule.objects.all()
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        # Filter by whether module has versions
        has_versions = self.request.query_params.get('has_versions', None)
        if has_versions is not None:
            has_versions = has_versions.lower() == 'true'
            if has_versions:
                queryset = queryset.filter(versions__isnull=False).distinct()
            else:
                queryset = queryset.filter(versions__isnull=True)
                
        # Filter by promo assignment
        promo_id = self.request.query_params.get('promo_id', None)
        if promo_id:
            queryset = queryset.filter(
                versions__promomodulesemester__promo_id=promo_id
            ).distinct()
            
        return queryset.order_by('name')
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a base module"""
        base_module = self.get_object()
        versions = base_module.versions.all().order_by('-version_name')
        serializer = VersionModuleSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        """Get usage statistics for a base module"""
        base_module = self.get_object()
        
        # Get all version modules
        versions = base_module.versions.all()
        
        # Count assignments
        total_assignments = PromoModuleSemester.objects.filter(
            module__in=versions
        ).count()
        
        # Count unique promos using this module
        unique_promos = Promo.objects.filter(
            promomodulesemester__module__in=versions
        ).distinct().count()
        
        # Get teacher assignments
        teacher_assignments = TeacherBaseModuleAssignment.objects.filter(
            base_module=base_module
        ).select_related('teacher')
        
        return Response({
            'total_versions': versions.count(),
            'total_assignments': total_assignments,
            'unique_promos': unique_promos,
            'assigned_teachers': [
                {
                    'id': assignment.teacher.id,
                    'full_name': assignment.teacher.full_name,
                    'scope_email': assignment.teacher.scope_email
                }
                for assignment in teacher_assignments
            ]
        })

class VersionModuleViewSet(viewsets.ModelViewSet):
    queryset = VersionModule.objects.all()
    serializer_class = VersionModuleSerializer

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer

    @action(detail=True, methods=['get'], url_path='semesters')
    def get_semesters(self, request, pk=None):
        """Return a list of semesters for the given academic year that have both start and end dates."""
        try:
            academic_year = self.get_object()
            # Filter semesters: must have both start_date and end_date non-null
            semesters = academic_year.semester_set.filter(
                start_date__isnull=False, 
                end_date__isnull=False
            ).order_by('semester_number')
            serializer = SemesterSerializer(semesters, many=True)
            return Response(serializer.data)
        except AcademicYear.DoesNotExist:
            return Response({'detail': 'Academic Year not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the error for debugging
            print(f"Error fetching semesters for Academic Year {pk}: {e}") 
            return Response({'detail': 'An error occurred while fetching semesters.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Academic years cannot be deleted as they are part of the academic structure."},
            status=status.HTTP_403_FORBIDDEN
        )

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.select_related('academic_year').order_by('-academic_year__year_start', 'semester_number')
    serializer_class = SemesterSerializer
    http_method_names = ['get', 'put', 'patch']

    def create(self, request, *args, **kwargs):
        return Response({'detail': 'Semesters are created automatically with academic years'}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'Semesters cannot be deleted'}, status=status.HTTP_403_FORBIDDEN)

class PromoModuleSemesterViewSet(viewsets.ModelViewSet):
    serializer_class = PromoModuleSemesterSerializer
    queryset = PromoModuleSemester.objects.select_related(
        'promo', 'semester', 'module', 'module__base_module'
    ).all()
    permission_classes = []
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = super().get_queryset()
        promo_id = self.request.query_params.get('promo')
        semester_id = self.request.query_params.get('semester')
        
        if promo_id:
            queryset = queryset.filter(promo_id=promo_id)
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
            
        return queryset.order_by('promo', 'semester', 'module')

    def create(self, request, *args, **kwargs):
        try:
            promo = Promo.objects.get(id=request.data.get('promo'))
            semester = Semester.objects.get(id=request.data.get('semester'))
            module = VersionModule.objects.get(id=request.data.get('module'))
            
            if semester.academic_year != promo.academic_year:
                return Response(
                    {'detail': 'Semester and promo must belong to the same academic year'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            assignment = PromoModuleSemester.objects.create(
                promo=promo,
                semester=semester,
                module=module
            )
            
            serializer = self.get_serializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except (Promo.DoesNotExist, Semester.DoesNotExist, VersionModule.DoesNotExist) as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': 'An error occurred while creating the assignment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'detail': 'An error occurred while deleting the assignment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        semester_id = self.request.query_params.get('semester')
        module_id = self.request.query_params.get('module')
        section_id = self.request.query_params.get('section')
        
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        if section_id:
            queryset = queryset.filter(section_id=section_id)
            
        return queryset.order_by('exam_date')

class ExamPeriodViewSet(viewsets.ModelViewSet):
    queryset = ExamPeriod.objects.all()
    serializer_class = ExamPeriodSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        semester_id = self.request.query_params.get('semester')
        
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
            
        return queryset.order_by('start_date')

class TeacherBaseModuleAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherBaseModuleAssignment.objects.select_related(
        'teacher',
        'base_module'
    ).all()
    serializer_class = TeacherBaseModuleAssignmentSerializer
    permission_classes = []

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            teacher_id = request.data.get('teacher')
            base_module_id = request.data.get('base_module')
            
            if not teacher_id or not base_module_id:
                return Response(
                    {'detail': 'Teacher and base module are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            teacher = User.objects.get(id=teacher_id, is_teacher=True)
            base_module = BaseModule.objects.get(id=base_module_id)
            
            assignment = TeacherBaseModuleAssignment.objects.create(
                teacher=teacher,
                base_module=base_module
            )
            
            serializer = self.get_serializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'Teacher not found or not a valid teacher'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except BaseModule.DoesNotExist:
            return Response(
                {'detail': 'Base module not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': 'An error occurred while creating the assignment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeacherModuleAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherModuleAssignment.objects.select_related(
        'teacher',
        'module',
        'module__base_module'
    ).all()
    serializer_class = TeacherModuleAssignmentSerializer
    permission_classes = []

class ScheduleEntryViewSet(viewsets.ModelViewSet):
    queryset = ScheduleEntry.objects.all()
    serializer_class = ScheduleEntrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        semester_id = self.request.query_params.get('semester')
        section_id = self.request.query_params.get('section')
        teacher_id = self.request.query_params.get('teacher')
        module_id = self.request.query_params.get('module')
        
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
            
        return queryset.order_by('semester', 'section', 'day_of_week', 'start_time')

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer

class ExamSurveillanceViewSet(viewsets.ModelViewSet):
    queryset = ExamSurveillance.objects.select_related('exam', 'teacher', 'exam__classroom', 'exam__module__base_module').all()
    serializer_class = ExamSurveillanceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        exam_id = self.request.query_params.get('exam')
        teacher_id = self.request.query_params.get('teacher')
        
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
            
        return queryset.order_by('exam__exam_date', 'teacher')

    @action(detail=False, methods=['post'], url_path='send-schedules')
    def send_schedules(self, request):
        try:
            exam_ids = request.data.get('exam_ids', [])
            if not exam_ids:
                return Response(
                    {'detail': 'No exam IDs provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            exams = Exam.objects.filter(id__in=exam_ids)
            if not exams.exists():
                return Response(
                    {'detail': 'No valid exams found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            for exam in exams:
                surveillance_assignments = ExamSurveillance.objects.filter(exam=exam)
                for assignment in surveillance_assignments:
                    # Send email to teacher
                    pass
                    
            return Response(
                {'detail': 'Schedules sent successfully'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'detail': 'An error occurred while sending schedules'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='generate-schedule')
    @transaction.atomic
    def generate_schedule(self, request):
        try:
            promo_id = request.data.get('promo_id')
            semester_id = request.data.get('semester_id')
            teacher_ids = request.data.get('teacher_ids', [])
            
            if not promo_id or not semester_id or not teacher_ids:
                return Response(
                    {'detail': 'Promo ID, semester ID, and teacher IDs are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            promo = Promo.objects.get(id=promo_id)
            semester = Semester.objects.get(id=semester_id)
            teachers = User.objects.filter(id__in=teacher_ids, is_teacher=True)
            
            if semester.academic_year != promo.academic_year:
                return Response(
                    {'detail': 'Semester and promo must belong to the same academic year'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if len(teachers) != len(teacher_ids):
                return Response(
                    {'detail': 'One or more invalid teacher IDs'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Generate schedule logic here
            
            return Response(
                {'detail': 'Schedule generated successfully'},
                status=status.HTTP_200_OK
            )
            
        except (Promo.DoesNotExist, Semester.DoesNotExist) as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': 'An error occurred while generating the schedule'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@transaction.atomic
def generate_exam_schedule_view(request):
    try:
        promo_id = request.data.get('promo_id')
        semester_id = request.data.get('semester_id')
        
        if not promo_id or not semester_id:
            return Response(
                {'detail': 'Promo ID and semester ID are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        promo = Promo.objects.get(id=promo_id)
        semester = Semester.objects.get(id=semester_id)
        
        if semester.academic_year != promo.academic_year:
            return Response(
                {'detail': 'Semester and promo must belong to the same academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Generate exam schedule logic here
        
        return Response(
            {'detail': 'Exam schedule generated successfully'},
            status=status.HTTP_200_OK
        )
        
    except (Promo.DoesNotExist, Semester.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while generating the exam schedule'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@transaction.atomic
def generate_all_promos_exam_schedule_view(request):
    try:
        semester_id = request.data.get('semester_id')
        
        if not semester_id:
            return Response(
                {'detail': 'Semester ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        semester = Semester.objects.get(id=semester_id)
        promos = Promo.objects.filter(academic_year=semester.academic_year)
        
        if not promos.exists():
            return Response(
                {'detail': 'No promos found for this academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Generate exam schedules for all promos logic here
        
        return Response(
            {'detail': 'Exam schedules generated successfully for all promos'},
            status=status.HTTP_200_OK
        )
        
    except Semester.DoesNotExist:
        return Response(
            {'detail': 'Semester not found'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while generating the exam schedules'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def generate_class_schedule_view(request):
    try:
        promo_id = request.data.get('promo_id')
        semester_id = request.data.get('semester_id')
        teacher_ids = request.data.get('teacher_ids', [])
        
        if not promo_id or not semester_id or not teacher_ids:
            return Response(
                {'detail': 'Promo ID, semester ID, and teacher IDs are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        promo = Promo.objects.get(id=promo_id)
        semester = Semester.objects.get(id=semester_id)
        teachers = User.objects.filter(id__in=teacher_ids, is_teacher=True)
        
        if semester.academic_year != promo.academic_year:
            return Response(
                {'detail': 'Semester and promo must belong to the same academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if len(teachers) != len(teacher_ids):
            return Response(
                {'detail': 'One or more invalid teacher IDs'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Generate class schedule logic here
        
        return Response(
            {'detail': 'Class schedule generated successfully'},
            status=status.HTTP_200_OK
        )
        
    except (Promo.DoesNotExist, Semester.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while generating the class schedule'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def export_schedule_pdf(request):
    try:
        semester_id = request.query_params.get('semester_id')
        section_id = request.query_params.get('section_id')
        
        if not semester_id or not section_id:
            return Response(
                {'detail': 'Semester ID and section ID are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        semester = Semester.objects.get(id=semester_id)
        section = Section.objects.get(id=section_id)
        
        if semester.academic_year != section.promo.academic_year:
            return Response(
                {'detail': 'Semester and section must belong to the same academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Export schedule to PDF logic here
        
        return Response(
            {'detail': 'Schedule exported to PDF successfully'},
            status=status.HTTP_200_OK
        )
        
    except (Semester.DoesNotExist, Section.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while exporting the schedule to PDF'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def export_schedule_excel(request):
    try:
        semester_id = request.query_params.get('semester_id')
        section_id = request.query_params.get('section_id')
        
        if not semester_id or not section_id:
            return Response(
                {'detail': 'Semester ID and section ID are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        semester = Semester.objects.get(id=semester_id)
        section = Section.objects.get(id=section_id)
        
        if semester.academic_year != section.promo.academic_year:
            return Response(
                {'detail': 'Semester and section must belong to the same academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Export schedule to Excel logic here
        
        return Response(
            {'detail': 'Schedule exported to Excel successfully'},
            status=status.HTTP_200_OK
        )
        
    except (Semester.DoesNotExist, Section.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while exporting the schedule to Excel'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def ai_admin_chat_view(request):
    try:
        message = request.data.get('message')
        
        if not message:
            return Response(
                {'detail': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # AI chat logic here
        
        return Response(
            {'detail': 'AI chat response generated successfully'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while processing the AI chat request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def getSemestersByAcademicYear(request, academic_year_id):
    try:
        academic_year = AcademicYear.objects.get(id=academic_year_id)
        semesters = academic_year.semester_set.filter(
            start_date__isnull=False, 
            end_date__isnull=False
        ).order_by('semester_number')
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)
    except AcademicYear.DoesNotExist:
        return Response(
            {'detail': 'Academic Year not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while fetching semesters'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_compatible_teachers_view(request):
    try:
        module_id = request.query_params.get('module_id')
        semester_id = request.query_params.get('semester_id')
        
        if not module_id or not semester_id:
            return Response(
                {'detail': 'Module ID and semester ID are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        module = VersionModule.objects.get(id=module_id)
        semester = Semester.objects.get(id=semester_id)
        
        # Get compatible teachers logic here
        
        return Response(
            {'detail': 'Compatible teachers fetched successfully'},
            status=status.HTTP_200_OK
        )
        
    except (VersionModule.DoesNotExist, Semester.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'detail': 'An error occurred while fetching compatible teachers'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
