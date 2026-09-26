from django.urls import reverse
from datetime import date
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

from .models import Evento


class EventosDirectivaTests(APITestCase):
    def setUp(self):
        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Eventos",
            comuna="Santiago",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Eventos",
            activo=True,
        )

        self.rol_directiva = Rol.objects.get(
            nombre="Directiva",
        )

        self.usuario = Usuario.objects.create_user(
            username="directiva_eventos",
            email="directiva.eventos@test.cl",
            password="ClaveSegura123!",
            rut="99999999-9",
            nombres="Usuario",
            apellido_paterno="Directiva",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_directiva,
            activo=True,
        )

        self.cargo = Cargo.objects.create(
            nombre="Presidente Eventos",
            descripcion="Cargo de prueba",
            permite_multiples=False,
            activo=True,
        )

        self.directiva = Directiva.objects.create(
            junta_vecinos=self.junta,
            fecha_inicio=date(2026, 1, 1),
            estado="VIGENTE",
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=self.usuario,
            cargo=self.cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

    def test_integrante_directiva_activo_puede_crear_evento(self):
        self.client.force_authenticate(user=self.usuario)

        data = {
            "directiva": self.directiva.id,
            "titulo": "Reunión comunitaria",
            "descripcion": "Reunión general con vecinos.",
            "lugar": "Sede vecinal",
            "fecha_inicio": "2026-10-10T18:00:00-03:00",
            "fecha_fin": "2026-10-10T20:00:00-03:00",
            "cupo_maximo": 50,
            "estado": "PROGRAMADO",
        }

        response = self.client.post(
            reverse("eventos-directiva-list-create"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Evento.objects.count(),
            1,
        )

        evento = Evento.objects.get()

        self.assertEqual(
            evento.creador,
            self.usuario,
        )

        self.assertEqual(
            evento.directiva,
            self.directiva,
        )

    def test_directiva_no_puede_crear_evento_para_otra_directiva(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta",
            comuna="Santiago",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado="VIGENTE",
        )

        self.client.force_authenticate(user=self.usuario)

        data = {
            "directiva": otra_directiva.id,
            "titulo": "Evento ajeno",
            "descripcion": "No debería poder crearse.",
            "lugar": "Otra sede",
            "fecha_inicio": "2026-10-15T18:00:00-03:00",
            "fecha_fin": "2026-10-15T20:00:00-03:00",
            "cupo_maximo": 30,
            "estado": "PROGRAMADO",
        }

        response = self.client.post(
            reverse("eventos-directiva-list-create"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            Evento.objects.count(),
            0,
        )

    def test_no_permite_fecha_fin_anterior_a_fecha_inicio(self):
        self.client.force_authenticate(user=self.usuario)

        data = {
            "directiva": self.directiva.id,
            "titulo": "Evento con fechas inválidas",
            "descripcion": "Prueba de validación.",
            "lugar": "Sede vecinal",
            "fecha_inicio": "2026-10-20T20:00:00-03:00",
            "fecha_fin": "2026-10-20T18:00:00-03:00",
            "cupo_maximo": 20,
            "estado": "PROGRAMADO",
        }

        response = self.client.post(
            reverse("eventos-directiva-list-create"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "fecha_fin",
            response.data,
        )

        self.assertEqual(
            Evento.objects.count(),
            0,
        )

    def test_no_permite_cupo_maximo_cero(self):
        self.client.force_authenticate(user=self.usuario)

        data = {
            "directiva": self.directiva.id,
            "titulo": "Evento sin cupos válidos",
            "descripcion": "Prueba de validación de cupo.",
            "lugar": "Sede vecinal",
            "fecha_inicio": "2026-10-25T18:00:00-03:00",
            "fecha_fin": "2026-10-25T20:00:00-03:00",
            "cupo_maximo": 0,
            "estado": "PROGRAMADO",
        }

        response = self.client.post(
            reverse("eventos-directiva-list-create"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "cupo_maximo",
            response.data,
        )

        self.assertEqual(
            Evento.objects.count(),
            0,
        )

    def test_directiva_solo_ve_eventos_de_su_directiva(self):
        Evento.objects.create(
            directiva=self.directiva,
            creador=self.usuario,
            titulo="Evento propio",
            descripcion="Evento de la directiva autenticada.",
            lugar="Sede vecinal",
            fecha_inicio="2026-10-30T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        otra_junta = JuntaVecinos.objects.create(
            nombre="Junta Externa",
            comuna="Santiago",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado="VIGENTE",
        )

        Evento.objects.create(
            directiva=otra_directiva,
            creador=self.usuario,
            titulo="Evento ajeno",
            descripcion="No debería aparecer.",
            lugar="Otra sede",
            fecha_inicio="2026-11-01T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.get(reverse("eventos-directiva-list-create"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["titulo"],
            "Evento propio",
        )

    def test_directiva_puede_cancelar_su_evento(self):
        evento = Evento.objects.create(
            directiva=self.directiva,
            creador=self.usuario,
            titulo="Evento a cancelar",
            descripcion="Evento de prueba.",
            lugar="Sede vecinal",
            fecha_inicio="2026-11-05T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.patch(
            reverse(
                "eventos-directiva-detail",
                kwargs={
                    "pk": evento.id,
                },
            ),
            {
                "estado": "CANCELADO",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        evento.refresh_from_db()

        self.assertEqual(
            evento.estado,
            "CANCELADO",
        )

    def test_directiva_no_puede_modificar_evento_de_otra_directiva(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Junta Evento Externo",
            comuna="Santiago",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado="VIGENTE",
        )

        evento_ajeno = Evento.objects.create(
            directiva=otra_directiva,
            creador=self.usuario,
            titulo="Evento ajeno",
            descripcion="Evento de otra directiva.",
            lugar="Otra sede",
            fecha_inicio="2026-11-10T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.patch(
            reverse(
                "eventos-directiva-detail",
                kwargs={
                    "pk": evento_ajeno.id,
                },
            ),
            {
                "estado": "CANCELADO",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        evento_ajeno.refresh_from_db()

        self.assertEqual(
            evento_ajeno.estado,
            "PROGRAMADO",
        )

    def test_directiva_puede_editar_su_evento(self):
        evento = Evento.objects.create(
            directiva=self.directiva,
            creador=self.usuario,
            titulo="Título original",
            descripcion="Descripción original.",
            lugar="Sede original",
            fecha_inicio="2026-11-15T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.patch(
            reverse(
                "eventos-directiva-detail",
                kwargs={
                    "pk": evento.id,
                },
            ),
            {
                "titulo": "Título actualizado",
                "lugar": "Nueva sede",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        evento.refresh_from_db()

        self.assertEqual(
            evento.titulo,
            "Título actualizado",
        )

        self.assertEqual(
            evento.lugar,
            "Nueva sede",
        )

        self.assertEqual(
            evento.estado,
            "PROGRAMADO",
        )

    def test_vecino_solo_ve_eventos_programados_de_su_junta(self):
        rol_vecino = Rol.objects.get(
            nombre="Vecino",
        )

        vecino = Usuario.objects.create_user(
            username="vecino_eventos",
            email="vecino.eventos@test.cl",
            password="ClaveSegura123!",
            rut="66666666-6",
            nombres="Vecino",
            apellido_paterno="Eventos",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=vecino,
            rol=rol_vecino,
            activo=True,
        )

        Evento.objects.create(
            directiva=self.directiva,
            creador=self.usuario,
            titulo="Evento visible",
            descripcion="Evento programado de su Junta.",
            lugar="Sede vecinal",
            fecha_inicio="2026-11-20T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        Evento.objects.create(
            directiva=self.directiva,
            creador=self.usuario,
            titulo="Evento cancelado",
            descripcion="No debe aparecer.",
            lugar="Sede vecinal",
            fecha_inicio="2026-11-21T18:00:00-03:00",
            estado="CANCELADO",
        )

        otra_junta = JuntaVecinos.objects.create(
            nombre="Junta Vecino Externo",
            comuna="Santiago",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado="VIGENTE",
        )

        Evento.objects.create(
            directiva=otra_directiva,
            creador=self.usuario,
            titulo="Evento de otra Junta",
            descripcion="No debe aparecer.",
            lugar="Otra sede",
            fecha_inicio="2026-11-22T18:00:00-03:00",
            estado="PROGRAMADO",
        )

        self.client.force_authenticate(user=vecino)

        response = self.client.get(reverse("eventos-vecino-list"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["titulo"],
            "Evento visible",
        )
