from django.db import models


class JuntaVecinos(models.Model):
    nombre = models.CharField(
        max_length=150,
    )

    comuna = models.CharField(
        max_length=100,
    )

    descripcion = models.TextField(
        null=True,
        blank=True,
    )

    activa = models.BooleanField(
        default=True,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.nombre

class Sector(models.Model):
    junta_vecinos = models.ForeignKey(
        JuntaVecinos,
        on_delete=models.PROTECT,
        related_name="sectores",
    )

    nombre = models.CharField(
        max_length=150,
    )

    descripcion = models.TextField(
        null=True,
        blank=True,
    )

    activo = models.BooleanField(
        default=True,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.nombre} - {self.junta_vecinos.nombre}"