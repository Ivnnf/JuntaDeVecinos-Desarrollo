from django.db import migrations


def migrar_roles_perfil(apps, schema_editor):
    Perfil = apps.get_model("profiles", "Perfil")
    UsuarioRol = apps.get_model("profiles", "UsuarioRol")

    for perfil in Perfil.objects.select_related("usuario", "rol").all():
        if perfil.rol_id:
            UsuarioRol.objects.get_or_create(
                usuario_id=perfil.usuario_id,
                rol_id=perfil.rol_id,
                defaults={
                    "activo": True,
                },
            )


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0005_usuariorol"),
    ]

    operations = [
        migrations.RunPython(
            migrar_roles_perfil,
            migrations.RunPython.noop,
        ),
    ]