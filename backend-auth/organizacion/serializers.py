from rest_framework import serializers

from .models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
)
from django.contrib.auth import get_user_model


class JuntaVecinosSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuntaVecinos
        fields = [
            "id",
            "nombre",
            "comuna",
            "descripcion",
            "activa",
            "fecha_creacion",
        ]

        read_only_fields = [
            "id",
            "fecha_creacion",
        ]


class SectorSerializer(serializers.ModelSerializer):
    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = Sector
        fields = [
            "id",
            "junta_vecinos",
            "junta_nombre",
            "nombre",
            "descripcion",
            "activo",
            "fecha_creacion",
        ]

        read_only_fields = [
            "id",
            "fecha_creacion",
        ]


class AsociacionSectorPendienteSerializer(serializers.ModelSerializer):
    sector_id = serializers.IntegerField(
        source="sector.id",
        read_only=True,
    )

    sector_nombre = serializers.CharField(
        source="sector.nombre",
        read_only=True,
    )

    junta_id = serializers.IntegerField(
        source="sector.junta_vecinos.id",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="sector.junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = get_user_model()

        fields = [
            "id",
            "username",
            "rut",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "email",
            "sector_id",
            "sector_nombre",
            "junta_id",
            "junta_nombre",
            "estado_asociacion_sector",
        ]

        read_only_fields = fields


class UsuarioElegibleDirectivaSerializer(serializers.ModelSerializer):
    sector_id = serializers.IntegerField(
        source="sector.id",
        read_only=True,
    )

    sector_nombre = serializers.CharField(
        source="sector.nombre",
        read_only=True,
    )

    junta_id = serializers.IntegerField(
        source="sector.junta_vecinos.id",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="sector.junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = get_user_model()

        fields = [
            "id",
            "username",
            "rut",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "email",
            "sector_id",
            "sector_nombre",
            "junta_id",
            "junta_nombre",
            "estado_asociacion_sector",
        ]

        read_only_fields = fields


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = [
            "id",
            "nombre",
            "descripcion",
            "permite_multiples",
            "activo",
        ]

        read_only_fields = [
            "id",
        ]


class DirectivaSerializer(serializers.ModelSerializer):
    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = Directiva
        fields = [
            "id",
            "junta_vecinos",
            "junta_nombre",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "observacion",
        ]

        read_only_fields = [
            "id",
        ]


class IntegranteDirectivaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(
        source="usuario.username",
        read_only=True,
    )

    usuario_nombres = serializers.CharField(
        source="usuario.nombres",
        read_only=True,
    )

    usuario_apellido_paterno = serializers.CharField(
        source="usuario.apellido_paterno",
        read_only=True,
    )

    cargo_nombre = serializers.CharField(
        source="cargo.nombre",
        read_only=True,
    )

    junta_id = serializers.IntegerField(
        source="directiva.junta_vecinos.id",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="directiva.junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = IntegranteDirectiva
        fields = [
            "id",
            "directiva",
            "usuario",
            "usuario_username",
            "usuario_nombres",
            "usuario_apellido_paterno",
            "cargo",
            "cargo_nombre",
            "junta_id",
            "junta_nombre",
            "fecha_inicio",
            "fecha_fin",
            "activo",
        ]

        read_only_fields = [
            "id",
        ]

    def validate(self, attrs):
        directiva = attrs.get(
            "directiva",
            getattr(self.instance, "directiva", None),
        )

        usuario = attrs.get(
            "usuario",
            getattr(self.instance, "usuario", None),
        )

        cargo = attrs.get(
            "cargo",
            getattr(self.instance, "cargo", None),
        )

        if directiva and directiva.estado != Directiva.EstadoDirectiva.VIGENTE:
            raise serializers.ValidationError(
                {
                    "directiva": (
                        "Solo se pueden asignar integrantes " "a una directiva vigente."
                    )
                }
            )

        if cargo and not cargo.activo:
            raise serializers.ValidationError(
                {"cargo": ("El cargo seleccionado no está activo.")}
            )

        if directiva and usuario:
            if (
                usuario.sector_id is None
                or usuario.estado_asociacion_sector != "CONFIRMADA"
                or usuario.sector.junta_vecinos_id != directiva.junta_vecinos_id
            ):
                raise serializers.ValidationError(
                    {
                        "usuario": (
                            "El usuario debe tener una asociación "
                            "territorial confirmada en la misma "
                            "junta de vecinos de la directiva."
                        )
                    }
                )
        activo = attrs.get(
            "activo",
            getattr(self.instance, "activo", True),
        )

        if directiva and usuario and activo:
            asignaciones_usuario = IntegranteDirectiva.objects.filter(
                directiva=directiva,
                usuario=usuario,
                activo=True,
            )

            if self.instance:
                asignaciones_usuario = asignaciones_usuario.exclude(pk=self.instance.pk)

            if asignaciones_usuario.exists():
                raise serializers.ValidationError(
                    {
                        "usuario": (
                            "El usuario ya posee un cargo activo " "en esta directiva."
                        )
                    }
                )

        if directiva and cargo and activo and not cargo.permite_multiples:
            asignaciones_cargo = IntegranteDirectiva.objects.filter(
                directiva=directiva,
                cargo=cargo,
                activo=True,
            )

            if self.instance:
                asignaciones_cargo = asignaciones_cargo.exclude(pk=self.instance.pk)

            if asignaciones_cargo.exists():
                raise serializers.ValidationError(
                    {
                        "cargo": (
                            "Este cargo ya está ocupado y no "
                            "permite múltiples integrantes."
                        )
                    }
                )
        return attrs
