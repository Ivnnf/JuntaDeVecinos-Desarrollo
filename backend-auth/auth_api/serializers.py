from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from profiles.models import Rol, UsuarioRol
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True
    )

    recordar = serializers.BooleanField(
        required=False,
        default=False
    )


class SolicitudRecuperacionSerializer(serializers.Serializer):
    email = serializers.EmailField()

class RestablecerPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirmar_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmar_password"]:
            raise serializers.ValidationError(
                {
                    "confirmar_password": (
                        "Las contraseñas no coinciden."
                    )
                }
            )

        return attrs

class RegistroVecinoSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
    )

    rut = serializers.CharField(
        max_length=12,
    )

    nombres = serializers.CharField(
        max_length=100,
    )

    apellido_paterno = serializers.CharField(
        max_length=80,
    )

    apellido_materno = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirmar_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_username(self, value):
        Usuario = get_user_model()

        if Usuario.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "El nombre de usuario ya se encuentra registrado."
            )

        return value

    def validate_email(self, value):
        Usuario = get_user_model()

        if Usuario.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "El correo electrónico ya se encuentra registrado."
            )

        return value.lower()

    def validate_rut(self, value):
        Usuario = get_user_model()

        rut_limpio = (
            value.replace(".", "")
            .replace("-", "")
            .strip()
            .upper()
        )

        if (
            len(rut_limpio) < 2
            or not rut_limpio[:-1].isdigit()
            or rut_limpio[-1] not in "0123456789K"
        ):
            raise serializers.ValidationError(
                "El RUT ingresado no es válido."
            )

        cuerpo = rut_limpio[:-1]
        dv_ingresado = rut_limpio[-1]

        suma = 0
        multiplicador = 2

        for digito in reversed(cuerpo):
            suma += int(digito) * multiplicador

            multiplicador += 1

            if multiplicador > 7:
                multiplicador = 2

        resultado = 11 - (suma % 11)

        if resultado == 11:
            dv_esperado = "0"
        elif resultado == 10:
            dv_esperado = "K"
        else:
            dv_esperado = str(resultado)

        if dv_ingresado != dv_esperado:
            raise serializers.ValidationError(
                "El RUT ingresado no es válido."
            )

        rut_normalizado = f"{cuerpo}-{dv_ingresado}"

        if Usuario.objects.filter(
            rut__iexact=rut_normalizado
        ).exists():
            raise serializers.ValidationError(
                "El RUT ya se encuentra registrado."
            )

        return rut_normalizado

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmar_password"]:
            raise serializers.ValidationError(
                {
                    "confirmar_password": (
                        "Las contraseñas no coinciden."
                    )
                }
            )

        Usuario = get_user_model()

        usuario_temporal = Usuario(
            username=attrs["username"],
            email=attrs["email"],
            rut=attrs["rut"],
            nombres=attrs["nombres"],
            apellido_paterno=attrs["apellido_paterno"],
            apellido_materno=attrs.get(
                "apellido_materno",
                "",
            ),
        )

        try:
            validate_password(
                attrs["password"],
                user=usuario_temporal,
            )
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                {
                    "password": list(error.messages)
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop(
            "confirmar_password"
        )

        password = validated_data.pop(
            "password"
        )

        Usuario = get_user_model()

        usuario = Usuario.objects.create_user(
            password=password,
            is_active=True,
            **validated_data,
        )

        rol_vecino = Rol.objects.get(
            nombre__iexact="Vecino"
        )

        UsuarioRol.objects.create(
            usuario=usuario,
            rol=rol_vecino,
            activo=True,
        )

        return usuario

class PerfilVecinoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        read_only=True,
    )

    rut = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = get_user_model()
        fields = [
            "username",
            "rut",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "email",
            "fecha_nacimiento",
        ]

    def validate_email(self, value):
        Usuario = get_user_model()

        consulta = Usuario.objects.filter(
            email__iexact=value
        )

        if self.instance:
            consulta = consulta.exclude(
                pk=self.instance.pk
            )

        if consulta.exists():
            raise serializers.ValidationError(
                "El correo electrónico ya se encuentra registrado."
            )

        return value.lower()