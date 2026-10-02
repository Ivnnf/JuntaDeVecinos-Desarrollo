from django.conf import settings
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


class VerificacionResidencia(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        VALIDADA = "VALIDADA", "Validada"
        REVISION_MANUAL = "REVISION_MANUAL", "Revisión manual"
        RECHAZADA = "RECHAZADA", "Rechazada"

    class TipoDocumento(models.TextChoices):
        ELECTRICIDAD = "ELECTRICIDAD", "Boleta de electricidad"
        AGUA = "AGUA", "Boleta de agua"
        GAS = "GAS", "Boleta de gas"
        INTERNET = "INTERNET", "Boleta de internet"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="verificaciones_residencia",
    )

    sector = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT,
        related_name="verificaciones_residencia",
    )

    tipo_documento = models.CharField(
        max_length=20,
        choices=TipoDocumento.choices,
    )

    archivo = models.FileField(
        upload_to="verificaciones_residencia/",
    )

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    nombre_extraido = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    direccion_extraida = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    fecha_documento_extraida = models.DateField(
        null=True,
        blank=True,
    )

    confianza_ocr = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    observacion_automatica = models.TextField(
        null=True,
        blank=True,
    )

    revisado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="verificaciones_residencia_revisadas",
        null=True,
        blank=True,
    )

    fecha_revision = models.DateTimeField(
        null=True,
        blank=True,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-fecha_creacion",
            "-id",
        ]

    def __str__(self):
        return f"{self.usuario.username} - " f"{self.sector.nombre} - " f"{self.estado}"


class Directiva(models.Model):
    class EstadoDirectiva(models.TextChoices):
        VIGENTE = "VIGENTE", "Vigente"
        FINALIZADA = "FINALIZADA", "Finalizada"

    junta_vecinos = models.ForeignKey(
        JuntaVecinos,
        on_delete=models.PROTECT,
        related_name="directivas",
    )

    fecha_inicio = models.DateField()

    fecha_fin = models.DateField(
        null=True,
        blank=True,
    )

    estado = models.CharField(
        max_length=20,
        choices=EstadoDirectiva.choices,
        default=EstadoDirectiva.VIGENTE,
    )

    observacion = models.CharField(
        max_length=500,
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(fecha_fin__isnull=True)
                    | models.Q(fecha_fin__gte=models.F("fecha_inicio"))
                ),
                name="ck_directiva_fechas_validas",
            ),
        ]

    def __str__(self):
        return f"{self.junta_vecinos.nombre} - {self.estado}"


class Cargo(models.Model):
    nombre = models.CharField(
        max_length=80,
        unique=True,
    )

    descripcion = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    permite_multiples = models.BooleanField(
        default=False,
    )

    activo = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return self.nombre


class IntegranteDirectiva(models.Model):
    directiva = models.ForeignKey(
        Directiva,
        on_delete=models.PROTECT,
        related_name="integrantes",
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="integraciones_directiva",
    )

    cargo = models.ForeignKey(
        Cargo,
        on_delete=models.PROTECT,
        related_name="integrantes",
    )

    fecha_inicio = models.DateField()

    fecha_fin = models.DateField(
        null=True,
        blank=True,
    )

    activo = models.BooleanField(
        default=True,
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(fecha_fin__isnull=True)
                    | models.Q(fecha_fin__gte=models.F("fecha_inicio"))
                ),
                name="ck_integrante_directiva_fechas_validas",
            ),
        ]

    def __str__(self):
        return (
            f"{self.usuario.username} - "
            f"{self.cargo.nombre} - "
            f"{self.directiva.junta_vecinos.nombre}"
        )
