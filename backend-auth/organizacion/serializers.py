from rest_framework import serializers

from .models import JuntaVecinos, Sector
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

class AsociacionSectorPendienteSerializer(
    serializers.ModelSerializer
):
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