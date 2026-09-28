from django.shortcuts import render
from profiles.models import UsuarioRol

# Create your views here.
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import SolicitudVecino
from .serializers import SolicitudVecinoSerializer


class SolicitudVecinoListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = SolicitudVecinoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SolicitudVecino.objects
            .select_related(
                "vecino",
                "junta_vecinos",
            )
            .filter(
                vecino=self.request.user,
            )
            .order_by("-fecha_creacion")
        )

    def perform_create(self, serializer):
        usuario = self.request.user
        
        tiene_rol_vecino = UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre="Vecino",
            activo=True,
        ).exists()

        if not tiene_rol_vecino:
            raise PermissionDenied(
                "Debes tener el rol Vecino activo."
            )

        if (
            not getattr(usuario, "sector_id", None)
            or usuario.estado_asociacion_sector != "CONFIRMADA"
        ):
            raise PermissionDenied(
                "Debes pertenecer a una Junta de Vecinos confirmada."
            )

        serializer.save(
            vecino=usuario,
            junta_vecinos=usuario.sector.junta_vecinos,
            estado=SolicitudVecino.Estado.PENDIENTE,
        )