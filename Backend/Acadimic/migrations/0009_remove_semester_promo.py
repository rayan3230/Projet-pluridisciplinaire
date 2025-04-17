from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('Acadimic', '0008_migrate_semester_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='semester',
            name='promo',
        ),
    ] 