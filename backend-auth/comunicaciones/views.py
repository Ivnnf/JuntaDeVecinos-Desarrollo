from rest_framework import generics
from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)

from organizacion.models import Directiva
from django.db import transaction
from profiles.models import UsuarioRol

from django.shortcuts import get_object_or_404
from profiles.models import UsuarioRol
from django.db import transaction
from organizacion.models import (
    Directiva,
    IntegranteDirectiva,
)

from django.utils import timezone

from organizacion.permissions import EsDirectiva
from django.contrib.auth import get_user_model

from .models import (
    AdjuntoPublicacion,
    Conversacion,
    Mensaje,
    Notificacion,
    Publicacion,
)
from .serializers import (
    AdjuntoPublicacionSerializer,
    ConversacionSerializer,
    MensajeSerializer,
    NotificacionSerializer,
    PublicacionSerializer,
)

from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from rest_framework.response import Response
from .models import Conversacion, Mensaje, RolRemitente
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


class NotificacionListView(generics.ListAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Notificacion.objects.select_related(
                "publicacion",
                "publicacion__directiva",
                "publicacion__directiva__junta_vecinos",
            )
            .filter(
                usuario=self.request.user,
            )
            .order_by("-fecha_creacion")
        )


class NotificacionDetailView(generics.RetrieveUpdateAPIView):
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


class PublicacionDetalleVecinoView(generics.RetrieveAPIView):
    serializer_class = PublicacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user

        if (
            not getattr(usuario, "sector_id", None)
            or usuario.estado_asociacion_sector != "CONFIRMADA"
        ):
            return Publicacion.objects.none()

        junta_id = usuario.sector.junta_vecinos_id

        return (
            Publicacion.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "autor",
            )
            .prefetch_related(
                "adjuntos",
            )
            .filter(
                directiva__junta_vecinos_id=junta_id,
                activa=True,
            )
        )


class ConversacionVecinoListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversacion.objects.select_related(
                "vecino",
                "directiva",
                "directiva__junta_vecinos",
            )
            .prefetch_related(
                "mensajes",
                "mensajes__remitente",
            )
            .filter(
                vecino=self.request.user,
            )
            .order_by("-fecha_actualizacion")
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

        directiva = Directiva.objects.filter(
            junta_vecinos=usuario.sector.junta_vecinos,
            estado=Directiva.EstadoDirectiva.VIGENTE,
        ).first()

        if directiva is None:
            raise ValidationError(
                {
                    "directiva": (
                        "La Junta de Vecinos no tiene " "una directiva vigente."
                    )
                }
            )

        mensaje_inicial = serializer.validated_data.pop("mensaje_inicial")

        with transaction.atomic():
            conversacion = serializer.save(
                vecino=usuario,
                directiva=directiva,
            )

            Mensaje.objects.create(
                conversacion=conversacion,
                remitente=usuario,
                rol_remitente=RolRemitente.VECINO,
                contenido=mensaje_inicial,
            )


class ConversacionDirectivaListView(generics.ListAPIView):
    serializer_class = ConversacionSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        return (
            Conversacion.objects.select_related(
                "vecino",
                "directiva",
                "directiva__junta_vecinos",
            )
            .prefetch_related(
                "mensajes",
                "mensajes__remitente",
            )
            .filter(
                directiva__integrantes__usuario=self.request.user,
                directiva__integrantes__activo=True,
                directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
            )
            .distinct()
            .order_by("-fecha_actualizacion")
        )


class MensajeDirectivaCreateView(generics.CreateAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [EsDirectiva]

    def perform_create(self, serializer):
        conversacion = get_object_or_404(
            Conversacion.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
            ),
            pk=self.kwargs["conversacion_id"],
            activa=True,
        )

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=conversacion.directiva,
            usuario=self.request.user,
            activo=True,
            directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes responder esta conversación.")

        serializer.save(
            conversacion=conversacion,
            remitente=self.request.user,
            rol_remitente=RolRemitente.DIRECTIVA,
        )

        conversacion.save(
            update_fields=[
                "fecha_actualizacion",
            ]
        )


class MensajeVecinoCreateView(generics.CreateAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        conversacion = get_object_or_404(
            Conversacion,
            pk=self.kwargs["conversacion_id"],
            vecino=self.request.user,
            activa=True,
        )

        serializer.save(
            conversacion=conversacion,
            remitente=self.request.user,
            rol_remitente=RolRemitente.VECINO,
        )

        conversacion.save(
            update_fields=[
                "fecha_actualizacion",
            ]
        )


class ConversacionVecinoDetailView(generics.RetrieveAPIView):
    serializer_class = ConversacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversacion.objects.select_related(
                "vecino",
                "directiva",
                "directiva__junta_vecinos",
            )
            .prefetch_related(
                "mensajes",
                "mensajes__remitente",
            )
            .filter(
                vecino=self.request.user,
            )
        )

    def retrieve(self, request, *args, **kwargs):
        conversacion = self.get_object()

        mensajes_no_leidos = conversacion.mensajes.filter(
            leido=False,
            rol_remitente=RolRemitente.DIRECTIVA,
        )

        mensajes_no_leidos.update(
            leido=True,
            fecha_lectura=timezone.now(),
        )

        # Volver a obtener la conversación desde la BD
        # para que los mensajes ya vengan con leido=True.
        conversacion = self.get_queryset().get(
            pk=conversacion.pk,
        )

        serializer = self.get_serializer(conversacion)

        return Response(serializer.data)


class ConversacionDirectivaDetailView(generics.RetrieveAPIView):
    serializer_class = ConversacionSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        return (
            Conversacion.objects.select_related(
                "vecino",
                "directiva",
                "directiva__junta_vecinos",
            )
            .prefetch_related(
                "mensajes",
                "mensajes__remitente",
            )
            .filter(
                directiva__integrantes__usuario=self.request.user,
                directiva__integrantes__activo=True,
                directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
            )
            .distinct()
        )

    def retrieve(self, request, *args, **kwargs):
        conversacion = self.get_object()

        mensajes_no_leidos = conversacion.mensajes.filter(
            leido=False,
            rol_remitente=RolRemitente.VECINO,
        )

        mensajes_no_leidos.update(
            leido=True,
            fecha_lectura=timezone.now(),
        )

        return super().retrieve(
            request,
            *args,
            **kwargs,
        )


class ConversacionesVecinoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversaciones = (
            Conversacion.objects.filter(vecino=request.user)
            .select_related(
                "vecino",
                "directiva",
                "directiva__junta_vecinos",
            )
            .prefetch_related(
                "mensajes",
                "mensajes__remitente",
            )
            .order_by("-fecha_actualizacion")
        )

        serializer = ConversacionSerializer(conversaciones, many=True)
        return Response(serializer.data)

    def post(self, request):
        usuario = request.user

        # Debe tener rol Vecino activo
        tiene_rol_vecino = UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre__iexact="Vecino",
            activo=True,
        ).exists()

        if not tiene_rol_vecino:
            return Response(
                {"detail": "Solo un vecino puede iniciar una conversación."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Debe estar asociado a un sector
        if not usuario.sector_id:
            return Response(
                {"detail": "No tienes un sector asociado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # La asociación territorial debe estar confirmada
        if usuario.estado_asociacion_sector != "CONFIRMADA":
            return Response(
                {
                    "detail": (
                        "Tu asociación territorial debe estar confirmada "
                        "para comunicarte con la directiva."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        junta = usuario.sector.junta_vecinos

        # Buscar la directiva vigente de su junta
        directiva = (
            Directiva.objects.filter(
                junta_vecinos=junta,
                estado="VIGENTE",
            )
            .order_by("-fecha_inicio")
            .first()
        )

        if not directiva:
            return Response(
                {
                    "detail": (
                        "Actualmente tu junta de vecinos no tiene "
                        "una directiva vigente."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ConversacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asunto = serializer.validated_data["asunto"]
        mensaje_inicial = serializer.validated_data["mensaje_inicial"]

        with transaction.atomic():
            conversacion = Conversacion.objects.create(
                vecino=usuario,
                directiva=directiva,
                asunto=asunto,
            )

            Mensaje.objects.create(
                conversacion=conversacion,
                remitente=usuario,
                contenido=mensaje_inicial,
            )

        respuesta = ConversacionSerializer(conversacion)

        return Response(
            respuesta.data,
            status=status.HTTP_201_CREATED,
        )


class ConversacionDirectivaEstadoView(generics.GenericAPIView):
    serializer_class = ConversacionSerializer
    permission_classes = [EsDirectiva]

    def patch(self, request, *args, **kwargs):
        conversacion = get_object_or_404(
            Conversacion.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "cerrada_por",
            ).prefetch_related(
                "mensajes",
                "mensajes__remitente",
            ),
            pk=self.kwargs["pk"],
        )

        es_integrante_activo = IntegranteDirectiva.objects.filter(
            directiva=conversacion.directiva,
            usuario=request.user,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).exists()

        if not es_integrante_activo:
            raise PermissionDenied("No puedes modificar esta conversación.")

        activa = request.data.get("activa")

        if not isinstance(activa, bool):
            raise ValidationError(
                {
                    "activa": (
                        "Debes indicar true para reabrir "
                        "o false para cerrar la conversación."
                    )
                }
            )

        if activa:
            # Reabrir conversación
            conversacion.activa = True
            conversacion.fecha_cierre = None
            conversacion.cerrada_por = None
            conversacion.rol_cierre = None
        else:
            # Cerrar conversación
            conversacion.activa = False
            conversacion.fecha_cierre = timezone.now()
            conversacion.cerrada_por = request.user
            conversacion.rol_cierre = "DIRECTIVA"

        conversacion.save()

        serializer = self.get_serializer(conversacion)

        return Response(serializer.data)
