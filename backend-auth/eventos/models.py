from django.conf import settings
from django.db import models

from organizacion.models import Directiva


class Evento(models.Model):
    class Estado(models.TextChoices):
        PROGRAMADO = "PROGRAMADO", "Programado"
        CANCELADO = "CANCELADO", "Cancelado"
        FINALIZADO = "FINALIZADO", "Finalizado"

    directiva = models.ForeignKey(
        Directiva,
        on_delete=models.PROTECT,
        related_name="eventos",
    )

    creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="eventos_creados",
    )

    titulo = models.CharField(
        max_length=200,
    )

    descripcion = models.TextField()

    lugar = models.CharField(
        max_length=255,
    )

    fecha_inicio = models.DateTimeField()

    fecha_fin = models.DateTimeField(
        null=True,
        blank=True,
    )

    cupo_maximo = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Dejar vacío para un evento sin límite de cupos.",
    )

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PROGRAMADO,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["fecha_inicio"]

    def __str__(self):
        return self.titulo

class InscripcionEvento(models.Model):
    class Estado(models.TextChoices):
        INSCRITO = "INSCRITO", "Inscrito"
        CANCELADA = "CANCELADA", "Cancelada"

    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name="inscripciones",
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inscripciones_eventos",
    )

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.INSCRITO,
    )

    fecha_inscripcion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_cancelacion = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "evento",
                    "usuario",
                ],
                name="uq_inscripcion_evento_usuario",
            ),
        ]

    def __str__(self):
        return (
            f"{self.usuario} - "
            f"{self.evento.titulo}"
        )