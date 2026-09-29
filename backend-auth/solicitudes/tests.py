from datetime import date

from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
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

from .models import (
    HistorialSolicitudDocumento,
    SolicitudDocumento,
    SolicitudDocumentoArchivo,
    SolicitudVecino,
    TipoDocumento,
)


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


class SolicitudesDocumentoTests(APITestCase):
    def setUp(self):
        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Documentos HU12",
            comuna="Santiago",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Documentos HU12",
            activo=True,
        )

        self.rol_vecino = Rol.objects.get(
            nombre="Vecino",
        )
        self.rol_directiva = Rol.objects.get(
            nombre="Directiva",
        )

        self.vecino = Usuario.objects.create_user(
            username="vecino_documentos_hu12",
            email="vecino.documentos.hu12@test.cl",
            password="ClaveSegura123!",
            rut="20202020-9",
            nombres="Vecino",
            apellido_paterno="Documentos",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.vecino,
            rol=self.rol_vecino,
            activo=True,
        )

        self.usuario_directiva = Usuario.objects.create_user(
            username="directiva_documentos_hu12",
            email="directiva.documentos.hu12@test.cl",
            password="ClaveSegura123!",
            rut="21212121-0",
            nombres="Directiva",
            apellido_paterno="Documentos",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        UsuarioRol.objects.create(
            usuario=self.usuario_directiva,
            rol=self.rol_directiva,
            activo=True,
        )

        self.cargo_directiva = Cargo.objects.create(
            nombre="Presidente Documentos HU12",
            descripcion="Cargo para pruebas documentales HU-12",
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
            cargo=self.cargo_directiva,
            fecha_inicio=date(2026, 1, 1),
            activo=True,
        )
        self.tipo_activo = TipoDocumento.objects.create(
            nombre="Certificado de residencia",
            descripcion="Certificado solicitado a la junta.",
            activo=True,
        )

        self.tipo_inactivo = TipoDocumento.objects.create(
            nombre="Documento deshabilitado",
            descripcion="No debe estar disponible.",
            activo=False,
        )

    def test_lista_solo_tipos_documento_activos(self):
        self.client.force_authenticate(user=self.vecino)

        response = self.client.get(reverse("tipos-documento-activos"))

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
            self.tipo_activo.id,
        )

        self.assertEqual(
            response.data[0]["nombre"],
            "Certificado de residencia",
        )

    def test_vecino_puede_crear_solicitud_documento(self):
        self.client.force_authenticate(user=self.vecino)

        response = self.client.post(
            reverse("solicitudes-documento-vecino-list-create"),
            {
                "tipo_documento": self.tipo_activo.id,
                "motivo": (
                    "Necesito el certificado para realizar " "un trámite personal."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            SolicitudDocumento.objects.count(),
            1,
        )

        solicitud = SolicitudDocumento.objects.get()

        self.assertEqual(
            solicitud.vecino,
            self.vecino,
        )

        self.assertEqual(
            solicitud.junta_vecinos,
            self.junta,
        )

        self.assertEqual(
            solicitud.tipo_documento,
            self.tipo_activo,
        )

        self.assertEqual(
            solicitud.estado_actual,
            "PENDIENTE",
        )

        self.assertTrue(solicitud.numero_seguimiento.startswith("DOC-"))

        self.assertEqual(
            solicitud.historial.count(),
            1,
        )

        historial = solicitud.historial.get()

        self.assertIsNone(
            historial.estado_anterior,
        )

        self.assertEqual(
            historial.estado_nuevo,
            "PENDIENTE",
        )

        self.assertEqual(
            historial.usuario_responsable,
            self.vecino,
        )

    def test_vecino_no_puede_solicitar_tipo_documento_inactivo(self):
        self.client.force_authenticate(user=self.vecino)

        response = self.client.post(
            reverse("solicitudes-documento-vecino-list-create"),
            {
                "tipo_documento": self.tipo_inactivo.id,
                "motivo": ("Intento solicitar un documento " "que está deshabilitado."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            SolicitudDocumento.objects.count(),
            0,
        )

    def test_directiva_ve_solicitudes_documento_de_su_junta(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-001",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud documental de prueba.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.get(reverse("solicitudes-documento-directiva-list"))

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
            solicitud.id,
        )

        self.assertEqual(
            response.data[0]["numero_seguimiento"],
            "DOC-HU12-001",
        )

    def test_directiva_puede_aprobar_solicitud_documento(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-002",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Necesito el documento para un trámite.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.patch(
            reverse(
                "solicitud-documento-directiva-detail",
                kwargs={
                    "pk": solicitud.id,
                },
            ),
            {
                "estado_actual": "APROBADA",
                "comentario_respuesta": ("La solicitud fue revisada y aprobada."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        solicitud.refresh_from_db()

        self.assertEqual(
            solicitud.estado_actual,
            "APROBADA",
        )

        self.assertEqual(
            solicitud.responsable,
            self.usuario_directiva,
        )

        self.assertIsNotNone(
            solicitud.fecha_resolucion,
        )

        historial = solicitud.historial.get()

        self.assertEqual(
            historial.estado_anterior,
            "PENDIENTE",
        )

        self.assertEqual(
            historial.estado_nuevo,
            "APROBADA",
        )

        self.assertEqual(
            historial.usuario_responsable,
            self.usuario_directiva,
        )

        self.assertEqual(
            historial.comentario_respuesta,
            "La solicitud fue revisada y aprobada.",
        )

    def test_directiva_no_puede_gestionar_solicitud_documento_de_otra_junta(self):
        otra_junta = JuntaVecinos.objects.create(
            nombre="Otra Junta Documentos HU12",
            comuna="Santiago",
            activa=True,
        )

        otro_sector = Sector.objects.create(
            junta_vecinos=otra_junta,
            nombre="Otro Sector Documentos HU12",
            activo=True,
        )

        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_documentos_hu12",
            email="otro.vecino.documentos.hu12@test.cl",
            password="ClaveSegura123!",
            rut="22222222-1",
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

        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-003",
            tipo_documento=self.tipo_activo,
            vecino=otro_vecino,
            junta_vecinos=otra_junta,
            motivo="Solicitud de otra junta.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.patch(
            reverse(
                "solicitud-documento-directiva-detail",
                kwargs={
                    "pk": solicitud.id,
                },
            ),
            {
                "estado_actual": "APROBADA",
                "comentario_respuesta": ("Intento de aprobación no autorizado."),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        solicitud.refresh_from_db()

        self.assertEqual(
            solicitud.estado_actual,
            "PENDIENTE",
        )

        self.assertIsNone(
            solicitud.responsable,
        )

        self.assertIsNone(
            solicitud.fecha_resolucion,
        )

    def test_vecino_puede_adjuntar_archivo_a_su_solicitud_documento(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-004",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud con archivo adjunto.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        archivo = SimpleUploadedFile(
            "respaldo.pdf",
            b"contenido de prueba",
            content_type="application/pdf",
        )

        self.client.force_authenticate(user=self.vecino)

        response = self.client.post(
            reverse(
                "solicitud-documento-archivo-vecino-create",
                kwargs={
                    "solicitud_id": solicitud.id,
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

        self.assertEqual(
            SolicitudDocumentoArchivo.objects.count(),
            1,
        )

        archivo_guardado = SolicitudDocumentoArchivo.objects.get()

        self.assertEqual(
            archivo_guardado.solicitud,
            solicitud,
        )

        self.assertEqual(
            archivo_guardado.nombre_original,
            "respaldo.pdf",
        )

        self.assertEqual(
            archivo_guardado.tipo_uso,
            SolicitudDocumentoArchivo.TipoUso.ADJUNTO,
        )

        self.assertEqual(
            archivo_guardado.subido_por,
            self.vecino,
        )

    def test_vecino_no_puede_adjuntar_archivo_a_solicitud_ajena(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_archivo_hu12",
            email="otro.vecino.archivo.hu12@test.cl",
            password="ClaveSegura123!",
            rut="23232323-2",
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

        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-005",
            tipo_documento=self.tipo_activo,
            vecino=otro_vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud perteneciente a otro vecino.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        archivo = SimpleUploadedFile(
            "intento.pdf",
            b"contenido no autorizado",
            content_type="application/pdf",
        )

        self.client.force_authenticate(user=self.vecino)

        response = self.client.post(
            reverse(
                "solicitud-documento-archivo-vecino-create",
                kwargs={
                    "solicitud_id": solicitud.id,
                },
            ),
            {
                "archivo": archivo,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertEqual(
            SolicitudDocumentoArchivo.objects.count(),
            0,
        )

    def test_directiva_puede_subir_documento_emitido_en_solicitud_aprobada(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-006",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud aprobada para emisión.",
            estado_actual=SolicitudDocumento.Estado.APROBADA,
            responsable=self.usuario_directiva,
        )

        archivo = SimpleUploadedFile(
            "certificado_emitido.pdf",
            b"contenido del documento emitido",
            content_type="application/pdf",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.post(
            reverse(
                "solicitud-documento-archivo-directiva-create",
                kwargs={
                    "solicitud_id": solicitud.id,
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

        self.assertEqual(
            SolicitudDocumentoArchivo.objects.count(),
            1,
        )

        archivo_guardado = SolicitudDocumentoArchivo.objects.get()

        self.assertEqual(
            archivo_guardado.solicitud,
            solicitud,
        )

        self.assertEqual(
            archivo_guardado.nombre_original,
            "certificado_emitido.pdf",
        )

        self.assertEqual(
            archivo_guardado.tipo_uso,
            SolicitudDocumentoArchivo.TipoUso.DOCUMENTO_EMITIDO,
        )

        self.assertEqual(
            archivo_guardado.subido_por,
            self.usuario_directiva,
        )

    def test_directiva_no_puede_subir_documento_emitido_si_no_esta_aprobada(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-007",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud todavía pendiente.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        archivo = SimpleUploadedFile(
            "documento_no_autorizado.pdf",
            b"contenido de prueba",
            content_type="application/pdf",
        )

        self.client.force_authenticate(user=self.usuario_directiva)

        response = self.client.post(
            reverse(
                "solicitud-documento-archivo-directiva-create",
                kwargs={
                    "solicitud_id": solicitud.id,
                },
            ),
            {
                "archivo": archivo,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertEqual(
            SolicitudDocumentoArchivo.objects.count(),
            0,
        )

    def test_vecino_puede_descargar_archivo_de_su_solicitud(self):
        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-008",
            tipo_documento=self.tipo_activo,
            vecino=self.vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud para probar descarga.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        archivo_subido = SimpleUploadedFile(
            "documento_descarga.pdf",
            b"contenido para descargar",
            content_type="application/pdf",
        )

        archivo = SolicitudDocumentoArchivo.objects.create(
            solicitud=solicitud,
            archivo=archivo_subido,
            nombre_original="documento_descarga.pdf",
            tipo_uso=SolicitudDocumentoArchivo.TipoUso.ADJUNTO,
            subido_por=self.vecino,
        )

        self.client.force_authenticate(user=self.vecino)

        response = self.client.get(
            reverse(
                "solicitud-documento-archivo-download",
                kwargs={
                    "pk": archivo.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "attachment",
            response["Content-Disposition"],
        )

        self.assertIn(
            "documento_descarga.pdf",
            response["Content-Disposition"],
        )

    def test_vecino_no_puede_descargar_archivo_de_solicitud_ajena(self):
        otro_vecino = Usuario.objects.create_user(
            username="otro_vecino_descarga_hu12",
            email="otro.vecino.descarga.hu12@test.cl",
            password="ClaveSegura123!",
            rut="24242424-3",
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

        solicitud = SolicitudDocumento.objects.create(
            numero_seguimiento="DOC-HU12-009",
            tipo_documento=self.tipo_activo,
            vecino=otro_vecino,
            junta_vecinos=self.junta,
            motivo="Solicitud perteneciente a otro vecino.",
            estado_actual=SolicitudDocumento.Estado.PENDIENTE,
        )

        archivo_subido = SimpleUploadedFile(
            "archivo_ajeno.pdf",
            b"contenido privado",
            content_type="application/pdf",
        )

        archivo = SolicitudDocumentoArchivo.objects.create(
            solicitud=solicitud,
            archivo=archivo_subido,
            nombre_original="archivo_ajeno.pdf",
            tipo_uso=SolicitudDocumentoArchivo.TipoUso.ADJUNTO,
            subido_por=otro_vecino,
        )

        self.client.force_authenticate(user=self.vecino)

        response = self.client.get(
            reverse(
                "solicitud-documento-archivo-download",
                kwargs={
                    "pk": archivo.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
