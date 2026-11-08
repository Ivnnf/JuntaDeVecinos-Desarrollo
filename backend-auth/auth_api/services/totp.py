import re

import pyotp
from cryptography.fernet import Fernet
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


TOTP_ISSUER = "Junta de Vecinos"


def _obtener_fernet():
    clave = getattr(settings, "TOTP_ENCRYPTION_KEY", None)

    if not clave:
        raise ImproperlyConfigured(
            "TOTP_ENCRYPTION_KEY no está configurada."
        )

    return Fernet(clave.encode())


def generar_secreto_totp():
    return pyotp.random_base32()


def cifrar_secreto_totp(secreto):
    return _obtener_fernet().encrypt(
        secreto.encode()
    ).decode()


def descifrar_secreto_totp(secreto_cifrado):
    return _obtener_fernet().decrypt(
        secreto_cifrado.encode()
    ).decode()


def generar_uri_totp(usuario, secreto):
    identificador = usuario.email or usuario.username

    return pyotp.TOTP(secreto).provisioning_uri(
        name=identificador,
        issuer_name=TOTP_ISSUER,
    )


def verificar_codigo_totp(secreto, codigo):
    codigo = str(codigo).strip().replace(" ", "")

    if not re.fullmatch(r"\d{6}", codigo):
        return False

    totp = pyotp.TOTP(secreto)

    return totp.verify(
        codigo,
        valid_window=1,
    )
