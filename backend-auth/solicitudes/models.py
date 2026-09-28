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

    class Meta:
        ordering = ["-fecha_creacion"]

    def __str__(self):
        return f"{self.tipo} - {self.asunto}"