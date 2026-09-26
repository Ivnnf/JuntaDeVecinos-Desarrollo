from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from organizacion.models import (
    Directiva,
    IntegranteDirectiva,
)

from django.utils import timezone

from organizacion.permissions import EsDirectiva
from django.contrib.auth import get_user_model

from .models import (
    AdjuntoPublicacion,
    Notificacion,
    Publicacion,
)

from .serializers import (
    AdjuntoPublicacionSerializer,
    NotificacionSerializer,
    PublicacionSerializer,
)

from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)

from django.http import FileResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

Usuario = get_user_model()


class PublicacionDirectivaListCreateView(generics.ListCreateAPIView):
    serializer_class = PublicacionSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        return (
            Publicacion.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "autor",
            )
            .filter(
                directiva__integrantes__usuario=self.request.user,
                directiva__integrantes__activo=True,
                directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
            )
            .distinct()
            .order_by("-fecha_publicacion")
        )

    def perform_create(self, serializer):
        directiva = serializer.validated_data["directiva"]

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=directiva,
            usuario=self.request.user,
            activo=True,
            directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes publicar en esta directiva.")

        publicacion = serializer.save(
            autor=self.request.user,
        )

        junta_id = publicacion.directiva.junta_vecinos_id

        usuarios_destinatarios = Usuario.objects.filter(
            sector__junta_vecinos_id=junta_id,
            estado_asociacion_sector="CONFIRMADA",
            is_active=True,
        ).exclude(
            id=self.request.user.id,
        )

        Notificacion.objects.bulk_create(
            [
                Notificacion(
                    publicacion=publicacion,
                    usuario=usuario,
                )
                for usuario in usuarios_destinatarios
            ],
            ignore_conflicts=True,
        )


class AdjuntoPublicacionCreateView(generics.CreateAPIView):
    serializer_class = AdjuntoPublicacionSerializer
    permission_classes = [EsDirectiva]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def perform_create(self, serializer):
        publicacion = get_object_or_404(
            Publicacion.objects.select_related(
                "directiva",
            ),
            pk=self.kwargs["publicacion_id"],
        )

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=publicacion.directiva,
            usuario=self.request.user,
            activo=True,
            directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes adjuntar archivos " "a esta publicación.")

        archivo = serializer.validated_data["archivo"]

        serializer.save(
            publicacion=publicacion,
            nombre_original=archivo.name,
        )


class AdjuntoPublicacionDescargaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        adjunto = get_object_or_404(
            AdjuntoPublicacion.objects.select_related(
                "publicacion",
                "publicacion__directiva",
                "publicacion__directiva__junta_vecinos",
            ),
            pk=pk,
        )

        junta_id = adjunto.publicacion.directiva.junta_vecinos_id

        es_integrante_directiva = IntegranteDirectiva.objects.filter(
            usuario=request.user,
            directiva__junta_vecinos_id=junta_id,
            activo=True,
        ).exists()

        pertenece_a_junta = (
            getattr(request.user, "sector_id", None)
            and request.user.sector.junta_vecinos_id == junta_id
            and request.user.estado_asociacion_sector == "CONFIRMADA"
        )

        if not (es_integrante_directiva or pertenece_a_junta):
            raise PermissionDenied("No tienes acceso a este archivo.")

        adjunto.archivo.open("rb")

        descargar = request.query_params.get("download") == "1"

        return FileResponse(
            adjunto.archivo,
            as_attachment=descargar,
            filename=adjunto.nombre_original,
        )


class NotificacionListView(
    generics.ListAPIView
):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Notificacion.objects
            .select_related(
                "publicacion",
                "publicacion__directiva",
                "publicacion__directiva__junta_vecinos",
            )
            .filter(
                usuario=self.request.user,
            )
            .order_by("-fecha_creacion")
        )

class NotificacionDetailView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(
            usuario=self.request.user,
        )

    def perform_update(self, serializer):
        notificacion = self.get_object()

        nueva_leida = serializer.validated_data.get(
            "leida",
            notificacion.leida,
        )

        if nueva_leida and not notificacion.leida:
            serializer.save(
                fecha_lectura=timezone.now(),
            )
            return

        if not nueva_leida:
            serializer.save(
                fecha_lectura=None,
            )
            return

        serializer.save()