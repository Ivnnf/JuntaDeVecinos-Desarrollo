from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from .services.validacion_residencia import (
    extraer_datos_personales,
    extraer_fecha_emision,
    validar_antiguedad_documento,
    analizar_documento_residencia,
    validar_coincidencia_comuna,
    determinar_estado_verificacion,
)

from unittest.mock import patch

from profiles.models import (
    HistorialGestionUsuario,
    Rol,
    UsuarioRol,
)

from .models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
    VerificacionResidencia,
)

Usuario = get_user_model()


class AsociacionSectorTests(APITestCase):

    def setUp(self):
        self.rol_vecino, _ = Rol.objects.get_or_create(nombre="Vecino")

        self.rol_admin, _ = Rol.objects.get_or_create(nombre="Administrador")

        self.admin = Usuario.objects.create_user(
            username="admin_test",
            email="admin@test.cl",
            password="ClaveSegura123!",
        )

        UsuarioRol.objects.create(
            usuario=self.admin,
            rol=self.rol_admin,
            activo=True,
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_test",
            email="vecino@test.cl",
            password="ClaveSegura123!",
            rut="11111111-1",
            nombres="Vecino",
            apellido_paterno="Prueba",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Test",
            comuna="Puente Alto",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Test",
            activo=True,
        )

    def test_vecino_puede_solicitar_asociacion_sector(self):
        self.client.force_authenticate(user=self.vecino)

        url = reverse("solicitar-asociacion-sector")

        response = self.client.post(
            url,
            {
                "sector_id": self.sector.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.sector,
            self.sector,
        )

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "PENDIENTE",
        )

    def test_admin_puede_ver_asociaciones_pendientes(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse("asociaciones-sector-pendientes")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["username"],
            self.vecino.username,
        )

        self.assertEqual(
            response.data[0]["sector_id"],
            self.sector.id,
        )

        self.assertEqual(
            response.data[0]["estado_asociacion_sector"],
            "PENDIENTE",
        )

    def test_admin_puede_confirmar_asociacion_pendiente(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        VerificacionResidencia.objects.create(
            usuario=self.vecino,
            sector=self.sector,
            tipo_documento=VerificacionResidencia.TipoDocumento.INTERNET,
            archivo="verificaciones_residencia/prueba.pdf",
            estado=VerificacionResidencia.Estado.VALIDADA,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "resolver-asociacion-sector",
            kwargs={
                "usuario_id": self.vecino.id,
            },
        )

        response = self.client.post(
            url,
            {
                "accion": "CONFIRMAR",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "CONFIRMADA",
        )

        self.assertEqual(
            self.vecino.confirmado_por_usuario,
            self.admin,
        )

        self.assertIsNotNone(self.vecino.fecha_confirmacion_sector)

    def test_admin_no_puede_confirmar_con_verificacion_de_otro_sector(self):
        otro_sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Otro Sector Test",
            activo=True,
        )

        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        VerificacionResidencia.objects.create(
            usuario=self.vecino,
            sector=otro_sector,
            tipo_documento=VerificacionResidencia.TipoDocumento.INTERNET,
            archivo="verificaciones_residencia/otro_sector.pdf",
            estado=VerificacionResidencia.Estado.VALIDADA,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "resolver-asociacion-sector",
            kwargs={
                "usuario_id": self.vecino.id,
            },
        )

        response = self.client.post(
            url,
            {
                "accion": "CONFIRMAR",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "PENDIENTE",
        )

    def test_admin_no_puede_confirmar_sin_verificacion_residencia(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "resolver-asociacion-sector",
            kwargs={
                "usuario_id": self.vecino.id,
            },
        )

        response = self.client.post(
            url,
            {
                "accion": "CONFIRMAR",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "PENDIENTE",
        )

        self.assertIn(
            "no tiene una verificación",
            response.data["detail"],
        )

    def test_admin_no_puede_confirmar_con_verificacion_no_validada(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        VerificacionResidencia.objects.create(
            usuario=self.vecino,
            sector=self.sector,
            tipo_documento=VerificacionResidencia.TipoDocumento.INTERNET,
            archivo="verificaciones_residencia/prueba_pendiente.pdf",
            estado=VerificacionResidencia.Estado.REVISION_MANUAL,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "resolver-asociacion-sector",
            kwargs={
                "usuario_id": self.vecino.id,
            },
        )

        response = self.client.post(
            url,
            {
                "accion": "CONFIRMAR",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "PENDIENTE",
        )

        self.assertIn(
            "REVISION_MANUAL",
            response.data["detail"],
        )

    def test_admin_puede_rechazar_asociacion_pendiente(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "PENDIENTE"
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
            ]
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "resolver-asociacion-sector",
            kwargs={
                "usuario_id": self.vecino.id,
            },
        )

        response = self.client.post(
            url,
            {
                "accion": "RECHAZAR",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "RECHAZADA",
        )

        self.assertIsNone(self.vecino.confirmado_por_usuario)

        self.assertIsNone(self.vecino.fecha_confirmacion_sector)

    def test_vecino_no_puede_reemplazar_asociacion_confirmada(self):
        self.vecino.sector = self.sector
        self.vecino.estado_asociacion_sector = "CONFIRMADA"
        self.vecino.confirmado_por_usuario = self.admin
        self.vecino.save(
            update_fields=[
                "sector",
                "estado_asociacion_sector",
                "confirmado_por_usuario",
            ]
        )

        self.client.force_authenticate(user=self.vecino)

        url = reverse("solicitar-asociacion-sector")

        response = self.client.post(
            url,
            {
                "sector_id": self.sector.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.vecino.refresh_from_db()

        self.assertEqual(
            self.vecino.estado_asociacion_sector,
            "CONFIRMADA",
        )


class GestionDirectivaTests(APITestCase):

    def setUp(self):
        self.rol_admin, _ = Rol.objects.get_or_create(nombre="Administrador")

        self.rol_vecino, _ = Rol.objects.get_or_create(nombre="Vecino")

        self.rol_directiva, _ = Rol.objects.get_or_create(nombre="Directiva")

        self.admin = Usuario.objects.create_user(
            username="admin_directiva_test",
            email="admin.directiva@test.cl",
            password="ClaveSegura123!",
        )

        UsuarioRol.objects.create(
            usuario=self.admin,
            rol=self.rol_admin,
            activo=True,
        )

        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Directiva Test",
            comuna="Puente Alto",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Directiva Test",
            activo=True,
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_directiva_test",
            email="vecino.directiva@test.cl",
            password="ClaveSegura123!",
            rut="22222222-2",
            nombres="Vecino",
            apellido_paterno="Directiva",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.cargo_presidente = Cargo.objects.create(
            nombre="Presidente",
            descripcion="Presidencia de la junta",
            permite_multiples=False,
            activo=True,
        )
        self.cargo_secretario = Cargo.objects.create(
            nombre="Secretario",
            descripcion="Secretaría de la junta",
            permite_multiples=False,
            activo=True,
        )

        self.directiva = Directiva.objects.create(
            junta_vecinos=self.junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

    def test_admin_puede_asignar_integrante_y_rol_directiva(self):
        self.client.force_authenticate(user=self.admin)

        url = reverse("integrantes-directiva-list-create")

        response = self.client.post(
            url,
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
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=self.vecino,
                cargo=self.cargo_presidente,
                activo=True,
            ).exists()
        )

        self.assertTrue(
            UsuarioRol.objects.filter(
                usuario=self.vecino,
                rol=self.rol_directiva,
                activo=True,
            ).exists()
        )
        historial = HistorialGestionUsuario.objects.get(
            usuario_objetivo=self.vecino,
            tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
        )

        self.assertEqual(
            historial.realizado_por,
            self.admin,
        )

        self.assertEqual(
            historial.valor_anterior,
            "SIN_CARGO_ACTIVO",
        )

        self.assertEqual(
            historial.valor_nuevo,
            self.cargo_presidente.nombre,
        )

        self.assertIn(
            str(self.directiva.id),
            historial.detalle,
        )

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

        historiales = HistorialGestionUsuario.objects.filter(
            usuario_objetivo=self.vecino,
            tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
        ).order_by("fecha_cambio", "id")

        self.assertEqual(
            historiales.count(),
            2,
        )

        historial_revocacion = historiales.last()

        self.assertEqual(
            historial_revocacion.realizado_por,
            self.admin,
        )

        self.assertEqual(
            historial_revocacion.valor_anterior,
            self.cargo_presidente.nombre,
        )

        self.assertEqual(
            historial_revocacion.valor_nuevo,
            "SIN_CARGO_ACTIVO",
        )

        self.assertIn(
            str(self.directiva.id),
            historial_revocacion.detalle,
        )

    def test_cargo_no_multiple_rechaza_segundo_integrante(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_test",
            email="otro.vecino@test.cl",
            password="ClaveSegura123!",
            rut="33333333-3",
            nombres="Otro",
            apellido_paterno="Vecino",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse("integrantes-directiva-list-create")

        response = self.client.post(
            url,
            {
                "directiva": self.directiva.id,
                "usuario": otro_vecino.id,
                "cargo": self.cargo_presidente.id,
                "fecha_inicio": "2026-01-02",
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                cargo=self.cargo_presidente,
                activo=True,
            ).count(),
            1,
        )

    def test_usuario_no_puede_tener_dos_cargos_activos_misma_directiva(self):
        cargo_secretario = self.cargo_secretario

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse("integrantes-directiva-list-create")

        response = self.client.post(
            url,
            {
                "directiva": self.directiva.id,
                "usuario": self.vecino.id,
                "cargo": cargo_secretario.id,
                "fecha_inicio": "2026-01-02",
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=self.vecino,
                activo=True,
            ).count(),
            1,
        )

    def test_rechaza_usuario_asociado_a_otra_junta(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Test",
            comuna="Puente Alto",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector Test",
            activo=True,
        )

        otro_vecino = Usuario.objects.create_user(
            username="vecino_otra_junta",
            email="otra.junta@test.cl",
            password="ClaveSegura123!",
            rut="44444444-4",
            nombres="Vecino",
            apellido_paterno="Otra Junta",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse("integrantes-directiva-list-create")

        response = self.client.post(
            url,
            {
                "directiva": self.directiva.id,
                "usuario": otro_vecino.id,
                "cargo": self.cargo_presidente.id,
                "fecha_inicio": "2026-01-01",
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=otro_vecino,
                activo=True,
            ).exists()
        )

    def test_rechaza_usuario_sin_asociacion_confirmada(self):
        vecino_pendiente = Usuario.objects.create_user(
            username="vecino_pendiente_directiva",
            email="pendiente.directiva@test.cl",
            password="ClaveSegura123!",
            rut="55555555-5",
            nombres="Vecino",
            apellido_paterno="Pendiente",
            sector=self.sector,
            estado_asociacion_sector="PENDIENTE",
        )

        UsuarioRol.objects.create(
            usuario=vecino_pendiente,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse("integrantes-directiva-list-create")

        response = self.client.post(
            url,
            {
                "directiva": self.directiva.id,
                "usuario": vecino_pendiente.id,
                "cargo": self.cargo_presidente.id,
                "fecha_inicio": "2026-01-01",
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=vecino_pendiente,
                activo=True,
            ).exists()
        )

    def test_admin_puede_ver_usuarios_elegibles_de_directiva(self):
        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "usuarios-elegibles-directiva",
            kwargs={
                "directiva_id": self.directiva.id,
            },
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        usuarios_ids = [usuario["id"] for usuario in response.data]

        self.assertIn(
            self.vecino.id,
            usuarios_ids,
        )

    def test_usuarios_elegibles_excluye_vecino_de_otra_junta(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Elegibles",
            comuna="Puente Alto",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector Elegibles",
            activo=True,
        )

        otro_vecino = Usuario.objects.create_user(
            username="vecino_no_elegible_otra_junta",
            email="no.elegible.otra.junta@test.cl",
            password="ClaveSegura123!",
            rut="66666666-6",
            nombres="Vecino",
            apellido_paterno="Otra Junta",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "usuarios-elegibles-directiva",
            kwargs={
                "directiva_id": self.directiva.id,
            },
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        usuarios_ids = [usuario["id"] for usuario in response.data]

        self.assertNotIn(
            otro_vecino.id,
            usuarios_ids,
        )

    def test_usuarios_elegibles_excluye_asociacion_pendiente(self):
        vecino_pendiente = Usuario.objects.create_user(
            username="vecino_pendiente_elegibles",
            email="pendiente.elegibles@test.cl",
            password="ClaveSegura123!",
            rut="77777777-7",
            nombres="Vecino",
            apellido_paterno="Pendiente",
            sector=self.sector,
            estado_asociacion_sector="PENDIENTE",
        )

        UsuarioRol.objects.create(
            usuario=vecino_pendiente,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "usuarios-elegibles-directiva",
            kwargs={
                "directiva_id": self.directiva.id,
            },
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        usuarios_ids = [usuario["id"] for usuario in response.data]

        self.assertNotIn(
            vecino_pendiente.id,
            usuarios_ids,
        )

    def test_usuarios_elegibles_excluye_usuario_inactivo(self):
        vecino_inactivo = Usuario.objects.create_user(
            username="vecino_inactivo_elegibles",
            email="inactivo.elegibles@test.cl",
            password="ClaveSegura123!",
            rut="88888888-8",
            nombres="Vecino",
            apellido_paterno="Inactivo",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
            is_active=False,
        )

        UsuarioRol.objects.create(
            usuario=vecino_inactivo,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "usuarios-elegibles-directiva",
            kwargs={
                "directiva_id": self.directiva.id,
            },
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        usuarios_ids = [usuario["id"] for usuario in response.data]

        self.assertNotIn(
            vecino_inactivo.id,
            usuarios_ids,
        )

    def test_admin_puede_reasignar_cargo_conservando_historial(self):
        self.client.force_authenticate(user=self.admin)

        response_crear = self.client.post(
            reverse("integrantes-directiva-list-create"),
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

        integrante_anterior = IntegranteDirectiva.objects.get(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
        )

        response_reasignar = self.client.post(
            reverse(
                "integrantes-directiva-reasignar",
                kwargs={
                    "pk": integrante_anterior.id,
                },
            ),
            {
                "cargo": self.cargo_secretario.id,
                "fecha_inicio": "2026-06-01",
            },
            format="json",
        )

        self.assertEqual(
            response_reasignar.status_code,
            status.HTTP_201_CREATED,
        )

        integrante_anterior.refresh_from_db()

        self.assertFalse(integrante_anterior.activo)

        self.assertEqual(
            integrante_anterior.fecha_fin,
            date(2026, 6, 1),
        )

        nuevo_integrante = IntegranteDirectiva.objects.get(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_secretario,
            activo=True,
        )

        self.assertEqual(
            nuevo_integrante.fecha_inicio,
            date(2026, 6, 1),
        )

        self.assertEqual(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=self.vecino,
                activo=True,
            ).count(),
            1,
        )

        self.assertEqual(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=self.vecino,
            ).count(),
            2,
        )

        self.assertTrue(
            UsuarioRol.objects.filter(
                usuario=self.vecino,
                rol=self.rol_directiva,
                activo=True,
            ).exists()
        )

        historiales = HistorialGestionUsuario.objects.filter(
            usuario_objetivo=self.vecino,
            tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
        ).order_by(
            "fecha_cambio",
            "id",
        )

        self.assertEqual(
            historiales.count(),
            2,
        )

        historial_reasignacion = historiales.last()

        self.assertEqual(
            historial_reasignacion.realizado_por,
            self.admin,
        )

        self.assertEqual(
            historial_reasignacion.valor_anterior,
            self.cargo_presidente.nombre,
        )

        self.assertEqual(
            historial_reasignacion.valor_nuevo,
            self.cargo_secretario.nombre,
        )

    def test_no_se_puede_cambiar_cargo_directamente_sin_historial(self):
        self.client.force_authenticate(user=self.admin)

        response_crear = self.client.post(
            reverse("integrantes-directiva-list-create"),
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
            cargo=self.cargo_presidente,
        )

        response = self.client.patch(
            reverse(
                "integrantes-directiva-detail",
                kwargs={
                    "pk": integrante.id,
                },
            ),
            {
                "cargo": self.cargo_secretario.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        integrante.refresh_from_db()

        self.assertEqual(
            integrante.cargo,
            self.cargo_presidente,
        )

        self.assertTrue(integrante.activo)

        self.assertFalse(
            IntegranteDirectiva.objects.filter(
                directiva=self.directiva,
                usuario=self.vecino,
                cargo=self.cargo_secretario,
            ).exists()
        )

    def test_admin_puede_consultar_directiva_vigente_de_junta(self):
        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse(
                "directiva-vigente-junta",
                kwargs={
                    "junta_id": self.junta.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["directiva"]["id"],
            self.directiva.id,
        )

        self.assertEqual(
            len(response.data["integrantes"]),
            1,
        )

        self.assertEqual(
            response.data["integrantes"][0]["usuario"],
            self.vecino.id,
        )

        self.assertEqual(
            response.data["integrantes"][0]["cargo"],
            self.cargo_presidente.id,
        )

    def test_finalizar_directiva_cierra_integrantes_y_desactiva_rol(self):
        self.client.force_authenticate(user=self.admin)

        # Primero asignamos al vecino como integrante de la directiva.
        response_crear = self.client.post(
            reverse("integrantes-directiva-list-create"),
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
            activo=True,
        )

        # El rol Directiva debe haberse activado.
        rol_directiva = UsuarioRol.objects.get(
            usuario=self.vecino,
            rol=self.rol_directiva,
        )

        self.assertTrue(rol_directiva.activo)

        # Finalizamos la directiva completa.
        response_finalizar = self.client.patch(
            reverse(
                "directivas-detail",
                kwargs={
                    "pk": self.directiva.id,
                },
            ),
            {
                "estado": Directiva.EstadoDirectiva.FINALIZADA,
            },
            format="json",
        )

        self.assertEqual(
            response_finalizar.status_code,
            status.HTTP_200_OK,
        )

        # La directiva debe quedar finalizada.
        self.directiva.refresh_from_db()

        self.assertEqual(
            self.directiva.estado,
            Directiva.EstadoDirectiva.FINALIZADA,
        )

        self.assertIsNotNone(self.directiva.fecha_fin)

        # El integrante debe quedar cerrado.
        integrante.refresh_from_db()

        self.assertFalse(integrante.activo)

        self.assertIsNotNone(integrante.fecha_fin)

        self.assertEqual(
            integrante.fecha_fin,
            self.directiva.fecha_fin,
        )

        # El rol Directiva debe quedar desactivado.
        rol_directiva.refresh_from_db()

        self.assertFalse(rol_directiva.activo)

        # Debe existir historial del cierre del cargo.
        historial = (
            HistorialGestionUsuario.objects.filter(
                usuario_objetivo=self.vecino,
                tipo_cambio=(HistorialGestionUsuario.TipoCambio.CARGO),
            )
            .order_by("fecha_cambio", "id")
            .last()
        )

        self.assertIsNotNone(historial)

        self.assertEqual(
            historial.realizado_por,
            self.admin,
        )

        self.assertEqual(
            historial.valor_anterior,
            self.cargo_presidente.nombre,
        )

        self.assertEqual(
            historial.valor_nuevo,
            "SIN_CARGO_ACTIVO",
        )

        self.assertIn(
            str(self.directiva.id),
            historial.detalle,
        )

    def test_no_permite_dos_directivas_vigentes_en_misma_junta(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("directivas-list-create"),
            {
                "junta_vecinos": self.junta.id,
                "fecha_inicio": "2026-07-01",
                "fecha_fin": None,
                "estado": Directiva.EstadoDirectiva.VIGENTE,
                "observacion": "Segunda directiva vigente de prueba",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Directiva.objects.filter(
                junta_vecinos=self.junta,
                estado=Directiva.EstadoDirectiva.VIGENTE,
            ).count(),
            1,
        )

        self.assertIn(
            "estado",
            response.data,
        )

    def test_usuarios_elegibles_excluye_integrante_con_cargo_activo(self):
        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse(
                "usuarios-elegibles-directiva",
                kwargs={
                    "directiva_id": self.directiva.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        usuarios_ids = [usuario["id"] for usuario in response.data]

        self.assertNotIn(
            self.vecino.id,
            usuarios_ids,
        )

    def test_directiva_puede_consultar_cargos_pero_no_crearlos(self):
        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(user=self.vecino)

        url = reverse("cargos-list-create")

        response_get = self.client.get(url)

        self.assertEqual(
            response_get.status_code,
            status.HTTP_200_OK,
        )

        response_post = self.client.post(
            url,
            {
                "nombre": "Vicepresidente",
                "descripcion": "Cargo de prueba",
                "permite_multiples": False,
                "activo": True,
            },
            format="json",
        )

        self.assertEqual(
            response_post.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertFalse(
            Cargo.objects.filter(
                nombre="Vicepresidente",
            ).exists()
        )

    def test_directiva_valida_residencia_y_confirma_asociacion(self):
        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.vecino,
            cargo=self.cargo_presidente,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        vecino_pendiente = Usuario.objects.create_user(
            username="vecino_verificacion_directiva",
            email="vecino.verificacion@test.cl",
            password="ClaveSegura123!",
            nombres="Vecino",
            apellido_paterno="Pendiente",
            sector=self.sector,
            estado_asociacion_sector="PENDIENTE",
        )

        UsuarioRol.objects.create(
            usuario=vecino_pendiente,
            rol=self.rol_vecino,
            activo=True,
        )

        verificacion = VerificacionResidencia.objects.create(
            usuario=vecino_pendiente,
            sector=self.sector,
            tipo_documento=VerificacionResidencia.TipoDocumento.INTERNET,
            archivo="verificaciones_residencia/directiva_test.pdf",
            estado=VerificacionResidencia.Estado.REVISION_MANUAL,
        )

        self.client.force_authenticate(user=self.vecino)

        url_verificacion = reverse(
            "directiva-resolver-verificacion-residencia",
            kwargs={
                "verificacion_id": verificacion.id,
            },
        )

        response_verificacion = self.client.post(
            url_verificacion,
            {
                "accion": "VALIDAR",
            },
            format="json",
        )

        self.assertEqual(
            response_verificacion.status_code,
            status.HTTP_200_OK,
        )

        verificacion.refresh_from_db()

        self.assertEqual(
            verificacion.estado,
            VerificacionResidencia.Estado.VALIDADA,
        )

        self.assertEqual(
            verificacion.revisado_por,
            self.vecino,
        )

        self.assertIsNotNone(
            verificacion.fecha_revision,
        )

        url_asociacion = reverse(
            "directiva-resolver-asociacion-sector",
            kwargs={
                "usuario_id": vecino_pendiente.id,
            },
        )

        response_asociacion = self.client.post(
            url_asociacion,
            {
                "accion": "CONFIRMAR",
            },
            format="json",
        )

        self.assertEqual(
            response_asociacion.status_code,
            status.HTTP_200_OK,
        )

        vecino_pendiente.refresh_from_db()

        self.assertEqual(
            vecino_pendiente.estado_asociacion_sector,
            "CONFIRMADA",
        )

        self.assertEqual(
            vecino_pendiente.confirmado_por_usuario,
            self.vecino,
        )

        self.assertIsNotNone(
            vecino_pendiente.fecha_confirmacion_sector,
        )


class ExtraccionDatosResidenciaTests(APITestCase):

    def test_extrae_nombre_direccion_y_comuna_en_misma_linea(self):
        lineas = [
            {
                "texto": "Nombre del cliente: Juan Perez Soto",
            },
            {
                "texto": "Direccion: Avenida Siempre Viva 123",
            },
            {
                "texto": "Comuna: Puente Alto",
            },
        ]

        resultado = extraer_datos_personales(lineas)

        self.assertEqual(
            resultado["nombre"],
            "Juan Perez Soto",
        )

        self.assertEqual(
            resultado["direccion"],
            "Avenida Siempre Viva 123",
        )

        self.assertEqual(
            resultado["comuna"],
            "Puente Alto",
        )

    def test_extrae_datos_cuando_etiqueta_y_valor_estan_en_cajas_separadas(self):
        lineas = [
            {
                "texto": "Nombre del cliente",
                "caja": [
                    [10, 10],
                    [120, 10],
                    [120, 30],
                    [10, 30],
                ],
            },
            {
                "texto": "Juan Perez Soto",
                "caja": [
                    [150, 10],
                    [280, 10],
                    [280, 30],
                    [150, 30],
                ],
            },
            {
                "texto": "Direccion",
                "caja": [
                    [10, 50],
                    [90, 50],
                    [90, 70],
                    [10, 70],
                ],
            },
            {
                "texto": "Avenida Siempre Viva 123",
                "caja": [
                    [120, 50],
                    [320, 50],
                    [320, 70],
                    [120, 70],
                ],
            },
            {
                "texto": "Comuna",
                "caja": [
                    [10, 90],
                    [80, 90],
                    [80, 110],
                    [10, 110],
                ],
            },
            {
                "texto": "Puente Alto",
                "caja": [
                    [110, 90],
                    [220, 90],
                    [220, 110],
                    [110, 110],
                ],
            },
        ]

        resultado = extraer_datos_personales(lineas)

        self.assertEqual(
            resultado["nombre"],
            "Juan Perez Soto",
        )

        self.assertEqual(
            resultado["direccion"],
            "Avenida Siempre Viva 123",
        )

        self.assertEqual(
            resultado["comuna"],
            "Puente Alto",
        )

    def test_extrae_datos_sin_etiquetas_usando_bloque_domicilio(self):
        lineas = [
            {
                "texto": "Juan Perez Soto",
                "caja": [
                    [20, 10],
                    [180, 10],
                    [180, 30],
                    [20, 30],
                ],
            },
            {
                "texto": "Avenida Siempre Viva 123",
                "caja": [
                    [20, 45],
                    [240, 45],
                    [240, 65],
                    [20, 65],
                ],
            },
            {
                "texto": "Puente Alto",
                "caja": [
                    [20, 80],
                    [140, 80],
                    [140, 100],
                    [20, 100],
                ],
            },
        ]

        resultado = extraer_datos_personales(lineas)

        self.assertEqual(
            resultado["nombre"],
            "Juan Perez Soto",
        )

        self.assertEqual(
            resultado["direccion"],
            "Avenida Siempre Viva 123",
        )

        self.assertEqual(
            resultado["comuna"],
            "Puente Alto",
        )

    def test_extrae_fecha_emision_sin_confundirla_con_vencimiento(self):
        texto = """
        Fecha de emision: 15-10-2026
        Fecha de vencimiento: 05-11-2026
        """

        resultado = extraer_fecha_emision(
            texto,
        )

        self.assertEqual(
            resultado,
            date(2026, 10, 15),
        )

    def test_extrae_fecha_emision_desde_cajas_separadas(self):
        lineas = [
            {
                "texto": "Fecha de emision",
                "caja": [
                    [10, 10],
                    [130, 10],
                    [130, 30],
                    [10, 30],
                ],
            },
            {
                "texto": "15-10-2026",
                "caja": [
                    [160, 10],
                    [250, 10],
                    [250, 30],
                    [160, 30],
                ],
            },
            {
                "texto": "Fecha de vencimiento",
                "caja": [
                    [10, 50],
                    [150, 50],
                    [150, 70],
                    [10, 70],
                ],
            },
            {
                "texto": "05-11-2026",
                "caja": [
                    [180, 50],
                    [270, 50],
                    [270, 70],
                    [180, 70],
                ],
            },
        ]

        resultado = extraer_fecha_emision(
            "",
            lineas,
        )

        self.assertEqual(
            resultado,
            date(2026, 10, 15),
        )

    @patch(
        "organizacion.services.validacion_residencia.timezone.localdate",
        return_value=date(2026, 11, 3),
    )
    def test_documento_de_exactamente_90_dias_es_vigente(
        self,
        mock_localdate,
    ):
        resultado = validar_antiguedad_documento(date(2026, 8, 5))

        self.assertTrue(resultado["valida"])

        self.assertEqual(
            resultado["dias_antiguedad"],
            90,
        )

        self.assertEqual(
            resultado["motivo"],
            "Documento vigente.",
        )

    @patch(
        "organizacion.services.validacion_residencia.timezone.localdate",
        return_value=date(2026, 11, 3),
    )
    def test_documento_de_91_dias_no_es_vigente(
        self,
        mock_localdate,
    ):
        resultado = validar_antiguedad_documento(date(2026, 8, 4))

        self.assertFalse(resultado["valida"])

        self.assertEqual(
            resultado["dias_antiguedad"],
            91,
        )

        self.assertIn(
            "90",
            resultado["motivo"],
        )

    @patch(
        "organizacion.services.validacion_residencia.timezone.localdate",
        return_value=date(2026, 11, 3),
    )
    def test_documento_con_fecha_futura_no_es_vigente(
        self,
        mock_localdate,
    ):
        resultado = validar_antiguedad_documento(date(2026, 11, 4))

        self.assertFalse(resultado["valida"])

        self.assertEqual(
            resultado["dias_antiguedad"],
            -1,
        )

        self.assertIn(
            "futuro",
            resultado["motivo"],
        )

    @patch(
        "organizacion.services.validacion_residencia.timezone.localdate",
        return_value=date(2026, 11, 3),
    )
    def test_analiza_documento_residencia_completo(
        self,
        mock_localdate,
    ):
        resultado_ocr = {
            "texto_completo": (
                "Nombre del cliente: Juan Perez Soto\n"
                "Direccion: Avenida Siempre Viva 123\n"
                "Comuna: Puente Alto\n"
                "Fecha de emision: 15-10-2026"
            ),
            "lineas": [
                {
                    "texto": "Nombre del cliente: Juan Perez Soto",
                },
                {
                    "texto": "Direccion: Avenida Siempre Viva 123",
                },
                {
                    "texto": "Comuna: Puente Alto",
                },
                {
                    "texto": "Fecha de emision: 15-10-2026",
                },
            ],
            "confianza_promedio": 0.96,
        }

        resultado = analizar_documento_residencia(resultado_ocr)

        self.assertEqual(
            resultado["nombre"],
            "Juan Perez Soto",
        )

        self.assertEqual(
            resultado["direccion"],
            "Avenida Siempre Viva 123",
        )

        self.assertEqual(
            resultado["comuna"],
            "Puente Alto",
        )

        self.assertEqual(
            resultado["fecha_emision"],
            date(2026, 10, 15),
        )

        self.assertEqual(
            resultado["confianza_ocr"],
            0.96,
        )

        self.assertTrue(resultado["documento_vigente"])

        self.assertEqual(
            resultado["dias_antiguedad"],
            19,
        )

    def test_comuna_coincide_aunque_ocr_agregue_texto_adicional(self):
        resultado = validar_coincidencia_comuna(
            "PUENTE ALTO - REGION METROPOLITANA",
            "Puente Alto",
        )

        self.assertTrue(resultado["coincide"])

        self.assertIn(
            "coincide",
            resultado["motivo"].lower(),
        )

    def test_comuna_distinta_no_coincide(self):
        resultado = validar_coincidencia_comuna(
            "La Florida",
            "Puente Alto",
        )

        self.assertFalse(resultado["coincide"])

        self.assertIn(
            "no coincide",
            resultado["motivo"].lower(),
        )

    def test_documento_vigente_y_comuna_correcta_pasa_a_revision_manual(self):
        estado = determinar_estado_verificacion(
            documento_vigente=True,
            comuna_coincide=True,
        )

        self.assertEqual(
            estado,
            "REVISION_MANUAL",
        )

    def test_documento_no_vigente_se_rechaza(self):
        estado = determinar_estado_verificacion(
            documento_vigente=False,
            comuna_coincide=True,
        )

        self.assertEqual(
            estado,
            "RECHAZADA",
        )

    def test_comuna_incorrecta_rechaza_verificacion(self):
        estado = determinar_estado_verificacion(
            documento_vigente=True,
            comuna_coincide=False,
        )

        self.assertEqual(
            estado,
            "RECHAZADA",
        )
