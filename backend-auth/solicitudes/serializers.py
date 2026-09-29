from rest_framework import serializers

from .models import (
    HistorialSolicitudDocumento,
    HistorialSolicitudVecino,
    SolicitudDocumento,
    SolicitudDocumentoArchivo,
    SolicitudVecino,
    TipoDocumento,
)


class HistorialSolicitudVecinoSerializer(serializers.ModelSerializer):
    usuario_responsable_username = serializers.CharField(
        source="usuario_responsable.username",
        read_only=True,
    )

    class Meta:
        model = HistorialSolicitudVecino
        fields = [
            "id",
            "estado_anterior",
            "estado_nuevo",
            "usuario_responsable",
            "usuario_responsable_username",
            "comentario_respuesta",
            "fecha_cambio",
        ]

        read_only_fields = fields


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

    historial = HistorialSolicitudVecinoSerializer(
        many=True,
        read_only=True,
    )

    numero_seguimiento = serializers.SerializerMethodField()

    def get_numero_seguimiento(self, obj):
        return f"SOL-{obj.id:06d}"

    class Meta:
        model = SolicitudVecino
        fields = [
            "id",
            "numero_seguimiento",
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
            "historial",
        ]

        read_only_fields = [
            "id",
            "numero_seguimiento",
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
    historial = HistorialSolicitudVecinoSerializer(
        many=True,
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
            "historial",
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


class TipoDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDocumento
        fields = [
            "id",
            "nombre",
            "descripcion",
            "activo",
        ]

        read_only_fields = [
            "id",
        ]


class HistorialSolicitudDocumentoSerializer(serializers.ModelSerializer):
    usuario_responsable_username = serializers.CharField(
        source="usuario_responsable.username",
        read_only=True,
    )

    class Meta:
        model = HistorialSolicitudDocumento
        fields = [
            "id",
            "solicitud",
            "estado_anterior",
            "estado_nuevo",
            "usuario_responsable",
            "usuario_responsable_username",
            "comentario_respuesta",
            "fecha_cambio",
        ]

        read_only_fields = [
            "id",
            "solicitud",
            "estado_anterior",
            "estado_nuevo",
            "usuario_responsable",
            "usuario_responsable_username",
            "comentario_respuesta",
            "fecha_cambio",
        ]


class SolicitudDocumentoArchivoSerializer(serializers.ModelSerializer):
    subido_por_username = serializers.CharField(
        source="subido_por.username",
        read_only=True,
    )

    class Meta:
        model = SolicitudDocumentoArchivo
        fields = [
            "id",
            "solicitud",
            "nombre_original",
            "tipo_uso",
            "subido_por",
            "subido_por_username",
            "fecha_subida",
        ]

        read_only_fields = [
            "id",
            "solicitud",
            "nombre_original",
            "tipo_uso",
            "subido_por",
            "subido_por_username",
            "fecha_subida",
        ]


class SolicitudDocumentoVecinoSerializer(serializers.ModelSerializer):
    tipo_documento_nombre = serializers.CharField(
        source="tipo_documento.nombre",
        read_only=True,
    )

    vecino_username = serializers.CharField(
        source="vecino.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    responsable_username = serializers.CharField(
        source="responsable.username",
        read_only=True,
    )

    historial = HistorialSolicitudDocumentoSerializer(
        many=True,
        read_only=True,
    )

    archivos = SolicitudDocumentoArchivoSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = SolicitudDocumento

        fields = [
            "id",
            "numero_seguimiento",
            "tipo_documento",
            "tipo_documento_nombre",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "motivo",
            "estado_actual",
            "responsable",
            "responsable_username",
            "fecha_solicitud",
            "fecha_resolucion",
            "historial",
            "archivos",
        ]

        read_only_fields = [
            "id",
            "numero_seguimiento",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "estado_actual",
            "responsable",
            "responsable_username",
            "fecha_solicitud",
            "fecha_resolucion",
            "historial",
            "archivos",
        ]

    def validate_tipo_documento(self, tipo_documento):
        if not tipo_documento.activo:
            raise serializers.ValidationError(
                "El tipo de documento seleccionado no está disponible."
            )

        return tipo_documento


class SolicitudDocumentoDirectivaSerializer(serializers.ModelSerializer):
    tipo_documento_nombre = serializers.CharField(
        source="tipo_documento.nombre",
        read_only=True,
    )

    vecino_username = serializers.CharField(
        source="vecino.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="junta_vecinos.nombre",
        read_only=True,
    )

    responsable_username = serializers.CharField(
        source="responsable.username",
        read_only=True,
    )

    historial = HistorialSolicitudDocumentoSerializer(
        many=True,
        read_only=True,
    )

    archivos = SolicitudDocumentoArchivoSerializer(
        many=True,
        read_only=True,
    )
    comentario_respuesta = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = SolicitudDocumento
        fields = [
            "id",
            "numero_seguimiento",
            "tipo_documento",
            "tipo_documento_nombre",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "motivo",
            "estado_actual",
            "responsable",
            "responsable_username",
            "fecha_solicitud",
            "fecha_resolucion",
            "historial",
            "archivos",
            "comentario_respuesta",
        ]

        read_only_fields = [
            "id",
            "numero_seguimiento",
            "tipo_documento",
            "tipo_documento_nombre",
            "vecino",
            "vecino_username",
            "junta_vecinos",
            "junta_nombre",
            "motivo",
            "responsable",
            "responsable_username",
            "fecha_solicitud",
            "fecha_resolucion",
            "historial",
            "archivos",
        ]


class SolicitudDocumentoArchivoUploadSerializer(serializers.ModelSerializer):
    archivo = serializers.FileField(write_only=True)

    class Meta:
        model = SolicitudDocumentoArchivo
        fields = [
            "archivo",
        ]

    def validate_archivo(self, archivo):
        extensiones_permitidas = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
        ]

        nombre = archivo.name.lower()

        if not any(nombre.endswith(extension) for extension in extensiones_permitidas):
            raise serializers.ValidationError("El tipo de archivo no está permitido.")

        if archivo.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede superar los 10 MB.")

        return archivo


class SeguimientoSolicitudSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )

    origen = serializers.CharField(
        read_only=True,
    )

    numero_seguimiento = serializers.CharField(
        read_only=True,
    )

    tipo = serializers.CharField(
        read_only=True,
    )

    titulo = serializers.CharField(
        read_only=True,
    )

    fecha_ingreso = serializers.DateTimeField(
        read_only=True,
    )

    estado_actual = serializers.CharField(
        read_only=True,
    )

    tiene_novedades = serializers.BooleanField(
        read_only=True,
    )

    respuesta_final = serializers.CharField(
        read_only=True,
        allow_blank=True,
    )

    fecha_respuesta = serializers.DateTimeField(
        read_only=True,
        allow_null=True,
    )

    historial = serializers.ListField(
        read_only=True,
    )

    archivos = serializers.ListField(
        read_only=True,
    )
