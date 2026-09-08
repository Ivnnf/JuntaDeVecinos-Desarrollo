from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase

from profiles.models import (
    EstadoUsuario,
    Perfil,
    Rol,
    UsuarioRol,
)


@override_settings(
    ALLOWED_HOSTS=["testserver"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class AutenticacionTests(APITestCase):

    def setUp(self):
        Usuario = get_user_model()

        self.password = "PasswordSeguro123!"

        self.usuario = Usuario.objects.create_user(
            username="vecino_test",
            email="vecino@test.cl",
            password=self.password,
        )

        self.rol_vecino, _ = Rol.objects.get_or_create(
            id=3,
            defaults={
                "nombre": "Vecino",
            },
        )

        Perfil.objects.create(
            usuario=self.usuario,
            nombre_completo="Vecino Prueba",
            rol=self.rol_vecino,
            estado=EstadoUsuario.ACTIVO,
        )

        UsuarioRol.objects.get_or_create(
            usuario=self.usuario,
            rol=self.rol_vecino,
            defaults={
                "activo": True,
            },
        )

    def test_login_correcto_crea_cookies_jwt(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "vecino_test",
                "password": self.password,
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

        self.assertTrue(
            response.cookies["access_token"]["httponly"]
        )

        self.assertTrue(
            response.cookies["refresh_token"]["httponly"]
        )

    def test_login_con_password_incorrecta_rechazado(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "vecino_test",
                "password": "PasswordIncorrecto123!",
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_sesion_sin_autenticacion_rechazada(self):
        response = self.client.get(
            "/api/auth/sesion/",
        )

        self.assertIn(
            response.status_code,
            [401, 403],
        )

    def test_sesion_autenticada_entrega_roles(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {
                "username": "vecino_test",
                "password": self.password,
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
        )

        response = self.client.get(
            "/api/auth/sesion/",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["username"],
            "vecino_test",
        )
        self.assertIn(
            self.rol_vecino.id,
            response.data["roles"],
        )

    def test_refresh_token_renueva_access_token(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {
                "username": "vecino_test",
                "password": self.password,
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
        )

        self.client.cookies.pop(
            "access_token",
            None,
        )

        response = self.client.post(
            "/api/auth/refresh/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "access_token",
            response.cookies,
        )

    def test_logout_elimina_cookies(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {
                "username": "vecino_test",
                "password": self.password,
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
        )

        response = self.client.post(
            "/api/auth/logout/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.cookies["access_token"]["max-age"],
            0,
        )

        self.assertEqual(
            response.cookies["refresh_token"]["max-age"],
            0,
        )

    def test_recuperacion_no_revela_si_email_existe(self):
        response_existente = self.client.post(
            "/api/auth/recuperar-password/",
            {
                "email": "vecino@test.cl",
            },
            format="json",
        )

        response_inexistente = self.client.post(
            "/api/auth/recuperar-password/",
            {
                "email": "noexiste@test.cl",
            },
            format="json",
        )

        self.assertEqual(
            response_existente.status_code,
            200,
        )

        self.assertEqual(
            response_inexistente.status_code,
            200,
        )

        self.assertEqual(
            response_existente.data["message"],
            response_inexistente.data["message"],
        )

        self.assertEqual(len(mail.outbox), 1)

    def test_restablecimiento_password_valido(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.usuario.pk)
        )

        token = default_token_generator.make_token(
            self.usuario
        )

        nueva_password = "NuevaPassword456!"

        response = self.client.post(
            (
                "/api/auth/restablecer-password/"
                f"{uid}/{token}/"
            ),
            {
                "password": nueva_password,
                "confirmar_password": nueva_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password(
                nueva_password
            )
        )

    def test_token_de_recuperacion_no_puede_reutilizarse(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.usuario.pk)
        )

        token = default_token_generator.make_token(
            self.usuario
        )

        nueva_password = "NuevaPassword789!"

        primera_respuesta = self.client.post(
            (
                "/api/auth/restablecer-password/"
                f"{uid}/{token}/"
            ),
            {
                "password": nueva_password,
                "confirmar_password": nueva_password,
            },
            format="json",
        )

        segunda_respuesta = self.client.post(
            (
                "/api/auth/restablecer-password/"
                f"{uid}/{token}/"
            ),
            {
                "password": "OtraPassword789!",
                "confirmar_password": "OtraPassword789!",
            },
            format="json",
        )

        self.assertEqual(
            primera_respuesta.status_code,
            200,
        )

        self.assertEqual(
            segunda_respuesta.status_code,
            400,
        )

    def test_registro_vecino_correcto_crea_usuario_y_rol(self):
        response = self.client.post(
            "/api/auth/registro/",
            {
                "username": "nuevo_vecino",
                "rut": "12.345.678-5",
                "nombres": "Nuevo",
                "apellido_paterno": "Vecino",
                "apellido_materno": "Prueba",
                "email": "nuevo@vecino.cl",
                "password": "PasswordNuevo123!",
                "confirmar_password": "PasswordNuevo123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        Usuario = get_user_model()

        usuario = Usuario.objects.get(
            username="nuevo_vecino"
        )

        self.assertTrue(usuario.is_active)

        self.assertEqual(
            usuario.rut,
            "12345678-5",
        )

        self.assertTrue(
            UsuarioRol.objects.filter(
                usuario=usuario,
                rol=self.rol_vecino,
                activo=True,
            ).exists()
        )

        self.assertFalse(
            Perfil.objects.filter(
                usuario=usuario
            ).exists()
        )

        login_response = self.client.post(
            "/api/auth/login/",
            {
                "username": "nuevo_vecino",
                "password": "PasswordNuevo123!",
                "recordar": False,
            },
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
        )

    def test_registro_vecino_rechaza_rut_invalido(self):
        response = self.client.post(
            "/api/auth/registro/",
            {
                "username": "vecino_rut_invalido",
                "rut": "12.345.678-9",
                "nombres": "Vecino",
                "apellido_paterno": "Prueba",
                "email": "rut@invalido.cl",
                "password": "PasswordNuevo123!",
                "confirmar_password": "PasswordNuevo123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertIn(
            "rut",
            response.data,
        )

    def test_registro_vecino_rechaza_email_duplicado(self):
        response = self.client.post(
            "/api/auth/registro/",
            {
                "username": "otro_vecino",
                "rut": "11.111.111-1",
                "nombres": "Otro",
                "apellido_paterno": "Vecino",
                "email": "vecino@test.cl",
                "password": "PasswordNuevo123!",
                "confirmar_password": "PasswordNuevo123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertIn(
            "email",
            response.data,
        )

    def test_registro_vecino_rechaza_passwords_distintos(self):
        response = self.client.post(
            "/api/auth/registro/",
            {
                "username": "vecino_password",
                "rut": "12.345.678-5",
                "nombres": "Vecino",
                "apellido_paterno": "Password",
                "email": "password@vecino.cl",
                "password": "PasswordNuevo123!",
                "confirmar_password": "OtraPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertIn(
            "confirmar_password",
            response.data,
        )