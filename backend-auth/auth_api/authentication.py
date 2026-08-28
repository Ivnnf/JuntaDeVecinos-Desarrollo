from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from utils.token import verificar_token


Usuario = get_user_model()


class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")

        if not access_token:
            return None

        payload = verificar_token(
            access_token,
            tipo_esperado="access",
        )

        if payload is None:
            raise AuthenticationFailed(
                "Token inválido o expirado"
            )

        user_id = payload.get("user_id")

        if not user_id:
            raise AuthenticationFailed(
                "Token inválido"
            )

        try:
            usuario = Usuario.objects.get(id=user_id)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed(
                "Usuario no encontrado"
            )

        return usuario, None