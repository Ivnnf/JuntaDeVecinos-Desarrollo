from django.shortcuts import render

# Create your views here.
import csv
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.http import HttpResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from .models import Directiva, IntegranteDirectiva

from .models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
    VerificacionResidencia,
)

from eventos.models import (
    AsistenciaEvento,
    Evento,
    InscripcionEvento,
)

from solicitudes.models import (
    SolicitudDocumento,
    SolicitudVecino,
)

from .permissions import (
    EsAdministrador,
    EsAdministradorODirectiva,
    EsDirectiva,
    EsVecino,
)

from .serializers import (
    AsociacionSectorPendienteSerializer,
    CargoSerializer,
    DirectivaSerializer,
    IntegranteDirectivaSerializer,
    JuntaVecinosSerializer,
    SectorSerializer,
    UsuarioElegibleDirectivaSerializer,
    ReasignarCargoDirectivaSerializer,
)

from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from profiles.models import (
    CaracterizacionComunitaria,
    HistorialGestionUsuario,
    Rol,
    UsuarioRol,
)


def es_administrador(usuario):
    return usuario.roles_asignados.filter(
        rol__nombre__iexact="Administrador",
        activo=True,
    ).exists()


def obtener_junta_directiva(usuario):
    integrante = (
        IntegranteDirectiva.objects.select_related(
            "directiva",
            "directiva__junta_vecinos",
        )
        .filter(
            usuario=usuario,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        )
        .first()
    )

    if integrante is None:
        return None

    return integrante.directiva.junta_vecinos


class JuntaVecinosListCreateView(generics.ListCreateAPIView):
    queryset = JuntaVecinos.objects.all().order_by("nombre")

    serializer_class = JuntaVecinosSerializer
    permission_classes = [EsAdministrador]


class JuntaVecinosDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JuntaVecinos.objects.all()
    serializer_class = JuntaVecinosSerializer
    permission_classes = [EsAdministrador]


class SectorListCreateView(generics.ListCreateAPIView):
    queryset = Sector.objects.select_related("junta_vecinos").all().order_by("nombre")

    serializer_class = SectorSerializer
    permission_classes = [EsAdministrador]


class JuntasDisponiblesRegistroView(generics.ListAPIView):
    serializer_class = JuntaVecinosSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return JuntaVecinos.objects.filter(activa=True).order_by("nombre")


class SectoresDisponiblesRegistroView(generics.ListAPIView):
    serializer_class = SectorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Sector.objects.select_related("junta_vecinos")
            .filter(
                activo=True,
                junta_vecinos__activa=True,
            )
            .order_by(
                "junta_vecinos__nombre",
                "nombre",
            )
        )


class SectorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sector.objects.select_related("junta_vecinos").all()

    serializer_class = SectorSerializer
    permission_classes = [EsAdministrador]


class SectoresDisponiblesView(generics.ListAPIView):
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Sector.objects.select_related("junta_vecinos")
            .filter(
                activo=True,
                junta_vecinos__activa=True,
            )
            .order_by(
                "junta_vecinos__nombre",
                "nombre",
            )
        )


class SolicitarAsociacionSectorView(generics.GenericAPIView):
    permission_classes = [EsVecino]

    def post(self, request):
        sector_id = request.data.get("sector_id")

        if not sector_id:
            return Response(
                {"detail": ("Debe indicar un sector.")},
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
                {"detail": ("El sector seleccionado no está disponible.")},
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
                "message": ("Solicitud de asociación enviada correctamente."),
                "sector": {
                    "id": sector.id,
                    "nombre": sector.nombre,
                    "junta": sector.junta_vecinos.nombre,
                },
                "estado": usuario.estado_asociacion_sector,
            },
            status=status.HTTP_200_OK,
        )


class AsociacionesSectorPendientesView(generics.ListAPIView):
    serializer_class = AsociacionSectorPendienteSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        Usuario = get_user_model()

        return (
            Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            )
            .filter(
                sector__isnull=False,
                estado_asociacion_sector="PENDIENTE",
            )
            .order_by(
                "nombres",
                "apellido_paterno",
            )
        )

class AsociacionesSectorTodasView(generics.ListAPIView):
    serializer_class = AsociacionSectorPendienteSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        Usuario = get_user_model()

        return (
            Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            )
            .prefetch_related(
                "verificaciones_residencia",
            )
            .filter(
                sector__isnull=False,
            )
            .order_by(
                "nombres",
                "apellido_paterno",
            )
        )
    
class AsociacionesSectorPendientesDirectivaView(generics.ListAPIView):
    serializer_class = AsociacionSectorPendienteSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        Usuario = get_user_model()

        juntas_directiva = IntegranteDirectiva.objects.filter(
            usuario=self.request.user,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        return (
            Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            )
            .filter(
                sector__isnull=False,
                estado_asociacion_sector="PENDIENTE",
                sector__junta_vecinos_id__in=juntas_directiva,
            )
            .order_by(
                "nombres",
                "apellido_paterno",
            )
        )
class AsociacionesSectorTodasDirectivaView(generics.ListAPIView):
    serializer_class = AsociacionSectorPendienteSerializer
    permission_classes = [EsDirectiva]

    def get_queryset(self):
        Usuario = get_user_model()

        juntas_directiva = IntegranteDirectiva.objects.filter(
            usuario=self.request.user,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        return (
            Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            )
            .prefetch_related(
                "verificaciones_residencia",
            )
            .filter(
                sector__isnull=False,
                sector__junta_vecinos_id__in=juntas_directiva,
            )
            .order_by(
                "nombres",
                "apellido_paterno",
            )
        )

class ResolverAsociacionSectorDirectivaView(generics.GenericAPIView):
    permission_classes = [EsDirectiva]

    def post(self, request, usuario_id):
        Usuario = get_user_model()

        juntas_directiva = IntegranteDirectiva.objects.filter(
            usuario=request.user,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        try:
            usuario = Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            ).get(
                id=usuario_id,
                sector__isnull=False,
                estado_asociacion_sector="PENDIENTE",
                sector__junta_vecinos_id__in=juntas_directiva,
            )
        except Usuario.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "No existe una asociación pendiente "
                        "que puedas gestionar para este usuario."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        accion = request.data.get("accion", "").upper()

        if accion == "CONFIRMAR":
            verificacion = usuario.verificaciones_residencia.all().first()

            if verificacion is None:
                return Response(
                    {
                        "detail": (
                            "No es posible confirmar esta asociación "
                            "porque el usuario no tiene una verificación "
                            "de residencia registrada."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            estados_permitidos = {
                VerificacionResidencia.Estado.VALIDADA,
            }

            if verificacion.estado not in estados_permitidos:
                return Response(
                    {
                        "detail": (
                            "No es posible confirmar esta asociación "
                            "porque la verificación de residencia "
                            f"se encuentra en estado {verificacion.estado}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            usuario.estado_asociacion_sector = "CONFIRMADA"
            usuario.confirmado_por_usuario = request.user
            usuario.fecha_confirmacion_sector = timezone.now()

        elif accion == "RECHAZAR":
            usuario.estado_asociacion_sector = "RECHAZADA"
            usuario.confirmado_por_usuario = None
            usuario.fecha_confirmacion_sector = None

        else:
            return Response(
                {"detail": ("La acción debe ser CONFIRMAR o RECHAZAR.")},
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
                "message": ("Asociación territorial actualizada correctamente."),
                "usuario_id": usuario.id,
                "sector_id": usuario.sector_id,
                "estado": usuario.estado_asociacion_sector,
            },
            status=status.HTTP_200_OK,
        )


class ResolverVerificacionResidenciaDirectivaView(generics.GenericAPIView):
    permission_classes = [EsDirectiva]

    def post(self, request, verificacion_id):
        juntas_directiva = IntegranteDirectiva.objects.filter(
            usuario=request.user,
            activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        try:
            verificacion = VerificacionResidencia.objects.select_related(
                "usuario",
                "sector",
                "sector__junta_vecinos",
            ).get(
                id=verificacion_id,
                sector__junta_vecinos_id__in=juntas_directiva,
            )
        except VerificacionResidencia.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "No existe una verificación de residencia "
                        "que puedas gestionar."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        accion = request.data.get(
            "accion",
            "",
        ).upper()

        if accion == "REVISION_MANUAL":
            verificacion.estado = VerificacionResidencia.Estado.REVISION_MANUAL

        elif accion == "VALIDAR":
            verificacion.estado = VerificacionResidencia.Estado.VALIDADA

        else:
            return Response(
                {"detail": ("La acción debe ser " "REVISION_MANUAL o VALIDAR.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verificacion.revisado_por = request.user
        verificacion.fecha_revision = timezone.now()

        verificacion.save(
            update_fields=[
                "estado",
                "revisado_por",
                "fecha_revision",
                "fecha_actualizacion",
            ]
        )

        return Response(
            {
                "message": ("Verificación de residencia " "actualizada correctamente."),
                "verificacion_id": verificacion.id,
                "estado": verificacion.estado,
            },
            status=status.HTTP_200_OK,
        )


class ResolverAsociacionSectorView(generics.GenericAPIView):
    permission_classes = [EsAdministrador]

    def post(self, request, usuario_id):
        Usuario = get_user_model()

        try:
            usuario = Usuario.objects.select_related("sector").get(
                id=usuario_id,
                sector__isnull=False,
                estado_asociacion_sector="PENDIENTE",
            )
        except Usuario.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "No existe una asociación pendiente " "para este usuario."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        accion = request.data.get(
            "accion",
            "",
        ).upper()

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
                {"detail": ("La acción debe ser CONFIRMAR o RECHAZAR.")},
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
                "message": ("Asociación territorial actualizada correctamente."),
                "usuario_id": usuario.id,
                "sector_id": usuario.sector_id,
                "estado": usuario.estado_asociacion_sector,
            },
            status=status.HTTP_200_OK,
        )


class CargoListCreateView(generics.ListCreateAPIView):
    queryset = Cargo.objects.all().order_by("nombre")
    serializer_class = CargoSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [
                EsAdministradorODirectiva,
            ]
        else:
            permission_classes = [
                EsAdministrador,
            ]

        return [permission() for permission in permission_classes]


class CargoDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [EsAdministrador]


class DirectivaListCreateView(generics.ListCreateAPIView):
    queryset = (
        Directiva.objects.select_related("junta_vecinos")
        .all()
        .order_by("-fecha_inicio")
    )

    serializer_class = DirectivaSerializer
    permission_classes = [EsAdministrador]


class DirectivaDetailView(generics.RetrieveUpdateAPIView):
    queryset = Directiva.objects.select_related("junta_vecinos").all()

    serializer_class = DirectivaSerializer
    permission_classes = [EsAdministrador]

    def perform_update(self, serializer):
        directiva = self.get_object()

        nuevo_estado = serializer.validated_data.get(
            "estado",
            directiva.estado,
        )

        if (
            directiva.estado == Directiva.EstadoDirectiva.VIGENTE
            and nuevo_estado == Directiva.EstadoDirectiva.FINALIZADA
        ):
            fecha_fin = serializer.validated_data.get(
                "fecha_fin",
                timezone.localdate(),
            )

            with transaction.atomic():
                directiva_actualizada = serializer.save(
                    fecha_fin=fecha_fin,
                )

                integrantes_activos = IntegranteDirectiva.objects.select_related(
                    "usuario",
                    "cargo",
                ).filter(
                    directiva=directiva_actualizada,
                    activo=True,
                )

                for integrante in integrantes_activos:
                    integrante.activo = False
                    integrante.fecha_fin = fecha_fin
                    integrante.save(
                        update_fields=[
                            "activo",
                            "fecha_fin",
                        ]
                    )

                    tiene_otra_asignacion_activa = IntegranteDirectiva.objects.filter(
                        usuario=integrante.usuario,
                        activo=True,
                    ).exists()

                    if not tiene_otra_asignacion_activa:
                        UsuarioRol.objects.filter(
                            usuario=integrante.usuario,
                            rol__nombre__iexact="Directiva",
                            activo=True,
                        ).update(
                            activo=False,
                        )

                    HistorialGestionUsuario.objects.create(
                        usuario_objetivo=integrante.usuario,
                        realizado_por=self.request.user,
                        tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
                        valor_anterior=integrante.cargo.nombre,
                        valor_nuevo="SIN_CARGO_ACTIVO",
                        detalle=(
                            "Cargo finalizado por cierre de la "
                            f"directiva {directiva_actualizada.id}."
                        ),
                    )

            return

        serializer.save()


class DirectivaVigenteJuntaView(generics.GenericAPIView):
    permission_classes = [EsAdministradorODirectiva]

    def get(self, request, junta_id):
        directiva = (
            Directiva.objects.select_related("junta_vecinos")
            .filter(
                junta_vecinos_id=junta_id,
                estado=Directiva.EstadoDirectiva.VIGENTE,
            )
            .order_by("-fecha_inicio")
            .first()
        )

        if directiva is None:
            return Response(
                {"detail": ("La junta indicada no tiene " "una directiva vigente.")},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not es_administrador(request.user):
            autorizado = IntegranteDirectiva.objects.filter(
                directiva=directiva,
                usuario=request.user,
                activo=True,
            ).exists()

            if not autorizado:
                raise PermissionDenied("No puede consultar la directiva de otra junta.")

        integrantes = (
            IntegranteDirectiva.objects.select_related(
                "usuario",
                "usuario__sector",
                "cargo",
                "directiva",
                "directiva__junta_vecinos",
            )
            .filter(
                directiva=directiva,
                activo=True,
            )
        )

        if not es_administrador(request.user):
            if request.user.sector_id is None:
                raise PermissionDenied(
                    "El usuario no tiene un sector asociado."
                )

            integrantes = integrantes.filter(
                usuario__sector_id=request.user.sector_id,
            )

        integrantes = integrantes.order_by(
            "cargo__nombre",
            "usuario__apellido_paterno",
            "usuario__nombres",
        )

        return Response(
            {
                "directiva": DirectivaSerializer(directiva).data,
                "integrantes": IntegranteDirectivaSerializer(
                    integrantes,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class UsuariosElegiblesDirectivaView(generics.ListAPIView):
    serializer_class = UsuarioElegibleDirectivaSerializer
    permission_classes = [EsAdministradorODirectiva]

    def get_queryset(self):
        Usuario = get_user_model()

        directiva_id = self.kwargs["directiva_id"]

        directiva = Directiva.objects.select_related("junta_vecinos").get(
            id=directiva_id,
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        if not es_administrador(self.request.user):
            autorizado = IntegranteDirectiva.objects.filter(
                directiva=directiva,
                usuario=self.request.user,
                activo=True,
            ).exists()

            if not autorizado:
                raise PermissionDenied("No puede consultar usuarios de otra directiva.")

        usuarios_con_cargo_activo = IntegranteDirectiva.objects.filter(
            directiva=directiva,
            activo=True,
        ).values_list(
            "usuario_id",
            flat=True,
        )

        return (
            Usuario.objects.select_related(
                "sector",
                "sector__junta_vecinos",
            )
            .filter(
                sector__junta_vecinos=directiva.junta_vecinos,
                estado_asociacion_sector="CONFIRMADA",
                is_active=True,
            )
            .exclude(
                id__in=usuarios_con_cargo_activo,
            )
            .order_by(
                "nombres",
                "apellido_paterno",
            )
        )


class IntegranteDirectivaListCreateView(generics.ListCreateAPIView):
    serializer_class = IntegranteDirectivaSerializer
    permission_classes = [EsAdministradorODirectiva]

    def get_queryset(self):
        queryset = (
            IntegranteDirectiva.objects.select_related(
                "directiva",
                "directiva__junta_vecinos",
                "usuario",
                "cargo",
            )
            .all()
            .order_by(
                "directiva_id",
                "cargo__nombre",
            )
        )

        if es_administrador(self.request.user):
            return queryset

        return queryset.filter(
            directiva__integrantes__usuario=self.request.user,
            directiva__integrantes__activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).distinct()

    def perform_create(self, serializer):
        directiva = serializer.validated_data["directiva"]

        if not es_administrador(self.request.user):
            autorizado = IntegranteDirectiva.objects.filter(
                directiva=directiva,
                usuario=self.request.user,
                activo=True,
                directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
            ).exists()

            if not autorizado:
                raise PermissionDenied(
                    "No puede gestionar integrantes de otra directiva."
                )

        integrante = serializer.save()

        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        UsuarioRol.objects.update_or_create(
            usuario=integrante.usuario,
            rol=rol_directiva,
            defaults={
                "activo": True,
            },
        )
        HistorialGestionUsuario.objects.create(
            usuario_objetivo=integrante.usuario,
            realizado_por=self.request.user,
            tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
            valor_anterior="SIN_CARGO_ACTIVO",
            valor_nuevo=integrante.cargo.nombre,
            detalle=(
                f"Asignación de cargo en directiva " f"{integrante.directiva_id}."
            ),
        )


class IntegranteDirectivaDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = IntegranteDirectivaSerializer
    permission_classes = [EsAdministradorODirectiva]

    def get_queryset(self):
        queryset = IntegranteDirectiva.objects.select_related(
            "directiva",
            "directiva__junta_vecinos",
            "usuario",
            "cargo",
        ).all()

        if es_administrador(self.request.user):
            return queryset

        return queryset.filter(
            directiva__integrantes__usuario=self.request.user,
            directiva__integrantes__activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).distinct()

    def perform_update(self, serializer):
        integrante = self.get_object()

        nuevo_activo = serializer.validated_data.get(
            "activo",
            integrante.activo,
        )

        if integrante.activo and not nuevo_activo:
            integrante_actualizado = serializer.save(
                fecha_fin=timezone.localdate(),
            )

            tiene_otra_asignacion_activa = IntegranteDirectiva.objects.filter(
                usuario=integrante_actualizado.usuario,
                activo=True,
            ).exists()

            if not tiene_otra_asignacion_activa:
                UsuarioRol.objects.filter(
                    usuario=integrante_actualizado.usuario,
                    rol__nombre__iexact="Directiva",
                    activo=True,
                ).update(
                    activo=False,
                )
            HistorialGestionUsuario.objects.create(
                usuario_objetivo=integrante_actualizado.usuario,
                realizado_por=self.request.user,
                tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
                valor_anterior=integrante_actualizado.cargo.nombre,
                valor_nuevo="SIN_CARGO_ACTIVO",
                detalle=(
                    f"Revocación de cargo en directiva "
                    f"{integrante_actualizado.directiva_id}."
                ),
            )
            return

        serializer.save()


class ReasignarCargoDirectivaView(generics.GenericAPIView):
    permission_classes = [EsAdministradorODirectiva]
    serializer_class = ReasignarCargoDirectivaSerializer

    def get_queryset(self):
        queryset = IntegranteDirectiva.objects.select_related(
            "directiva",
            "directiva__junta_vecinos",
            "usuario",
            "cargo",
        ).all()

        if es_administrador(self.request.user):
            return queryset

        return queryset.filter(
            directiva__integrantes__usuario=self.request.user,
            directiva__integrantes__activo=True,
            directiva__estado=Directiva.EstadoDirectiva.VIGENTE,
        ).distinct()

    def post(self, request, pk):
        integrante = self.get_object()

        if not integrante.activo:
            return Response(
                {
                    "detail": (
                        "Solo se puede reasignar un cargo " "que se encuentre activo."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nuevo_cargo = serializer.validated_data["cargo"]

        fecha_inicio = serializer.validated_data.get(
            "fecha_inicio",
            timezone.localdate(),
        )

        if nuevo_cargo.id == integrante.cargo_id:
            return Response(
                {"detail": ("El nuevo cargo debe ser distinto " "al cargo actual.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if fecha_inicio < integrante.fecha_inicio:
            return Response(
                {
                    "detail": (
                        "La fecha de inicio del nuevo cargo "
                        "no puede ser anterior a la asignación actual."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cargo_anterior = integrante.cargo.nombre

        with transaction.atomic():
            integrante.activo = False
            integrante.fecha_fin = fecha_inicio

            integrante.save(
                update_fields=[
                    "activo",
                    "fecha_fin",
                ]
            )

            nuevo_integrante_serializer = IntegranteDirectivaSerializer(
                data={
                    "directiva": integrante.directiva_id,
                    "usuario": integrante.usuario_id,
                    "cargo": nuevo_cargo.id,
                    "fecha_inicio": fecha_inicio,
                    "activo": True,
                }
            )

            nuevo_integrante_serializer.is_valid(raise_exception=True)

            nuevo_integrante = nuevo_integrante_serializer.save()

            HistorialGestionUsuario.objects.create(
                usuario_objetivo=integrante.usuario,
                realizado_por=request.user,
                tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
                valor_anterior=cargo_anterior,
                valor_nuevo=nuevo_cargo.nombre,
                detalle=(
                    f"Reasignación de cargo en directiva " f"{integrante.directiva_id}."
                ),
            )

        return Response(
            IntegranteDirectivaSerializer(nuevo_integrante).data,
            status=status.HTTP_201_CREATED,
        )


class DashboardDirectivaView(generics.GenericAPIView):
    permission_classes = [EsDirectiva]

    MINIMO_CARACTERIZACIONES = 3

    def get(self, request):
        junta = obtener_junta_directiva(request.user)

        if junta is None:
            raise PermissionDenied(
                "No existe una directiva vigente asociada al usuario."
            )
        fecha_desde_param = request.query_params.get("fecha_desde")
        fecha_hasta_param = request.query_params.get("fecha_hasta")

        try:
            fecha_desde = parse_date(fecha_desde_param) if fecha_desde_param else None
        except ValueError:
            fecha_desde = None

        try:
            fecha_hasta = parse_date(fecha_hasta_param) if fecha_hasta_param else None
        except ValueError:
            fecha_hasta = None

        if fecha_desde_param and fecha_desde is None:
            return Response(
                {
                    "detail": (
                        "La fecha_desde debe tener formato YYYY-MM-DD "
                        "y ser una fecha válida."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if fecha_hasta_param and fecha_hasta is None:
            return Response(
                {
                    "detail": (
                        "La fecha_hasta debe tener formato YYYY-MM-DD "
                        "y ser una fecha válida."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        fecha_desde = parse_date(fecha_desde_param) if fecha_desde_param else None

        fecha_hasta = parse_date(fecha_hasta_param) if fecha_hasta_param else None

        if fecha_desde_param and fecha_desde is None:
            return Response(
                {"detail": ("La fecha_desde debe tener formato YYYY-MM-DD.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if fecha_hasta_param and fecha_hasta is None:
            return Response(
                {"detail": ("La fecha_hasta debe tener formato YYYY-MM-DD.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            fecha_desde is not None
            and fecha_hasta is not None
            and fecha_desde > fecha_hasta
        ):
            return Response(
                {
                    "detail": (
                        "La fecha_desde no puede ser posterior " "a la fecha_hasta."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        Usuario = get_user_model()

        vecinos_confirmados = (
            Usuario.objects.filter(
                is_active=True,
                sector__junta_vecinos=junta,
                estado_asociacion_sector="CONFIRMADA",
                roles_asignados__rol__nombre__iexact="Vecino",
                roles_asignados__activo=True,
            )
            .distinct()
            .count()
        )

        solicitudes = SolicitudVecino.objects.filter(
            junta_vecinos=junta,
        )
        if fecha_desde is not None:
            solicitudes = solicitudes.filter(
                fecha_creacion__date__gte=fecha_desde,
            )

        if fecha_hasta is not None:
            solicitudes = solicitudes.filter(
                fecha_creacion__date__lte=fecha_hasta,
            )
        resumen_solicitudes = solicitudes.aggregate(
            total=Count("id"),
            consultas=Count(
                "id",
                filter=Q(
                    tipo=SolicitudVecino.Tipo.CONSULTA,
                ),
            ),
            reclamos=Count(
                "id",
                filter=Q(
                    tipo=SolicitudVecino.Tipo.RECLAMO,
                ),
            ),
            solicitudes=Count(
                "id",
                filter=Q(
                    tipo=SolicitudVecino.Tipo.SOLICITUD,
                ),
            ),
            pendientes=Count(
                "id",
                filter=Q(
                    estado=SolicitudVecino.Estado.PENDIENTE,
                ),
            ),
            en_proceso=Count(
                "id",
                filter=Q(
                    estado=SolicitudVecino.Estado.EN_PROCESO,
                ),
            ),
            respondidas=Count(
                "id",
                filter=Q(
                    estado=SolicitudVecino.Estado.RESPONDIDA,
                ),
            ),
            cerradas=Count(
                "id",
                filter=Q(
                    estado=SolicitudVecino.Estado.CERRADA,
                ),
            ),
        )

        solicitudes_documentos = SolicitudDocumento.objects.filter(
            junta_vecinos=junta,
        )

        if fecha_desde is not None:
            solicitudes_documentos = solicitudes_documentos.filter(
                fecha_solicitud__date__gte=fecha_desde,
            )

        if fecha_hasta is not None:
            solicitudes_documentos = solicitudes_documentos.filter(
                fecha_solicitud__date__lte=fecha_hasta,
            )

        resumen_documentos = solicitudes_documentos.aggregate(
            total=Count("id"),
            pendientes=Count(
                "id",
                filter=Q(
                    estado_actual=SolicitudDocumento.Estado.PENDIENTE,
                ),
            ),
            en_revision=Count(
                "id",
                filter=Q(
                    estado_actual=SolicitudDocumento.Estado.EN_REVISION,
                ),
            ),
            aprobadas=Count(
                "id",
                filter=Q(
                    estado_actual=SolicitudDocumento.Estado.APROBADA,
                ),
            ),
            rechazadas=Count(
                "id",
                filter=Q(
                    estado_actual=SolicitudDocumento.Estado.RECHAZADA,
                ),
            ),
        )

        eventos = Evento.objects.filter(
            directiva__junta_vecinos=junta,
        )

        if fecha_desde is not None:
            eventos = eventos.filter(
                fecha_inicio__date__gte=fecha_desde,
            )

        if fecha_hasta is not None:
            eventos = eventos.filter(
                fecha_inicio__date__lte=fecha_hasta,
            )

        resumen_eventos = eventos.aggregate(
            total=Count("id"),
            programados=Count(
                "id",
                filter=Q(
                    estado=Evento.Estado.PROGRAMADO,
                ),
            ),
            finalizados=Count(
                "id",
                filter=Q(
                    estado=Evento.Estado.FINALIZADO,
                ),
            ),
            cancelados=Count(
                "id",
                filter=Q(
                    estado=Evento.Estado.CANCELADO,
                ),
            ),
        )

        inscripciones_activas = InscripcionEvento.objects.filter(
            evento__in=eventos,
            estado=InscripcionEvento.Estado.INSCRITO,
        ).count()

        inscripciones_eventos_finalizados = InscripcionEvento.objects.filter(
            evento__in=eventos,
            evento__estado=Evento.Estado.FINALIZADO,
            estado=InscripcionEvento.Estado.INSCRITO,
        ).count()

        asistencias = AsistenciaEvento.objects.filter(
            inscripcion__evento__in=eventos,
            inscripcion__evento__estado=Evento.Estado.FINALIZADO,
            inscripcion__estado=InscripcionEvento.Estado.INSCRITO,
        )

        presentes = asistencias.filter(
            estado=AsistenciaEvento.Estado.PRESENTE,
        ).count()

        ausentes = asistencias.filter(
            estado=AsistenciaEvento.Estado.AUSENTE,
        ).count()

        asistencias_registradas = presentes + ausentes

        porcentaje_asistencia = (
            round(
                (presentes / asistencias_registradas) * 100,
                2,
            )
            if asistencias_registradas > 0
            else 0
        )

        total_caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__junta_vecinos=junta,
            usuario__estado_asociacion_sector="CONFIRMADA",
        ).count()

        return Response(
            {
                "junta": {
                    "id": junta.id,
                    "nombre": junta.nombre,
                },
                "periodo": {
                    "fecha_desde": (
                        fecha_desde.isoformat() if fecha_desde is not None else None
                    ),
                    "fecha_hasta": (
                        fecha_hasta.isoformat() if fecha_hasta is not None else None
                    ),
                },
                "resumen": {
                    "vecinos_confirmados": vecinos_confirmados,
                    "solicitudes_vecinales": resumen_solicitudes["total"],
                    "solicitudes_documentos": resumen_documentos["total"],
                    "eventos": resumen_eventos["total"],
                    "caracterizaciones": total_caracterizaciones,
                },
                "solicitudes": resumen_solicitudes,
                "documentos": resumen_documentos,
                "eventos": resumen_eventos,
                "participacion": {
                    "inscripciones_activas": inscripciones_activas,
                    "inscripciones_eventos_finalizados": (
                        inscripciones_eventos_finalizados
                    ),
                    "presentes": presentes,
                    "ausentes": ausentes,
                    "sin_registro_asistencia": max(
                        inscripciones_eventos_finalizados - asistencias_registradas,
                        0,
                    ),
                    "porcentaje_asistencia": porcentaje_asistencia,
                },
                "caracterizacion": {
                    "total": total_caracterizaciones,
                    "minimo_requerido": self.MINIMO_CARACTERIZACIONES,
                    "datos_disponibles": (
                        total_caracterizaciones >= self.MINIMO_CARACTERIZACIONES
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )
class ExportarDashboardDirectivaCSVView(generics.GenericAPIView):
    permission_classes = [EsDirectiva]

    def get(self, request):
        dashboard_response = DashboardDirectivaView().get(
            request,
        )

        if dashboard_response.status_code != status.HTTP_200_OK:
            return dashboard_response

        datos = dashboard_response.data

        response = HttpResponse(
            content_type="text/csv; charset=utf-8",
        )

        response["Content-Disposition"] = (
            'attachment; filename="reporte_directiva.csv"'
        )

        response.write("\ufeff")

        writer = csv.writer(response)

        writer.writerow(
            [
                "Reporte agregado de Directiva",
            ]
        )

        writer.writerow(
            [
                "Junta de Vecinos",
                datos["junta"]["nombre"],
            ]
        )

        writer.writerow(
            [
                "Fecha desde",
                datos["periodo"]["fecha_desde"] or "Sin filtro",
            ]
        )

        writer.writerow(
            [
                "Fecha hasta",
                datos["periodo"]["fecha_hasta"] or "Sin filtro",
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "RESUMEN GENERAL",
            ]
        )

        writer.writerow(
            [
                "Indicador",
                "Valor",
            ]
        )

        writer.writerow(
            [
                "Vecinos confirmados",
                datos["resumen"]["vecinos_confirmados"],
            ]
        )

        writer.writerow(
            [
                "Solicitudes vecinales",
                datos["resumen"]["solicitudes_vecinales"],
            ]
        )

        writer.writerow(
            [
                "Solicitudes de documentos",
                datos["resumen"]["solicitudes_documentos"],
            ]
        )

        writer.writerow(
            [
                "Eventos",
                datos["resumen"]["eventos"],
            ]
        )

        writer.writerow(
            [
                "Caracterizaciones",
                datos["resumen"]["caracterizaciones"],
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "SOLICITUDES VECINALES",
            ]
        )

        writer.writerow(
            [
                "Total",
                datos["solicitudes"]["total"],
            ]
        )

        writer.writerow(
            [
                "Consultas",
                datos["solicitudes"]["consultas"],
            ]
        )

        writer.writerow(
            [
                "Reclamos",
                datos["solicitudes"]["reclamos"],
            ]
        )

        writer.writerow(
            [
                "Solicitudes",
                datos["solicitudes"]["solicitudes"],
            ]
        )

        writer.writerow(
            [
                "Pendientes",
                datos["solicitudes"]["pendientes"],
            ]
        )

        writer.writerow(
            [
                "En proceso",
                datos["solicitudes"]["en_proceso"],
            ]
        )

        writer.writerow(
            [
                "Respondidas",
                datos["solicitudes"]["respondidas"],
            ]
        )

        writer.writerow(
            [
                "Cerradas",
                datos["solicitudes"]["cerradas"],
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "SOLICITUDES DE DOCUMENTOS",
            ]
        )

        writer.writerow(
            [
                "Total",
                datos["documentos"]["total"],
            ]
        )

        writer.writerow(
            [
                "Pendientes",
                datos["documentos"]["pendientes"],
            ]
        )

        writer.writerow(
            [
                "En revisión",
                datos["documentos"]["en_revision"],
            ]
        )

        writer.writerow(
            [
                "Aprobadas",
                datos["documentos"]["aprobadas"],
            ]
        )

        writer.writerow(
            [
                "Rechazadas",
                datos["documentos"]["rechazadas"],
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "EVENTOS",
            ]
        )

        writer.writerow(
            [
                "Total",
                datos["eventos"]["total"],
            ]
        )

        writer.writerow(
            [
                "Programados",
                datos["eventos"]["programados"],
            ]
        )

        writer.writerow(
            [
                "Finalizados",
                datos["eventos"]["finalizados"],
            ]
        )

        writer.writerow(
            [
                "Cancelados",
                datos["eventos"]["cancelados"],
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "PARTICIPACIÓN",
            ]
        )

        writer.writerow(
            [
                "Inscripciones activas",
                datos["participacion"]["inscripciones_activas"],
            ]
        )

        writer.writerow(
            [
                "Inscripciones en eventos finalizados",
                datos["participacion"][
                    "inscripciones_eventos_finalizados"
                ],
            ]
        )

        writer.writerow(
            [
                "Presentes",
                datos["participacion"]["presentes"],
            ]
        )

        writer.writerow(
            [
                "Ausentes",
                datos["participacion"]["ausentes"],
            ]
        )

        writer.writerow(
            [
                "Sin registro de asistencia",
                datos["participacion"][
                    "sin_registro_asistencia"
                ],
            ]
        )

        writer.writerow(
            [
                "Porcentaje de asistencia",
                f'{datos["participacion"]["porcentaje_asistencia"]}%',
            ]
        )

        writer.writerow([])

        writer.writerow(
            [
                "CARACTERIZACIÓN COMUNITARIA",
            ]
        )

        writer.writerow(
            [
                "Total de caracterizaciones",
                datos["caracterizacion"]["total"],
            ]
        )

        writer.writerow(
            [
                "Mínimo requerido",
                datos["caracterizacion"]["minimo_requerido"],
            ]
        )

        writer.writerow(
            [
                "Datos disponibles",
                (
                    "Sí"
                    if datos["caracterizacion"]["datos_disponibles"]
                    else "No"
                ),
            ]
        )

        return response