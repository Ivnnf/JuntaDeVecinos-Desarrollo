from rest_framework import serializers
from pathlib import Path

from .models import (
    AdjuntoPublicacion,
    Conversacion,
    Mensaje,
    Notificacion,
    Publicacion,
)


class AdjuntoPublicacionSerializer(serializers.ModelSerializer):
    def validate_archivo(self, archivo):
        extensiones_permitidas = {
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
        }

        extension = Path(archivo.name).suffix.lower()

        if extension not in extensiones_permitidas:
            raise serializers.ValidationError(
                "Tipo de archivo no permitido. "
                "Se permiten PDF, imágenes, documentos Office y TXT."
            )

        tamaño_maximo = 10 * 1024 * 1024  # 10 MB

        if archivo.size > tamaño_maximo:
            raise serializers.ValidationError("El archivo no puede superar los 10 MB.")

        return archivo

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


class NotificacionSerializer(serializers.ModelSerializer):
    titulo_publicacion = serializers.CharField(
        source="publicacion.titulo",
        read_only=True,
    )

    publicacion_id = serializers.IntegerField(
        source="publicacion.id",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="publicacion.directiva.junta_vecinos.nombre",
        read_only=True,
    )

    class Meta:
        model = Notificacion
        fields = [
            "id",
            "publicacion_id",
            "titulo_publicacion",
            "junta_nombre",
            "leida",
            "fecha_creacion",
            "fecha_lectura",
        ]

        read_only_fields = [
            "id",
            "publicacion_id",
            "titulo_publicacion",
            "junta_nombre",
            "fecha_creacion",
            "fecha_lectura",
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


class MensajeSerializer(serializers.ModelSerializer):
    remitente_username = serializers.CharField(
        source="remitente.username",
        read_only=True,
    )

    class Meta:
        model = Mensaje
        fields = [
            "id",
            "remitente",
            "remitente_username",
            "rol_remitente",
            "contenido",
            "fecha_envio",
            "leido",
            "fecha_lectura",
        ]

        read_only_fields = [
            "id",
            "remitente",
            "remitente_username",
            "rol_remitente",
            "fecha_envio",
            "leido",
            "fecha_lectura",
        ]


class ConversacionSerializer(serializers.ModelSerializer):
    mensaje_inicial = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )
    vecino_username = serializers.CharField(
        source="vecino.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="directiva.junta_vecinos.nombre",
        read_only=True,
    )
    cerrada_por_username = serializers.CharField(
        source="cerrada_por.username",
        read_only=True,
        allow_null=True,
    )
    mensajes = MensajeSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Conversacion
        fields = [
            "id",
            "vecino",
            "vecino_username",
            "directiva",
            "junta_nombre",
            "asunto",
            "mensaje_inicial",
            "fecha_creacion",
            "fecha_actualizacion",
            "activa",
            "mensajes",
            "fecha_cierre",
            "cerrada_por",
            "cerrada_por_username",
            "rol_cierre",
        ]

        read_only_fields = [
            "id",
            "vecino",
            "vecino_username",
            "directiva",
            "junta_nombre",
            "fecha_creacion",
            "fecha_actualizacion",
            "activa",
            "mensajes",
            "fecha_cierre",
            "cerrada_por",
            "cerrada_por_username",
            "rol_cierre",
        ]
