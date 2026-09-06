from django.db import migrations


def cargar_roles_iniciales(apps, schema_editor):
    Rol = apps.get_model("profiles", "Rol")

    roles = [
        (1, "Administrador"),
        (2, "Moderador"),
        (3, "Usuario"),
    ]

    for rol_id, nombre in roles:
        Rol.objects.get_or_create(
            id=rol_id,
            defaults={"nombre": nombre},
        )


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0003_perfil"),
    ]

    operations = [
        migrations.RunPython(
            cargar_roles_iniciales,
            migrations.RunPython.noop,
        ),
    ]