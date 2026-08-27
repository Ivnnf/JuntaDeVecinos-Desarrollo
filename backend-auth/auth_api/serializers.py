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