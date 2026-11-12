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
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import EsAdministrador

from profiles.models import (
    HistorialGestionUsuario,
    Rol,
    UsuarioRol,
)
from organizacion.models import IntegranteDirectiva

from .serializers import (
    LoginSerializer,
    Desafio2FASerializer,
    Codigo2FASerializer,
    Activar2FASerializer,
    SolicitudRecuperacionSerializer,
    RestablecerPasswordSerializer,
    RegistroVecinoSerializer,
    PerfilVecinoSerializer,
    UsuarioAdministracionSerializer,
    EstadoCuentaUsuarioSerializer,
    RolAdministracionSerializer,
    RolUsuarioAdministracionSerializer,
    CrearUsuarioMunicipalSerializer,
    CrearUsuarioVecinoAdminSerializer,
)

from utils.token import (
    generar_tokens,
    generar_token_desafio_2fa,
    refresh_access_token,
    verificar_token,
)

from .services.totp import (
    generar_secreto_totp,
    cifrar_secreto_totp,
    descifrar_secreto_totp,
    generar_uri_totp,
    verificar_codigo_totp,
)

from rest_framework.permissions import IsAuthenticated
from rest_framework import generics


def health(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "auth_api",
        }
    )


class RegistroVecinoView(APIView):
    def post(self, request):
        serializer = RegistroVecinoSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        usuario = serializer.save()

        return Response(
            {
                "message": ("Registro realizado correctamente."),
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class PerfilVecinoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = PerfilVecinoSerializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = PerfilVecinoSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message": "Perfil actualizado correctamente.",
                "perfil": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        recordar = serializer.validated_data["recordar"]

        Usuario = get_user_model()

        usuario_deshabilitado = Usuario.objects.filter(
            username__iexact=username,
            is_active=False,
        ).first()

        if usuario_deshabilitado is not None and usuario_deshabilitado.check_password(
            password
        ):
            return Response(
                {"detail": "Su cuenta ha sido deshabilitada."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
        if usuario.totp_requerido and not usuario.totp_habilitado:
            challenge_token = generar_token_desafio_2fa(
                usuario,
                recordar=recordar,
            )

            return Response(
                {
                    "message": (
                        "Debes configurar la autenticación "
                        "en dos pasos antes de continuar."
                    ),
                    "requiere_configurar_2fa": True,
                    "challenge_token": challenge_token,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        if usuario.totp_habilitado:
            challenge_token = generar_token_desafio_2fa(
                usuario,
                recordar=recordar,
            )

            return Response(
                {
                    "message": "Se requiere verificación en dos pasos.",
                    "requiere_2fa": True,
                    "challenge_token": challenge_token,
                },
                status=status.HTTP_202_ACCEPTED,
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


class Preparar2FAInicialView(APIView):
    def post(self, request):
        serializer = Desafio2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        challenge_token = serializer.validated_data["challenge_token"]

        payload = verificar_token(
            challenge_token,
            tipo_esperado="2fa_challenge",
        )

        if payload is None:
            return Response(
                {
                    "detail": (
                        "El desafío de autenticación es inválido " "o ha expirado."
                    )
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = payload.get("user_id")

        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(
                id=user_id,
                is_active=True,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no válido."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not usuario.totp_requerido:
            return Response(
                {
                    "detail": (
                        "Este usuario no requiere configuración "
                        "obligatoria de segundo factor."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if usuario.totp_habilitado:
            return Response(
                {"detail": ("El segundo factor ya se encuentra " "configurado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if usuario.totp_secret:
            secreto = descifrar_secreto_totp(usuario.totp_secret)
        else:
            secreto = generar_secreto_totp()

            usuario.totp_secret = cifrar_secreto_totp(secreto)

            usuario.save(update_fields=["totp_secret"])

        uri = generar_uri_totp(
            usuario,
            secreto,
        )

        return Response(
            {
                "message": ("Configuración inicial de segundo factor preparada."),
                "provisioning_uri": uri,
                "secreto": secreto,
            },
            status=status.HTTP_200_OK,
        )


class Activar2FAInicialView(APIView):
    def post(self, request):
        serializer = Codigo2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        challenge_token = serializer.validated_data["challenge_token"]
        codigo = serializer.validated_data["codigo"]

        payload = verificar_token(
            challenge_token,
            tipo_esperado="2fa_challenge",
        )

        if payload is None:
            return Response(
                {
                    "detail": (
                        "El proceso de configuración es inválido "
                        "o ha expirado. Inicia sesión nuevamente."
                    )
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = payload.get("user_id")

        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(
                id=user_id,
                is_active=True,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no válido."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not usuario.totp_requerido:
            return Response(
                {
                    "detail": (
                        "Este usuario no requiere configurar " "el segundo factor."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if usuario.totp_habilitado:
            return Response(
                {"detail": ("El segundo factor ya está activado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not usuario.totp_secret:
            return Response(
                {
                    "detail": (
                        "Primero debes preparar la configuración " "del segundo factor."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        secreto = descifrar_secreto_totp(usuario.totp_secret)

        if not verificar_codigo_totp(
            secreto,
            codigo,
        ):
            return Response(
                {"detail": ("El código de verificación es inválido " "o ha expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario.totp_habilitado = True
        usuario.save(update_fields=["totp_habilitado"])

        recordar = payload.get(
            "recordar",
            False,
        )

        access_token, refresh_token, access_max_age, refresh_max_age = generar_tokens(
            usuario,
            recordar=recordar,
        )

        response = Response(
            {
                "message": ("Autenticación en dos pasos configurada " "correctamente."),
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                },
            },
            status=status.HTTP_200_OK,
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


class Configurar2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        usuario = request.user

        if usuario.totp_habilitado:
            return Response(
                {
                    "detail": (
                        "El segundo factor ya está configurado " "para este usuario."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if usuario.totp_secret:
            secreto = descifrar_secreto_totp(usuario.totp_secret)
        else:
            secreto = generar_secreto_totp()

            usuario.totp_secret = cifrar_secreto_totp(secreto)
            usuario.save(update_fields=["totp_secret"])

        uri = generar_uri_totp(
            usuario,
            secreto,
        )

        return Response(
            {
                "message": ("Configuración de segundo factor preparada."),
                "provisioning_uri": uri,
                "secreto": secreto,
            },
            status=status.HTTP_200_OK,
        )


class Activar2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = Activar2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        usuario = request.user
        codigo = serializer.validated_data["codigo"]

        if usuario.totp_habilitado:
            return Response(
                {
                    "detail": (
                        "El segundo factor ya está activado " "para este usuario."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not usuario.totp_secret:
            return Response(
                {
                    "detail": (
                        "Primero debes iniciar la configuración " "del segundo factor."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        secreto = descifrar_secreto_totp(usuario.totp_secret)

        if not verificar_codigo_totp(
            secreto,
            codigo,
        ):
            return Response(
                {"detail": ("El código de verificación es inválido " "o ha expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario.totp_habilitado = True
        usuario.save(update_fields=["totp_habilitado"])

        return Response(
            {"message": ("Segundo factor activado correctamente.")},
            status=status.HTTP_200_OK,
        )


class Verificar2FAView(APIView):
    def post(self, request):
        serializer = Codigo2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        challenge_token = serializer.validated_data["challenge_token"]
        codigo = serializer.validated_data["codigo"]

        payload = verificar_token(
            challenge_token,
            tipo_esperado="2fa_challenge",
        )

        if payload is None:
            return Response(
                {
                    "detail": (
                        "El desafío de autenticación es inválido " "o ha expirado."
                    )
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = payload.get("user_id")

        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(
                id=user_id,
                is_active=True,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no válido."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not usuario.totp_habilitado or not usuario.totp_secret:
            return Response(
                {
                    "detail": (
                        "El segundo factor no está habilitado " "para este usuario."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        secreto = descifrar_secreto_totp(usuario.totp_secret)

        if not verificar_codigo_totp(
            secreto,
            codigo,
        ):
            return Response(
                {"detail": ("El código de verificación es inválido " "o ha expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recordar = payload.get(
            "recordar",
            False,
        )

        access_token, refresh_token, access_max_age, refresh_max_age = generar_tokens(
            usuario,
            recordar=recordar,
        )

        response = Response(
            {
                "message": "Autenticación en dos pasos correcta.",
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                },
            },
            status=status.HTTP_200_OK,
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
            uid = urlsafe_base64_encode(force_bytes(usuario.pk))

            token = default_token_generator.make_token(usuario)

            frontend_url = getattr(
                settings,
                "FRONTEND_URL",
                "http://localhost:5173",
            )

            enlace = f"{frontend_url}/restablecer-password/" f"{uid}/{token}"

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
        serializer = RestablecerPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        Usuario = get_user_model()

        try:
            usuario_id = force_str(urlsafe_base64_decode(uidb64))

            usuario = Usuario.objects.get(pk=usuario_id)

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            Usuario.DoesNotExist,
        ):
            return Response(
                {"detail": ("El enlace de recuperación " "no es válido.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(
            usuario,
            token,
        ):
            return Response(
                {"detail": ("El enlace de recuperación " "es inválido o ha expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario.set_password(serializer.validated_data["password"])

        usuario.save(update_fields=["password"])

        return Response(
            {"message": ("Contraseña actualizada correctamente.")},
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
                "es_superusuario": usuario.is_superuser,
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


class UsuarioAdministracionListView(APIView):
    permission_classes = [EsAdministrador]

    def get(self, request):
        Usuario = get_user_model()

        usuarios = Usuario.objects.all().order_by(
            "nombres",
            "apellido_paterno",
            "username",
        )

        serializer = UsuarioAdministracionSerializer(
            usuarios,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = CrearUsuarioMunicipalSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        usuario = serializer.save()

        return Response(
            {
                "message": ("Usuario Municipal creado " "correctamente."),
                "usuario": (UsuarioAdministracionSerializer(usuario).data),
            },
            status=status.HTTP_201_CREATED,
        )


class RolAdministracionListView(generics.ListAPIView):
    serializer_class = RolAdministracionSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        return Rol.objects.filter(
            nombre__in=[
                "Administrador",
                "Directiva",
                "Vecino",
                "Municipal",
            ]
        ).order_by("nombre")


class CrearUsuarioVecinoAdminView(APIView):
    permission_classes = [EsAdministrador]

    def post(self, request):
        serializer = CrearUsuarioVecinoAdminSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        serializer.is_valid(raise_exception=True)

        usuario = serializer.save()

        return Response(
            {
                "message": ("Vecino creado y asociado " "correctamente."),
                "usuario": (UsuarioAdministracionSerializer(usuario).data),
            },
            status=status.HTTP_201_CREATED,
        )


class EstadoCuentaUsuarioView(APIView):
    permission_classes = [EsAdministrador]

    def patch(self, request, usuario_id):
        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        estado_anterior = usuario.is_active

        serializer = EstadoCuentaUsuarioSerializer(
            usuario,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        nuevo_estado = serializer.validated_data.get(
            "is_active",
            usuario.is_active,
        )

        if usuario.id == request.user.id and not nuevo_estado:
            return Response(
                {"detail": ("No puedes deshabilitar tu propia cuenta.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario_actualizado = serializer.save()

        if estado_anterior != usuario_actualizado.is_active:
            HistorialGestionUsuario.objects.create(
                usuario_objetivo=usuario_actualizado,
                realizado_por=request.user,
                tipo_cambio=(HistorialGestionUsuario.TipoCambio.ESTADO_CUENTA),
                valor_anterior=("HABILITADA" if estado_anterior else "DESHABILITADA"),
                valor_nuevo=(
                    "HABILITADA" if usuario_actualizado.is_active else "DESHABILITADA"
                ),
                detalle="Cambio de estado de cuenta.",
            )

        return Response(
            {
                "message": ("Estado de cuenta actualizado correctamente."),
                "usuario": UsuarioAdministracionSerializer(usuario_actualizado).data,
            },
            status=status.HTTP_200_OK,
        )


class RolUsuarioAdministracionView(APIView):
    permission_classes = [EsAdministrador]

    def patch(self, request, usuario_id):
        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": ("Usuario no encontrado.")},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RolUsuarioAdministracionSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        rol = Rol.objects.get(id=serializer.validated_data["rol_id"])

        activo = serializer.validated_data["activo"]
        if (
            usuario.id == request.user.id
            and rol.nombre.lower() == "administrador"
            and not activo
        ):
            return Response(
                {"detail": ("No puedes desactivar tu propio rol " "de Administrador.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        asignacion_previa = UsuarioRol.objects.filter(
            usuario=usuario,
            rol=rol,
        ).first()

        estado_anterior = asignacion_previa.activo if asignacion_previa else None

        with transaction.atomic():
            asignacion, _ = UsuarioRol.objects.update_or_create(
                usuario=usuario,
                rol=rol,
                defaults={
                    "activo": activo,
                },
            )

            if rol.nombre.lower() == "directiva" and not activo:
                IntegranteDirectiva.objects.filter(
                    usuario=usuario,
                    activo=True,
                    directiva__estado="VIGENTE",
                ).update(
                    activo=False,
                    fecha_fin=timezone.localdate(),
                )

        if estado_anterior is None or estado_anterior != asignacion.activo:
            HistorialGestionUsuario.objects.create(
                usuario_objetivo=usuario,
                realizado_por=request.user,
                tipo_cambio=(HistorialGestionUsuario.TipoCambio.ROL),
                valor_anterior=(
                    "NO_ASIGNADO"
                    if estado_anterior is None
                    else ("ACTIVO" if estado_anterior else "INACTIVO")
                ),
                valor_nuevo=("ACTIVO" if asignacion.activo else "INACTIVO"),
                detalle=(f"Rol: {rol.nombre}"),
            )

        return Response(
            {
                "message": ("Rol de usuario actualizado correctamente."),
                "usuario": UsuarioAdministracionSerializer(usuario).data,
            },
            status=status.HTTP_200_OK,
        )
