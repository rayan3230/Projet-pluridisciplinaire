from django.db import models
from enum import Enum 
from django.conf import settings # Import settings to reference the custom User model

class MyEnum(Enum):
    COURS = 'Cours'
    TD = 'TD'
    TP = 'TP'

class Classroom(models.Model) :
    name = models.CharField(max_length=50)
    type = models.CharField(
        max_length=10,
        choices=[(tag.name, tag.value) for tag in MyEnum]  # Use Enum values as choices
    )
    capacity = models.IntegerField(default=0)
    has_projector = models.BooleanField(default=False)
    computers_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

# --- Academic Structure ---
class Speciality(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Promo(models.Model):
    name = models.CharField(max_length=100)
    speciality = models.ForeignKey(Speciality, on_delete=models.CASCADE, related_name='promos')

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
    code = models.CharField(max_length=10, unique=True) # e.g., ANAL, PROG
    coef = models.FloatField(default=1.0)

    def __str__(self):
        return f"{self.name} ({self.code})"

class VersionModule(models.Model):
    base_module = models.ForeignKey(BaseModule, on_delete=models.CASCADE, related_name='versions')
    version_name = models.CharField(max_length=50, blank=True) # e.g., "1", "Advanced", could be blank if only one version
    cours_hours = models.PositiveIntegerField(default=0)
    td_hours = models.PositiveIntegerField(default=0)
    tp_hours = models.PositiveIntegerField(default=0)
    # Add other fields specific to a version if needed

    def __str__(self):
        # Use version name if available, otherwise just base module name
        version_suffix = f" - {self.version_name}" if self.version_name else ""
        return f"{self.base_module.name}{version_suffix}"

# --- Semesters & Exams ---
class Semester(models.Model):
    name = models.CharField(max_length=50) # e.g., "Semester 1", "Autumn 2024"
    start_date = models.DateField()
    end_date = models.DateField()
    # Potentially link to Promo if semesters are specific per promo/year
    # promo = models.ForeignKey(Promo, on_delete=models.CASCADE, related_name='semesters', null=True, blank=True)

    def __str__(self):
        return self.name

class Exam(models.Model):
    name = models.CharField(max_length=100) # e.g., "Midterm", "Final Exam"
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='exams')
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='exams')
    exam_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=120)

    def __str__(self):
        return f"{self.name} - {self.module} ({self.semester})"


# --- Teachers & Assignments ---
class TeacherModuleAssignment(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='module_assignments', limit_choices_to={'is_teacher': True})
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='assignments')
    promo = models.ForeignKey(Promo, on_delete=models.CASCADE, related_name='teacher_assignments') # Assign teacher to module FOR a specific promo
    # semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='teacher_assignments') # Optional: Assign per semester

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
        choices=[(tag.name, tag.value) for tag in MyEnum] # Cours, TD, TP
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



