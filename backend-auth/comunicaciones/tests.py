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
    Conversacion,
    Mensaje,
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

    def test_vecino_misma_junta_puede_ver_detalle_publicacion(self):
        vecino = Usuario.objects.create_user(
            username="vecino_detalle",
            email="vecino.detalle@test.cl",
            password="ClaveSegura123!",
            rut="77777777-7",
            nombres="Vecino",
            apellido_paterno="Detalle",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado visible para vecino",
            contenido="Contenido completo del comunicado.",
            activa=True,
        )

        self.client.force_authenticate(user=vecino)

        response = self.client.get(
            reverse(
                "publicacion-detalle-vecino",
                kwargs={
                    "pk": publicacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            publicacion.id,
        )

        self.assertEqual(
            response.data["titulo"],
            "Comunicado visible para vecino",
        )

    def test_vecino_otra_junta_no_puede_ver_detalle_publicacion(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Junta Vecino Externo",
            comuna="Puente Alto",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Sector Vecino Externo",
            activo=True,
        )

        vecino_externo = Usuario.objects.create_user(
            username="vecino_externo",
            email="vecino.externo@test.cl",
            password="ClaveSegura123!",
            rut="88888888-8",
            nombres="Vecino",
            apellido_paterno="Externo",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=vecino_externo,
            rol=self.rol_vecino,
            activo=True,
        )

        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Comunicado privado de la junta",
            contenido="Este contenido no pertenece a la junta del vecino externo.",
            activa=True,
        )

        self.client.force_authenticate(user=vecino_externo)

        response = self.client.get(
            reverse(
                "publicacion-detalle-vecino",
                kwargs={
                    "pk": publicacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_no_permite_adjunto_con_extension_no_valida(self):
        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Publicación con adjunto inválido",
            contenido="Contenido de prueba.",
            activa=True,
        )

        archivo = SimpleUploadedFile(
            "archivo.exe",
            b"contenido de prueba",
            content_type="application/octet-stream",
        )

        self.client.force_authenticate(user=self.usuario)

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
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "archivo",
            response.data,
        )

    def test_no_permite_adjunto_mayor_a_10_mb(self):
        publicacion = Publicacion.objects.create(
            directiva=self.directiva,
            autor=self.usuario,
            titulo="Publicación con archivo muy grande",
            contenido="Contenido de prueba.",
            activa=True,
        )

        archivo = SimpleUploadedFile(
            "archivo_grande.pdf",
            b"a" * (10 * 1024 * 1024 + 1),
            content_type="application/pdf",
        )

        self.client.force_authenticate(user=self.usuario)

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
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "archivo",
            response.data,
        )


class ConversacionesTests(APITestCase):
    def setUp(self):
        self.rol_vecino, _ = Rol.objects.get_or_create(
            nombre="Vecino",
        )

        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Mensajeria HU13",
            comuna="Puente Alto",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Mensajeria HU13",
            activo=True,
        )

        self.directiva = Directiva.objects.create(
            junta_vecinos=self.junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_mensajeria_hu13",
            email="vecino.mensajeria.hu13@test.cl",
            password="ClaveSegura123!",
            rut="99999999-9",
            nombres="Vecino",
            apellido_paterno="Mensajeria",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

    def test_vecino_puede_iniciar_conversacion(self):
        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.post(
            reverse("conversaciones-vecino-list-create"),
            {
                "asunto": "Consulta sobre actividad comunitaria",
                "mensaje_inicial": (
                    "Quisiera información sobre " "la próxima actividad."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Conversacion.objects.count(),
            1,
        )

        conversacion = Conversacion.objects.get()

        self.assertEqual(
            conversacion.vecino,
            self.vecino,
        )

        self.assertEqual(
            conversacion.directiva,
            self.directiva,
        )

        self.assertEqual(
            conversacion.asunto,
            "Consulta sobre actividad comunitaria",
        )

        self.assertEqual(
            Mensaje.objects.count(),
            1,
        )

        mensaje = Mensaje.objects.get()

        self.assertEqual(
            mensaje.conversacion,
            conversacion,
        )

        self.assertEqual(
            mensaje.remitente,
            self.vecino,
        )

        self.assertEqual(
            mensaje.contenido,
            ("Quisiera información sobre " "la próxima actividad."),
        )

        self.assertFalse(
            mensaje.leido,
        )

    def test_directiva_puede_ver_conversaciones_recibidas(self):
        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        cargo = Cargo.objects.create(
            nombre="Presidente Mensajeria HU13",
            descripcion="Cargo para prueba HU13",
            permite_multiples=False,
            activo=True,
        )

        usuario_directiva = Usuario.objects.create_user(
            username="directiva_mensajeria_hu13",
            email="directiva.mensajeria.hu13@test.cl",
            password="ClaveSegura123!",
            rut="12121212-1",
            nombres="Directiva",
            apellido_paterno="Mensajeria",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=usuario_directiva,
            rol=rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=usuario_directiva,
            cargo=cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Consulta recibida por directiva",
        )

        Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Mensaje para la directiva.",
        )

        self.client.force_authenticate(
            user=usuario_directiva,
        )

        response = self.client.get(reverse("conversaciones-directiva-list"))

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
            conversacion.id,
        )

        self.assertEqual(
            response.data[0]["asunto"],
            "Consulta recibida por directiva",
        )

        self.assertEqual(
            len(response.data[0]["mensajes"]),
            1,
        )

    def test_directiva_puede_responder_conversacion(self):
        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        cargo = Cargo.objects.create(
            nombre="Secretario Mensajeria HU13",
            descripcion="Cargo para responder mensajes.",
            permite_multiples=False,
            activo=True,
        )

        usuario_directiva = Usuario.objects.create_user(
            username="directiva_respuesta_hu13",
            email="directiva.respuesta.hu13@test.cl",
            password="ClaveSegura123!",
            rut="13131313-2",
            nombres="Directiva",
            apellido_paterno="Respuesta",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=usuario_directiva,
            rol=rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=usuario_directiva,
            cargo=cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Consulta para responder",
        )

        Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Necesito orientación.",
        )

        self.client.force_authenticate(
            user=usuario_directiva,
        )

        response = self.client.post(
            reverse(
                "mensajes-directiva-create",
                kwargs={
                    "conversacion_id": conversacion.id,
                },
            ),
            {
                "contenido": (
                    "Tu consulta fue recibida. " "Te orientaremos por este medio."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            conversacion.mensajes.count(),
            2,
        )

        mensaje = conversacion.mensajes.order_by("fecha_envio").last()

        self.assertEqual(
            mensaje.remitente,
            usuario_directiva,
        )

        self.assertEqual(
            mensaje.contenido,
            ("Tu consulta fue recibida. " "Te orientaremos por este medio."),
        )

        self.assertFalse(
            mensaje.leido,
        )

    def test_vecino_puede_responder_su_conversacion(self):
        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Consulta con respuesta del vecino",
        )

        Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Mensaje inicial.",
        )

        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.post(
            reverse(
                "mensajes-vecino-create",
                kwargs={
                    "conversacion_id": conversacion.id,
                },
            ),
            {
                "contenido": ("Agrego información adicional " "sobre mi consulta."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            conversacion.mensajes.count(),
            2,
        )

        mensaje = conversacion.mensajes.order_by("fecha_envio").last()

        self.assertEqual(
            mensaje.remitente,
            self.vecino,
        )

        self.assertEqual(
            mensaje.contenido,
            ("Agrego información adicional " "sobre mi consulta."),
        )

        self.assertFalse(
            mensaje.leido,
        )

    def test_vecino_al_abrir_conversacion_marca_mensajes_recibidos_como_leidos(self):
        usuario_directiva = Usuario.objects.create_user(
            username="directiva_lectura_hu13",
            email="directiva.lectura.hu13@test.cl",
            password="ClaveSegura123!",
            rut="14141414-3",
            nombres="Directiva",
            apellido_paterno="Lectura",
        )

        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Consulta con mensaje pendiente",
        )

        mensaje = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=usuario_directiva,
            contenido="Respuesta pendiente de lectura.",
            leido=False,
        )

        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.get(
            reverse(
                "conversacion-vecino-detail",
                kwargs={
                    "pk": conversacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        mensaje.refresh_from_db()

        self.assertTrue(
            mensaje.leido,
        )

        self.assertIsNotNone(
            mensaje.fecha_lectura,
        )

    def test_directiva_al_abrir_conversacion_marca_mensajes_recibidos_como_leidos(self):
        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        cargo = Cargo.objects.create(
            nombre="Tesorero Mensajeria HU13",
            descripcion="Cargo para prueba de lectura.",
            permite_multiples=False,
            activo=True,
        )

        usuario_directiva = Usuario.objects.create_user(
            username="directiva_lectura_detalle_hu13",
            email="directiva.lectura.detalle.hu13@test.cl",
            password="ClaveSegura123!",
            rut="15151515-4",
            nombres="Directiva",
            apellido_paterno="LecturaDetalle",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=usuario_directiva,
            rol=rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=usuario_directiva,
            cargo=cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Mensaje pendiente para directiva",
        )

        mensaje = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Mensaje pendiente de lectura por directiva.",
            leido=False,
        )

        self.client.force_authenticate(
            user=usuario_directiva,
        )

        response = self.client.get(
            reverse(
                "conversacion-directiva-detail",
                kwargs={
                    "pk": conversacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        mensaje.refresh_from_db()

        self.assertTrue(
            mensaje.leido,
        )

        self.assertIsNotNone(
            mensaje.fecha_lectura,
        )

    def test_directiva_no_puede_acceder_a_conversacion_de_otra_junta(self):
        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Mensajeria HU13",
            comuna="Puente Alto",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector Mensajeria HU13",
            activo=True,
        )

        otra_directiva = Directiva.objects.create(
            junta_vecinos=otra_junta,
            fecha_inicio=date(2026, 1, 1),
            estado=Directiva.EstadoDirectiva.VIGENTE,
        )

        vecino_otra_junta = Usuario.objects.create_user(
            username="vecino_otra_junta_hu13",
            email="vecino.otra.junta.hu13@test.cl",
            password="ClaveSegura123!",
            rut="16161616-5",
            nombres="Vecino",
            apellido_paterno="OtraJunta",
            sector=otro_sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        conversacion = Conversacion.objects.create(
            vecino=vecino_otra_junta,
            directiva=otra_directiva,
            asunto="Conversacion privada otra junta",
        )

        cargo = Cargo.objects.create(
            nombre="Vocal Mensajeria HU13",
            descripcion="Cargo para prueba de privacidad.",
            permite_multiples=True,
            activo=True,
        )

        usuario_directiva = Usuario.objects.create_user(
            username="directiva_privacidad_hu13",
            email="directiva.privacidad.hu13@test.cl",
            password="ClaveSegura123!",
            rut="17171717-6",
            nombres="Directiva",
            apellido_paterno="Privacidad",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=usuario_directiva,
            rol=rol_directiva,
            activo=True,
        )

        IntegranteDirectiva.objects.create(
            directiva=self.directiva,
            usuario=usuario_directiva,
            cargo=cargo,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )

        self.client.force_authenticate(
            user=usuario_directiva,
        )

        response = self.client.get(
            reverse(
                "conversacion-directiva-detail",
                kwargs={
                    "pk": conversacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_vecino_no_puede_acceder_a_conversacion_de_otro_vecino(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_privacidad_hu13",
            email="otro.vecino.privacidad.hu13@test.cl",
            password="ClaveSegura123!",
            rut="18181818-7",
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

        conversacion = Conversacion.objects.create(
            vecino=otro_vecino,
            directiva=self.directiva,
            asunto="Conversacion privada de otro vecino",
        )

        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.get(
            reverse(
                "conversacion-vecino-detail",
                kwargs={
                    "pk": conversacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_vecino_no_puede_responder_conversacion_de_otro_vecino(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_respuesta_hu13",
            email="otro.vecino.respuesta.hu13@test.cl",
            password="ClaveSegura123!",
            rut="19191919-8",
            nombres="Otro",
            apellido_paterno="VecinoRespuesta",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=otro_vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        conversacion = Conversacion.objects.create(
            vecino=otro_vecino,
            directiva=self.directiva,
            asunto="Conversacion ajena",
        )

        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.post(
            reverse(
                "mensajes-vecino-create",
                kwargs={
                    "conversacion_id": conversacion.id,
                },
            ),
            {
                "contenido": ("Este mensaje no debería poder enviarse."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertEqual(
            conversacion.mensajes.count(),
            0,
        )

    def test_mensajes_se_muestran_en_orden_cronologico(self):
        conversacion = Conversacion.objects.create(
            vecino=self.vecino,
            directiva=self.directiva,
            asunto="Orden cronologico HU13",
        )

        mensaje_1 = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Primer mensaje.",
        )

        mensaje_2 = Mensaje.objects.create(
            conversacion=conversacion,
            remitente=self.vecino,
            contenido="Segundo mensaje.",
        )

        self.client.force_authenticate(
            user=self.vecino,
        )

        response = self.client.get(
            reverse(
                "conversacion-vecino-detail",
                kwargs={
                    "pk": conversacion.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["mensajes"]),
            2,
        )

        self.assertEqual(
            response.data["mensajes"][0]["id"],
            mensaje_1.id,
        )

        self.assertEqual(
            response.data["mensajes"][1]["id"],
            mensaje_2.id,
        )

        self.assertEqual(
            response.data["mensajes"][0]["contenido"],
            "Primer mensaje.",
        )

        self.assertEqual(
            response.data["mensajes"][1]["contenido"],
            "Segundo mensaje.",
        )
