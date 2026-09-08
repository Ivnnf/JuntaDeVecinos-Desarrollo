from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse
from utils.AutorizacionUsuario import AutorizacionUsuario
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    SolicitudRecuperacionSerializer,
    RestablecerPasswordSerializer,
    RegistroVecinoSerializer,
)
from utils.token import generar_tokens, refresh_access_token, verificar_token
from rest_framework.permissions import IsAuthenticated

def health(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "auth_api",
        }
    )


class RegistroVecinoView(APIView):
    def post(self, request):
        serializer = RegistroVecinoSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        usuario = serializer.save()

        return Response(
            {
                "message": (
                    "Registro realizado correctamente."
                ),
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        recordar = serializer.validated_data["recordar"]

        usuario = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if usuario is None:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        auth_usuario = AutorizacionUsuario(usuario)
        puede_acceder, motivo = auth_usuario.puede_acceder()

        if not puede_acceder:
           return Response(
        {
            "detail": "Acceso denegado",
            "motivo": motivo,
        },
        status=status.HTTP_403_FORBIDDEN,
    )

        access_token, refresh_token, access_max_age, refresh_max_age = generar_tokens(
            usuario,
            recordar=recordar,
        )

        response = Response(
            {
                "message": "Autenticación correcta",
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                },
            }
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=int(access_max_age),
            path="/",
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=int(refresh_max_age),
            path="/",
        )

        return response

class SolicitudRecuperacionView(APIView):
    def post(self, request):
        serializer = SolicitudRecuperacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        Usuario = get_user_model()

        usuario = Usuario.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if usuario and usuario.has_usable_password():
            uid = urlsafe_base64_encode(
                force_bytes(usuario.pk)
            )

            token = default_token_generator.make_token(
                usuario
            )

            frontend_url = getattr(
                settings,
                "FRONTEND_URL",
                "http://localhost:5173",
            )

            enlace = (
                f"{frontend_url}/restablecer-password/"
                f"{uid}/{token}"
            )

            send_mail(
                subject="Recuperación de contraseña",
                message=(
                    "Se solicitó recuperar el acceso a tu cuenta.\n\n"
                    "Utiliza el siguiente enlace para establecer "
                    "una nueva contraseña:\n\n"
                    f"{enlace}\n\n"
                    "Si no realizaste esta solicitud, puedes "
                    "ignorar este mensaje."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[usuario.email],
                fail_silently=False,
            )

        return Response(
            {
                "message": (
                    "Si el correo se encuentra registrado, "
                    "recibirás instrucciones para recuperar "
                    "tu contraseña."
                )
            },
            status=status.HTTP_200_OK,
        )

class RestablecerPasswordView(APIView):
    def post(self, request, uidb64, token):
        serializer = RestablecerPasswordSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        Usuario = get_user_model()

        try:
            usuario_id = force_str(
                urlsafe_base64_decode(uidb64)
            )

            usuario = Usuario.objects.get(
                pk=usuario_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            Usuario.DoesNotExist,
        ):
            return Response(
                {
                    "detail": (
                        "El enlace de recuperación "
                        "no es válido."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(
            usuario,
            token,
        ):
            return Response(
                {
                    "detail": (
                        "El enlace de recuperación "
                        "es inválido o ha expirado."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario.set_password(
            serializer.validated_data["password"]
        )

        usuario.save(
            update_fields=["password"]
        )

        return Response(
            {
                "message": (
                    "Contraseña actualizada correctamente."
                )
            },
            status=status.HTTP_200_OK,
        )

class SesionUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        auth_usuario = AutorizacionUsuario(usuario)
        puede_acceder, motivo = auth_usuario.puede_acceder()

        if not puede_acceder:
            return Response(
                {
                    "detail": "Acceso denegado",
                    "motivo": motivo,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
    {
        "id": usuario.id,
        "username": usuario.username,
        "email": usuario.email,
        "roles": auth_usuario.getRoles(),
        "rol_id": auth_usuario.getRol(),
        "estado": auth_usuario.getEstado(),
        "cargo_id": auth_usuario.getCargo(),
    }
)


class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {"message": "Logout exitoso"},
            status=status.HTTP_200_OK,
        )

        response.delete_cookie(
            "access_token",
            path="/",
        )

        response.delete_cookie(
            "refresh_token",
            path="/",
        )

        return response


class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "No existe refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        nuevo_access_token, access_max_age, error = refresh_access_token(refresh_token)

        if error:
            return Response(
                {"detail": error},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            {"message": "Access token renovado"},
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="access_token",
            value=nuevo_access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=int(access_max_age),
            path="/",
        )

        return response
