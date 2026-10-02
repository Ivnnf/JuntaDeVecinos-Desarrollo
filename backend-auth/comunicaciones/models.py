from django.conf import settings
from django.db import models

from organizacion.models import Directiva


class Publicacion(models.Model):
    directiva = models.ForeignKey(
        Directiva,
        on_delete=models.PROTECT,
        related_name="publicaciones",
    )

    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="publicaciones_creadas",
    )

    titulo = models.CharField(
        max_length=200,
    )

    contenido = models.TextField()

    fecha_publicacion = models.DateTimeField(
        auto_now_add=True,
    )

    activa = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = [
            "-fecha_publicacion",
        ]

    def __str__(self):
        return self.titulo


class AdjuntoPublicacion(models.Model):
    publicacion = models.ForeignKey(
        Publicacion,
        on_delete=models.CASCADE,
        related_name="adjuntos",
    )

    archivo = models.FileField(
        upload_to="comunicaciones/adjuntos/",
    )

    nombre_original = models.CharField(
        max_length=255,
    )

    fecha_subida = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.nombre_original


class Notificacion(models.Model):
    publicacion = models.ForeignKey(
        Publicacion,
        on_delete=models.CASCADE,
        related_name="notificaciones",
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notificaciones",
    )

    leida = models.BooleanField(
        default=False,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_lectura = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = [
            "-fecha_creacion",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "publicacion",
                    "usuario",
                ],
                name=("uq_notificacion_publicacion_usuario"),
            ),
        ]

    def __str__(self):
        return f"{self.usuario} - " f"{self.publicacion.titulo}"


class Conversacion(models.Model):
    vecino = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="conversaciones_vecino",
    )

    directiva = models.ForeignKey(
        Directiva,
        on_delete=models.PROTECT,
        related_name="conversaciones",
    )

    asunto = models.CharField(
        max_length=200,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
    )

    activa = models.BooleanField(
        default=True,
    )
    fecha_cierre = models.DateTimeField(
        null=True,
        blank=True,
    )

    cerrada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="conversaciones_cerradas",
        null=True,
        blank=True,
    )

    rol_cierre = models.CharField(
        max_length=20,
        choices=[
            ("DIRECTIVA", "Directiva"),
        ],
        null=True,
        blank=True,
    )

    class Meta:
        ordering = [
            "-fecha_actualizacion",
        ]

    def __str__(self):
        return f"{self.vecino.username} - " f"{self.asunto}"


class RolRemitente(models.TextChoices):
    VECINO = "VECINO", "Vecino"
    DIRECTIVA = "DIRECTIVA", "Directiva"


class Mensaje(models.Model):
    conversacion = models.ForeignKey(
        Conversacion,
        on_delete=models.CASCADE,
        related_name="mensajes",
    )

    remitente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="mensajes_enviados",
    )
    rol_remitente = models.CharField(
        max_length=20,
        choices=RolRemitente.choices,
        null=True,
        blank=True,
    )

    contenido = models.TextField()

    fecha_envio = models.DateTimeField(
        auto_now_add=True,
    )

    leido = models.BooleanField(
        default=False,
    )

    fecha_lectura = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = [
            "fecha_envio",
        ]

    def __str__(self):
        return f"{self.remitente.username} - " f"{self.fecha_envio}"
