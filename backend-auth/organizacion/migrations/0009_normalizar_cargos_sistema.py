from django.db import migrations


def normalizar_cargos_sistema(apps, schema_editor):
    Cargo = apps.get_model("organizacion", "Cargo")
    IntegranteDirectiva = apps.get_model(
        "organizacion",
        "IntegranteDirectiva",
    )

    cargos_sistema = [
        {
            "codigo": "PRESIDENCIA",
            "nombre": "Presidencia",
            "variantes": ["Presidente", "Presidenta"],
            "descripcion": "Presidencia de la junta",
            "permite_multiples": False,
        },
        {
            "codigo": "SECRETARIA",
            "nombre": "Secretaría",
            "variantes": ["Secretario", "Secretaria"],
            "descripcion": "Secretaría de la junta",
            "permite_multiples": False,
        },
        {
            "codigo": "TESORERIA",
            "nombre": "Tesorería",
            "variantes": ["Tesorero", "Tesorera"],
            "descripcion": "Tesorería de la junta",
            "permite_multiples": False,
        },
        {
            "codigo": "VOCAL",
            "nombre": "Vocal",
            "variantes": [],
            "descripcion": "Integrante vocal de la junta",
            "permite_multiples": True,
        },
    ]

    for datos in cargos_sistema:
        cargo_principal = Cargo.objects.filter(
            codigo=datos["codigo"],
        ).first()

        if cargo_principal is None:
            cargo_principal = Cargo.objects.filter(
                nombre=datos["nombre"],
            ).first()

        if cargo_principal is None:
            for variante in datos["variantes"]:
                cargo_principal = Cargo.objects.filter(
                    nombre=variante,
                ).first()

                if cargo_principal is not None:
                    break

        if cargo_principal is None:
            cargo_principal = Cargo.objects.create(
                nombre=datos["nombre"],
                codigo=datos["codigo"],
                descripcion=datos["descripcion"],
                permite_multiples=datos["permite_multiples"],
                es_sistema=True,
                activo=True,
            )
        else:
            cargo_principal.nombre = datos["nombre"]
            cargo_principal.codigo = datos["codigo"]
            cargo_principal.descripcion = datos["descripcion"]
            cargo_principal.permite_multiples = datos[
                "permite_multiples"
            ]
            cargo_principal.es_sistema = True
            cargo_principal.activo = True

            cargo_principal.save(
                update_fields=[
                    "nombre",
                    "codigo",
                    "descripcion",
                    "permite_multiples",
                    "es_sistema",
                    "activo",
                ]
            )

        nombres_duplicados = (
            [datos["nombre"]]
            + datos["variantes"]
        )

        duplicados = Cargo.objects.filter(
            nombre__in=nombres_duplicados,
        ).exclude(
            id=cargo_principal.id,
        )

        for duplicado in duplicados:
            IntegranteDirectiva.objects.filter(
                cargo_id=duplicado.id,
            ).update(
                cargo_id=cargo_principal.id,
            )

            duplicado.delete()


def reversa_no_op(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("organizacion", "0008_cargo_codigo_cargo_es_sistema"),
    ]

    operations = [
        migrations.RunPython(
            normalizar_cargos_sistema,
            reversa_no_op,
        ),
    ]