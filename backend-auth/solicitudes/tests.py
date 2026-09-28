from datetime import date

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from organizacion.models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
)
from profiles.models import Rol, Usuario, UsuarioRol

from .models import SolicitudVecino


class SolicitudesVecinoTests(APITestCase):
    def setUp(self):
        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Solicitudes",
            comuna="Santiago",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Solicitudes",
            activo=True,
        )

        self.rol_vecino = Rol.objects.get(
            nombre="Vecino",
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_solicitudes",
            email="vecino.solicitudes@test.cl",
            password="ClaveSegura123!",
            rut="12121212-1",
            nombres="Vecino",
            apellido_paterno="Solicitudes",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

    def test_vecino_puede_crear_solicitud(self):
        self.client.force_authenticate(user=self.vecino)

        response = self.client.post(
            reverse("solicitudes-vecino-list-create"),
            {
                "tipo": "SOLICITUD",
                "asunto": "Solicitud de luminaria",
                "descripcion": (
                    "Solicito revisar una luminaria " "que no está funcionando."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            SolicitudVecino.objects.count(),
            1,
        )

        solicitud = SolicitudVecino.objects.get()

        self.assertEqual(
            solicitud.vecino,
            self.vecino,
        )

        self.assertEqual(
            solicitud.junta_vecinos,
            self.junta,
        )

        self.assertEqual(
            solicitud.estado,
            "PENDIENTE",
        )

        self.assertEqual(
            solicitud.tipo,
            "SOLICITUD",
        )

    def test_vecino_solo_ve_sus_propias_solicitudes(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_solicitudes",
            email="otro.vecino.solicitudes@test.cl",
            password="ClaveSegura123!",
            rut="13131313-2",
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

        SolicitudVecino.objects.create(
            vecino=self.vecino,
            junta_vecinos=self.junta,
            tipo="CONSULTA",
            asunto="Mi consulta",
            descripcion="Consulta propia.",
            estado="PENDIENTE",
        )

        SolicitudVecino.objects.create(
            vecino=otro_vecino,
            junta_vecinos=self.junta,
            tipo="RECLAMO",
            asunto="Reclamo ajeno",
            descripcion="No debe aparecer.",
            estado="PENDIENTE",
        )

        self.client.force_authenticate(user=self.vecino)

        response = self.client.get(reverse("solicitudes-vecino-list-create"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["asunto"],
            "Mi consulta",
        )

    def test_vecino_no_confirmado_no_puede_crear_solicitud(self):
        vecino_no_confirmado = Usuario.objects.create_user(
            username="vecino_no_confirmado",
            email="vecino.no.confirmado@test.cl",
            password="ClaveSegura123!",
            rut="14141414-3",
            nombres="Vecino",
            apellido_paterno="NoConfirmado",
            sector=self.sector,
            estado_asociacion_sector="PENDIENTE",
        )

        UsuarioRol.objects.create(
            usuario=vecino_no_confirmado,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=vecino_no_confirmado)

        response = self.client.post(
            reverse("solicitudes-vecino-list-create"),
            {
                "tipo": "RECLAMO",
                "asunto": "Reclamo de prueba",
                "descripcion": "No debería poder crearse.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            SolicitudVecino.objects.count(),
            0,
        )

    def test_usuario_sin_rol_vecino_no_puede_crear_solicitud(self):
        rol_directiva = Rol.objects.get(
            nombre="Directiva",
        )

        usuario_directiva = Usuario.objects.create_user(
            username="directiva_sin_rol_vecino",
            email="directiva.sin.vecino@test.cl",
            password="ClaveSegura123!",
            rut="15151515-4",
            nombres="Usuario",
            apellido_paterno="Directiva",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=usuario_directiva,
            rol=rol_directiva,
            activo=True,
        )

        self.client.force_authenticate(user=usuario_directiva)

        response = self.client.post(
            reverse("solicitudes-vecino-list-create"),
            {
                "tipo": "CONSULTA",
                "asunto": "Consulta no autorizada",
                "descripcion": ("Este usuario no tiene rol Vecino."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            SolicitudVecino.objects.count(),
            0,
        )


class SolicitudesDirectivaTests(APITestCase):
    def setUp(self):
        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Directiva Solicitudes",
            comuna="Santiago",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Directiva Solicitudes",
            activo=True,
        )

        self.rol_vecino = Rol.objects.get(
            nombre="Vecino",
        )

        self.rol_directiva = Rol.objects.get(
            nombre="Directiva",
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_hu11",
            email="vecino.hu11@test.cl",
            password="ClaveSegura123!",
            rut="16161616-5",
            nombres="Vecino",
            apellido_paterno="HU11",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.usuario_directiva = Usuario.objects.create_user(
            username="directiva_hu11",
            email="directiva.hu11@test.cl",
            password="ClaveSegura123!",
            rut="17171717-6",
            nombres="Directiva",
            apellido_paterno="HU11",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.usuario_directiva,
            rol=self.rol_directiva,
            activo=True,
        )

        self.cargo = Cargo.objects.create(
            nombre="Presidente HU11",
            descripcion="Cargo para pruebas HU-11",
            permite_multiples=False,
            activo=True,
        )

        self.directiva = Directiva.objects.create(
            junta_vecinos=self.junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.usuario_directiva,
            cargo=self.cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

    def test_directiva_solo_ve_solicitudes_de_su_junta(self):
        SolicitudVecino.objects.create(
            vecino=self.vecino,
            junta_vecinos=self.junta,
            tipo="CONSULTA",
            asunto="Consulta de mi junta",
            descripcion="Debe aparecer.",
            estado="PENDIENTE",
        )

        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta HU11",
            comuna="Santiago",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector HU11",
            activo=True,
        )

        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_hu11",
            email="otro.vecino.hu11@test.cl",
            password="ClaveSegura123!",
            rut="18181818-7",
            nombres="Otro",
            apellido_paterno="Vecino",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        SolicitudVecino.objects.create(
            vecino=otro_vecino,
            junta_vecinos=otra_junta,
            tipo="RECLAMO",
            asunto="Solicitud de otra junta",
            descripcion="No debe aparecer.",
            estado="PENDIENTE",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.get(reverse("solicitudes-directiva-list"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["asunto"],
            "Consulta de mi junta",
        )

    def test_directiva_puede_responder_solicitud(self):
        solicitud = SolicitudVecino.objects.create(
            vecino=self.vecino,
            junta_vecinos=self.junta,
            tipo="CONSULTA",
            asunto="Consulta para responder",
            descripcion="Necesito una respuesta.",
            estado="PENDIENTE",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.patch(
            reverse(
                "solicitud-directiva-detail",
                kwargs={
                    "pk": solicitud.id,
                },
            ),
            {
                "estado": "RESPONDIDA",
                "respuesta": ("La solicitud fue revisada " "y será gestionada."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        solicitud.refresh_from_db()

        self.assertEqual(
            solicitud.estado,
            "RESPONDIDA",
        )

        self.assertEqual(
            solicitud.respuesta,
            ("La solicitud fue revisada " "y será gestionada."),
        )

        self.assertEqual(
            solicitud.respondido_por,
            self.usuario_directiva,
        )

        self.assertIsNotNone(
            solicitud.fecha_respuesta,
        )

    def test_directiva_no_puede_marcar_respondida_sin_respuesta(self):
        solicitud = SolicitudVecino.objects.create(
            vecino=self.vecino,
            junta_vecinos=self.junta,
            tipo="RECLAMO",
            asunto="Reclamo sin respuesta",
            descripcion="Debe requerir una respuesta.",
            estado="PENDIENTE",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.patch(
            reverse(
                "solicitud-directiva-detail",
                kwargs={
                    "pk": solicitud.id,
                },
            ),
            {
                "estado": "RESPONDIDA",
                "respuesta": "",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        solicitud.refresh_from_db()

        self.assertEqual(
            solicitud.estado,
            "PENDIENTE",
        )

        self.assertEqual(
            solicitud.respuesta,
            "",
        )

        self.assertIsNone(
            solicitud.respondido_por,
        )

        self.assertIsNone(
            solicitud.fecha_respuesta,
        )

    def test_directiva_no_puede_responder_solicitud_de_otra_junta(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Respuesta HU11",
            comuna="Santiago",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector Respuesta HU11",
            activo=True,
        )

        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_respuesta_hu11",
            email="otro.vecino.respuesta.hu11@test.cl",
            password="ClaveSegura123!",
            rut="19191919-8",
            nombres="Otro",
            apellido_paterno="Vecino",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        solicitud = SolicitudVecino.objects.create(
            vecino=otro_vecino,
            junta_vecinos=otra_junta,
            tipo="SOLICITUD",
            asunto="Solicitud de otra junta",
            descripcion="No debe poder responderla.",
            estado="PENDIENTE",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.patch(
            reverse(
                "solicitud-directiva-detail",
                kwargs={
                    "pk": solicitud.id,
                },
            ),
            {
                "estado": "RESPONDIDA",
                "respuesta": "Intento de respuesta no autorizado.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        solicitud.refresh_from_db()

        self.assertEqual(
            solicitud.estado,
            "PENDIENTE",
        )

        self.assertEqual(
            solicitud.respuesta,
            "",
        )
