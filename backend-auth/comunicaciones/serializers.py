from rest_framework import serializers

from .models import (
    AdjuntoPublicacion,
    Publicacion,
)


class AdjuntoPublicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdjuntoPublicacion
        fields = [
            "id",
            "archivo",
            "nombre_original",
            "fecha_subida",
        ]

        read_only_fields = [
            "id",
            "nombre_original",
            "fecha_subida",
        ]


class PublicacionSerializer(serializers.ModelSerializer):
    autor_username = serializers.CharField(
        source="autor.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="directiva.junta_vecinos.nombre",
        read_only=True,
    )
    adjuntos = AdjuntoPublicacionSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Publicacion
        fields = [
            "id",
            "directiva",
            "junta_nombre",
            "autor",
            "autor_username",
            "titulo",
            "contenido",
            "fecha_publicacion",
            "activa",
            "adjuntos",
        ]

        read_only_fields = [
            "id",
            "autor",
            "autor_username",
            "junta_nombre",
            "fecha_publicacion",
            "adjuntos",
        ]
