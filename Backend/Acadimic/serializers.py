from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Classroom, Speciality, Promo, Section,
    BaseModule, VersionModule, Semester, Exam,
    TeacherModuleAssignment, ScheduleEntry, ExamPeriod,
    SessionType, Location, ExamSurveillance, AcademicYear,
    PromoModuleSemester, TeacherBaseModuleAssignment
)

User = get_user_model()

class BaseModuleSerializer(serializers.ModelSerializer):
    versions_count = serializers.SerializerMethodField()
    latest_version = serializers.SerializerMethodField()
    assigned_teachers_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    versions_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = BaseModule
        fields = [
            'id', 
            'name',
            'status',
            'versions_count',
            'latest_version',
            'assigned_teachers_count',
            'versions_summary'
        ]
        
    def get_versions_count(self, obj):
        try:
            return obj.versions.count()
        except:
            return 0
        
    def get_latest_version(self, obj):
        try:
            latest = obj.versions.order_by('-version_name').first()
            if latest:
                return {
                    'id': latest.id,
                    'version_name': latest.version_name,
                    'coefficient': latest.coefficient,
                    'hours': {
                        'cours': latest.cours_hours,
                        'td': latest.td_hours,
                        'tp': latest.tp_hours,
                        'total': latest.cours_hours + latest.td_hours + latest.tp_hours
                    }
                }
        except:
            pass
        return None
        
    def get_assigned_teachers_count(self, obj):
        try:
            return obj.teacher_assignments.count()
        except:
            return 0
            
    def get_status(self, obj):
        try:
            versions_count = obj.versions.count()
            teachers_count = obj.teacher_assignments.count()
            
            if versions_count == 0:
                return {
                    'code': 'no_versions',
                    'label': 'No Versions',
                    'description': 'Module needs versions to be created'
                }
            elif teachers_count == 0:
                return {
                    'code': 'no_teachers',
                    'label': 'No Teachers',
                    'description': 'Module needs teachers to be assigned'
                }
            else:
                return {
                    'code': 'ready',
                    'label': 'Ready',
                    'description': 'Module is ready to be used'
                }
        except:
            return {
                'code': 'error',
                'label': 'Error',
                'description': 'Unable to determine module status'
            }
            
    def get_versions_summary(self, obj):
        try:
            versions = obj.versions.all()
            if not versions:
                return []
                
            return [{
                'id': version.id,
                'version_name': version.version_name,
                'total_hours': version.cours_hours + version.td_hours + version.tp_hours,
                'coefficient': version.coefficient
            } for version in versions]
        except:
            return []

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

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'year_start', 'year_end', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if data['year_end'] != data['year_start'] + 1:
            raise serializers.ValidationError("Academic year must span exactly one year")
        return data

class SemesterSerializer(serializers.ModelSerializer):
    academic_year = AcademicYearSerializer(read_only=True)
    academic_year_display = serializers.SerializerMethodField()

    class Meta:
        model = Semester
        fields = [
            'id', 'academic_year', 'academic_year_display', 'semester_number', 
            'start_date', 'end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'academic_year_display']

    def get_academic_year_display(self, obj):
        if obj.academic_year:
            return f"{obj.academic_year.year_start}-{obj.academic_year.year_end}"
        return "N/A"

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({"end_date": "End date must be after start date"})
        return data

class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = '__all__'

class PromoSerializer(serializers.ModelSerializer):
    speciality = SpecialitySerializer(read_only=True)
    academic_year = AcademicYearSerializer(read_only=True)
    speciality_id = serializers.IntegerField(write_only=True, required=True)
    academic_year_id = serializers.IntegerField(write_only=True, required=True)
    module_assignments = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    def validate(self, data):
        if not data.get('name'):
            raise serializers.ValidationError({"name": "Name is required"})
        
        if not data.get('speciality_id'):
            raise serializers.ValidationError({"speciality_id": "Speciality is required"})
            
        if not data.get('academic_year_id'):
            raise serializers.ValidationError({"academic_year_id": "Academic year is required"})

        module_assignments = data.get('module_assignments', [])
        if module_assignments:
            for assignment in module_assignments:
                if not all(key in assignment for key in ['semester_id', 'module_id']):
                    raise serializers.ValidationError({
                        "module_assignments": "Each assignment must have semester_id and module_id"
                    })
                
                try:
                    semester = Semester.objects.get(id=assignment['semester_id'])
                    if semester.academic_year.id != data['academic_year_id']:
                        raise serializers.ValidationError({
                            "module_assignments": f"Semester {semester.id} does not belong to the selected academic year"
                        })
                except Semester.DoesNotExist:
                    raise serializers.ValidationError({
                        "module_assignments": f"Semester {assignment['semester_id']} does not exist"
                    })
                
                try:
                    VersionModule.objects.get(id=assignment['module_id'])
                except VersionModule.DoesNotExist:
                    raise serializers.ValidationError({
                        "module_assignments": f"Module {assignment['module_id']} does not exist"
                    })
            
        return data

    def create(self, validated_data):
        module_assignments = validated_data.pop('module_assignments', [])
        promo = super().create(validated_data)
        
        for assignment in module_assignments:
            PromoModuleSemester.objects.create(
                promo=promo,
                semester_id=assignment['semester_id'],
                module_id=assignment['module_id']
            )
        
        return promo

    class Meta:
        model = Promo
        fields = [
            'id', 'name', 'speciality', 'academic_year', 
            'speciality_id', 'academic_year_id', 'module_assignments'
        ]
        read_only_fields = ['speciality', 'academic_year']

class SectionSerializer(serializers.ModelSerializer):
    promo = PromoSerializer(read_only=True)
    promo_id = serializers.IntegerField(write_only=True, required=True)

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
            'id', 'name', 'type', 'has_projector', 'computers_count',
            'location', 'location_id'
        ]

class ExamSerializer(serializers.ModelSerializer):
    module = VersionModuleSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    
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
    section_id = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all(),
        source='section',
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
            'id', 'name', 'module', 'semester', 'section', 'classroom',
            'module_id', 'semester_id', 'section_id', 'classroom_id',
            'exam_date', 'duration_minutes'
        ]

class ExamPeriodSerializer(serializers.ModelSerializer):
    semester = SemesterSerializer(read_only=True)
    semester_id = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), source='semester', write_only=True)

    class Meta:
        model = ExamPeriod
        fields = ['id', 'start_date', 'end_date', 'semester', 'semester_id']

class TeacherBaseModuleAssignmentSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_teacher=True), write_only=True, required=False)
    teacher_details = serializers.SerializerMethodField(read_only=True)
    base_module = BaseModuleSerializer(read_only=True)
    base_module_id = serializers.PrimaryKeyRelatedField(
        queryset=BaseModule.objects.all(),
        source='base_module',
        write_only=True
    )

    class Meta:
        model = TeacherBaseModuleAssignment
        fields = ['id', 'teacher', 'teacher_details', 'base_module', 'base_module_id']
        read_only_fields = ['teacher_details']

    def get_teacher_details(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.teacher).data

    def create(self, validated_data):
        if 'teacher_id' in self.initial_data:
            validated_data['teacher'] = User.objects.get(id=self.initial_data['teacher_id'])
        return super().create(validated_data)

class TeacherModuleAssignmentSerializer(serializers.ModelSerializer):
    teacher_details = serializers.SerializerMethodField(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_teacher=True),
        source='teacher',
        write_only=True
    )
    module = VersionModuleSerializer(read_only=True)
    module_id = serializers.PrimaryKeyRelatedField(
        queryset=VersionModule.objects.all(),
        source='module',
        write_only=True
    )

    class Meta:
        model = TeacherModuleAssignment
        fields = ['id', 'teacher_details', 'teacher_id', 'module', 'module_id']

    def get_teacher_details(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.teacher).data

class ScheduleEntrySerializer(serializers.ModelSerializer):
    section = SectionSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    module = VersionModuleSerializer(read_only=True)
    teacher_details = serializers.SerializerMethodField(read_only=True)
    classroom = ClassroomSerializer(read_only=True, allow_null=True)

    section_id = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), source='section', write_only=True)
    semester_id = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), source='semester', write_only=True)
    module_id = serializers.PrimaryKeyRelatedField(queryset=VersionModule.objects.all(), source='module', write_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_teacher=True), source='teacher', write_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all(), source='classroom', write_only=True, allow_null=True, required=False)

    class Meta:
        model = ScheduleEntry
        fields = [
            'id', 'section', 'semester', 'module', 'teacher_details', 'classroom',
            'section_id', 'semester_id', 'module_id', 'teacher_id', 'classroom_id',
            'day_of_week', 'start_time', 'end_time', 'entry_type'
        ]

    def get_teacher_details(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.teacher).data

class ExamSurveillanceSerializer(serializers.ModelSerializer):
    exam = ExamSerializer(read_only=True)
    teacher_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ExamSurveillance
        fields = ['id', 'exam', 'teacher', 'teacher_details']

    def get_teacher_details(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.teacher).data

class PromoModuleSemesterSerializer(serializers.ModelSerializer):
    promo = serializers.PrimaryKeyRelatedField(queryset=Promo.objects.all())
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())
    module = serializers.PrimaryKeyRelatedField(queryset=VersionModule.objects.all())

    promo_name = serializers.CharField(source='promo.name', read_only=True)
    semester_display = serializers.CharField(source='semester.__str__', read_only=True)
    module_display = serializers.CharField(source='module.__str__', read_only=True)

    def validate(self, data):
        promo = data.get('promo')
        semester = data.get('semester')
        module = data.get('module')

        if promo and semester and promo.academic_year != semester.academic_year:
            raise serializers.ValidationError(
                f"Semester's academic year ({semester.academic_year}) does not match promo's academic year ({promo.academic_year})"
            )

        return data

    class Meta:
        model = PromoModuleSemester
        fields = [
            'id', 'promo', 'semester', 'module',
            'promo_name', 'semester_display', 'module_display'
        ]
        read_only_fields = ['promo_name', 'semester_display', 'module_display']

class ScheduleGenerationRequestSerializer(serializers.Serializer):
    promo_id = serializers.IntegerField(required=True)
    semester_id = serializers.IntegerField(required=True)
    teacher_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )

    def validate_promo_id(self, value):
        try:
            Promo.objects.get(id=value)
        except Promo.DoesNotExist:
            raise serializers.ValidationError("Promo not found")
        return value

    def validate_semester_id(self, value):
        try:
            Semester.objects.get(id=value)
        except Semester.DoesNotExist:
            raise serializers.ValidationError("Semester not found")
        return value

    def validate_teacher_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one teacher must be specified")
        return value 