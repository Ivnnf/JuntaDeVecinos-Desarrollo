from django.shortcuts import render
from profiles.models import UsuarioRol

# Create your views here.
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import SolicitudVecino
from django.utils import timezone

from organizacion.models import IntegranteDirectiva
from organizacion.permissions import EsDirectiva

from .serializers import (
    SolicitudDirectivaSerializer,
    SolicitudVecinoSerializer,
)


class SolicitudVecinoListCreateView(generics.ListCreateAPIView):
    serializer_class = SolicitudVecinoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SolicitudVecino.objects.select_related(
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
            raise PermissionDenied("Debes tener el rol Vecino activo.")

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


class SolicitudesDirectivaListView(generics.ListAPIView):
    serializer_class = SolicitudDirectivaSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        juntas_ids = IntegranteDirectiva.objects.filter(
            usuario=self.request.user,
            activo=True,
            directiva__estado="VIGENTE",
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        return (
            SolicitudVecino.objects.select_related(
                "vecino",
                "junta_vecinos",
                "respondido_por",
            )
            .filter(
                junta_vecinos_id__in=juntas_ids,
            )
            .order_by("-fecha_creacion")
        )


class SolicitudDirectivaDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SolicitudDirectivaSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        juntas_ids = IntegranteDirectiva.objects.filter(
            usuario=self.request.user,
            activo=True,
            directiva__estado="VIGENTE",
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        return SolicitudVecino.objects.select_related(
            "vecino",
            "junta_vecinos",
            "respondido_por",
        ).filter(
            junta_vecinos_id__in=juntas_ids,
        )

    def perform_update(self, serializer):
        estado = serializer.validated_data.get(
            "estado",
            serializer.instance.estado,
        )

        respuesta = serializer.validated_data.get(
            "respuesta",
            serializer.instance.respuesta,
        )

        if estado == SolicitudVecino.Estado.RESPONDIDA:
            if not respuesta.strip():
                raise ValidationError(
                    {
                        "respuesta": (
                            "Debes ingresar una respuesta antes "
                            "de marcar la solicitud como respondida."
                        )
                    }
                )

            serializer.save(
                respondido_por=self.request.user,
                fecha_respuesta=timezone.now(),
            )
            return

        serializer.save()
