from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry, ExamPeriod,
    SessionType, Location, ExamSurveillance
)
# Import UserSerializer from the correct app
from users.serializers import UserSerializer

User = get_user_model()

class BaseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseModule
        fields = ['id', 'name']

# Define SemesterSerializer before VersionModuleSerializer if VersionModule uses it
class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'

class VersionModuleSerializer(serializers.ModelSerializer):
    base_module = BaseModuleSerializer(read_only=True)
    base_module_id = serializers.PrimaryKeyRelatedField(
        queryset=BaseModule.objects.all(), source='base_module', write_only=True
    )

    class Meta:
        model = VersionModule
        fields = [
            'id', 'base_module', 'base_module_id', 'version_name',
            'coefficient', 'cours_hours', 'td_hours', 'tp_hours'
        ]
        extra_kwargs = {
            'version_name': {'required': True}
        }

# Define SpecialitySerializer before PromoSerializer
class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = '__all__'

class PromoSerializer(serializers.ModelSerializer):
    speciality = SpecialitySerializer(read_only=True)
    speciality_id = serializers.PrimaryKeyRelatedField(
        queryset=Speciality.objects.all(), source='speciality', write_only=True
    )
    modules = VersionModuleSerializer(many=True, read_only=True)
    module_ids = serializers.PrimaryKeyRelatedField(
        queryset=VersionModule.objects.all(), source='modules', write_only=True, many=True, required=False
    )
    semester = SemesterSerializer(read_only=True, required=False)
    semester_id = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all(), source='semester', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Promo
        fields = [
            'id', 'name', 'speciality', 'speciality_id',
            'year_start', 'year_end',
            'semester', 'semester_id',
            'modules', 'module_ids'
        ]

class SectionSerializer(serializers.ModelSerializer):
    promo = PromoSerializer(read_only=True)
    promo_id = serializers.PrimaryKeyRelatedField(
        queryset=Promo.objects.all(), source='promo', write_only=True
    )

    class Meta:
        model = Section
        fields = ['id', 'name', 'promo', 'promo_id']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class ClassroomSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True, required=False, allow_null=True
    )
    type = serializers.ChoiceField(choices=SessionType.choices)
    has_projector = serializers.BooleanField()

    class Meta:
        model = Classroom
        fields = [
            'id',
            'name',
            'type',
            'has_projector',
            'location',
            'location_id'
        ]

class ExamSerializer(serializers.ModelSerializer):
    module = VersionModuleSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    
    module_id = serializers.PrimaryKeyRelatedField(
        queryset=VersionModule.objects.all(),
        source='module',
        write_only=True
    )
    semester_id = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all(),
        source='semester',
        write_only=True
    )
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Classroom.objects.all(),
        source='classroom',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Exam
        fields = [
            'id', 'name', 'exam_date', 'duration_minutes', 
            'module', 'semester', 'classroom',
            'module_id', 'semester_id', 'classroom_id'
        ]

class ExamPeriodSerializer(serializers.ModelSerializer):
    semester = SemesterSerializer(read_only=True)
    semester_id = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), source='semester', write_only=True)

    class Meta:
        model = ExamPeriod
        fields = ['id', 'start_date', 'end_date', 'semester', 'semester_id']

class TeacherModuleAssignmentSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    module = VersionModuleSerializer(read_only=True)
    promo = PromoSerializer(read_only=True)

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
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_teacher=True), source='teacher', write_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all(), source='classroom', write_only=True, allow_null=True, required=False)

    class Meta:
        model = ScheduleEntry
        fields = [
            'id', 'section', 'semester', 'module', 'teacher', 'classroom',
            'day_of_week', 'start_time', 'end_time', 'entry_type',
            'section_id', 'semester_id', 'module_id', 'teacher_id', 'classroom_id'
        ]

class ExamSurveillanceSerializer(serializers.ModelSerializer):
    exam = ExamSerializer(read_only=True)
    teacher = UserSerializer(read_only=True)

    exam_id = serializers.PrimaryKeyRelatedField(
        queryset=Exam.objects.all(),
        source='exam',
        write_only=True
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_teacher=True),
        source='teacher',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = ExamSurveillance
        fields = ['id', 'exam', 'teacher', 'exam_id', 'teacher_id'] 