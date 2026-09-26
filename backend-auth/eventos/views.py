from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from organizacion.models import IntegranteDirectiva
from organizacion.permissions import EsDirectiva

from .models import Evento
from .serializers import EventoSerializer


class EventoDirectivaListCreateView(generics.ListCreateAPIView):
    serializer_class = EventoSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        return (
            Evento.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "creador",
            )
            .filter(
                directiva__integrantes__usuario=self.request.user,
                directiva__integrantes__activo=True,
                directiva__estado="VIGENTE",
            )
            .distinct()
            .order_by("fecha_inicio")
        )

    def perform_create(self, serializer):
        directiva = serializer.validated_data["directiva"]

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=directiva,
            usuario=self.request.user,
            activo=True,
            directiva__estado="VIGENTE",
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes crear eventos para esta directiva.")

        serializer.save(
            creador=self.request.user,
        )


class EventoDirectivaDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = EventoSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        return (
            Evento.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "creador",
            )
            .filter(
                directiva__integrantes__usuario=self.request.user,
                directiva__integrantes__activo=True,
                directiva__estado="VIGENTE",
            )
            .distinct()
        )

    def perform_update(self, serializer):
        directiva = serializer.validated_data.get(
            "directiva",
            serializer.instance.directiva,
        )

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=directiva,
            usuario=self.request.user,
            activo=True,
            directiva__estado="VIGENTE",
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes modificar eventos de esta directiva.")

        serializer.save()


class EventoVecinoListView(generics.ListAPIView):
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user

        if (
            not getattr(usuario, "sector_id", None)
            or usuario.estado_asociacion_sector != "CONFIRMADA"
        ):
            return Evento.objects.none()

        junta_id = usuario.sector.junta_vecinos_id

        return (
            Evento.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "creador",
            )
            .filter(
                directiva__junta_vecinos_id=junta_id,
                directiva__estado="VIGENTE",
                estado=Evento.Estado.PROGRAMADO,
            )
            .order_by("fecha_inicio")
        )
