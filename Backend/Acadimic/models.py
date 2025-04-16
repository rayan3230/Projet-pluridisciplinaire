from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings # Import settings to reference the custom User model
from django.core.exceptions import ValidationError

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
    academic_year = models.ForeignKey(
        'AcademicYear',
        on_delete=models.CASCADE,
        related_name='promos'
    )
    # REMOVED: modules = models.ManyToManyField(Module, related_name='promos_assigned')

    # Add a relationship to the new linking model
    assigned_modules = models.ManyToManyField(
        'VersionModule',
        through='PromoModuleSemester',
        related_name='assigned_promos'
    )

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'speciality', 'academic_year')

    def __str__(self):
        # Keep existing or update as needed
        return f"{self.name} - {self.speciality.name} ({self.academic_year})"

# NEW MODEL
class PromoModuleSemester(models.Model):
    promo = models.ForeignKey(Promo, on_delete=models.CASCADE)
    semester = models.ForeignKey('Semester', on_delete=models.CASCADE) # Use forward reference
    module = models.ForeignKey('VersionModule', on_delete=models.CASCADE) # Use forward reference

    class Meta:
        unique_together = ('promo', 'semester', 'module')
        verbose_name = "Promo Module Assignment (Semester)"
        verbose_name_plural = "Promo Module Assignments (Semester)"

    def __str__(self):
        return f"{self.promo} - {self.module} ({self.semester})"

    def clean(self):
        """
        Validate that the semester belongs to the same academic year as the promo.
        """
        if self.semester.academic_year != self.promo.academic_year:
            raise ValidationError(
                f"Semester's academic year ({self.semester.academic_year}) does not match promo's academic year ({self.promo.academic_year})"
            )
        super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

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
# --- MODIFIED: Semester now belongs to a Promo ---
class AcademicYear(models.Model):
    year_start = models.IntegerField()
    year_end = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('year_start', 'year_end')
        ordering = ['-year_start']

    def __str__(self):
        return f"{self.year_start}-{self.year_end}"

    def clean(self):
        if self.year_end != self.year_start + 1:
            raise ValidationError("Academic year must span exactly one year")
        super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        # Create two semesters if they don't exist
        if not self.semester_set.exists():
            Semester.objects.create(
                academic_year=self,
                semester_number=1,
                start_date=None,
                end_date=None
            )
            Semester.objects.create(
                academic_year=self,
                semester_number=2,
                start_date=None,
                end_date=None
            )

class Semester(models.Model):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    semester_number = models.IntegerField(choices=[(1, 'First'), (2, 'Second')])
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('academic_year', 'semester_number')
        ordering = ['academic_year', 'semester_number']

    def __str__(self):
        return f"Semester {self.semester_number} - {self.academic_year}"

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date")
        super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Exam(models.Model):
    name = models.CharField(max_length=100) # e.g., "Midterm", "Final Exam"
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='exams')
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='exams')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='exams')
    exam_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=120)
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')

    class Meta:
        unique_together = ('semester', 'module', 'section')
        ordering = ['semester', 'section', 'exam_date']

    def __str__(self):
        return f"{self.name} - {self.module} - {self.section} ({self.semester})"

class ExamPeriod(models.Model):
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='exam_periods')
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Exam Period - {self.semester} ({self.start_date} to {self.end_date})"


# --- Teachers & Assignments ---
# --- MODIFIED: Assignment is per Teacher, Module, and SEMESTER (not promo directly) ---
class TeacherBaseModuleAssignment(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='base_module_assignments', limit_choices_to={'is_teacher': True})
    base_module = models.ForeignKey(BaseModule, on_delete=models.CASCADE, related_name='teacher_assignments')

    class Meta:
        unique_together = ('teacher', 'base_module')
        ordering = ['teacher', 'base_module']

    def __str__(self):
        return f"{self.teacher.full_name} -> {self.base_module.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Create assignments for all version modules of this base module
        version_modules = VersionModule.objects.filter(base_module=self.base_module)
        for version_module in version_modules:
            TeacherModuleAssignment.objects.get_or_create(
                teacher=self.teacher,
                module=version_module
            )

class TeacherModuleAssignment(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='module_assignments', limit_choices_to={'is_teacher': True})
    module = models.ForeignKey(VersionModule, on_delete=models.CASCADE, related_name='teacher_assignments')

    class Meta:
        unique_together = ('teacher', 'module')
        ordering = ['teacher', 'module']

    def __str__(self):
        return f"{self.teacher.full_name} -> {self.module}"


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


# --- Exam Surveillance ---
class ExamSurveillance(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='surveillance_assignments',
        help_text="The exam being supervised."
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='surveillance_duties',
        limit_choices_to={'is_teacher': True},
        help_text="The teacher assigned to supervise this exam."
    )

    class Meta:
        unique_together = ('exam', 'teacher')
        ordering = ['exam__exam_date', 'teacher']
        verbose_name = "Exam Surveillance Assignment"
        verbose_name_plural = "Exam Surveillance Assignments"

    def __str__(self):
        teacher_name = self.teacher.get_full_name() if self.teacher else "Unassigned"
        return f"Surveillance for {self.exam} by {teacher_name}"

    def save(self, *args, **kwargs):
        # Ensure the teacher is marked as a teacher
        if self.teacher and not self.teacher.is_teacher:
            raise ValidationError("Only teachers can be assigned to exam surveillance.")
        super().save(*args, **kwargs)



