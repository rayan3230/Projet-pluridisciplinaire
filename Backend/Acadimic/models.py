from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings # Import settings to reference the custom User model

# <<< NEW MODEL >>>
class Location(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Name of the location (e.g., Building A, Science Faculty, Amphi B)")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name'] # Order locations alphabetically by default

# Enum for Session Type
class SessionType(models.TextChoices):
    COURSE = 'COURS', _('Course')
    TD = 'TD', _('Tutorial Session')
    TP = 'TP', _('Practical Session')
    EXAM = 'EXAM', _('Exam')

class Classroom(models.Model) :
    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(
        max_length=10,
        choices=SessionType.choices, # Use choices from Enum
        default=SessionType.COURSE # Optional: Provide a default
    )
    has_projector = models.BooleanField(default=False)
    computers_count = models.IntegerField(default=0) # Added back
    # Add association to Location
    location = models.ForeignKey(
        Location, 
        on_delete=models.SET_NULL, # Keep classroom if location deleted, set location to null
        null=True, 
        blank=True, 
        related_name='classrooms', 
        help_text="Optional location where the classroom is situated."
    )
    # Note: computers_count field is missing in this version, might need re-adding

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    class Meta:
        ordering = ['name']

# --- Academic Structure ---
class Speciality(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Promo(models.Model):
    name = models.CharField(max_length=100)
    speciality = models.ForeignKey(Speciality, on_delete=models.CASCADE, related_name='promos')
    year_start = models.PositiveIntegerField()
    year_end = models.PositiveIntegerField()
    modules = models.ManyToManyField('VersionModule', related_name='promos', blank=True)
    semester = models.ForeignKey('Semester', on_delete=models.SET_NULL, related_name='promos', null=True, blank=True)

    class Meta:
        unique_together = ('name', 'speciality') # Ensure promo name is unique within a speciality

    def __str__(self):
        return f"{self.name} ({self.speciality.name})"

class Section(models.Model):
    name = models.CharField(max_length=50) # e.g., 'A', 'B', 'Group 1'
    promo = models.ForeignKey(Promo, on_delete=models.CASCADE, related_name='sections')

    class Meta:
        unique_together = ('name', 'promo') # Ensure section name is unique within a promo

    def __str__(self):
        return f"Section {self.name} ({self.promo})"


# --- Modules ---
class BaseModule(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class VersionModule(models.Model):
    base_module = models.ForeignKey(BaseModule, on_delete=models.CASCADE, related_name='versions')
    version_name = models.CharField(max_length=50) # e.g., "2023-2024", "Spring Variant"
    coefficient = models.FloatField(default=1.0)
    cours_hours = models.PositiveIntegerField(default=0)
    td_hours = models.PositiveIntegerField(default=0)
    tp_hours = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('base_module', 'version_name')

    def __str__(self):
        return f"{self.base_module.name} ({self.version_name})"

# --- Semesters & Exams ---
class Semester(models.Model):
    name = models.CharField(max_length=50) # e.g., "Semester 1", "Autumn 2024"
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

class Exam(models.Model):
    name = models.CharField(max_length=100) # e.g., "Midterm", "Final Exam"
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='exams')
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='exams')
    exam_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=120)
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')

    def __str__(self):
        return f"{self.name} - {self.module} ({self.semester})"

class ExamPeriod(models.Model):
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='exam_periods')
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Exam Period - {self.semester} ({self.start_date} to {self.end_date})"


# --- Teachers & Assignments ---
class TeacherModuleAssignment(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='module_assignments', limit_choices_to={'is_teacher': True})
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='assignments')
    promo = models.ForeignKey(Promo, on_delete=models.CASCADE, related_name='teacher_assignments') # Assign teacher to module FOR a specific promo

    class Meta:
        unique_together = ('teacher', 'module', 'promo') # Ensure a teacher is assigned only once to a module per promo

    def __str__(self):
        return f"{self.teacher.full_name} -> {self.module} ({self.promo})"


# --- Schedule Generation ---
class ScheduleEntry(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='schedule_entries')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='schedule_entries')
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='schedule_entries')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='schedule_entries', limit_choices_to={'is_teacher': True})
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedule_entries')
    day_of_week = models.IntegerField(choices=[(i, i) for i in range(1, 8)]) # 1=Monday, 7=Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()
    entry_type = models.CharField(
        max_length=10,
        choices=SessionType.choices,
        default=SessionType.COURSE
    )
    # Add a unique constraint to prevent conflicts
    class Meta:
        unique_together = (
            ('section', 'day_of_week', 'start_time'), # Section can't be in two places at once
            ('teacher', 'day_of_week', 'start_time'), # Teacher can't be in two places at once
            ('classroom', 'day_of_week', 'start_time'), # Classroom can't be used twice at once (if assigned)
        )
        ordering = ['semester', 'section', 'day_of_week', 'start_time']

    def __str__(self):
        day_map = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'}
        classroom_str = f" in {self.classroom}" if self.classroom else ""
        return f"{self.section} - {self.module} ({self.get_entry_type_display()}) with {self.teacher.full_name} on {day_map.get(self.day_of_week)} {self.start_time}-{self.end_time}{classroom_str}"



