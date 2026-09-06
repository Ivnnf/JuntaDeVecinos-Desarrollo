from django.db import migrations


def migrar_datos_perfil_usuario(apps, schema_editor):
    Perfil = apps.get_model("profiles", "Perfil")
    Usuario = apps.get_model("profiles", "Usuario")

    for perfil in Perfil.objects.all():
        usuario = Usuario.objects.get(id=perfil.usuario_id)

        cambios = []

        if perfil.rut and not usuario.rut:
            usuario.rut = perfil.rut
            cambios.append("rut")

        if perfil.fecha_nacimiento and not usuario.fecha_nacimiento:
            usuario.fecha_nacimiento = perfil.fecha_nacimiento
            cambios.append("fecha_nacimiento")

        if cambios:
            usuario.save(update_fields=cambios)


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0008_usuario_apellido_materno_usuario_apellido_paterno_and_more"),
    ]

    operations = [
        migrations.RunPython(
            migrar_datos_perfil_usuario,
            migrations.RunPython.noop,
        ),
    ]