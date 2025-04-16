from django.db import migrations, models
import django.db.models.deletion

def create_academic_years(apps, schema_editor):
    Promo = apps.get_model('Acadimic', 'Promo')
    AcademicYear = apps.get_model('Acadimic', 'AcademicYear')
    
    # Get unique year combinations from existing promos
    year_combinations = Promo.objects.values('year_start', 'year_end').distinct()
    
    # Create AcademicYear instances
    for combo in year_combinations:
        AcademicYear.objects.create(
            year_start=combo['year_start'],
            year_end=combo['year_end']
        )

def reverse_academic_years(apps, schema_editor):
    AcademicYear = apps.get_model('Acadimic', 'AcademicYear')
    AcademicYear.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('Acadimic', '0006_alter_promo_options_alter_semester_options_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AcademicYear',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year_start', models.PositiveIntegerField()),
                ('year_end', models.PositiveIntegerField()),
            ],
            options={
                'ordering': ['-year_start'],
                'unique_together': {('year_start', 'year_end')},
            },
        ),
        migrations.RunPython(create_academic_years, reverse_academic_years),
        migrations.AddField(
            model_name='semester',
            name='academic_year',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='semesters', to='Acadimic.academicyear'),
        ),
        migrations.AlterUniqueTogether(
            name='semester',
            unique_together={('academic_year', 'semester_number')},
        ),
        migrations.AlterModelOptions(
            name='semester',
            options={'ordering': ['academic_year__year_start', 'semester_number']},
        ),
    ] 