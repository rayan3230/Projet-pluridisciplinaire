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
        available_classrooms = list(Classroom.objects.filter(type=SessionType.COURSE.name))
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
        print(f"Class Schedule Generation Error: {e}") # Log for debugging
        return Response({'error': 'An unexpected error occurred during schedule generation.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
