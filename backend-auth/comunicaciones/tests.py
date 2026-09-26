from datetime import date
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.urls import reverse
from tempfile import TemporaryDirectory
from rest_framework import status
from rest_framework.test import APITestCase

from organizacion.models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
)
from profiles.models import Rol, UsuarioRol

from .models import (
    AdjuntoPublicacion,
    Notificacion,
    Publicacion,
)

Usuario = get_user_model()


class PublicacionesDirectivaTests(APITestCase):

    def setUp(self):
        self.rol_vecino, _ = Rol.objects.get_or_create(nombre="Vecino")

        self.rol_directiva, _ = Rol.objects.get_or_create(nombre="Directiva")

        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Comunicaciones Test",
            comuna="Puente Alto",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Comunicaciones Test",
            activo=True,
        )

        self.usuario = Usuario.objects.create_user(
            username="directiva_comunicaciones",
            email="directiva.comunicaciones@test.cl",
            password="ClaveSegura123!",
            rut="11111111-1",
            nombres="Usuario",
            apellido_paterno="Directiva",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_vecino,
            activo=True,
        )

        UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_directiva,
            activo=True,
        )

        self.cargo = Cargo.objects.create(
            nombre="Presidente Comunicaciones",
            descripcion="Cargo de prueba",
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
            usuario=self.usuario,
            cargo=self.cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

    def test_integrante_directiva_puede_crear_publicacion(self):
        self.client.force_authenticate(user=self.usuario)

        response = self.client.post(
            reverse("publicaciones-directiva-list-create"),
            {
                "directiva": self.directiva.id,
                "titulo": "Reunión extraordinaria",
                "contenido": (
                    "Se informa a los vecinos sobre " "una reunión extraordinaria."
                ),
                "activa": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        publicacion = Publicacion.objects.get()

        self.assertEqual(
            publicacion.autor,
            self.usuario,
        )

        self.assertEqual(
            publicacion.directiva,
            self.directiva,
        )

        self.assertEqual(
            publicacion.titulo,
            "Reunión extraordinaria",
        )

    def test_directiva_no_puede_publicar_en_otra_directiva(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Comunicaciones",
            comuna="Puente Alto",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.post(
            reverse("publicaciones-directiva-list-create"),
            {
                "directiva": otra_directiva.id,
                "titulo": "Publicación no permitida",
                "contenido": ("Este comunicado no debería ser creado."),
                "activa": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertFalse(
            Publicacion.objects.filter(
                directiva=otra_directiva,
                autor=self.usuario,
            ).exists()
        )

    def test_directiva_no_ve_publicaciones_de_otra_directiva(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Publicaciones",
            comuna="Puente Alto",
            activa=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        otro_usuario = Usuario.objects.create_user(
            username="otra_directiva_usuario",
            email="otra.directiva@test.cl",
            password="ClaveSegura123!",
            rut="22222222-2",
            nombres="Otro",
            apellido_paterno="Directiva",
        )

        Publicacion.objects.create(
            directiva=otra_directiva,
            autor=otro_usuario,
            titulo="Comunicado de otra junta",
            contenido="Contenido privado de otra junta.",
            activa=True,
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.get(reverse("publicaciones-directiva-list-create"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        titulos = [publicacion["titulo"] for publicacion in response.data]

        self.assertNotIn(
            "Comunicado de otra junta",
            titulos,
        )

    def test_integrante_directiva_puede_subir_adjunto(self):
        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado con archivo",
            contenido="Comunicado de prueba.",
            activa=True,
        )

        archivo = SimpleUploadedFile(
            "aviso.txt",
            b"Contenido del archivo de prueba.",
            content_type="text/plain",
        )

        self.client.force_authenticate(user=self.usuario)

        with TemporaryDirectory() as media_root:
            with self.settings(MEDIA_ROOT=media_root):
                response = self.client.post(
                    reverse(
                        "adjuntos-publicacion-create",
                        kwargs={
                            "publicacion_id": publicacion.id,
                        },
                    ),
                    {
                        "archivo": archivo,
                    },
                    format="multipart",
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_201_CREATED,
                )

                adjunto = AdjuntoPublicacion.objects.get()

                self.assertEqual(
                    adjunto.publicacion,
                    publicacion,
                )

                self.assertEqual(
                    adjunto.nombre_original,
                    "aviso.txt",
                )

                self.assertTrue(adjunto.archivo.name.endswith("aviso.txt"))

    def test_integrante_directiva_puede_descargar_adjunto(self):
        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado descargable",
            contenido="Contenido de prueba.",
            activa=True,
        )

        archivo = SimpleUploadedFile(
            "documento.txt",
            b"Contenido protegido.",
            content_type="text/plain",
        )

        with TemporaryDirectory() as media_root:
            with self.settings(MEDIA_ROOT=media_root):
                adjunto = AdjuntoPublicacion.objects.create(
                    publicacion=publicacion,
                    archivo=archivo,
                    nombre_original="documento.txt",
                )

                self.client.force_authenticate(user=self.usuario)

                response = self.client.get(
                    reverse(
                        "adjuntos-publicacion-descargar",
                        kwargs={
                            "pk": adjunto.id,
                        },
                    )
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )

                self.assertEqual(
                    response["Content-Disposition"],
                    'inline; filename="documento.txt"',
                )

                for closer in list(response._resource_closers):
                    closer()

                response._resource_closers.clear()

    def test_publicacion_genera_notificacion_para_vecino_misma_junta(self):
        vecino_destinatario = Usuario.objects.create_user(
            username="vecino_notificado",
            email="vecino.notificado@test.cl",
            password="ClaveSegura123!",
            rut="33333333-3",
            nombres="Vecino",
            apellido_paterno="Notificado",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=vecino_destinatario,
            rol=self.rol_vecino,
            activo=True,
        )

        self.client.force_authenticate(user=self.usuario)

        response = self.client.post(
            reverse("publicaciones-directiva-list-create"),
            {
                "directiva": self.directiva.id,
                "titulo": "Aviso para los vecinos",
                "contenido": ("Este comunicado debe generar " "una notificación."),
                "activa": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        publicacion = Publicacion.objects.get(titulo="Aviso para los vecinos")

        self.assertTrue(
            Notificacion.objects.filter(
                publicacion=publicacion,
                usuario=vecino_destinatario,
                leida=False,
            ).exists()
        )

        self.assertFalse(
            Notificacion.objects.filter(
                publicacion=publicacion,
                usuario=self.usuario,
            ).exists()
        )

    def test_usuario_solo_puede_ver_sus_notificaciones(self):
        vecino_destinatario = Usuario.objects.create_user(
            username="vecino_notificaciones",
            email="vecino.notificaciones@test.cl",
            password="ClaveSegura123!",
            rut="44444444-4",
            nombres="Vecino",
            apellido_paterno="Notificaciones",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_notificaciones",
            email="otro.vecino.notificaciones@test.cl",
            password="ClaveSegura123!",
            rut="55555555-5",
            nombres="Otro",
            apellido_paterno="Vecino",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado de notificaciones",
            contenido="Contenido de prueba.",
            activa=True,
        )

        notificacion_propia = Notificacion.objects.create(
            publicacion=publicacion,
            usuario=vecino_destinatario,
        )

        Notificacion.objects.create(
            publicacion=publicacion,
            usuario=otro_vecino,
        )

        self.client.force_authenticate(user=vecino_destinatario)

        response = self.client.get(reverse("notificaciones-list"))

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            notificacion_propia.id,
        )

    def test_usuario_puede_marcar_notificacion_como_leida(self):
        vecino_destinatario = Usuario.objects.create_user(
            username="vecino_lectura",
            email="vecino.lectura@test.cl",
            password="ClaveSegura123!",
            rut="66666666-6",
            nombres="Vecino",
            apellido_paterno="Lectura",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado para lectura",
            contenido="Contenido de prueba.",
            activa=True,
        )

        notificacion = Notificacion.objects.create(
            publicacion=publicacion,
            usuario=vecino_destinatario,
        )

        self.client.force_authenticate(user=vecino_destinatario)

        response = self.client.patch(
            reverse(
                "notificaciones-detail",
                kwargs={
                    "pk": notificacion.id,
                },
            ),
            {
                "leida": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        notificacion.refresh_from_db()

        self.assertTrue(notificacion.leida)

        self.assertIsNotNone(notificacion.fecha_lectura)
