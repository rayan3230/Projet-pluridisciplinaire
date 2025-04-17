from django.db import migrations

def migrate_semester_data(apps, schema_editor):
    Semester = apps.get_model('Acadimic', 'Semester')
    AcademicYear = apps.get_model('Acadimic', 'AcademicYear')
    
    # For each semester, find or create the corresponding academic year
    for semester in Semester.objects.all():
        if semester.promo:
            academic_year, created = AcademicYear.objects.get_or_create(
                year_start=semester.promo.year_start,
                year_end=semester.promo.year_end
            )
            semester.academic_year = academic_year
            semester.save()

def reverse_migrate_semester_data(apps, schema_editor):
    # Since we can't reliably reverse this operation, we'll pass
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('Acadimic', '0007_add_academic_year'),
    ]

    operations = [
        migrations.RunPython(migrate_semester_data, reverse_migrate_semester_data),
    ] 