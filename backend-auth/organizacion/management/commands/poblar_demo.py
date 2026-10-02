from datetime import date, datetime
from django.utils import timezone

from eventos.models import (
    AsistenciaEvento,
    Evento,
    InscripcionEvento,
)
from django.core.management.base import BaseCommand

from organizacion.models import (
    Cargo,
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
)

from profiles.models import Rol, Usuario, UsuarioRol
from solicitudes.models import (
    HistorialSolicitudDocumento,
    HistorialSolicitudVecino,
    SolicitudDocumento,
    SolicitudVecino,
    TipoDocumento,
)
from comunicaciones.models import (
    Conversacion,
    Mensaje,
    RolRemitente,
)

class Command(BaseCommand):
    help = "Crea datos ficticios para la demostración del sistema."

    def handle(self, *args, **options):
        junta, junta_creada = JuntaVecinos.objects.get_or_create(
            nombre="Junta Vecinal Condominio Los Alerces",
            defaults={
                "comuna": "Santiago",
                "descripcion": (
                    "Junta de Vecinos ficticia utilizada para "
                    "demostraciones del sistema."
                ),
                "activa": True,
            },
        )

        torre_norte, norte_creado = Sector.objects.get_or_create(
            junta_vecinos=junta,
            nombre="Torre Norte",
            defaults={
                "descripcion": (
                    "Sector correspondiente a los vecinos "
                    "residentes de la Torre Norte."
                ),
                "activo": True,
            },
        )

        torre_sur, sur_creado = Sector.objects.get_or_create(
            junta_vecinos=junta,
            nombre="Torre Sur",
            defaults={
                "descripcion": (
                    "Sector correspondiente a los vecinos "
                    "residentes de la Torre Sur."
                ),
                "activo": True,
            },
        )

        self.stdout.write(
            self.style.SUCCESS("Datos base de demostración creados correctamente.")
        )

        self.stdout.write(
            f"Junta: {junta.nombre} " f"({'creada' if junta_creada else 'existente'})"
        )

        self.stdout.write(
            f"Sector: {torre_norte.nombre} "
            f"({'creado' if norte_creado else 'existente'})"
        )

        self.stdout.write(
            f"Sector: {torre_sur.nombre} "
            f"({'creado' if sur_creado else 'existente'})"
        )
        # Roles
        rol_vecino, _ = Rol.objects.get_or_create(
            nombre="Vecino",
        )

        rol_directiva, _ = Rol.objects.get_or_create(
            nombre="Directiva",
        )

        # Usuarios de demostración
        usuarios_demo = [
            {
                "username": "carolina.soto",
                "email": "carolina.soto@example.com",
                "rut": "11111111-1",
                "nombres": "Carolina",
                "apellido_paterno": "Soto",
                "apellido_materno": "Muñoz",
                "sector": torre_norte,
                "estado": "CONFIRMADA",
                "roles": [rol_vecino, rol_directiva],
            },
            {
                "username": "diego.morales",
                "email": "diego.morales@example.com",
                "rut": "12222222-2",
                "nombres": "Diego",
                "apellido_paterno": "Morales",
                "apellido_materno": "Rojas",
                "sector": torre_sur,
                "estado": "CONFIRMADA",
                "roles": [rol_vecino, rol_directiva],
            },
            {
                "username": "paula.rojas",
                "email": "paula.rojas@example.com",
                "rut": "13333333-3",
                "nombres": "Paula",
                "apellido_paterno": "Rojas",
                "apellido_materno": "Silva",
                "sector": torre_norte,
                "estado": "CONFIRMADA",
                "roles": [rol_vecino],
            },
            {
                "username": "andres.silva",
                "email": "andres.silva@example.com",
                "rut": "14444444-4",
                "nombres": "Andrés",
                "apellido_paterno": "Silva",
                "apellido_materno": "Torres",
                "sector": torre_sur,
                "estado": "CONFIRMADA",
                "roles": [rol_vecino],
            },
            {
                "username": "camila.perez",
                "email": "camila.perez@example.com",
                "rut": "15555555-5",
                "nombres": "Camila",
                "apellido_paterno": "Pérez",
                "apellido_materno": "González",
                "sector": torre_norte,
                "estado": "PENDIENTE",
                "roles": [rol_vecino],
            },
            {
                "username": "felipe.torres",
                "email": "felipe.torres@example.com",
                "rut": "16666666-6",
                "nombres": "Felipe",
                "apellido_paterno": "Torres",
                "apellido_materno": "Castro",
                "sector": None,
                "estado": None,
                "roles": [rol_vecino],
            },
        ]

        for datos in usuarios_demo:
            roles = datos.pop("roles")
            estado = datos.pop("estado")
            sector = datos.pop("sector")

            usuario, creado = Usuario.objects.get_or_create(
                username=datos["username"],
                defaults={
                    **datos,
                    "sector": sector,
                    "estado_asociacion_sector": estado,
                },
            )

            # Solo modificamos estas cuentas ficticias de demo.
            usuario.email = datos["email"]
            usuario.rut = datos["rut"]
            usuario.nombres = datos["nombres"]
            usuario.apellido_paterno = datos["apellido_paterno"]
            usuario.apellido_materno = datos["apellido_materno"]
            usuario.sector = sector
            usuario.estado_asociacion_sector = estado
            usuario.set_password("Demo2026!")
            usuario.save()

            for rol in roles:
                UsuarioRol.objects.get_or_create(
                    usuario=usuario,
                    rol=rol,
                    defaults={
                        "activo": True,
                    },
                )

            self.stdout.write(
                f"Usuario: {usuario.username} "
                f"({'creado' if creado else 'existente'})"
            )
            # Cargos de la Directiva
        cargo_presidenta, _ = Cargo.objects.get_or_create(
            nombre="Presidenta",
            defaults={
                "descripcion": ("Representa y coordina la gestión de la Directiva."),
                "permite_multiples": False,
                "activo": True,
            },
        )

        cargo_secretario, _ = Cargo.objects.get_or_create(
            nombre="Secretario",
            defaults={
                "descripcion": (
                    "Apoya la gestión administrativa y documental " "de la Directiva."
                ),
                "permite_multiples": False,
                "activo": True,
            },
        )

        # Directiva vigente
        directiva, directiva_creada = Directiva.objects.get_or_create(
            junta_vecinos=junta,
            fecha_inicio=date(2026, 1, 1),
            defaults={
                "fecha_fin": date(2028, 12, 31),
                "estado": Directiva.EstadoDirectiva.VIGENTE,
                "observacion": ("Directiva ficticia creada para demostración."),
            },
        )

        # Usuarios integrantes
        carolina = Usuario.objects.get(
            username="carolina.soto",
        )

        diego = Usuario.objects.get(
            username="diego.morales",
        )

        integrante_carolina, carolina_creada = (
            IntegranteDirectiva.objects.get_or_create(
                directiva=directiva,
                usuario=carolina,
                defaults={
                    "cargo": cargo_presidenta,
                    "fecha_inicio": date(2026, 1, 1),
                    "fecha_fin": None,
                    "activo": True,
                },
            )
        )

        integrante_diego, diego_creado = IntegranteDirectiva.objects.get_or_create(
            directiva=directiva,
            usuario=diego,
            defaults={
                "cargo": cargo_secretario,
                "fecha_inicio": date(2026, 1, 1),
                "fecha_fin": None,
                "activo": True,
            },
        )

        self.stdout.write(
            f"Directiva Los Alerces: "
            f"{'creada' if directiva_creada else 'existente'}"
        )

        self.stdout.write(
            f"Presidenta: {carolina.username} "
            f"({'creada' if carolina_creada else 'existente'})"
        )

        self.stdout.write(
            f"Secretario: {diego.username} "
            f"({'creado' if diego_creado else 'existente'})"
        )
        # Usuarios vecinos para los eventos
        paula = Usuario.objects.get(
            username="paula.rojas",
        )

        andres = Usuario.objects.get(
            username="andres.silva",
        )

        # Evento finalizado
        reunion, reunion_creada = Evento.objects.get_or_create(
            directiva=directiva,
            titulo="Reunión General de Vecinos",
            defaults={
                "creador": carolina,
                "descripcion": (
                    "Reunión general para revisar temas de seguridad, "
                    "mantención y actividades de la comunidad."
                ),
                "lugar": "Salón comunitario",
                "fecha_inicio": timezone.make_aware(datetime(2026, 9, 20, 19, 0)),
                "fecha_fin": timezone.make_aware(datetime(2026, 9, 20, 21, 0)),
                "cupo_maximo": 40,
                "estado": Evento.Estado.FINALIZADO,
            },
        )

        # Evento programado 1
        seguridad, seguridad_creada = Evento.objects.get_or_create(
            directiva=directiva,
            titulo="Taller de Seguridad Vecinal",
            defaults={
                "creador": diego,
                "descripcion": (
                    "Actividad comunitaria sobre prevención, "
                    "seguridad y coordinación entre vecinos."
                ),
                "lugar": "Sala multiuso",
                "fecha_inicio": timezone.make_aware(datetime(2026, 10, 12, 18, 30)),
                "fecha_fin": timezone.make_aware(datetime(2026, 10, 12, 20, 0)),
                "cupo_maximo": 25,
                "estado": Evento.Estado.PROGRAMADO,
            },
        )

        # Evento programado 2
        limpieza, limpieza_creada = Evento.objects.get_or_create(
            directiva=directiva,
            titulo="Jornada de Limpieza Comunitaria",
            defaults={
                "creador": carolina,
                "descripcion": (
                    "Jornada colaborativa para ordenar y limpiar "
                    "los espacios comunes del condominio."
                ),
                "lugar": "Patio central",
                "fecha_inicio": timezone.make_aware(datetime(2026, 10, 24, 10, 0)),
                "fecha_fin": timezone.make_aware(datetime(2026, 10, 24, 13, 0)),
                "cupo_maximo": 30,
                "estado": Evento.Estado.PROGRAMADO,
            },
        )

        # Inscripciones al evento finalizado
        inscripcion_paula, _ = InscripcionEvento.objects.get_or_create(
            evento=reunion,
            usuario=paula,
            defaults={
                "estado": InscripcionEvento.Estado.INSCRITO,
            },
        )

        inscripcion_andres, _ = InscripcionEvento.objects.get_or_create(
            evento=reunion,
            usuario=andres,
            defaults={
                "estado": InscripcionEvento.Estado.INSCRITO,
            },
        )

        # Asistencia del evento finalizado
        AsistenciaEvento.objects.get_or_create(
            inscripcion=inscripcion_paula,
            defaults={
                "estado": AsistenciaEvento.Estado.PRESENTE,
                "registrado_por": carolina,
            },
        )

        AsistenciaEvento.objects.get_or_create(
            inscripcion=inscripcion_andres,
            defaults={
                "estado": AsistenciaEvento.Estado.AUSENTE,
                "registrado_por": carolina,
            },
        )

        # Inscripciones a próximos eventos
        InscripcionEvento.objects.get_or_create(
            evento=seguridad,
            usuario=paula,
            defaults={
                "estado": InscripcionEvento.Estado.INSCRITO,
            },
        )

        InscripcionEvento.objects.get_or_create(
            evento=seguridad,
            usuario=andres,
            defaults={
                "estado": InscripcionEvento.Estado.INSCRITO,
            },
        )

        InscripcionEvento.objects.get_or_create(
            evento=limpieza,
            usuario=paula,
            defaults={
                "estado": InscripcionEvento.Estado.INSCRITO,
            },
        )

        self.stdout.write(
            f"Evento: {reunion.titulo} "
            f"({'creado' if reunion_creada else 'existente'})"
        )

        self.stdout.write(
            f"Evento: {seguridad.titulo} "
            f"({'creado' if seguridad_creada else 'existente'})"
        )

        self.stdout.write(
            f"Evento: {limpieza.titulo} "
            f"({'creado' if limpieza_creada else 'existente'})"
        )
        # Solicitudes vecinales de demostración

        # 1. Reclamo de Paula - En proceso
        solicitud_iluminacion, iluminacion_creada = (
            SolicitudVecino.objects.get_or_create(
                vecino=paula,
                junta_vecinos=junta,
                tipo=SolicitudVecino.Tipo.RECLAMO,
                asunto="Iluminación del acceso principal",
                defaults={
                    "descripcion": (
                        "La iluminación del acceso principal presenta "
                        "fallas durante la noche y requiere revisión."
                    ),
                    "estado": SolicitudVecino.Estado.EN_PROCESO,
                },
            )
        )

        solicitud_iluminacion.estado = SolicitudVecino.Estado.EN_PROCESO
        solicitud_iluminacion.respuesta = ""
        solicitud_iluminacion.respondido_por = None
        solicitud_iluminacion.fecha_respuesta = None
        solicitud_iluminacion.save()

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_iluminacion,
            estado_anterior=None,
            estado_nuevo=SolicitudVecino.Estado.PENDIENTE,
            usuario_responsable=paula,
            comentario_respuesta="Solicitud ingresada por la vecina.",
        )

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_iluminacion,
            estado_anterior=SolicitudVecino.Estado.PENDIENTE,
            estado_nuevo=SolicitudVecino.Estado.EN_PROCESO,
            usuario_responsable=carolina,
            comentario_respuesta=(
                "La Directiva está revisando la situación " "con administración."
            ),
        )

        # 2. Consulta de Paula - Respondida
        solicitud_salon, salon_creada = SolicitudVecino.objects.get_or_create(
            vecino=paula,
            junta_vecinos=junta,
            tipo=SolicitudVecino.Tipo.CONSULTA,
            asunto="Horario de uso del salón comunitario",
            defaults={
                "descripcion": (
                    "Consulta sobre horarios disponibles para "
                    "utilizar el salón comunitario."
                ),
                "estado": SolicitudVecino.Estado.RESPONDIDA,
            },
        )

        solicitud_salon.estado = SolicitudVecino.Estado.RESPONDIDA
        solicitud_salon.respuesta = (
            "El salón comunitario puede utilizarse de lunes a "
            "domingo entre las 09:00 y las 22:00 horas, "
            "previa reserva."
        )
        solicitud_salon.respondido_por = diego
        solicitud_salon.fecha_respuesta = timezone.now()
        solicitud_salon.save()

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_salon,
            estado_anterior=None,
            estado_nuevo=SolicitudVecino.Estado.PENDIENTE,
            usuario_responsable=paula,
            comentario_respuesta="Consulta ingresada por la vecina.",
        )

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_salon,
            estado_anterior=SolicitudVecino.Estado.PENDIENTE,
            estado_nuevo=SolicitudVecino.Estado.RESPONDIDA,
            usuario_responsable=diego,
            comentario_respuesta=solicitud_salon.respuesta,
        )

        # 3. Solicitud de Andrés - Cerrada
        solicitud_luminaria, luminaria_creada = SolicitudVecino.objects.get_or_create(
            vecino=andres,
            junta_vecinos=junta,
            tipo=SolicitudVecino.Tipo.SOLICITUD,
            asunto="Revisión de luminaria Torre Sur",
            defaults={
                "descripcion": (
                    "Se solicita revisar una luminaria apagada "
                    "en el acceso de la Torre Sur."
                ),
                "estado": SolicitudVecino.Estado.CERRADA,
            },
        )

        solicitud_luminaria.estado = SolicitudVecino.Estado.CERRADA
        solicitud_luminaria.respuesta = (
            "La luminaria fue revisada y reemplazada correctamente."
        )
        solicitud_luminaria.respondido_por = carolina
        solicitud_luminaria.fecha_respuesta = timezone.now()
        solicitud_luminaria.save()

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_luminaria,
            estado_anterior=None,
            estado_nuevo=SolicitudVecino.Estado.PENDIENTE,
            usuario_responsable=andres,
            comentario_respuesta="Solicitud ingresada por el vecino.",
        )

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_luminaria,
            estado_anterior=SolicitudVecino.Estado.PENDIENTE,
            estado_nuevo=SolicitudVecino.Estado.EN_PROCESO,
            usuario_responsable=carolina,
            comentario_respuesta=("Se solicitó revisión de la luminaria."),
        )

        HistorialSolicitudVecino.objects.get_or_create(
            solicitud=solicitud_luminaria,
            estado_anterior=SolicitudVecino.Estado.EN_PROCESO,
            estado_nuevo=SolicitudVecino.Estado.CERRADA,
            usuario_responsable=carolina,
            comentario_respuesta=solicitud_luminaria.respuesta,
        )

        self.stdout.write(
            f"Solicitud: {solicitud_iluminacion.asunto} "
            f"({'creada' if iluminacion_creada else 'existente'})"
        )

        self.stdout.write(
            f"Solicitud: {solicitud_salon.asunto} "
            f"({'creada' if salon_creada else 'existente'})"
        )

        self.stdout.write(
            f"Solicitud: {solicitud_luminaria.asunto} "
            f"({'creada' if luminaria_creada else 'existente'})"
        )
                # Tipos de documentos de demostración
        certificado_residencia, _ = TipoDocumento.objects.get_or_create(
            nombre="Certificado de residencia",
            defaults={
                "descripcion": (
                    "Documento que acredita la residencia del vecino "
                    "en la comunidad."
                ),
                "activo": True,
            },
        )

        carta_respaldo, _ = TipoDocumento.objects.get_or_create(
            nombre="Carta de respaldo comunitario",
            defaults={
                "descripcion": (
                    "Carta emitida por la Junta de Vecinos para respaldar "
                    "una solicitud o trámite del vecino."
                ),
                "activo": True,
            },
        )

        # Solicitud de documento de Paula - En revisión
        documento_residencia, residencia_creada = (
            SolicitudDocumento.objects.get_or_create(
                numero_seguimiento="DOC-DEMO-001",
                defaults={
                    "tipo_documento": certificado_residencia,
                    "vecino": paula,
                    "junta_vecinos": junta,
                    "motivo": (
                        "Necesito acreditar domicilio para realizar "
                        "un trámite personal."
                    ),
                    "estado_actual": (
                        SolicitudDocumento.Estado.EN_REVISION
                    ),
                    "responsable": diego,
                },
            )
        )

        HistorialSolicitudDocumento.objects.get_or_create(
            solicitud=documento_residencia,
            estado_anterior=None,
            estado_nuevo=SolicitudDocumento.Estado.PENDIENTE,
            usuario_responsable=paula,
            comentario_respuesta=(
                "Solicitud de certificado ingresada por la vecina."
            ),
        )

        HistorialSolicitudDocumento.objects.get_or_create(
            solicitud=documento_residencia,
            estado_anterior=SolicitudDocumento.Estado.PENDIENTE,
            estado_nuevo=SolicitudDocumento.Estado.EN_REVISION,
            usuario_responsable=diego,
            comentario_respuesta=(
                "La Directiva está verificando los antecedentes."
            ),
        )

        # Solicitud de documento de Andrés - Rechazada
        documento_respaldo, respaldo_creado = (
            SolicitudDocumento.objects.get_or_create(
                numero_seguimiento="DOC-DEMO-002",
                defaults={
                    "tipo_documento": carta_respaldo,
                    "vecino": andres,
                    "junta_vecinos": junta,
                    "motivo": (
                        "Solicito una carta de respaldo para presentar "
                        "en una postulación comunitaria."
                    ),
                    "estado_actual": (
                        SolicitudDocumento.Estado.RECHAZADA
                    ),
                    "responsable": carolina,
                    "fecha_resolucion": timezone.now(),
                },
            )
        )

        HistorialSolicitudDocumento.objects.get_or_create(
            solicitud=documento_respaldo,
            estado_anterior=None,
            estado_nuevo=SolicitudDocumento.Estado.PENDIENTE,
            usuario_responsable=andres,
            comentario_respuesta=(
                "Solicitud de carta ingresada por el vecino."
            ),
        )

        HistorialSolicitudDocumento.objects.get_or_create(
            solicitud=documento_respaldo,
            estado_anterior=SolicitudDocumento.Estado.PENDIENTE,
            estado_nuevo=SolicitudDocumento.Estado.RECHAZADA,
            usuario_responsable=carolina,
            comentario_respuesta=(
                "La solicitud requiere antecedentes adicionales "
                "antes de poder emitir el documento."
            ),
        )

        self.stdout.write(
            f"Documento: {documento_residencia.numero_seguimiento} "
            f"({'creado' if residencia_creada else 'existente'})"
        )

        self.stdout.write(
            f"Documento: {documento_respaldo.numero_seguimiento} "
            f"({'creado' if respaldo_creado else 'existente'})"
        )
                # Conversación de demostración
        conversacion_iluminacion, conversacion_creada = (
            Conversacion.objects.get_or_create(
                vecino=paula,
                directiva=directiva,
                asunto="Consulta sobre iluminación del acceso",
                defaults={
                    "activa": True,
                },
            )
        )

        mensajes_demo = [
            {
                "remitente": paula,
                "rol": RolRemitente.VECINO,
                "contenido": (
                    "Buenas tardes. Quisiera consultar si existen "
                    "novedades sobre la iluminación del acceso principal."
                ),
                "leido": True,
            },
            {
                "remitente": carolina,
                "rol": RolRemitente.DIRECTIVA,
                "contenido": (
                    "Buenas tardes, Paula. La solicitud se encuentra "
                    "en revisión y ya fue informada a administración."
                ),
                "leido": True,
            },
            {
                "remitente": paula,
                "rol": RolRemitente.VECINO,
                "contenido": (
                    "Muchas gracias. Quedo atenta a cualquier novedad."
                ),
                "leido": True,
            },
            {
                "remitente": diego,
                "rol": RolRemitente.DIRECTIVA,
                "contenido": (
                    "Tenemos una actualización: se coordinó la revisión "
                    "de la luminaria para esta semana."
                ),
                "leido": False,
            },
        ]

        for datos_mensaje in mensajes_demo:
            mensaje, _ = Mensaje.objects.get_or_create(
                conversacion=conversacion_iluminacion,
                remitente=datos_mensaje["remitente"],
                rol_remitente=datos_mensaje["rol"],
                contenido=datos_mensaje["contenido"],
            )

            mensaje.leido = datos_mensaje["leido"]
            mensaje.fecha_lectura = (
                timezone.now()
                if datos_mensaje["leido"]
                else None
            )

            mensaje.save(
                update_fields=[
                    "leido",
                    "fecha_lectura",
                ]
            )

        # Actualiza el orden de la conversación
        conversacion_iluminacion.save()

        self.stdout.write(
            f"Conversación: {conversacion_iluminacion.asunto} "
            f"({'creada' if conversacion_creada else 'existente'})"
        )