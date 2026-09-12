from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from profiles.models import Rol, Usuario, UsuarioRol

from .models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
)


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
        cargo_secretario = Cargo.objects.create(
            nombre="Secretario",
            descripcion="Secretaría de la junta",
            permite_multiples=False,
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

        usuarios_ids = [
            usuario["id"]
            for usuario in response.data
        ]

        self.assertNotIn(
            vecino_inactivo.id,
            usuarios_ids,
        )