from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models

class EstadoUsuario(models.TextChoices):
    VERIFICACION = "VERIFICACION", "Esperando verificación"
    ACTIVO = "ACTIVO", "Activo"
    SUSPENDIDO = "SUSPENDIDO", "Suspendido"
    BANEADO = "BANEADO", "Baneado"

class UsuarioManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("El usuario debe tener username")

        if not email:
            raise ValueError("El usuario debe tener email")

        email = self.normalize_email(email)

        user = self.model(
            username=username,
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            username,
            email,
            password,
            **extra_fields
        )


class Usuario(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(
        max_length=150,
        unique=True
    )

    rut = models.CharField(
        max_length=12,
        unique=True,
        null=True,
        blank=True,
    )

    nombres = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    apellido_paterno = models.CharField(
        max_length=80,
        null=True,
        blank=True,
    )  

    apellido_materno = models.CharField(
        max_length=80,
        null=True,
        blank=True,
    )

    fecha_nacimiento = models.DateField(
        null=True,
        blank=True,
    )

    email = models.EmailField(
        unique=True
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True
    )

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = UsuarioManager()

    def __str__(self):
        return self.username

class Rol(models.Model):
    nombre = models.CharField(
        max_length=50,
        unique=True,
    )

    def __str__(self):
        return self.nombre

class UsuarioRol(models.Model):
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="roles_asignados",
    )

    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        related_name="usuarios_asignados",
    )

    fecha_asignacion = models.DateTimeField(
        auto_now_add=True,
    )

    activo = models.BooleanField(
        default=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "rol"],
                name="uq_usuario_rol",
            ),
        ]

    def __str__(self):
        return f"{self.usuario.username} - {self.rol.nombre}"

class Perfil(models.Model):
    SEXO_MASCULINO = "M"
    SEXO_FEMENINO = "F"

    SEXO_CHOICES = [
        (SEXO_MASCULINO, "Masculino"),
        (SEXO_FEMENINO, "Femenino"),
    ]

    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name="perfil",
    )

    nombre_completo = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    rut = models.CharField(
        max_length=12,
        unique=True,
        null=True,
        blank=True,
    )

    fecha_nacimiento = models.DateField(
        null=True,
        blank=True,
    )

    sexo = models.CharField(
        max_length=1,
        choices=SEXO_CHOICES,
        null=True,
        blank=True,
    )

    region_id = models.IntegerField(
        null=True,
        blank=True,
    )

    comuna_id = models.IntegerField(
        null=True,
        blank=True,
    )

    direccion = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    jdv = models.IntegerField(
        null=True,
        blank=True,
    )

    imagen_1 = models.URLField(
        max_length=500,
        null=True,
        blank=True,
    )

    imagen_2 = models.URLField(
        max_length=500,
        null=True,
        blank=True,
    )

    imagen_o_doc = models.URLField(
        max_length=500,
        null=True,
        blank=True,
    )

    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        default=3,
        related_name="perfiles",
    )

    estado = models.CharField(
        max_length=20,
        choices=EstadoUsuario.choices,
        default=EstadoUsuario.VERIFICACION,
    )

    cargo_id = models.IntegerField(
        default=6,
    )

    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"
        ordering = ["nombre_completo"]

    def __str__(self):
        return (
            f"{self.nombre_completo or 'Sin nombre'} "
            f"({self.rut or 'Sin RUT'})"
        )