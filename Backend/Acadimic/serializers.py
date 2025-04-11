from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model # Import get_user_model
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry
)
from users.serializers import UserSerializer

# Get the actual User model class
User = get_user_model()

class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = '__all__'

class PromoSerializer(serializers.ModelSerializer):
    # Optionally include speciality details when reading
    speciality = SpecialitySerializer(read_only=True)
    # Allow writing speciality by ID
    speciality_id = serializers.PrimaryKeyRelatedField(
        queryset=Speciality.objects.all(), source='speciality', write_only=True
    )

    class Meta:
        model = Promo
        fields = ['id', 'name', 'speciality', 'speciality_id']

class SectionSerializer(serializers.ModelSerializer):
    # Optionally include promo details when reading
    promo = PromoSerializer(read_only=True)
     # Allow writing promo by ID
    promo_id = serializers.PrimaryKeyRelatedField(
        queryset=Promo.objects.all(), source='promo', write_only=True
    )

    class Meta:
        model = Section
        fields = ['id', 'name', 'promo', 'promo_id']


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'


class BaseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseModule
        fields = '__all__'

class VersionModuleSerializer(serializers.ModelSerializer):
    # Optionally include base module details when reading
    base_module = BaseModuleSerializer(read_only=True)
     # Allow writing base_module by ID
    base_module_id = serializers.PrimaryKeyRelatedField(
        queryset=BaseModule.objects.all(), source='base_module', write_only=True
    )

    class Meta:
        model = VersionModule
        fields = ['id', 'version_name', 'cours_hours', 'td_hours', 'tp_hours', 'base_module', 'base_module_id']

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    module = VersionModuleSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    module_id = serializers.PrimaryKeyRelatedField(queryset=VersionModule.objects.all(), source='module', write_only=True)
    semester_id = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), source='semester', write_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'name', 'exam_date', 'duration_minutes', 'module', 'semester', 'module_id', 'semester_id']


class TeacherModuleAssignmentSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True) # Assuming UserSerializer exists and shows relevant info
    module = VersionModuleSerializer(read_only=True)
    promo = PromoSerializer(read_only=True)

    # Use the imported User model class here
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_teacher=True), source='teacher', write_only=True)
    module_id = serializers.PrimaryKeyRelatedField(queryset=VersionModule.objects.all(), source='module', write_only=True)
    promo_id = serializers.PrimaryKeyRelatedField(queryset=Promo.objects.all(), source='promo', write_only=True)

    class Meta:
        model = TeacherModuleAssignment
        fields = ['id', 'teacher', 'module', 'promo', 'teacher_id', 'module_id', 'promo_id']


class ScheduleEntrySerializer(serializers.ModelSerializer):
    section = SectionSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    module = VersionModuleSerializer(read_only=True)
    teacher = UserSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True, allow_null=True)

    section_id = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), source='section', write_only=True)
    semester_id = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), source='semester', write_only=True)
    module_id = serializers.PrimaryKeyRelatedField(queryset=VersionModule.objects.all(), source='module', write_only=True)
    # Use the imported User model class here
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_teacher=True), source='teacher', write_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all(), source='classroom', write_only=True, allow_null=True, required=False)

    class Meta:
        model = ScheduleEntry
        fields = [
            'id', 'section', 'semester', 'module', 'teacher', 'classroom',
            'day_of_week', 'start_time', 'end_time', 'entry_type',
            'section_id', 'semester_id', 'module_id', 'teacher_id', 'classroom_id'
        ]

# Remove the import from the bottom as it's now at the top
# from django.conf import settings 