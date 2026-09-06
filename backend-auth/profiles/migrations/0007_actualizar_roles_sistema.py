from django.db import migrations


def actualizar_roles_sistema(apps, schema_editor):
    Rol = apps.get_model("profiles", "Rol")

    roles = [
        (1, "Administrador"),
        (2, "Directiva"),
        (3, "Vecino"),
        (4, "Municipal"),
    ]

    for rol_id, nombre in roles:
        rol, creado = Rol.objects.get_or_create(
            id=rol_id,
            defaults={"nombre": nombre},
        )

        if not creado and rol.nombre != nombre:
            rol.nombre = nombre
            rol.save(update_fields=["nombre"])


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0006_migrar_roles_perfil"),
    ]

    operations = [
        migrations.RunPython(
            actualizar_roles_sistema,
            migrations.RunPython.noop,
        ),
    ]