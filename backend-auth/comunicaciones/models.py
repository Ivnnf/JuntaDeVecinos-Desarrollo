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