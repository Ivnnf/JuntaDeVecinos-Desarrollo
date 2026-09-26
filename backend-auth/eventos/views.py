from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from organizacion.models import IntegranteDirectiva
from organizacion.permissions import EsDirectiva

from .models import Evento, InscripcionEvento
from .serializers import EventoSerializer, InscripcionEventoSerializer


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


class InscripcionEventoCreateView(generics.CreateAPIView):
    serializer_class = InscripcionEventoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        usuario = self.request.user
        evento = serializer.validated_data["evento"]

        if (
            not getattr(usuario, "sector_id", None)
            or usuario.estado_asociacion_sector != "CONFIRMADA"
        ):
            raise PermissionDenied(
                "Debes pertenecer a una Junta de Vecinos confirmada."
            )

        junta_usuario_id = usuario.sector.junta_vecinos_id
        junta_evento_id = evento.directiva.junta_vecinos_id

        if junta_usuario_id != junta_evento_id:
            raise PermissionDenied("No puedes inscribirte en eventos de otra Junta.")

        if evento.estado != Evento.Estado.PROGRAMADO:
            raise ValidationError(
                {"evento": ("Solo puedes inscribirte en eventos programados.")}
            )

        inscripcion_existente = InscripcionEvento.objects.filter(
            evento=evento,
            usuario=usuario,
        ).first()

        if (
            inscripcion_existente
            and inscripcion_existente.estado == InscripcionEvento.Estado.INSCRITO
        ):
            raise ValidationError({"evento": ("Ya estás inscrito en este evento.")})

        inscritos_actuales = InscripcionEvento.objects.filter(
            evento=evento,
            estado=InscripcionEvento.Estado.INSCRITO,
        ).count()

        if evento.cupo_maximo is not None and inscritos_actuales >= evento.cupo_maximo:
            raise ValidationError(
                {"evento": ("No quedan cupos disponibles para este evento.")}
            )

        if inscripcion_existente:
            inscripcion_existente.estado = InscripcionEvento.Estado.INSCRITO
            inscripcion_existente.fecha_cancelacion = None
            inscripcion_existente.save(
                update_fields=[
                    "estado",
                    "fecha_cancelacion",
                ]
            )

            serializer.instance = inscripcion_existente
            return

        serializer.save(
            usuario=usuario,
        )


class InscripcionEventoCancelarView(generics.UpdateAPIView):
    serializer_class = InscripcionEventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InscripcionEvento.objects.filter(
            usuario=self.request.user,
        )

    def perform_update(self, serializer):
        inscripcion = serializer.instance

        if inscripcion.estado != InscripcionEvento.Estado.INSCRITO:
            raise ValidationError(
                {"estado": ("La inscripción ya se encuentra cancelada.")}
            )

        serializer.save(
            estado=InscripcionEvento.Estado.CANCELADA,
            fecha_cancelacion=timezone.now(),
        )
