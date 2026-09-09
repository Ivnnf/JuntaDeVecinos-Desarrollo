from rest_framework.permissions import BasePermission

from profiles.models import UsuarioRol


class EsAdministrador(BasePermission):
    message = "Se requiere rol de Administrador."

    def has_permission(self, request, view):
        usuario = request.user

        if not usuario or not usuario.is_authenticated:
            return False

        return UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre__iexact="Administrador",
            activo=True,
        ).exists()

class EsVecino(BasePermission):
    message = "Se requiere rol de Vecino."

    def has_permission(self, request, view):
        usuario = request.user

        if not usuario or not usuario.is_authenticated:
            return False

        return UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre__iexact="Vecino",
            activo=True,
        ).exists()