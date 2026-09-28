from rest_framework import serializers

from .models import SolicitudVecino


class SolicitudVecinoSerializer(serializers.ModelSerializer):
    vecino_username = serializers.CharField(
        source="vecino.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    respondido_por_username = serializers.CharField(
        source="respondido_por.username",
        read_only=True,
    )

    class Meta:
        model = SolicitudVecino
        fields = [
            "id",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "tipo",
            "asunto",
            "descripcion",
            "estado",
            "respuesta",
            "respondido_por",
            "respondido_por_username",
            "fecha_respuesta",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

        read_only_fields = [
            "id",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "estado",
            "respuesta",
            "respondido_por",
            "respondido_por_username",
            "fecha_respuesta",
            "fecha_creacion",
            "fecha_actualizacion",
        ]


class SolicitudDirectivaSerializer(serializers.ModelSerializer):
    vecino_username = serializers.CharField(
        source="vecino.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    respondido_por_username = serializers.CharField(
        source="respondido_por.username",
        read_only=True,
    )

    class Meta:
        model = SolicitudVecino
        fields = [
            "id",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "tipo",
            "asunto",
            "descripcion",
            "estado",
            "respuesta",
            "respondido_por",
            "respondido_por_username",
            "fecha_respuesta",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

        read_only_fields = [
            "id",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "tipo",
            "asunto",
            "descripcion",
            "respondido_por",
            "respondido_por_username",
            "fecha_respuesta",
            "fecha_creacion",
            "fecha_actualizacion",
        ]