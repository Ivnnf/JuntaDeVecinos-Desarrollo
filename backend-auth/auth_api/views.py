from django.contrib.auth import authenticate
from django.http import JsonResponse

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer


def health(request):
    return JsonResponse({
        "status": "ok",
        "service": "auth_api"
    })


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        usuario = authenticate(
            request=request,
            username=username,
            password=password
        )

        if usuario is None:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "message": "Autenticación correcta",
            "usuario": {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
            }
        })