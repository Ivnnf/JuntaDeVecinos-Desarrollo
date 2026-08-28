"""
Autor: Ivan Tamayo

Descripción:
Utilidades para generar y validar tokens JWT utilizados por
el servicio de autenticación.

Actualmente maneja dos tipos de token:
- access: utilizado para autenticar solicitudes.
- refresh: utilizado posteriormente para renovar el access token.
"""

from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings


def generar_tokens(user, recordar=False):
    """
    Genera un access token y un refresh token para un usuario.
    """

    if recordar:
        access_exp_seconds = settings.ACCESS_TOKEN_EXP_REMEMBER_SECONDS
        refresh_exp_seconds = settings.REFRESH_TOKEN_EXP_REMEMBER_SECONDS
    else:
        access_exp_seconds = settings.ACCESS_TOKEN_EXP_SECONDS
        refresh_exp_seconds = settings.REFRESH_TOKEN_EXP_SECONDS

    ahora = datetime.now(timezone.utc)

    access_payload = {
        "user_id": user.id,
        "type": "access",
        "iat": ahora,
        "exp": ahora + timedelta(seconds=access_exp_seconds),
    }

    refresh_payload = {
        "user_id": user.id,
        "type": "refresh",
        "recordar": recordar,
        "iat": ahora,
        "exp": ahora + timedelta(seconds=refresh_exp_seconds),
    }

    access_token = jwt.encode(
        access_payload,
        settings.SECRET_KEY,
        algorithm="HS256",
    )

    refresh_token = jwt.encode(
        refresh_payload,
        settings.SECRET_KEY,
        algorithm="HS256",
    )

    return (
        access_token,
        refresh_token,
        access_exp_seconds,
        refresh_exp_seconds,
    )


def verificar_token(token, tipo_esperado="access"):
    """
    Valida un JWT y comprueba que corresponda al tipo esperado.
    """

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )

        if payload.get("type") != tipo_esperado:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None


def refresh_access_token(refresh_token):
    """
    Genera un nuevo access token a partir de un refresh token válido.
    """

    payload = verificar_token(
        refresh_token,
        tipo_esperado="refresh",
    )

    if payload is None:
        return None, None, "Token inválido o expirado"

    recordar = payload.get("recordar", False)

    user_id = payload.get("user_id")

    if not user_id:
        return None, None, "Token inválido o expirado"

    from django.contrib.auth import get_user_model

    Usuario = get_user_model()

    try:
        usuario = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return None, None, "Token inválido o expirado"

    if recordar:
        access_exp_seconds = settings.ACCESS_TOKEN_EXP_REMEMBER_SECONDS
    else:
        access_exp_seconds = settings.ACCESS_TOKEN_EXP_SECONDS

    ahora = datetime.now(timezone.utc)

    access_payload = {
        "user_id": usuario.id,
        "type": "access",
        "iat": ahora,
        "exp": ahora + timedelta(seconds=access_exp_seconds),
    }

    nuevo_access_token = jwt.encode(
        access_payload,
        settings.SECRET_KEY,
        algorithm="HS256",
    )

    return nuevo_access_token, access_exp_seconds, None



    
