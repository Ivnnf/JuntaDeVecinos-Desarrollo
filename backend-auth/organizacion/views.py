from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
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
)

from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from profiles.models import Rol, UsuarioRol


def es_administrador(usuario):
    return usuario.roles_asignados.filter(
        rol__nombre__iexact="Administrador",
        activo=True,
    ).exists()


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
    permission_classes = [EsAdministrador]


class CargoDetailView(generics.RetrieveUpdateDestroyAPIView):
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


class DirectivaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Directiva.objects.select_related("junta_vecinos").all()

    serializer_class = DirectivaSerializer
    permission_classes = [EsAdministrador]


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

            return

        serializer.save()

    def test_revocar_integrante_cierra_historial_y_desactiva_rol(self):
        self.client.force_authenticate(user=self.admin)

        url_crear = reverse("integrantes-directiva-list-create")

        response_crear = self.client.post(
            url_crear,
            {
                "directiva": self.directiva.id,
                "usuario": self.vecino.id,
                "cargo": self.cargo_presidente.id,
                "fecha_inicio": "2026-01-01",
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response_crear.status_code,
            status.HTTP_201_CREATED,
        )

        integrante = IntegranteDirectiva.objects.get(
            directiva=self.directiva,
            usuario=self.vecino,
        )

        url_detalle = reverse(
            "integrantes-directiva-detail",
            kwargs={"pk": integrante.id},
        )

        response_revocar = self.client.patch(
            url_detalle,
            {
                "activo": False,
            },
            format="json",
        )

        self.assertEqual(
            response_revocar.status_code,
            status.HTTP_200_OK,
        )

        integrante.refresh_from_db()

        self.assertFalse(integrante.activo)
        self.assertIsNotNone(integrante.fecha_fin)

        rol_directiva = UsuarioRol.objects.get(
            usuario=self.vecino,
            rol=self.rol_directiva,
        )

        self.assertFalse(rol_directiva.activo)
