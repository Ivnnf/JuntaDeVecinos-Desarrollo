from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import JuntaVecinos, Sector
from .permissions import EsAdministrador, EsVecino
from .serializers import (
    JuntaVecinosSerializer,
    SectorSerializer,
    AsociacionSectorPendienteSerializer,
)
from rest_framework.response import Response
from rest_framework import status

class JuntaVecinosListCreateView(
    generics.ListCreateAPIView
):
    queryset = JuntaVecinos.objects.all().order_by(
        "nombre"
    )

    serializer_class = JuntaVecinosSerializer
    permission_classes = [EsAdministrador]


class JuntaVecinosDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = JuntaVecinos.objects.all()
    serializer_class = JuntaVecinosSerializer
    permission_classes = [EsAdministrador]

class SectorListCreateView(
    generics.ListCreateAPIView
):
    queryset = Sector.objects.select_related(
        "junta_vecinos"
    ).all().order_by(
        "nombre"
    )

    serializer_class = SectorSerializer
    permission_classes = [EsAdministrador]


class SectorDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Sector.objects.select_related(
        "junta_vecinos"
    ).all()

    serializer_class = SectorSerializer
    permission_classes = [EsAdministrador]

class SectoresDisponiblesView(
    generics.ListAPIView
):
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Sector.objects.select_related(
            "junta_vecinos"
        ).filter(
            activo=True,
            junta_vecinos__activa=True,
        ).order_by(
            "junta_vecinos__nombre",
            "nombre",
        )

class SolicitarAsociacionSectorView(
    generics.GenericAPIView
):
    permission_classes = [EsVecino]

    def post(self, request):
        sector_id = request.data.get("sector_id")

        if not sector_id:
            return Response(
                {
                    "detail": (
                        "Debe indicar un sector."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sector = Sector.objects.get(
                id=sector_id,
                activo=True,
                junta_vecinos__activa=True,
            )
        except Sector.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "El sector seleccionado no está disponible."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        usuario = request.user

        if (
             usuario.sector_id is not None
             and usuario.estado_asociacion_sector == "CONFIRMADA"
        ):
            return Response(
        {
            "detail": (
                "La asociación territorial ya está confirmada "
                "y no puede ser reemplazada directamente."
            )
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

        usuario.sector = sector
        usuario.estado_asociacion_sector = "PENDIENTE"
        usuario.confirmado_por_usuario = None
        usuario.fecha_confirmacion_sector = None

        usuario.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
                "confirmado_por_usuario",
                "fecha_confirmacion_sector",
            ]
        )

        return Response(
            {
                "message": (
                    "Solicitud de asociación enviada correctamente."
                ),
                "sector": {
                    "id": sector.id,
                    "nombre": sector.nombre,
                    "junta": sector.junta_vecinos.nombre,
                },
                "estado": usuario.estado_asociacion_sector,
            },
            status=status.HTTP_200_OK,
        )

class AsociacionesSectorPendientesView(
    generics.ListAPIView
):
    serializer_class = AsociacionSectorPendienteSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        Usuario = get_user_model()

        return Usuario.objects.select_related(
            "sector",
            "sector__junta_vecinos",
        ).filter(
            sector__isnull=False,
            estado_asociacion_sector="PENDIENTE",
        ).order_by(
            "nombres",
            "apellido_paterno",
        )

class ResolverAsociacionSectorView(
    generics.GenericAPIView
):
    permission_classes = [EsAdministrador]

    def post(self, request, usuario_id):
        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.select_related(
                "sector"
            ).get(
                id=usuario_id,
                sector__isnull=False,
                estado_asociacion_sector="PENDIENTE",
            )
        except Usuario.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "No existe una asociación pendiente "
                        "para este usuario."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        accion = request.data.get("accion", "").upper()

        if accion == "CONFIRMAR":
            usuario.estado_asociacion_sector = "CONFIRMADA"
            usuario.confirmado_por_usuario = request.user
            usuario.fecha_confirmacion_sector = timezone.now()

        elif accion == "RECHAZAR":
            usuario.estado_asociacion_sector = "RECHAZADA"
            usuario.confirmado_por_usuario = None
            usuario.fecha_confirmacion_sector = None

        else:
            return Response(
                {
                    "detail": (
                        "La acción debe ser CONFIRMAR o RECHAZAR."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario.save(
            update_fields=[
                "estado_asociacion_sector",
                "confirmado_por_usuario",
                "fecha_confirmacion_sector",
            ]
        )

        return Response(
            {
                "message": (
                    "Asociación territorial actualizada correctamente."
                ),
                "usuario_id": usuario.id,
                "sector_id": usuario.sector_id,
                "estado": usuario.estado_asociacion_sector,
            },
            status=status.HTTP_200_OK,
        )