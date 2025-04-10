# Generated by Django 5.1.7 on 2025-04-11 09:59

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Acadimic', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BaseModule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('code', models.CharField(max_length=10, unique=True)),
                ('coef', models.FloatField(default=1.0)),
            ],
        ),
        migrations.CreateModel(
            name='Promo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Semester',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Speciality',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('promo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='Acadimic.promo')),
            ],
            options={
                'unique_together': {('name', 'promo')},
            },
        ),
        migrations.AddField(
            model_name='promo',
            name='speciality',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='promos', to='Acadimic.speciality'),
        ),
        migrations.CreateModel(
            name='VersionModule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version_name', models.CharField(blank=True, max_length=50)),
                ('cours_hours', models.PositiveIntegerField(default=0)),
                ('td_hours', models.PositiveIntegerField(default=0)),
                ('tp_hours', models.PositiveIntegerField(default=0)),
                ('base_module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='versions', to='Acadimic.basemodule')),
            ],
        ),
        migrations.CreateModel(
            name='Exam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('exam_date', models.DateTimeField()),
                ('duration_minutes', models.PositiveIntegerField(default=120)),
                ('semester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exams', to='Acadimic.semester')),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exams', to='Acadimic.versionmodule')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='promo',
            unique_together={('name', 'speciality')},
        ),
        migrations.CreateModel(
            name='TeacherModuleAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('promo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teacher_assignments', to='Acadimic.promo')),
                ('teacher', models.ForeignKey(limit_choices_to={'is_teacher': True}, on_delete=django.db.models.deletion.CASCADE, related_name='module_assignments', to=settings.AUTH_USER_MODEL)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='Acadimic.versionmodule')),
            ],
            options={
                'unique_together': {('teacher', 'module', 'promo')},
            },
        ),
        migrations.CreateModel(
            name='ScheduleEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day_of_week', models.IntegerField(choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7)])),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('entry_type', models.CharField(choices=[('COURS', 'Cours'), ('TD', 'TD'), ('TP', 'TP')], max_length=10)),
                ('classroom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='schedule_entries', to='Acadimic.classroom')),
                ('teacher', models.ForeignKey(limit_choices_to={'is_teacher': True}, on_delete=django.db.models.deletion.CASCADE, related_name='schedule_entries', to=settings.AUTH_USER_MODEL)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedule_entries', to='Acadimic.section')),
                ('semester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedule_entries', to='Acadimic.semester')),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedule_entries', to='Acadimic.versionmodule')),
            ],
            options={
                'ordering': ['semester', 'section', 'day_of_week', 'start_time'],
                'unique_together': {('classroom', 'day_of_week', 'start_time'), ('section', 'day_of_week', 'start_time'), ('teacher', 'day_of_week', 'start_time')},
            },
        ),
    ]
