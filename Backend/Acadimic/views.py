from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from datetime import timedelta, date, datetime, time
from django.utils import timezone
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry, ExamPeriod,
    SessionType
)
from .serializers import (
    ClassroomSerializer, SpecialitySerializer, PromoSerializer, SectionSerializer,
    BaseModuleSerializer, VersionModuleSerializer, SemesterSerializer, ExamSerializer,
    TeacherModuleAssignmentSerializer, ScheduleEntrySerializer, ExamPeriodSerializer
)
import random

# Permissions: Default is IsAuthenticated. Consider IsAdminUser for stricter control.
# from rest_framework.permissions import IsAdminUser, IsAuthenticated

class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer

class PromoViewSet(viewsets.ModelViewSet):
    queryset = Promo.objects.all()
    serializer_class = PromoSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

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
def generate_exam_schedule_view(request):
    promo_id = request.data.get('promo_id')
    if not promo_id:
        return Response({'error': 'promo_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # --- Wrap EVERYTHING in a transaction --- 
        with transaction.atomic(): 
            promo = Promo.objects.select_related('semester').prefetch_related('modules').get(pk=promo_id)
            semester = promo.semester
            if not semester:
                return Response({'error': 'The selected promo does not have an assigned semester.'}, status=status.HTTP_400_BAD_REQUEST)
            
            modules = promo.modules.all()
            if not modules:
                return Response({'error': 'No modules assigned to the selected promo.'}, status=status.HTTP_404_NOT_FOUND)

            # --- Delete existing schedule first (within the transaction) --- 
            ExamPeriod.objects.filter(semester=semester).delete()
            Exam.objects.filter(semester=semester).delete()

            # --- Fetch available classrooms --- 
            available_classrooms = list(Classroom.objects.all())
            if not available_classrooms:
                 # If no classrooms exist at all, maybe raise error immediately
                 raise IntegrityError("No classrooms exist in the system to schedule exams.")

            period_start_date = semester.end_date + timedelta(days=7)
            # Adjust start date if Friday
            while period_start_date.weekday() == 4:
                period_start_date += timedelta(days=1)
            
            current_exam_date = period_start_date
            created_exams = []
            period_end_date = period_start_date
            last_assigned_classroom_index = -1 # Track last used index

            # --- Loop through modules to schedule --- 
            for module in modules:
                # Ensure current_exam_date is not a Friday 
                while current_exam_date.weekday() == 4:
                    current_exam_date += timedelta(days=1)
                
                # Calculate exam start and end times (assuming noon start, default duration)
                duration = timedelta(minutes=120) # Default duration
                exam_start_datetime = datetime.combine(current_exam_date, datetime.min.time()) + timedelta(hours=12) 
                exam_end_datetime = exam_start_datetime + duration

                # --- Find an available classroom --- 
                assigned_classroom = None
                found_classroom = False
                # Try all classrooms, starting after the last one used
                start_index = (last_assigned_classroom_index + 1) % len(available_classrooms)
                checked_indices = 0
                current_check_index = start_index

                while checked_indices < len(available_classrooms):
                    potential_classroom = available_classrooms[current_check_index]
                    
                    # Check for conflicts for this classroom at this time
                    conflicting_exams = Exam.objects.filter(
                        classroom=potential_classroom,
                        # Check for overlap: (ExistingStart < NewEnd) and (ExistingEnd > NewStart)
                        exam_date__lt=exam_end_datetime, 
                        exam_date__gte=exam_start_datetime - duration # Check end time based on exam_date + duration
                        # A more precise check would calculate the end time for each existing exam
                        # This simpler check assumes fixed duration for now
                        # NOTE: Assumes all exams have the same fixed duration for this conflict check.
                    ).exists()
                    
                    if not conflicting_exams:
                        assigned_classroom = potential_classroom
                        last_assigned_classroom_index = current_check_index # Remember index used
                        found_classroom = True
                        break # Found a free room
                    
                    # Move to the next classroom index (wrap around)
                    current_check_index = (current_check_index + 1) % len(available_classrooms)
                    checked_indices += 1

                # --- If no classroom found, abort --- 
                if not found_classroom:
                    raise IntegrityError(f"No available classroom found for module '{module.base_module.name} ({module.version_name})' on {current_exam_date.strftime('%Y-%m-%d')}.")

                # --- Create Exam --- 
                exam = Exam.objects.create(
                    name=f"Exam - {module.base_module.name}",
                    semester=semester, 
                    module=module,
                    exam_date=exam_start_datetime, # Use the calculated datetime
                    duration_minutes=duration.seconds // 60, # Store duration used
                    classroom=assigned_classroom 
                )
                created_exams.append(exam)
                period_end_date = current_exam_date # Update potential end date

                # Advance date for the next exam (exam day + 1 gap day = 2 days)
                current_exam_date += timedelta(days=2)

            # --- Create Exam Period (only if loop completes) --- 
            exam_period = ExamPeriod.objects.create(
                semester=semester,
                start_date=period_start_date,
                end_date=period_end_date
            )
            
            # --- Serialize and Return Success Response (outside the inner loop) --- 
            exam_period_serializer = ExamPeriodSerializer(exam_period)
            exam_serializer = ExamSerializer(created_exams, many=True)
    
            return Response({
                'message': 'Exam schedule generated successfully.',
                'exam_period': exam_period_serializer.data,
                'exams': exam_serializer.data
            }, status=status.HTTP_201_CREATED)

    # --- Exception Handling --- 
    except Promo.DoesNotExist:
        return Response({'error': 'Promo not found.'}, status=status.HTTP_404_NOT_FOUND)
    except IntegrityError as e: # Catch IntegrityError (e.g., from classroom conflict or explicit raise)
        # Rollback already happened due to transaction.atomic()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # General error (could be database issue, etc.)
        return Response({'error': f'An unexpected error occurred during schedule generation.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            classrooms_by_type = {
                SessionType.COURS.name: [c for c in all_classrooms if c.type == SessionType.COURS.name],
                SessionType.TD.name: [c for c in all_classrooms if c.type == SessionType.TD.name],
                SessionType.TP.name: [c for c in all_classrooms if c.type == SessionType.TP.name],
            }
            # Allow COURS/TD rooms to be used interchangeably if needed?
            flexible_classrooms = classrooms_by_type[SessionType.COURS.name] + classrooms_by_type[SessionType.TD.name]
            random.shuffle(flexible_classrooms)
            random.shuffle(classrooms_by_type[SessionType.TP.name])

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
                    
                    slots_to_schedule = [
                        (SessionType.COURS.name, (module.cours_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES),
                        (SessionType.TD.name, (module.td_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES),
                        (SessionType.TP.name, (module.tp_hours * 60 + SLOT_DURATION_MINUTES - 1) // SLOT_DURATION_MINUTES),
                    ]

                    print(f"  Module: {module} - Teacher: {teacher.full_name} - Needs: {slots_to_schedule}")

                    for session_type, count in slots_to_schedule:
                        if count <= 0:
                            continue
                        
                        slots_placed = 0
                        
                        # --- Select CORRECT classroom pool based on session type --- 
                        if session_type == SessionType.TP.name:
                            possible_classroom_pool = classrooms_by_type[SessionType.TP.name]
                        elif session_type == SessionType.TD.name:
                            possible_classroom_pool = classrooms_by_type[SessionType.TD.name]
                        elif session_type == SessionType.COURS.name:
                            possible_classroom_pool = classrooms_by_type[SessionType.COURS.name]
                        else:
                            # Should not happen with current SessionType enum
                            possible_classroom_pool = [] 
                        
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
                            busy_teachers = booked_slots.get(slot_key, {}).get('teachers', set())
                            busy_sections = booked_slots.get(slot_key, {}).get('sections', set())
                            busy_classrooms = booked_slots.get(slot_key, {}).get('classrooms', set())

                            if teacher.id in busy_teachers: continue 
                            if section.id in busy_sections: continue
                            
                            # --- Find ALL available classrooms and choose randomly --- 
                            free_classrooms = []
                            for classroom in possible_classroom_pool:
                                if classroom.id not in busy_classrooms:
                                    free_classrooms.append(classroom)
                            
                            if not free_classrooms: continue # No free rooms this slot
                                
                            # Randomly choose one from the free list
                            assigned_classroom = random.choice(free_classrooms) 
                            
                            # --- Slot Found! Create Entry & Update Tracker --- 
                            print(f"    Placing {session_type} slot {slots_placed + 1}/{count} on Day {day} at {start_time} in {assigned_classroom.name}")
                            entry = ScheduleEntry( 
                                section=section, semester=semester, module=module,
                                teacher=teacher, classroom=assigned_classroom,
                                day_of_week=day, start_time=start_time, end_time=end_time,
                                entry_type=session_type
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
        print(f"Class Schedule Generation Error: {e}") # Log for debugging
        return Response({'error': 'An unexpected error occurred during schedule generation.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
