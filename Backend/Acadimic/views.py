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
    SessionType, Location, ExamSurveillance
)
from .serializers import (
    ClassroomSerializer, SpecialitySerializer, PromoSerializer, SectionSerializer,
    BaseModuleSerializer, VersionModuleSerializer, SemesterSerializer, ExamSerializer,
    TeacherModuleAssignmentSerializer, ScheduleEntrySerializer, ExamPeriodSerializer,
    LocationSerializer, ExamSurveillanceSerializer
)
import random
import traceback # Import traceback module
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

# Get the User model
User = get_user_model()

# Permissions: Default is IsAuthenticated. Consider IsAdminUser for stricter control.
# from rest_framework.permissions import IsAdminUser, IsAuthenticated

class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer

class PromoViewSet(viewsets.ModelViewSet):
    queryset = Promo.objects.all()
    serializer_class = PromoSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related('promo', 'promo__speciality').all() # Optimize query
    serializer_class = SectionSerializer

    def get_queryset(self):
        """Optionally filter sections by promo_id."""
        queryset = super().get_queryset() # Start with the base queryset
        promo_id = self.request.query_params.get('promo_id')
        
        if promo_id:
            try:
                queryset = queryset.filter(promo_id=int(promo_id))
            except (ValueError, TypeError):
                return queryset.none() # Or raise an appropriate DRF exception
        return queryset.order_by('name') # Ensure consistent ordering

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

class BaseModuleViewSet(viewsets.ModelViewSet):
    queryset = BaseModule.objects.all()
    serializer_class = BaseModuleSerializer

class VersionModuleViewSet(viewsets.ModelViewSet):
    queryset = VersionModule.objects.all()
    serializer_class = VersionModuleSerializer

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_queryset(self):
        """Optionally filter exams by semester."""
        try:
            print("ExamViewSet: Fetching exams...")
            queryset = Exam.objects.select_related(
                'semester', 'module', 'module__base_module', 'classroom'
            ).all()
            
            semester_id = self.request.query_params.get('semester_id')
            print(f"ExamViewSet: Filtering by semester_id={semester_id}")
            if semester_id:
                queryset = queryset.filter(semester_id=semester_id)
            
            print(f"ExamViewSet: Found {queryset.count()} exams. Ordering...")
            ordered_queryset = queryset.order_by('exam_date')
            print("ExamViewSet: Returning queryset.")
            return ordered_queryset
        except Exception as e:
            print(f"!!! ERROR in ExamViewSet.get_queryset: {str(e)}")
            import traceback
            traceback.print_exc() # Print the full traceback to console
            return Exam.objects.none()  # Return empty queryset on error

class ExamPeriodViewSet(viewsets.ModelViewSet):
    queryset = ExamPeriod.objects.all()
    serializer_class = ExamPeriodSerializer

    def get_queryset(self):
        queryset = ExamPeriod.objects.all()
        semester_id = self.request.query_params.get('semester_id')
        if semester_id is not None:
            queryset = queryset.filter(semester_id=semester_id)
        return queryset

class TeacherModuleAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherModuleAssignment.objects.all()
    serializer_class = TeacherModuleAssignmentSerializer

class ScheduleEntryViewSet(viewsets.ModelViewSet):
    queryset = ScheduleEntry.objects.all()
    serializer_class = ScheduleEntrySerializer

    def get_queryset(self):
        """Optionally filter schedule entries by promo, semester, section, or teacher."""
        queryset = ScheduleEntry.objects.select_related(
            'section', 'section__promo', 'semester', 
            'module', 'module__base_module', 'teacher', 'classroom'
        ).all()
        
        promo_id = self.request.query_params.get('promo_id')
        semester_id = self.request.query_params.get('semester_id')
        section_id = self.request.query_params.get('section_id')
        teacher_id = self.request.query_params.get('teacher_id')

        if promo_id:
            queryset = queryset.filter(section__promo_id=promo_id)
        
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
            
        if section_id:
            queryset = queryset.filter(section_id=section_id)
            
        if teacher_id:
             queryset = queryset.filter(teacher_id=teacher_id)
            
        # Order for consistent display
        return queryset.order_by('day_of_week', 'start_time')

# --- Constants for Scheduling --- 
# Define working days (1=Mon, 2=Tue, ... 6=Sat, 7=Sun)
WORKING_DAYS = [6, 7, 1, 2, 3, 4] # Sat, Sun, Mon, Tue, Wed, Thu
# Define time slots (start_hour, start_minute, end_hour, end_minute)
TIME_SLOTS = [
    (8, 0, 9, 30),
    (9, 40, 11, 10),
    (11, 20, 12, 50),
    (13, 0, 14, 30),
    (14, 40, 16, 10),
    (16, 20, 17, 50),
]
SLOT_DURATION_MINUTES = 90 # Assuming 1.5 hour slots

# --- Function-Based View for Schedule Generation ---

@api_view(['POST'])
@transaction.atomic # Ensure atomicity
def generate_exam_schedule_view(request):
    try:
        print("--- generate_exam_schedule_view: START ---")
        promo_id = request.data.get('promo_id')
        print(f"generate_exam_schedule_view: Received promo_id={promo_id}")
        if not promo_id:
            return Response({'error': 'promo_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- Wrap EVERYTHING in a transaction (already done by decorator) --- 
        promo = Promo.objects.select_related('semester').prefetch_related('modules').get(pk=promo_id)
        print(f"generate_exam_schedule_view: Found promo: {promo}")
        semester = promo.semester
        if not semester:
            print("generate_exam_schedule_view: ERROR - Promo has no assigned semester.")
            return Response({'error': 'The selected promo does not have an assigned semester.'}, status=status.HTTP_400_BAD_REQUEST)
        print(f"generate_exam_schedule_view: Found semester: {semester}")
        
        modules = promo.modules.all()
        if not modules:
            print("generate_exam_schedule_view: ERROR - No modules assigned to promo.")
            return Response({'error': 'No modules assigned to the selected promo.'}, status=status.HTTP_404_NOT_FOUND)
        print(f"generate_exam_schedule_view: Found {modules.count()} modules.")

        # --- Delete existing schedule first (within the transaction) --- 
        print("generate_exam_schedule_view: Deleting existing exam periods and exams...")
        deleted_periods, _ = ExamPeriod.objects.filter(semester=semester).delete()
        deleted_exams, _ = Exam.objects.filter(semester=semester).delete()
        print(f"generate_exam_schedule_view: Deleted {deleted_periods} periods, {deleted_exams} exams.")

        # --- Fetch available classrooms --- 
        available_classrooms = list(Classroom.objects.filter(type=SessionType.COURSE.value))
        if not available_classrooms:
             print("generate_exam_schedule_view: ERROR - No classrooms of type 'COURS' exist.")
             raise IntegrityError("No classrooms of type 'COURS' exist in the system to schedule exams.")
        print(f"generate_exam_schedule_view: Found {len(available_classrooms)} classrooms of type 'COURS'.")

        period_start_date = semester.end_date + timedelta(days=7)
        while period_start_date.weekday() == 4: # Skip Friday
            period_start_date += timedelta(days=1)
        print(f"generate_exam_schedule_view: Exam period start date: {period_start_date}")
        
        current_exam_date = period_start_date
        created_exams = []
        period_end_date = period_start_date
        last_assigned_classroom_index = -1 # Track last used index

        # --- Loop through modules to schedule --- 
        print("generate_exam_schedule_view: Starting module loop...")
        for module_index, module in enumerate(modules):
            print(f"generate_exam_schedule_view: Processing module {module_index + 1}/{len(modules)}: {module}")
            
            # Ensure current_exam_date is not a Friday 
            while current_exam_date.weekday() == 4:
                current_exam_date += timedelta(days=1)
            
            duration = timedelta(minutes=120) # Default duration
            exam_start_datetime = datetime.combine(current_exam_date, time(12, 0)) # Start at noon
            exam_end_datetime = exam_start_datetime + duration
            print(f"generate_exam_schedule_view: Proposed exam time: {exam_start_datetime} - {exam_end_datetime}")

            # --- Find an available classroom --- 
            assigned_classroom = None
            start_index = (last_assigned_classroom_index + 1) % len(available_classrooms)
            
            print(f"generate_exam_schedule_view: Searching for classroom starting from index {start_index}")
            for i in range(len(available_classrooms)):
                current_check_index = (start_index + i) % len(available_classrooms)
                potential_classroom = available_classrooms[current_check_index]
                print(f"generate_exam_schedule_view: Checking classroom {potential_classroom.name} (index {current_check_index})")
                
                # Check for conflicts for this classroom at this time
                # A simpler check: does any exam *start* in this classroom on this day?
                # Assumes one exam per day per classroom for simplicity in generation.
                conflicting_exams = Exam.objects.filter(
                    classroom=potential_classroom,
                    exam_date__date=current_exam_date
                ).exists()
                
                if not conflicting_exams:
                    assigned_classroom = potential_classroom
                    last_assigned_classroom_index = current_check_index
                    print(f"generate_exam_schedule_view: Found available classroom: {assigned_classroom.name}")
                    break # Found a classroom
                else:
                    print(f"generate_exam_schedule_view: Classroom {potential_classroom.name} is busy on {current_exam_date}.")
            
            if not assigned_classroom:
                # If no classroom found after checking all, move to the next day and retry
                print("generate_exam_schedule_view: No classroom available for this module today. Moving to next day.")
                current_exam_date += timedelta(days=1)
                continue # Retry scheduling this module on the new day

            # --- Create the Exam --- 
            exam = Exam.objects.create(
                name=f"Exam - {module.base_module.name}",
                semester=semester,
                module=module,
                exam_date=exam_start_datetime,
                duration_minutes=duration.total_seconds() // 60,
                classroom=assigned_classroom
            )
            created_exams.append(exam)
            print(f"generate_exam_schedule_view: Created exam: {exam}")
            
            # --- Update scheduling variables --- 
            period_end_date = max(period_end_date, current_exam_date) 
            current_exam_date += timedelta(days=1) # Move to the next day for the next module

        # --- Create ExamPeriod --- 
        print(f"generate_exam_schedule_view: Creating ExamPeriod from {period_start_date} to {period_end_date}")
        ExamPeriod.objects.create(
            semester=semester,
            start_date=period_start_date,
            end_date=period_end_date
        )
        print("generate_exam_schedule_view: Exam schedule generation successful.")
        return Response({'message': 'Exam schedule generated successfully.'}, status=status.HTTP_201_CREATED)

    except Promo.DoesNotExist:
        print("!!! ERROR in generate_exam_schedule_view: Promo not found.")
        return Response({'error': 'Promo not found.'}, status=status.HTTP_404_NOT_FOUND)
    except IntegrityError as e:
        print(f"!!! ERROR in generate_exam_schedule_view (Integrity): {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Database integrity error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"!!! ERROR in generate_exam_schedule_view (General): {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Class Schedule Generation View --- 
@api_view(['POST'])
def generate_class_schedule_view(request):
    promo_id = request.data.get('promo_id')
    semester_id = request.data.get('semester_id')

    if not promo_id or not semester_id:
        return Response({'error': 'promo_id and semester_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # 1. Fetch Core Data
            try:
                promo = Promo.objects.select_related('speciality').get(pk=promo_id)
                semester = Semester.objects.get(pk=semester_id)
                # Get sections for this promo
                sections = list(Section.objects.filter(promo=promo))
                if not sections:
                     raise ValueError(f"Promo '{promo.name}' has no sections defined.")
                # Get modules assigned to this promo
                modules = list(promo.modules.all())
                if not modules:
                     raise ValueError(f"Promo '{promo.name}' has no modules assigned.")
                # Get assignments for this promo
                assignments = TeacherModuleAssignment.objects.filter(promo=promo).select_related('teacher', 'module')
                # Create teacher lookup map: module_id -> teacher
                teacher_map = {a.module_id: a.teacher for a in assignments}
                 # Get classrooms 
                all_classrooms = list(Classroom.objects.all())
                if not all_classrooms:
                    raise ValueError("No classrooms found in the system.")
            except (Promo.DoesNotExist, Semester.DoesNotExist) as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. Clear Old Schedule
            ScheduleEntry.objects.filter(section__in=sections, semester=semester).delete()

            # 3. Scheduling Algorithm
            created_schedule_entries = []
            unscheduled_sessions = [] 
            # Keep track of booked resources within this run to avoid DB hits
            booked_slots = {} # Key: (day_of_week, start_time), Value: {'teachers': set(), 'sections': set(), 'classrooms': set()}

            # Pre-categorize classrooms by type
            print("generate_class_schedule_view: Categorizing classrooms...")
            classrooms_by_type = {
                SessionType.COURSE.value: [c for c in all_classrooms if c.type == SessionType.COURSE.value],
                SessionType.TD.value:    [c for c in all_classrooms if c.type == SessionType.TD.value],
                SessionType.TP.value:    [c for c in all_classrooms if c.type == SessionType.TP.value],
            }
            # Use .value for accessing the dictionary keys as well
            print(f"generate_class_schedule_view: COURS rooms: {[c.name for c in classrooms_by_type.get(SessionType.COURSE.value, [])]}")
            print(f"generate_class_schedule_view: TD rooms: {[c.name for c in classrooms_by_type.get(SessionType.TD.value, [])]}")
            print(f"generate_class_schedule_view: TP rooms: {[c.name for c in classrooms_by_type.get(SessionType.TP.value, [])]}")
            # Allow COURS/TD rooms to be used interchangeably if needed?
            # Use .get with default empty list to avoid KeyError if no rooms of a type exist
            flexible_classrooms = classrooms_by_type.get(SessionType.COURSE.value, []) + classrooms_by_type.get(SessionType.TD.value, [])
            random.shuffle(flexible_classrooms)
            # Also use .get for TP rooms
            tp_classrooms = classrooms_by_type.get(SessionType.TP.value, [])
            random.shuffle(tp_classrooms)

            # --- Create and Shuffle All Possible Slots --- 
            all_possible_slots = []
            for day in WORKING_DAYS:
                for start_h, start_m, end_h, end_m in TIME_SLOTS:
                    all_possible_slots.append({
                        'day': day,
                        'start_time': time(start_h, start_m),
                        'end_time': time(end_h, end_m),
                        'key': (day, time(start_h, start_m)) # Use tuple for dict key
                    })

            for section in sections:
                print(f"--- Scheduling Section: {section.name} ---")
                # Shuffle available slots for *this section* to vary placement
                random.shuffle(all_possible_slots) 

                for module in modules:
                    teacher = teacher_map.get(module.id)
                    if not teacher:
                        # This should ideally be caught before starting generation
                        unscheduled_sessions.append(f"Section '{section.name}', Module '{module}': No teacher assigned.")
                        continue 
                    
                    # Calculate slots needed based on hours and duration
                    slots_to_schedule = [
                        (SessionType.COURSE.value, (module.cours_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES if module.cours_hours > 0 else 0),
                        (SessionType.TD.value,    (module.td_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES if module.td_hours > 0 else 0),
                        (SessionType.TP.value,    (module.tp_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES if module.tp_hours > 0 else 0),
                    ]

                    print(f"  Module: {module} - Teacher: {teacher.full_name} - Needs: {slots_to_schedule}")

                    for session_type, count in slots_to_schedule:
                        if count <= 0:
                            continue
                        
                        print(f"    Attempting to schedule {count} slots of type {session_type}...")
                        
                        slots_placed = 0
                        
                        # --- Select CORRECT classroom pool based on session type --- 
                        # Use .get for safety
                        possible_classroom_pool = classrooms_by_type.get(session_type, [])
                        print(f"      Selected {session_type} classroom pool (size: {len(possible_classroom_pool)})")
                       
                        # Shuffle the chosen pool for randomness within the correct type
                        random.shuffle(possible_classroom_pool)
                        
                        if not possible_classroom_pool:
                             unscheduled_sessions.append(f"Section '{section.name}', Module '{module}', Type '{session_type}': No suitable classrooms of type '{session_type}' exist.")
                             continue # Cannot schedule without correct room type
                        
                        # --- Iterate through SHUFFLED slots --- 
                        for slot_info in all_possible_slots:
                            if slots_placed >= count: break # Got enough for this type
                                
                            day = slot_info['day']
                            start_time = slot_info['start_time']
                            end_time = slot_info['end_time']
                            slot_key = slot_info['key']

                            # --- Check Conflicts ---
                            busy_teachers_local = booked_slots.get(slot_key, {}).get('teachers', set()) # Renamed for clarity
                            busy_sections_local = booked_slots.get(slot_key, {}).get('sections', set()) # Renamed for clarity
                            busy_classrooms_local = booked_slots.get(slot_key, {}).get('classrooms', set()) # Renamed for clarity

                            # --- Check Teacher Availability (Local + DB) ---
                            if teacher.id in busy_teachers_local:
                                # print(f"      Local Conflict: Teacher {teacher.id} busy at {day} {start_time}") # Debugging
                                continue # Teacher busy in this run

                            # Check if teacher is busy according to the database
                            if ScheduleEntry.objects.filter(
                                teacher=teacher,
                                day_of_week=day,
                                start_time=start_time,
                                semester=semester
                            ).exists():
                                # print(f"      DB Conflict: Teacher {teacher.id} busy at {day} {start_time}") # Debugging
                                continue # Teacher already has a class scheduled then

                            # --- Check Section Availability (Local only - sections are specific to this promo) ---
                            if section.id in busy_sections_local:
                                # print(f"      Local Conflict: Section {section.id} busy at {day} {start_time}") # Debugging
                                continue # Section already has a class in this run

                            # --- Find AVAILABLE Classrooms (considering Local + DB) ---
                            truly_free_classrooms = []
                            for classroom in possible_classroom_pool:
                                # Check local conflicts first (faster)
                                if classroom.id in busy_classrooms_local:
                                    # print(f"      Local Conflict: Classroom {classroom.id} busy at {day} {start_time}") # Debugging
                                    continue # Classroom busy in this run

                                # Check DB conflicts
                                if ScheduleEntry.objects.filter(
                                    classroom=classroom,
                                    day_of_week=day,
                                    start_time=start_time,
                                    semester=semester
                                ).exists():
                                    # print(f"      DB Conflict: Classroom {classroom.id} busy at {day} {start_time}") # Debugging
                                    continue # Classroom already booked in DB

                                # If free both locally and in DB, add to list
                                truly_free_classrooms.append(classroom)

                            if not truly_free_classrooms:
                                # print(f"      Conflict: No truly free classrooms of type {session_type} found for slot {day} {start_time}") # Debugging
                                continue # No available rooms this slot

                            # Randomly choose one from the TRULY free list
                            assigned_classroom = random.choice(truly_free_classrooms)

                            # --- Slot Found! Create Entry & Update Tracker ---
                            # print(f"    Placing {session_type} slot {slots_placed + 1}/{count} on Day {day} at {start_time} in {assigned_classroom.name}") # Debugging
                            entry = ScheduleEntry(
                                section=section, semester=semester, module=module,
                                teacher=teacher, classroom=assigned_classroom,
                                day_of_week=day, start_time=start_time, end_time=end_time,
                                entry_type=session_type # Use the value ('COURS', 'TD', 'TP') directly
                            )
                            entry.save()
                            created_schedule_entries.append(entry)
                            slots_placed += 1

                            # Update booked slots tracker (as before)
                            if slot_key not in booked_slots:
                                booked_slots[slot_key] = {'teachers': set(), 'sections': set(), 'classrooms': set()}
                            booked_slots[slot_key]['teachers'].add(teacher.id)
                            booked_slots[slot_key]['sections'].add(section.id)
                            booked_slots[slot_key]['classrooms'].add(assigned_classroom.id)
                        # End of shuffled slots loop
                        
                        if slots_placed < count:
                            unscheduled_sessions.append(f"Section '{section.name}', Module '{module}', Type '{session_type}': Could only place {slots_placed}/{count} sessions.")

            # 4. Check for Failures (outside section/module loops)
            if unscheduled_sessions:
                 error_details = "\n".join(unscheduled_sessions)
                 print(f"SCHEDULING FAILED:\n{error_details}")
                 raise IntegrityError(f"Failed to schedule all sessions:\n{error_details}")

            # 5. Success Response 
            print(f"SCHEDULING SUCCESS: Generated {len(created_schedule_entries)} entries.")
            return Response({'message': f'Successfully generated schedule for {len(created_schedule_entries)} sessions.'}, status=status.HTTP_201_CREATED)
    
    # --- Exception Handling --- 
    except IntegrityError as e: # Catch IntegrityError (raised on scheduling failure)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Class Schedule Generation Error: Exception Type = {type(e).__name__}, Message = {e}")
        print(traceback.format_exc()) # Print the full traceback
        return Response({'error': 'An unexpected error occurred during schedule generation.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LocationViewSet(viewsets.ModelViewSet):
    """API endpoint that allows locations to be viewed or edited."""
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    # Add permission classes if needed, e.g., only admins can edit
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

@api_view(['GET'])
def export_schedule_pdf(request):
    """Export the current schedule to PDF format."""
    try:
        # Get filter parameters
        promo_id = request.query_params.get('promo_id')
        teacher_id = request.query_params.get('teacher_id')
        semester_id = request.query_params.get('semester_id')
        
        print(f"Received request with promo_id={promo_id}, teacher_id={teacher_id}, semester_id={semester_id}")
        
        if not semester_id:
            return Response({'error': 'semester_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not promo_id and not teacher_id:
            return Response({'error': 'Either promo_id or teacher_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=50)
        all_elements = []  # Will contain elements for all pages

        if promo_id:
            try:
                # Get promo information
                promo = Promo.objects.select_related('speciality').get(id=promo_id)
                # Get all sections for this promo
                sections = Section.objects.filter(promo_id=promo_id)
                
                for section in sections:
                    elements = []  # Elements for this section's page
                    
                    # Get schedule entries for this section
                    schedule_entries = ScheduleEntry.objects.filter(
                        semester_id=semester_id,
                        section=section
                    ).select_related(
                        'section', 'section__promo', 'semester', 
                        'module', 'module__base_module', 'teacher', 'classroom'
                    ).order_by('day_of_week', 'start_time')

                    # Add styles
                    styles = getSampleStyleSheet()
                    styles.add(ParagraphStyle(
                        name='CustomTitle',
                        parent=styles['Title'],
                        fontSize=12,
                        spaceAfter=30,
                        alignment=TA_CENTER
                    ))
                    styles.add(ParagraphStyle(
                        name='Header',
                        parent=styles['Normal'],
                        fontSize=10,
                        alignment=TA_CENTER,
                        spaceAfter=6
                    ))

                    # Add USTHB header
                    header_text = [
                        "University of Science and Technology Houari Boumediene",
                        "Vice-rectorate in charge of the higher education of graduation, the continuing education",
                        "et degrees"
                    ]
                    
                    for text in header_text:
                        elements.append(Paragraph(text, styles['Header']))
                    
                    elements.append(Spacer(1, 20))

                    # Add title and semester info
                    title_text = f"Schedules of: {promo.year_start}-{promo.year_end}  {promo.speciality.name} -- Section: {section.name}"
                    elements.append(Paragraph(title_text, styles['CustomTitle']))
                    
                    semester = Semester.objects.get(id=semester_id)
                    current_date = timezone.now().strftime("%d/%m/%Y")
                    info_text = f"College year: {promo.year_start}-{promo.year_end}     Semester: {semester.name}     Date: {current_date}"
                    elements.append(Paragraph(info_text, styles['Header']))
                    elements.append(Spacer(1, 20))

                    # Create time slots header
                    time_slots = [
                        "08:00 - 09:30",
                        "09:40 - 11:10",
                        "11:20 - 12:50",
                        "13:00 - 14:30",
                        "14:40 - 16:10",
                        "16:20 - 17:50"
                    ]

                    # Prepare data for table
                    data = [[''] + time_slots]  # First row is time slots
                    day_map = {
                        6: 'Sat',
                        7: 'Sun',
                        1: 'Mon',
                        2: 'Tue',
                        3: 'Wed',
                        4: 'Thu'
                    }  # Removed Friday (5) and reordered to put Saturday first

                    # Initialize empty schedule grid
                    schedule_grid = {day: [''] * len(time_slots) for day in day_map.keys()}

                    # Fill in the schedule grid
                    for entry in schedule_entries:
                        try:
                            day = entry.day_of_week
                            if day not in day_map:  # Skip Friday
                                continue
                            # Find the time slot index
                            time_str = entry.start_time.strftime("%H:%M")
                            slot_index = next(
                                (i for i, slot in enumerate(time_slots) if slot.startswith(time_str)),
                                -1
                            )
                            if slot_index != -1:
                                # Format the cell content with just section name
                                cell_content = [
                                    f"{entry.module.base_module.name}",
                                    f"{entry.entry_type}",
                                    f"Section {entry.section.name}",
                                    f"{entry.classroom.name if entry.classroom else 'N/A'}"
                                ]
                                schedule_grid[day][slot_index] = '\n'.join(filter(None, cell_content))
                        except Exception as e:
                            print(f"Error processing entry {entry.id}: {str(e)}")
                            continue

                    # Build the table data in the correct order (Saturday first)
                    ordered_days = [6, 7, 1, 2, 3, 4]  # Saturday to Thursday
                    for day in ordered_days:
                        row = [day_map[day]] + schedule_grid[day]
                        data.append(row)

                    # Create table
                    col_widths = [40] + [85] * len(time_slots)  # Adjust the widths as needed
                    table = Table(data, colWidths=col_widths, repeatRows=1)
                    
                    # Style the table
                    table_style = [
                        # Headers
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        # Day column
                        ('BACKGROUND', (0, 1), (0, -1), colors.grey),
                        ('TEXTCOLOR', (0, 1), (0, -1), colors.whitesmoke),
                        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
                        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                        # Content cells
                        ('BACKGROUND', (1, 1), (-1, -1), colors.white),
                        ('TEXTCOLOR', (1, 1), (-1, -1), colors.black),
                        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (1, 1), (-1, -1), 8),
                        ('TOPPADDING', (1, 1), (-1, -1), 5),
                        ('BOTTOMPADDING', (1, 1), (-1, -1), 5),
                        # Grid
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ]
                    table.setStyle(TableStyle(table_style))

                    elements.append(table)
                    
                    # Add page break after each section (except the last one)
                    if section != sections.last():
                        elements.append(PageBreak())
                    
                    # Add this section's elements to the main list
                    all_elements.extend(elements)

            except Promo.DoesNotExist:
                print(f"Promo with id {promo_id} not found")
                return Response({'error': f'Promo with id {promo_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"Error while getting promo data: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:  # teacher_id case
            try:
                schedule_entries = ScheduleEntry.objects.filter(
                    semester_id=semester_id,
                    teacher_id=teacher_id
                ).select_related(
                    'section', 'section__promo', 'semester', 
                    'module', 'module__base_module', 'teacher', 'classroom'
                ).order_by('day_of_week', 'start_time')

                if not schedule_entries:
                    return Response({'error': 'No schedule entries found.'}, status=status.HTTP_404_NOT_FOUND)

                elements = []  # Elements for teacher's page

                # Add styles
                styles = getSampleStyleSheet()
                styles.add(ParagraphStyle(
                    name='CustomTitle',
                    parent=styles['Title'],
                    fontSize=12,
                    spaceAfter=30,
                    alignment=TA_CENTER
                ))
                styles.add(ParagraphStyle(
                    name='Header',
                    parent=styles['Normal'],
                    fontSize=10,
                    alignment=TA_CENTER,
                    spaceAfter=6
                ))

                # Add USTHB header
                header_text = [
                    "University of Science and Technology Houari Boumediene",
                    "Vice-rectorate in charge of the higher education of graduation, the continuing education",
                    "et degrees"
                ]
                
                for text in header_text:
                    elements.append(Paragraph(text, styles['Header']))
                
                elements.append(Spacer(1, 20))

                # Add title and semester info
                teacher = schedule_entries.first().teacher
                title_text = f"Schedule of: {teacher.full_name}"
                elements.append(Paragraph(title_text, styles['CustomTitle']))
                
                semester = Semester.objects.get(id=semester_id)
                current_date = timezone.now().strftime("%d/%m/%Y")
                info_text = f"Semester: {semester.name}     Date: {current_date}"
                elements.append(Paragraph(info_text, styles['Header']))
                elements.append(Spacer(1, 20))

                # Create time slots header
                time_slots = [
                    "08:00 - 09:30",
                    "09:40 - 11:10",
                    "11:20 - 12:50",
                    "13:00 - 14:30",
                    "14:40 - 16:10",
                    "16:20 - 17:50"
                ]

                # Prepare data for table
                data = [[''] + time_slots]  # First row is time slots
                day_map = {
                    6: 'Sat',
                    7: 'Sun',
                    1: 'Mon',
                    2: 'Tue',
                    3: 'Wed',
                    4: 'Thu'
                }  # Removed Friday (5) and reordered to put Saturday first

                # Initialize empty schedule grid
                schedule_grid = {day: [''] * len(time_slots) for day in day_map.keys()}

                # Fill in the schedule grid
                for entry in schedule_entries:
                    try:
                        day = entry.day_of_week
                        if day not in day_map:  # Skip Friday
                            continue
                        # Find the time slot index
                        time_str = entry.start_time.strftime("%H:%M")
                        slot_index = next(
                            (i for i, slot in enumerate(time_slots) if slot.startswith(time_str)),
                            -1
                        )
                        if slot_index != -1:
                            # Format the cell content with just section name
                            cell_content = [
                                f"{entry.module.base_module.name}",
                                f"{entry.entry_type}",
                                f"Section {entry.section.name}",
                                f"{entry.classroom.name if entry.classroom else 'N/A'}"
                            ]
                            schedule_grid[day][slot_index] = '\n'.join(filter(None, cell_content))
                    except Exception as e:
                        print(f"Error processing entry {entry.id}: {str(e)}")
                        continue

                # Build the table data in the correct order (Saturday first)
                ordered_days = [6, 7, 1, 2, 3, 4]  # Saturday to Thursday
                for day in ordered_days:
                    row = [day_map[day]] + schedule_grid[day]
                    data.append(row)

                # Create table
                col_widths = [40] + [85] * len(time_slots)  # Adjust the widths as needed
                table = Table(data, colWidths=col_widths, repeatRows=1)
                
                # Style the table
                table_style = [
                    # Headers
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    # Day column
                    ('BACKGROUND', (0, 1), (0, -1), colors.grey),
                    ('TEXTCOLOR', (0, 1), (0, -1), colors.whitesmoke),
                    ('ALIGN', (0, 1), (0, -1), 'CENTER'),
                    ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                    # Content cells
                    ('BACKGROUND', (1, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (1, 1), (-1, -1), colors.black),
                    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                    ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (1, 1), (-1, -1), 8),
                    ('TOPPADDING', (1, 1), (-1, -1), 5),
                    ('BOTTOMPADDING', (1, 1), (-1, -1), 5),
                    # Grid
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]
                table.setStyle(TableStyle(table_style))

                elements.append(table)
                
                # Add all elements to the main list
                all_elements.extend(elements)

            except Exception as e:
                print(f"Error while getting teacher data: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Build PDF with all elements
        doc.build(all_elements)

        # Create response
        pdf = buffer.getvalue()
        buffer.close()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="schedule.pdf"'
        response.write(pdf)
        return response

    except Exception as e:
        print(f"PDF Export Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def export_schedule_excel(request):
    """Export the current schedule to Excel format."""
    try:
        # Get filter parameters
        promo_id = request.query_params.get('promo_id')
        teacher_id = request.query_params.get('teacher_id')
        semester_id = request.query_params.get('semester_id')
        
        if not semester_id:
            return Response({'error': 'semester_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not promo_id and not teacher_id:
            return Response({'error': 'Either promo_id or teacher_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get schedule entries
        schedule_entries = ScheduleEntry.objects.filter(
            semester_id=semester_id
        ).select_related(
            'section', 'section__promo', 'semester', 
            'module', 'module__base_module', 'teacher', 'classroom'
        )

        if promo_id:
            schedule_entries = schedule_entries.filter(section__promo_id=promo_id)
        if teacher_id:
            schedule_entries = schedule_entries.filter(teacher_id=teacher_id)

        schedule_entries = schedule_entries.order_by('day_of_week', 'start_time')

        if not schedule_entries:
            return Response({'error': 'No schedule entries found.'}, status=status.HTTP_404_NOT_FOUND)

        # Create Excel workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Schedule"

        # Add headers
        headers = ['Day', 'Time', 'Module', 'Teacher', 'Classroom', 'Type']
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = header
            cell.font = Font(bold=True)
            cell.alignment = Alignment(horizontal='center')
            cell.fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")

        # Add data
        day_map = {1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'}
        
        for row_num, entry in enumerate(schedule_entries, 2):
            ws.cell(row=row_num, column=1).value = day_map.get(entry.day_of_week, 'Unknown')
            ws.cell(row=row_num, column=2).value = f"{entry.start_time.strftime('%H:%M')} - {entry.end_time.strftime('%H:%M')}"
            ws.cell(row=row_num, column=3).value = entry.module.base_module.name
            ws.cell(row=row_num, column=4).value = entry.teacher.full_name
            ws.cell(row=row_num, column=5).value = entry.classroom.name if entry.classroom else 'N/A'
            ws.cell(row=row_num, column=6).value = entry.entry_type

        # Adjust column widths
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column].width = adjusted_width

        # Save to BytesIO
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        # Create response
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="schedule.xlsx"'
        return response

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- NEW VIEWSET for Exam Surveillance ---
class ExamSurveillanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Exam Surveillance assignments.
    Includes an action to automatically generate the surveillance schedule for a semester.
    """
    queryset = ExamSurveillance.objects.select_related('exam', 'teacher', 'exam__classroom', 'exam__module__base_module').all()
    serializer_class = ExamSurveillanceSerializer
    # permission_classes = [permissions.IsAdminUser] # Consider restricting access

    def get_queryset(self):
        """Optionally filter surveillance assignments by semester and/or teacher."""
        queryset = super().get_queryset()
        semester_id = self.request.query_params.get('semester_id')
        teacher_id = self.request.query_params.get('teacher_id')

        if semester_id:
            queryset = queryset.filter(exam__semester_id=semester_id)
        
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        # Order by exam date/time for logical display
        return queryset.order_by('exam__exam_date')

    @action(detail=False, methods=['post'], url_path='generate-schedule')
    @transaction.atomic
    def generate_schedule(self, request):
        """
        Generates the exam surveillance schedule for a given semester.
        Assigns one available teacher per exam slot.
        Expects 'semester_id' in the request data.
        """
        semester_id = request.data.get('semester_id')
        if not semester_id:
            return Response({'error': 'semester_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # --- Validate Semester ---
            semester = Semester.objects.get(pk=semester_id)

            # --- Get Data ---
            exams_to_schedule = list(Exam.objects.filter(semester=semester).order_by('exam_date'))
            available_teachers = list(User.objects.filter(is_teacher=True).order_by('id')) # Order for consistent assignment

            if not exams_to_schedule:
                return Response({'warning': 'No exams found for this semester. No schedule generated.'}, status=status.HTTP_200_OK)

            if not available_teachers:
                return Response({'error': 'No teachers found in the system.'}, status=status.HTTP_400_BAD_REQUEST)

            # --- Clear Existing Schedule for this Semester ---
            deleted_count, _ = ExamSurveillance.objects.filter(exam__semester=semester).delete()
            print(f"Deleted {deleted_count} existing surveillance assignments for semester {semester_id}.")

            # --- Scheduling Logic ---
            teacher_assignments = {} # Track teacher availability: {teacher_id: [ (start_time, end_time), ... ]}
            schedule_results = []
            teacher_index = 0
            assignments_made = 0

            for exam in exams_to_schedule:
                exam_start = exam.exam_date
                # Ensure exam.duration_minutes is not None, provide a default if necessary
                duration_minutes = exam.duration_minutes if exam.duration_minutes is not None else 120 # Default to 120 mins
                exam_end = exam_start + timedelta(minutes=duration_minutes)
                assigned_teacher = None

                # Try to find an available teacher
                attempts = 0
                while attempts < len(available_teachers):
                    current_teacher = available_teachers[teacher_index]
                    teacher_id = current_teacher.id
                    is_available = True

                    # Check for conflicts with this teacher's existing assignments in this run
                    if teacher_id in teacher_assignments:
                        for assigned_start, assigned_end in teacher_assignments[teacher_id]:
                            # Check for overlap: (StartA < EndB) and (EndA > StartB)
                            if exam_start < assigned_end and exam_end > assigned_start:
                                is_available = False
                                break # Conflict found

                    if is_available:
                        assigned_teacher = current_teacher
                        # Record the assignment time slot for this teacher
                        if teacher_id not in teacher_assignments:
                            teacher_assignments[teacher_id] = []
                        teacher_assignments[teacher_id].append((exam_start, exam_end))
                        # Move to the next teacher for the next assignment
                        teacher_index = (teacher_index + 1) % len(available_teachers)
                        break # Teacher found and assigned

                    # Move to the next teacher if the current one is busy
                    teacher_index = (teacher_index + 1) % len(available_teachers)
                    attempts += 1

                # --- Create Surveillance Record --- 
                # Use try-except for get_or_create or update_or_create for robustness if needed
                surveillance = ExamSurveillance(exam=exam, teacher=assigned_teacher)
                schedule_results.append(surveillance)
                if assigned_teacher:
                    assignments_made += 1
                else:
                    # Log or handle cases where no teacher could be assigned (e.g., more concurrent exams than teachers)
                    print(f"Warning: Could not find an available teacher for exam {exam.id} on {exam.exam_date}")


            # Bulk create the assignments
            ExamSurveillance.objects.bulk_create(schedule_results)

            # Fetch the created objects again to serialize them with related data
            created_assignments = ExamSurveillance.objects.filter(exam__semester=semester).select_related(
                'exam', 'teacher', 'exam__classroom', 'exam__module__base_module'
            ).order_by('exam__exam_date')
                
            serializer = self.get_serializer(created_assignments, many=True)
            return Response({
                'message': f'Successfully generated surveillance schedule for {assignments_made} out of {len(exams_to_schedule)} exams.',
                'schedule': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Semester.DoesNotExist:
            return Response({'error': f'Semester with id {semester_id} not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the detailed error
            print(f"!!! ERROR in generate_schedule: {str(e)}")
            traceback.print_exc()
            return Response({'error': f'An unexpected error occurred during schedule generation: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
