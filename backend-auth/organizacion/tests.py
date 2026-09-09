from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from profiles.models import Rol, Usuario, UsuarioRol

from .models import JuntaVecinos, Sector


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

        self.client.force_authenticate(
            user=self.vecino
        )

        url = reverse(
            "solicitar-asociacion-sector"
        )

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