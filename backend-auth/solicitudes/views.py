import uuid
from django.shortcuts import render
from profiles.models import UsuarioRol
from django.shortcuts import get_object_or_404
from django.http import FileResponse
# Create your views here.
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from .models import (
    HistorialSolicitudDocumento,
    SolicitudDocumento,
    SolicitudDocumentoArchivo,
    SolicitudVecino,
    TipoDocumento,
)
from django.utils import timezone

from organizacion.models import IntegranteDirectiva
from organizacion.permissions import EsDirectiva

from .serializers import (
    SolicitudDirectivaSerializer,
    SolicitudDocumentoArchivoUploadSerializer,
    SolicitudDocumentoDirectivaSerializer,
    SolicitudDocumentoVecinoSerializer,
    SolicitudVecinoSerializer,
    TipoDocumentoSerializer,
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


class TipoDocumentoActivoListView(generics.ListAPIView):
    serializer_class = TipoDocumentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TipoDocumento.objects.filter(
            activo=True,
        ).order_by("nombre")


class SolicitudDocumentoVecinoListCreateView(generics.ListCreateAPIView):
    serializer_class = SolicitudDocumentoVecinoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SolicitudDocumento.objects.select_related(
                "tipo_documento",
                "vecino",
                "junta_vecinos",
                "responsable",
            )
            .prefetch_related(
                "historial",
                "archivos",
            )
            .filter(
                vecino=self.request.user,
            )
            .order_by("-fecha_solicitud")
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
                "Debes tener el rol Vecino para solicitar documentos."
            )

        if not usuario.sector_id or usuario.estado_asociacion_sector != "CONFIRMADA":
            raise PermissionDenied("Debes tener una asociación territorial confirmada.")

        numero_seguimiento = f"DOC-{uuid.uuid4().hex[:12].upper()}"

        solicitud = serializer.save(
            numero_seguimiento=numero_seguimiento,
            vecino=usuario,
            junta_vecinos=usuario.sector.junta_vecinos,
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        HistorialSolicitudDocumento.objects.create(
            solicitud=solicitud,
            estado_anterior=None,
            estado_nuevo=SolicitudDocumento.Estado.PENDIENTE,
            usuario_responsable=usuario,
            comentario_respuesta="Solicitud de documento creada.",
        )


class SolicitudDocumentoDirectivaListView(generics.ListAPIView):
    serializer_class = SolicitudDocumentoDirectivaSerializer
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
            SolicitudDocumento.objects.select_related(
                "tipo_documento",
                "vecino",
                "junta_vecinos",
                "responsable",
            )
            .prefetch_related(
                "historial",
                "archivos",
            )
            .filter(
                junta_vecinos_id__in=juntas_ids,
            )
            .order_by("-fecha_solicitud")
        )


class SolicitudDocumentoDirectivaDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SolicitudDocumentoDirectivaSerializer
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
            SolicitudDocumento.objects.select_related(
                "tipo_documento",
                "vecino",
                "junta_vecinos",
                "responsable",
            )
            .prefetch_related(
                "historial",
                "archivos",
            )
            .filter(
                junta_vecinos_id__in=juntas_ids,
            )
        )

    def perform_update(self, serializer):
        solicitud = serializer.instance

        estado_anterior = solicitud.estado_actual

        estado_nuevo = serializer.validated_data.get(
            "estado_actual",
            estado_anterior,
        )

        comentario = serializer.validated_data.pop(
            "comentario_respuesta",
            "",
        )

        datos_adicionales = {
            "responsable": self.request.user,
        }

        if estado_nuevo in [
            SolicitudDocumento.Estado.APROBADA,
            SolicitudDocumento.Estado.RECHAZADA,
        ]:
            datos_adicionales["fecha_resolucion"] = timezone.now()

        solicitud_actualizada = serializer.save(
            **datos_adicionales,
        )

        if estado_anterior != estado_nuevo or comentario.strip():
            HistorialSolicitudDocumento.objects.create(
                solicitud=solicitud_actualizada,
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                usuario_responsable=self.request.user,
                comentario_respuesta=comentario.strip(),
            )


class SolicitudDocumentoArchivoVecinoCreateView(generics.CreateAPIView):
    serializer_class = SolicitudDocumentoArchivoUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        usuario = self.request.user

        tiene_rol_vecino = UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre="Vecino",
            activo=True,
        ).exists()

        if not tiene_rol_vecino:
            raise PermissionDenied("Debes tener el rol Vecino para adjuntar archivos.")

        solicitud = get_object_or_404(
            SolicitudDocumento,
            id=self.kwargs["solicitud_id"],
            vecino=usuario,
        )

        archivo = serializer.validated_data["archivo"]

        serializer.save(
            solicitud=solicitud,
            nombre_original=archivo.name,
            tipo_uso=SolicitudDocumentoArchivo.TipoUso.ADJUNTO,
            subido_por=usuario,
        )


class SolicitudDocumentoArchivoDirectivaCreateView(generics.CreateAPIView):
    serializer_class = SolicitudDocumentoArchivoUploadSerializer
    permission_classes = [EsDirectiva]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        juntas_ids = IntegranteDirectiva.objects.filter(
            usuario=self.request.user,
            activo=True,
            directiva__estado="VIGENTE",
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        solicitud = get_object_or_404(
            SolicitudDocumento,
            id=self.kwargs["solicitud_id"],
            junta_vecinos_id__in=juntas_ids,
            estado_actual=SolicitudDocumento.Estado.APROBADA,
        )

        archivo = serializer.validated_data["archivo"]

        serializer.save(
            solicitud=solicitud,
            nombre_original=archivo.name,
            tipo_uso=(SolicitudDocumentoArchivo.TipoUso.DOCUMENTO_EMITIDO),
            subido_por=self.request.user,
        )
class SolicitudDocumentoArchivoDownloadView(
    generics.GenericAPIView
):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        archivo = get_object_or_404(
            SolicitudDocumentoArchivo.objects.select_related(
                "solicitud",
                "solicitud__vecino",
                "solicitud__junta_vecinos",
            ),
            pk=pk,
        )

        es_propietario = (
            archivo.solicitud.vecino_id
            == request.user.id
        )

        tiene_rol_directiva = UsuarioRol.objects.filter(
            usuario=request.user,
            rol__nombre="Directiva",
            activo=True,
        ).exists()

        pertenece_directiva_junta = (
            IntegranteDirectiva.objects.filter(
                usuario=request.user,
                activo=True,
                directiva__estado="VIGENTE",
                directiva__junta_vecinos=(
                    archivo.solicitud.junta_vecinos
                ),
            ).exists()
        )

        puede_descargar = (
            es_propietario
            or (
                tiene_rol_directiva
                and pertenece_directiva_junta
            )
        )

        if not puede_descargar:
            raise PermissionDenied(
                "No tienes permiso para descargar este archivo."
            )

        archivo.archivo.open("rb")

        return FileResponse(
            archivo.archivo,
            as_attachment=True,
            filename=archivo.nombre_original,
        )