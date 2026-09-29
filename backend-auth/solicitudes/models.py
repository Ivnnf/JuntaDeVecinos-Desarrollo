from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models

from organizacion.models import JuntaVecinos


class SolicitudVecino(models.Model):
    class Tipo(models.TextChoices):
        CONSULTA = "CONSULTA", "Consulta"
        RECLAMO = "RECLAMO", "Reclamo"
        SOLICITUD = "SOLICITUD", "Solicitud"

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        EN_PROCESO = "EN_PROCESO", "En proceso"
        RESPONDIDA = "RESPONDIDA", "Respondida"
        CERRADA = "CERRADA", "Cerrada"

    vecino = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="solicitudes_vecino",
    )

    junta_vecinos = models.ForeignKey(
        JuntaVecinos,
        on_delete=models.PROTECT,
        related_name="solicitudes_vecino",
    )

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
    )

    asunto = models.CharField(
        max_length=200,
    )

    descripcion = models.TextField()

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
    )

    fecha_ultima_revision_vecino = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-fecha_creacion"]

    def __str__(self):
        return f"{self.tipo} - {self.asunto}"

    respuesta = models.TextField(
        blank=True,
        default="",
    )

    respondido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="solicitudes_respondidas",
        null=True,
        blank=True,
    )

    fecha_respuesta = models.DateTimeField(
        null=True,
        blank=True,
    )


class TipoDocumento(models.Model):
    nombre = models.CharField(
        max_length=120,
        unique=True,
    )

    descripcion = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    activo = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class SolicitudDocumento(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        EN_REVISION = "EN_REVISION", "En revisión"
        APROBADA = "APROBADA", "Aprobada"
        RECHAZADA = "RECHAZADA", "Rechazada"

    numero_seguimiento = models.CharField(
        max_length=30,
        unique=True,
    )

    tipo_documento = models.ForeignKey(
        TipoDocumento,
        on_delete=models.PROTECT,
        related_name="solicitudes",
    )

    vecino = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="solicitudes_documento",
    )

    junta_vecinos = models.ForeignKey(
        JuntaVecinos,
        on_delete=models.PROTECT,
        related_name="solicitudes_documento",
    )

    motivo = models.TextField()

    estado_actual = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="solicitudes_documento_responsable",
        null=True,
        blank=True,
    )

    fecha_solicitud = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_resolucion = models.DateTimeField(
        null=True,
        blank=True,
    )
    fecha_ultima_revision_vecino = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-fecha_solicitud"]

    def __str__(self):
        return f"{self.numero_seguimiento} - " f"{self.tipo_documento.nombre}"


class HistorialSolicitudDocumento(models.Model):
    solicitud = models.ForeignKey(
        SolicitudDocumento,
        on_delete=models.CASCADE,
        related_name="historial",
    )

    estado_anterior = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )

    estado_nuevo = models.CharField(
        max_length=20,
    )

    usuario_responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="historial_solicitudes_documento",
    )

    comentario_respuesta = models.TextField(
        blank=True,
        default="",
    )

    fecha_cambio = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["fecha_cambio"]

    def __str__(self):
        return f"{self.solicitud.numero_seguimiento} - " f"{self.estado_nuevo}"


class SolicitudDocumentoArchivo(models.Model):
    class TipoUso(models.TextChoices):
        ADJUNTO = "ADJUNTO", "Adjunto"
        DOCUMENTO_EMITIDO = (
            "DOCUMENTO_EMITIDO",
            "Documento emitido",
        )

    solicitud = models.ForeignKey(
        SolicitudDocumento,
        on_delete=models.CASCADE,
        related_name="archivos",
    )

    archivo = models.FileField(
        upload_to="solicitudes_documentos/",
    )

    nombre_original = models.CharField(
        max_length=255,
    )

    tipo_uso = models.CharField(
        max_length=30,
        choices=TipoUso.choices,
        default=TipoUso.ADJUNTO,
    )

    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="archivos_solicitudes_documento",
    )

    fecha_subida = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["fecha_subida"]

    def __str__(self):
        return f"{self.solicitud.numero_seguimiento} - " f"{self.nombre_original}"


class HistorialSolicitudVecino(models.Model):
    solicitud = models.ForeignKey(
        SolicitudVecino,
        on_delete=models.CASCADE,
        related_name="historial",
    )

    estado_anterior = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )

    estado_nuevo = models.CharField(
        max_length=20,
    )

    usuario_responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="historial_solicitudes_vecino",
    )

    comentario_respuesta = models.TextField(
        blank=True,
        default="",
    )

    fecha_cambio = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["fecha_cambio"]

    def __str__(self):
        return f"{self.solicitud.id} - " f"{self.estado_nuevo}"
