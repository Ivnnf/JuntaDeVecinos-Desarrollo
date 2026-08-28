from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer
from utils.token import generar_tokens, refresh_access_token, verificar_token


def health(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "auth_api",
        }
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


class SesionUsuarioView(APIView):
    def get(self, request):
        access_token = request.COOKIES.get("access_token")

        if not access_token:
            return Response(
                {"detail": "No existe una sesión activa"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        payload = verificar_token(
            access_token,
            tipo_esperado="access",
        )

        if payload is None:
            return Response(
                {"detail": "Token inválido o expirado"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = payload.get("user_id")
        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.get(id=user_id)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
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

        nuevo_access_token, access_max_age, error = refresh_access_token(
            refresh_token
        )

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