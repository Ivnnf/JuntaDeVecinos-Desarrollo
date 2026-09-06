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