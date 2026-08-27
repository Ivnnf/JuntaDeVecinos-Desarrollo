from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models


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