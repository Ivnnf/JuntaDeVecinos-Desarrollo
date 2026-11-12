
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type TipoSolicitud = 'CONSULTA' | 'RECLAMO' | 'SOLICITUD'

type EstadoSolicitud =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'RESPONDIDA'
  | 'CERRADA'

type SolicitudVecino = {
  id: number
  vecino: number
  vecino_username: string
  junta_vecinos: number
  junta_nombre: string
  tipo: TipoSolicitud
  asunto: string
  descripcion: string
  estado: EstadoSolicitud
  respuesta: string
  respondido_por: number | null
  respondido_por_username: string | null
  fecha_respuesta: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

const API = 'http://localhost:8000'

function SolicitudesVecinoPage() {
  const [solicitudes, setSolicitudes] =
    useState<SolicitudVecino[]>([])

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [tipo, setTipo] =
    useState<TipoSolicitud>('CONSULTA')

  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)

  // ==================================
  // CARGAR SOLICITUDES
  // ==================================

  useEffect(() => {
    const controlador = new AbortController()

    const cargarSolicitudes = async () => {
      try {
        const response = await fetch(
          `${API}/api/solicitudes/solicitudes/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible cargar tus solicitudes.'
          )
        }

        const data =
          (await response.json()) as SolicitudVecino[]

        if (!controlador.signal.aborted) {
          setSolicitudes(data)
          setErrorCarga('')
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setErrorCarga(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.'
          )
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargarSolicitudes()

    return () => controlador.abort()
  }, [])

  // ==================================
  // CREAR SOLICITUD
  // ==================================

  const crearSolicitud = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!asunto.trim() || !descripcion.trim()) {
      setErrorEnvio(
        'Debes completar el asunto y la descripción.'
      )
      return
    }

    setEnviando(true)
    setMensaje('')
    setErrorEnvio('')

    try {
      const response = await fetch(
        `${API}/api/solicitudes/solicitudes/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo,
            asunto: asunto.trim(),
            descripcion: descripcion.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const detalle =
          typeof data.detail === 'string'
            ? data.detail
            : 'No fue posible enviar la solicitud.'

        throw new Error(detalle)
      }

      const nuevaSolicitud = data as SolicitudVecino

      setSolicitudes((actuales) => [
        nuevaSolicitud,
        ...actuales,
      ])

      setTipo('CONSULTA')
      setAsunto('')
      setDescripcion('')

      setMensaje('Solicitud enviada correctamente.')
    } catch (err) {
      setErrorEnvio(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setEnviando(false)
    }
  }

  // ==================================
  // FUNCIONES AUXILIARES
  // ==================================

  const nombreTipo = (valor: TipoSolicitud) => {
    switch (valor) {
      case 'CONSULTA':
        return 'Consulta'
      case 'RECLAMO':
        return 'Reclamo'
      case 'SOLICITUD':
        return 'Solicitud'
    }
  }

  const nombreEstado = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente'
      case 'EN_PROCESO':
        return 'En proceso'
      case 'RESPONDIDA':
        return 'Respondida'
      case 'CERRADA':
        return 'Cerrada'
    }
  }

  const claseEstado = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'sv-badge sv-warning'
      case 'EN_PROCESO':
        return 'sv-badge sv-info'
      case 'RESPONDIDA':
        return 'sv-badge sv-success'
      case 'CERRADA':
        return 'sv-badge sv-muted'
    }
  }

  const claseTipo = (valor: TipoSolicitud) => {
    switch (valor) {
      case 'CONSULTA':
        return 'sv-badge sv-info'
      case 'RECLAMO':
        return 'sv-badge sv-danger'
      case 'SOLICITUD':
        return 'sv-badge'
    }
  }

  const formatearFecha = (fecha: string) => {
    const valor = new Date(fecha)

    if (Number.isNaN(valor.getTime())) {
      return 'Sin información'
    }

    return valor.toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // ==================================
  // ESTADÍSTICAS
  // ==================================

  const pendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === 'PENDIENTE'
  ).length

  const enProceso = solicitudes.filter(
    (solicitud) => solicitud.estado === 'EN_PROCESO'
  ).length

  const respondidas = solicitudes.filter(
    (solicitud) => solicitud.estado === 'RESPONDIDA'
  ).length

  const cerradas = solicitudes.filter(
    (solicitud) => solicitud.estado === 'CERRADA'
  ).length

  const resumen = [
    {
      titulo: 'Pendientes',
      valor: pendientes,
      etiqueta: 'Pendientes',
      clase: 'sv-warning',
    },
    {
      titulo: 'En proceso',
      valor: enProceso,
      etiqueta: 'Gestionando',
      clase: 'sv-info',
    },
    {
      titulo: 'Respondidas',
      valor: respondidas,
      etiqueta: 'Respondidas',
      clase: 'sv-success',
    },
    {
      titulo: 'Cerradas',
      valor: cerradas,
      etiqueta: 'Finalizadas',
      clase: 'sv-muted',
    },
  ]

  return (
    <main className="solicitudes-vecino-bosque">
      <style>{`
        /* =====================================
           ESTILO GENERAL VERDE BOSQUE
           ===================================== */

        .solicitudes-vecino-bosque {
          --sv-oro: #d7ac32;
          --sv-oro-claro: #f0d375;
          --sv-crema: #f6efd9;
          --sv-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 20px;

          background-color: #092318;

          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/vecino-solicitudes.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: var(--sv-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .solicitudes-vecino-bosque,
        .solicitudes-vecino-bosque * {
          box-sizing: border-box;
        }

        .solicitudes-vecino-bosque .sv-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* =====================================
           PANELES TRANSPARENTES
           ===================================== */

        .solicitudes-vecino-bosque .sv-panel {
          background: rgba(8, 29, 19, 0.74);
          border: 1px solid rgba(215, 172, 50, 0.35);
          border-radius: 22px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.20);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* =====================================
           TIPOGRAFÍA
           ===================================== */

        .solicitudes-vecino-bosque h1,
        .solicitudes-vecino-bosque h2,
        .solicitudes-vecino-bosque h3,
        .solicitudes-vecino-bosque h4 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--sv-crema);
          line-height: 1.25;
        }

        .solicitudes-vecino-bosque .sv-title {
          margin: 0;
          font-size: clamp(29px, 3vw, 42px);
        }

        .solicitudes-vecino-bosque .sv-heading {
          margin: 0;
          font-size: 29px;
        }

        .solicitudes-vecino-bosque .sv-subtitle {
          margin: 9px 0 0;
          color: var(--sv-suave);
          font-size: 15px;
          line-height: 1.7;
        }

        /* =====================================
           ENCABEZADO
           ===================================== */

        .solicitudes-vecino-bosque .sv-header {
          padding: 30px;
          margin-bottom: 28px;
        }

        .solicitudes-vecino-bosque .sv-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .solicitudes-vecino-bosque .sv-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 12px;
        }

        /* =====================================
           ETIQUETAS
           ===================================== */

        .solicitudes-vecino-bosque .sv-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 15px;

          border-radius: 999px;
          border: 1px solid rgba(215, 172, 50, 0.55);
          background: rgba(215, 172, 50, 0.15);

          color: #edce70;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.3;
        }

        .solicitudes-vecino-bosque .sv-warning {
          background: rgba(180, 113, 22, 0.25);
          border-color: rgba(232, 180, 75, 0.65);
          color: #ffdf94;
        }

        .solicitudes-vecino-bosque .sv-info {
          background: rgba(31, 104, 121, 0.24);
          border-color: rgba(104, 181, 198, 0.55);
          color: #b8e9f2;
        }

        .solicitudes-vecino-bosque .sv-success {
          background: rgba(28, 125, 78, 0.25);
          border-color: rgba(80, 183, 125, 0.60);
          color: #a6eac4;
        }

        .solicitudes-vecino-bosque .sv-danger {
          background: rgba(145, 43, 45, 0.26);
          border-color: rgba(230, 116, 116, 0.60);
          color: #ffc4c1;
        }

        .solicitudes-vecino-bosque .sv-muted {
          background: rgba(230, 230, 210, 0.08);
          border-color: rgba(220, 220, 200, 0.25);
          color: #e6e9df;
        }

        /* =====================================
           BOTONES DORADOS
           ===================================== */

        .solicitudes-vecino-bosque .sv-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 46px;
          padding: 11px 22px;

          border-radius: 13px;
          border: 1px solid rgba(215, 172, 50, 0.70);
          background: rgba(215, 172, 50, 0.18);
          color: #f8e8b4;

          font: inherit;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .solicitudes-vecino-bosque .sv-button:hover {
          background: rgba(215, 172, 50, 0.35);
          color: #fff4d2;
          transform: translateY(-2px);
        }

        .solicitudes-vecino-bosque .sv-button-primary {
          background:
            linear-gradient(
              115deg,
              #e4c55b,
              #c49a28
            );

          color: #102419;
          border-color: #d7ac32;
          font-weight: 800;
        }

        .solicitudes-vecino-bosque .sv-button-primary:hover {
          background:
            linear-gradient(
              115deg,
              #f0d67c,
              #dfb646
            );

          color: #102419;
        }

        .solicitudes-vecino-bosque .sv-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* =====================================
           ESTADÍSTICAS
           ===================================== */

        .solicitudes-vecino-bosque .sv-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 29px;
        }

        .solicitudes-vecino-bosque .sv-stat {
          padding: 24px 25px;
          min-width: 0;
          transition: transform 0.2s ease;
        }

        .solicitudes-vecino-bosque .sv-stat:hover {
          transform: translateY(-3px);
        }

        .solicitudes-vecino-bosque .sv-stat-label {
          margin: 0 0 17px;
          color: #cbd2c4;
          font-size: 15px;
          font-weight: 600;
        }

        .solicitudes-vecino-bosque .sv-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .solicitudes-vecino-bosque .sv-stat-value {
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
          color: #d7ac32;
        }

        /* =====================================
           FORMULARIO
           ===================================== */

        .solicitudes-vecino-bosque .sv-form {
          overflow: hidden;
          margin-bottom: 32px;
        }

        .solicitudes-vecino-bosque .sv-form-header {
          padding: 27px 30px;
          border-bottom:
            1px solid rgba(215, 172, 50, 0.22);
        }

        .solicitudes-vecino-bosque .sv-form-body {
          padding: 30px;
        }

        .solicitudes-vecino-bosque .sv-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .solicitudes-vecino-bosque .sv-field {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .solicitudes-vecino-bosque .sv-field-full {
          grid-column: 1 / -1;
        }

        .solicitudes-vecino-bosque .sv-label {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;

          margin-bottom: 10px;
          color: #f0eddf;
          font-size: 14px;
          font-weight: 700;
        }

        .solicitudes-vecino-bosque .sv-required {
          color: #ffb8a7;
          font-size: 12px;
          font-weight: 500;
        }

        .solicitudes-vecino-bosque .sv-input {
          display: block;
          width: 100%;
          min-height: 50px;
          padding: 12px 15px;

          border: 1px solid rgba(215, 172, 50, 0.38);
          border-radius: 12px;
          outline: none;

          background: rgba(3, 20, 12, 0.72);
          color: #f6efd9;

          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .solicitudes-vecino-bosque .sv-input:focus {
          border-color: #e8c657;
          box-shadow:
            0 0 0 3px rgba(215, 172, 50, 0.15);
        }

        .solicitudes-vecino-bosque .sv-input::placeholder {
          color: #98ab99;
        }

        .solicitudes-vecino-bosque select.sv-input {
          color-scheme: dark;
          cursor: pointer;
        }

        .solicitudes-vecino-bosque .sv-input option {
          background: #102b1d;
          color: #f6efd9;
        }

        .solicitudes-vecino-bosque textarea.sv-input {
          min-height: 155px;
          resize: vertical;
        }

        .solicitudes-vecino-bosque .sv-field-hint {
          margin-top: 8px;
          color: #adbdae;
          font-size: 12px;
          line-height: 1.5;
        }

        .solicitudes-vecino-bosque .sv-counter {
          margin-top: 8px;
          color: #abbbaa;
          font-size: 12px;
          text-align: right;
        }

        .solicitudes-vecino-bosque .sv-form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 24px;
          border-top:
            1px solid rgba(215, 172, 50, 0.22);
        }

        /* =====================================
           ALERTAS
           ===================================== */

        .solicitudes-vecino-bosque .sv-alert {
          padding: 16px 20px;
          margin-bottom: 22px;

          border-radius: 13px;
          font-size: 14px;
          line-height: 1.6;
        }

        .solicitudes-vecino-bosque .sv-alert-error {
          background: rgba(118, 33, 35, 0.85);
          border: 1px solid rgba(231, 104, 104, 0.55);
          color: #ffe4e4;
        }

        .solicitudes-vecino-bosque .sv-alert-success {
          background: rgba(18, 93, 57, 0.83);
          border: 1px solid rgba(102, 201, 140, 0.50);
          color: #dbffe6;
        }

        .solicitudes-vecino-bosque .sv-alert-neutral {
          background: rgba(215, 172, 50, 0.10);
          border: 1px solid rgba(215, 172, 50, 0.28);
          color: #dfdecf;
        }

        /* =====================================
           LISTADO DE SOLICITUDES
           ===================================== */

        .solicitudes-vecino-bosque .sv-section-heading {
          margin-bottom: 22px;
        }

        .solicitudes-vecino-bosque .sv-empty {
          padding: 58px 25px;
          text-align: center;
        }

        .solicitudes-vecino-bosque .sv-empty-icon {
          display: grid;
          place-items: center;

          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;

          background: rgba(215, 172, 50, 0.17);
          color: #edce70;

          font-size: 28px;
          font-weight: 800;
        }

        .solicitudes-vecino-bosque .sv-empty h3 {
          margin: 0 0 13px;
          font-size: 25px;
        }

        .solicitudes-vecino-bosque .sv-empty p {
          max-width: 500px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        /* =====================================
           TARJETAS DE SOLICITUDES
           ===================================== */

        .solicitudes-vecino-bosque .sv-list {
          display: flex;
          flex-direction: column;
          gap: 23px;
        }

        .solicitudes-vecino-bosque .sv-card {
          overflow: hidden;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .solicitudes-vecino-bosque .sv-card:hover {
          transform: translateY(-2px);
          border-color: rgba(215, 172, 50, 0.68);
        }

        .solicitudes-vecino-bosque .sv-card-header {
          padding: 25px 28px;
          border-bottom:
            1px solid rgba(215, 172, 50, 0.22);
        }

        .solicitudes-vecino-bosque .sv-card-body {
          padding: 28px;
        }

        .solicitudes-vecino-bosque .sv-card-title {
          margin: 13px 0 7px;
          font-size: 26px;
        }

        .solicitudes-vecino-bosque .sv-card-subtitle {
          color: #cbd2c4;
          font-size: 14px;
        }

        .solicitudes-vecino-bosque .sv-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .solicitudes-vecino-bosque .sv-meta-label {
          margin: 0 0 8px;
          color: #afbdaf;

          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .solicitudes-vecino-bosque .sv-message-box {
          padding: 21px;
          border-radius: 14px;

          border: 1px solid rgba(215, 172, 50, 0.17);
          background: rgba(3, 20, 12, 0.47);

          color: #f6efd9;
          line-height: 1.8;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .solicitudes-vecino-bosque .sv-answer {
          margin-top: 22px;
          padding: 22px;

          border: 1px solid rgba(80, 183, 125, 0.45);
          border-radius: 15px;
          background: rgba(17, 84, 51, 0.20);
        }

        .solicitudes-vecino-bosque .sv-answer-heading {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 15px;
        }

        .solicitudes-vecino-bosque .sv-answer h4 {
          margin: 0;
          font-size: 20px;
        }

        .solicitudes-vecino-bosque .sv-answer-text {
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.8;
        }

        .solicitudes-vecino-bosque .sv-answer-meta {
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid rgba(80, 183, 125, 0.30);

          color: #cbd2c4;
          font-size: 13px;
          line-height: 1.6;
        }

        .solicitudes-vecino-bosque .sv-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;

          margin-top: 25px;
          padding-top: 20px;
          border-top:
            1px solid rgba(215, 172, 50, 0.22);
        }

        /* =====================================
           ACCESIBILIDAD
           ===================================== */

        .solicitudes-vecino-bosque button:focus-visible,
        .solicitudes-vecino-bosque a:focus-visible,
        .solicitudes-vecino-bosque .sv-input:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 1100px) {
          .solicitudes-vecino-bosque .sv-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 750px) {
          .solicitudes-vecino-bosque .sv-form-grid {
            grid-template-columns: 1fr;
          }

          .solicitudes-vecino-bosque .sv-field-full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .solicitudes-vecino-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .solicitudes-vecino-bosque .sv-header,
          .solicitudes-vecino-bosque .sv-form-header,
          .solicitudes-vecino-bosque .sv-form-body,
          .solicitudes-vecino-bosque .sv-card-header,
          .solicitudes-vecino-bosque .sv-card-body {
            padding: 22px;
          }

          .solicitudes-vecino-bosque .sv-stats {
            gap: 12px;
          }

          .solicitudes-vecino-bosque .sv-stat {
            padding: 18px;
          }

          .solicitudes-vecino-bosque .sv-stat-value {
            font-size: 28px;
          }

          .solicitudes-vecino-bosque .sv-title {
            font-size: 29px;
          }
        }


        /* ================================================
           APT | IDENTIDAD VISUAL OFICIAL - EDICION FOTOGRAFICA
           Las fotografias son secundarias al contenido.
           ================================================ */

        .solicitudes-vecino-bosque {
          --sv-oro: #e2bf62;
          --sv-oro-claro: #f3dc98;
          --sv-crema: #fbf4e2;
          --sv-suave: #d3d9cf;
          background-color: #0b241b;
          background-image:
            linear-gradient(120deg, rgba(5, 25, 18, .62), rgba(5, 25, 18, .56)),
            url('/vecino-solicitudes.webp');
        }

        .solicitudes-vecino-bosque .sv-container {
          max-width: 1320px;
        }

        .solicitudes-vecino-bosque .sv-panel {
          background-color: rgba(13, 43, 31, .92);
          border: 1px solid rgba(216, 184, 98, .42);
          border-radius: 24px;
          box-shadow: 0 18px 44px rgba(3, 17, 12, .28);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }

        /* Fotografia en el encabezado principal. */
        .solicitudes-vecino-bosque .sv-header {
          min-height: 160px;
          padding: 30px 33px;
          overflow: hidden;
          background-image:
            linear-gradient(115deg, rgba(7, 34, 24, .82), rgba(8, 37, 28, .83)),
            url('/registro-vecino.webp');
          background-size: cover;
          background-position: center 48%;
          background-repeat: no-repeat;
        }

        .solicitudes-vecino-bosque .sv-title {
          font-size: clamp(32px, 3.2vw, 47px);
          letter-spacing: -.6px;
        }

        .solicitudes-vecino-bosque .sv-subtitle {
          color: #d5d9cf;
        }

        /* Cuatro estadisticas con una fotografia propia. */
        .solicitudes-vecino-bosque .sv-stat {
          min-height: 122px;
          overflow: hidden;
          padding: 23px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform .24s ease, border-color .24s ease;
        }

        .solicitudes-vecino-bosque .sv-stat:nth-child(1) {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .83), rgba(9, 39, 28, .85)),
            url('/registro-vecino.webp');
        }
        .solicitudes-vecino-bosque .sv-stat:nth-child(2) {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .82), rgba(9, 39, 28, .85)),
            url('/gestion-directiva.webp');
        }
        .solicitudes-vecino-bosque .sv-stat:nth-child(3) {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .83), rgba(9, 39, 28, .86)),
            url('/directivas.webp');
        }
        .solicitudes-vecino-bosque .sv-stat:nth-child(4) {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .83), rgba(9, 39, 28, .86)),
            url('/casitas.webp');
        }

        .solicitudes-vecino-bosque .sv-stat:hover {
          border-color: rgba(241, 213, 138, .68);
          transform: translateY(-3px);
        }
        .solicitudes-vecino-bosque .sv-stat-value {
          color: #f0ca68;
        }
        .solicitudes-vecino-bosque .sv-stat-label {
          color: #e0e2d7;
        }

        /* Fotografia tambien en la ficha completa de nueva solicitud. */
        .solicitudes-vecino-bosque .sv-form {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .86), rgba(8, 35, 25, .88)),
            url('/vecino-solicitudes.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .solicitudes-vecino-bosque .sv-form-header {
          background-image:
            linear-gradient(110deg, rgba(8, 35, 25, .72), rgba(8, 35, 25, .82)),
            url('/sector.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .solicitudes-vecino-bosque .sv-form-body {
          background-color: rgba(8, 30, 22, .45);
        }
        .solicitudes-vecino-bosque .sv-input {
          background: #eaf0f8;
          color: #142b22;
          border: 1px solid rgba(221, 190, 101, .58);
          border-radius: 12px;
          color-scheme: light;
        }
        .solicitudes-vecino-bosque .sv-input::placeholder {
          color: #65736d;
        }
        .solicitudes-vecino-bosque select.sv-input {
          color-scheme: light;
        }
        .solicitudes-vecino-bosque .sv-input option {
          background: #f3f6f9;
          color: #142b22;
        }
        .solicitudes-vecino-bosque .sv-label {
          color: #fff6e5;
        }
        .solicitudes-vecino-bosque .sv-required {
          color: #f2d17e;
        }

        /* Listado: el titulo, el vacio y las tarjetas contienen fotos. */
        .solicitudes-vecino-bosque .sv-list-section {
          padding: 25px 23px;
          border: 1px solid rgba(216, 184, 98, .37);
          border-radius: 24px;
          background-color: rgba(11, 39, 28, .90);
          background-image:
            linear-gradient(115deg, rgba(8, 32, 23, .87), rgba(8, 32, 23, .89)),
            url('/casitas.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: 0 18px 44px rgba(3, 17, 12, .25);
        }
        .solicitudes-vecino-bosque .sv-section-heading {
          padding: 5px 5px 0;
        }
        .solicitudes-vecino-bosque .sv-empty {
          background-image:
            linear-gradient(115deg, rgba(7, 33, 24, .84), rgba(9, 39, 28, .88)),
            url('/sector.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .solicitudes-vecino-bosque .sv-card {
          background-image:
            linear-gradient(115deg, rgba(7, 32, 23, .86), rgba(8, 36, 27, .89)),
            url('/vecino-solicitudes.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-color: rgba(216, 184, 98, .39);
        }
        .solicitudes-vecino-bosque .sv-card:nth-child(2n) {
          background-image:
            linear-gradient(115deg, rgba(7, 32, 23, .86), rgba(8, 36, 27, .89)),
            url('/gestion-directiva.webp');
        }
        .solicitudes-vecino-bosque .sv-card-header {
          background: rgba(5, 27, 19, .35);
        }
        .solicitudes-vecino-bosque .sv-card-body {
          background: rgba(7, 29, 21, .32);
        }
        .solicitudes-vecino-bosque .sv-message-box {
          background: rgba(5, 24, 17, .78);
          border: 1px solid rgba(216, 184, 98, .27);
        }
        .solicitudes-vecino-bosque .sv-answer {
          background: rgba(15, 64, 42, .74);
        }
        .solicitudes-vecino-bosque .sv-button-primary {
          background: linear-gradient(115deg, #f0d57f, #d4ac4c);
          color: #11291e;
        }
        .solicitudes-vecino-bosque .sv-button-primary:hover {
          background: linear-gradient(115deg, #ffe49b, #eac269);
          color: #11291e;
        }

        @media (max-width: 600px) {
          .solicitudes-vecino-bosque .sv-header {
            min-height: 0;
            padding: 23px;
          }
          .solicitudes-vecino-bosque .sv-list-section {
            padding: 18px 12px;
          }
          .solicitudes-vecino-bosque .sv-stat {
            min-height: 112px;
          }
        }


        /* PALETA FUNCIONAL: estados, tipologias y acciones. */
        .solicitudes-vecino-bosque .sv-stat { border-top:4px solid var(--sv-accent,#e1bf70); }
        .solicitudes-vecino-bosque .sv-stat:nth-child(1) { --sv-accent:#f3c476; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(2) { --sv-accent:#86cafa; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(3) { --sv-accent:#86deb0; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(4) { --sv-accent:#bac6d1; }
        .solicitudes-vecino-bosque .sv-stat .sv-stat-value { color:var(--sv-accent) !important; }
        .solicitudes-vecino-bosque .sv-stat .sv-stat-label { color:#f4f2e7; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(1) .sv-badge { border-color:#f3c476;color:#ffe1a5; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(2) .sv-badge { border-color:#86cafa;color:#c0e7ff; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(3) .sv-badge { border-color:#86deb0;color:#b6f1d2; }
        .solicitudes-vecino-bosque .sv-stat:nth-child(4) .sv-badge { border-color:#bac6d1;color:#e1e9ee; }

        /* Identidad de tipos independiente de los estados. */
        .solicitudes-vecino-bosque .sv-type-CONSULTA { --sv-type:#91d5f3; }
        .solicitudes-vecino-bosque .sv-type-RECLAMO { --sv-type:#f3a0a5; }
        .solicitudes-vecino-bosque .sv-type-SOLICITUD { --sv-type:#c5acfa; }
        .solicitudes-vecino-bosque .sv-card { border-left:5px solid var(--sv-type,#d8bd7d) !important; }
        .solicitudes-vecino-bosque .sv-card.sv-type-CONSULTA .sv-badges > span:first-child { background:rgba(42,108,144,.27);color:#c3eeff;border-color:#91d5f3; }
        .solicitudes-vecino-bosque .sv-card.sv-type-RECLAMO .sv-badges > span:first-child { background:rgba(135,41,58,.28);color:#ffd4d4;border-color:#f3a0a5; }
        .solicitudes-vecino-bosque .sv-card.sv-type-SOLICITUD .sv-badges > span:first-child { background:rgba(91,62,157,.26);color:#e7d7ff;border-color:#c5acfa; }
        .solicitudes-vecino-bosque .sv-card:hover { border-left-color:var(--sv-type,#d8bd7d) !important; }
        .solicitudes-vecino-bosque .sv-card-title { overflow-wrap:anywhere; }
        .solicitudes-vecino-bosque .sv-card .sv-badges .sv-warning { color:#ffe4a8;border-color:#edbc61; }
        .solicitudes-vecino-bosque .sv-card .sv-badges .sv-info { color:#bee9ff;border-color:#85c7ed; }
        .solicitudes-vecino-bosque .sv-card .sv-badges .sv-success { color:#bdf1d4;border-color:#87d4ad; }
        .solicitudes-vecino-bosque .sv-card .sv-badges .sv-muted { color:#e0e8eb;border-color:#a8b8bf; }
        .solicitudes-vecino-bosque .sv-answer { border-left:4px solid #86deb0;background:rgba(18,83,55,.52); }
        .solicitudes-vecino-bosque .sv-answer h4 { color:#bdf1d4; }

        /* Formulario y acciones: distinguir crear, volver y consultar. */
        .solicitudes-vecino-bosque .sv-form { border-top:4px solid #a6cffa; }
        .solicitudes-vecino-bosque .sv-form .sv-badge { color:#c3e5ff;border-color:#a6cffa;background:rgba(50,102,150,.25); }
        .solicitudes-vecino-bosque .sv-form .sv-button-primary { background:linear-gradient(110deg,#c0e7ff,#83c3ed);border-color:#a4dafa;color:#112c3a; }
        .solicitudes-vecino-bosque .sv-form .sv-button-primary:hover:not(:disabled) { background:linear-gradient(110deg,#e0f4ff,#a2d9fa);color:#112c3a; }
        .solicitudes-vecino-bosque .sv-input:focus { border-color:#9bd8f7;box-shadow:0 0 0 3px rgba(129,202,242,.2); }
        .solicitudes-vecino-bosque .sv-header > .sv-row > a.sv-button { border-color:#e7c77c;color:#f8e9b9; }
        .solicitudes-vecino-bosque .sv-header > .sv-row > a.sv-button:hover { color:#142c21; }
        .solicitudes-vecino-bosque .sv-alert-success { border-left:4px solid #88e6b2; }
        .solicitudes-vecino-bosque .sv-alert-error { border-left:4px solid #efa0a5; }
        @media (prefers-reduced-motion:reduce) {
          .solicitudes-vecino-bosque .sv-stat,.solicitudes-vecino-bosque .sv-card,.solicitudes-vecino-bosque .sv-button {transition:none;}
        }
      `}</style>

      <section className="sv-container">

        {/* ==================================
            ENCABEZADO
            ================================== */}

        <header className="sv-panel sv-header">
          <div className="sv-row">
            <div>
              <div className="sv-title-row">
                <h1 className="sv-title">
                  Consultas, Reclamos y Solicitudes
                </h1>

                <span className="sv-badge">
                  Vecino
                </span>
              </div>

              <p className="sv-subtitle">
                Envía nuevas solicitudes a tu Junta de Vecinos
                y revisa el estado de las gestiones que ya has
                realizado.
              </p>
            </div>

            <Link to="/vecino" className="sv-button">
              ← Volver al Panel
            </Link>
          </div>
        </header>

        {/* ==================================
            RESUMEN
            ================================== */}

        {!cargando && (
          <div className="sv-stats">
            {resumen.map((item) => (
              <div
                key={item.titulo}
                className="sv-panel sv-stat"
              >
                <p className="sv-stat-label">
                  {item.titulo}
                </p>

                <div className="sv-stat-bottom">
                  <span className="sv-stat-value">
                    {item.valor}
                  </span>

                  <span
                    className={`sv-badge ${item.clase}`}
                  >
                    {item.etiqueta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================
            NUEVA SOLICITUD
            ================================== */}

        <form
          onSubmit={crearSolicitud}
          className="sv-panel sv-form"
        >

          <div className="sv-form-header">
            <div className="sv-title-row">
              <h2 className="sv-heading">
                Nueva solicitud
              </h2>

              <span className="sv-badge">
                Nuevo
              </span>
            </div>

            <p className="sv-subtitle">
              Completa los datos para enviar una nueva
              gestión a la directiva.
            </p>
          </div>

          <div className="sv-form-body">

            {/* MENSAJE DE ÉXITO */}

            {mensaje && (
              <div
                className="sv-alert sv-alert-success"
                role="status"
              >
                {mensaje}
              </div>
            )}

            {/* ERRORES */}

            {errorCarga && (
              <div
                className="sv-alert sv-alert-error"
                role="alert"
              >
                {errorCarga}
              </div>
            )}

            {errorEnvio && (
              <div
                className="sv-alert sv-alert-error"
                role="alert"
              >
                {errorEnvio}
              </div>
            )}

            {/* CAMPOS DEL FORMULARIO */}

            <div className="sv-form-grid">

              {/* TIPO */}

              <label className="sv-field">
                <span className="sv-label">
                  Tipo
                  <span className="sv-required">
                    Obligatorio
                  </span>
                </span>

                <select
                  className="sv-input"
                  value={tipo}
                  onChange={(event) =>
                    setTipo(
                      event.target.value as TipoSolicitud
                    )
                  }
                  required
                >
                  <option value="CONSULTA">
                    Consulta
                  </option>

                  <option value="RECLAMO">
                    Reclamo
                  </option>

                  <option value="SOLICITUD">
                    Solicitud
                  </option>
                </select>

                <span className="sv-field-hint">
                  Selecciona la categoría que mejor
                  represente tu gestión.
                </span>
              </label>

              {/* ASUNTO */}

              <label className="sv-field">
                <span className="sv-label">
                  Asunto
                  <span className="sv-required">
                    Obligatorio
                  </span>
                </span>

                <input
                  type="text"
                  className="sv-input"
                  value={asunto}
                  onChange={(event) =>
                    setAsunto(event.target.value)
                  }
                  maxLength={200}
                  placeholder="Ej: Consulta sobre actividad comunitaria"
                  required
                />

                <span className="sv-counter">
                  {asunto.length}/200
                </span>
              </label>

              {/* DESCRIPCIÓN */}

              <label className="sv-field sv-field-full">
                <span className="sv-label">
                  Descripción
                  <span className="sv-required">
                    Obligatorio
                  </span>
                </span>

                <textarea
                  className="sv-input"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Explica tu consulta, reclamo o solicitud con el mayor detalle posible..."
                  required
                />

                <span className="sv-counter">
                  {descripcion.length} caracteres
                </span>
              </label>

            </div>

            {/* BOTÓN ENVIAR */}

            <div className="sv-form-actions">
              <button
                type="submit"
                className="sv-button sv-button-primary"
                disabled={enviando}
              >
                {enviando
                  ? 'Enviando...'
                  : 'Enviar solicitud'}
              </button>
            </div>

          </div>
        </form>

        {/* ==================================
            ESTADO DE CARGA
            ================================== */}

        {cargando && (
          <div
            className="sv-panel sv-alert"
            role="status"
          >
            Cargando tus solicitudes...
          </div>
        )}

        {/* ==================================
            LISTADO DE SOLICITUDES
            ================================== */}

        {!cargando && (
          <section className="sv-list-section">

            <div className="sv-row sv-section-heading">
              <div>
                <h2 className="sv-heading">
                  Mis solicitudes
                </h2>

                <p className="sv-subtitle">
                  Consulta el estado y las respuestas
                  de la directiva.
                </p>
              </div>

              {solicitudes.length > 0 && (
                <span className="sv-badge">
                  {solicitudes.length}{' '}
                  {solicitudes.length === 1
                    ? 'registro'
                    : 'registros'}
                </span>
              )}
            </div>

            {/* SIN SOLICITUDES */}

            {solicitudes.length === 0 ? (
              <div className="sv-panel sv-empty">
                <div className="sv-empty-icon">
                  +
                </div>

                <h3>
                  {errorCarga
                    ? 'No se pudieron consultar tus solicitudes'
                    : 'Aún no tienes solicitudes'}
                </h3>

                <p>
                  {errorCarga
                    ? 'No fue posible verificar tu historial. Revisa la conexión con el servidor.'
                    : 'Cuando envíes una consulta, reclamo o solicitud podrás revisar su avance en esta sección.'}
                </p>
              </div>
            ) : (

              <div className="sv-list">

                {solicitudes.map((solicitud) => (
                  <article
                    key={solicitud.id}
                    className={`sv-panel sv-card sv-type-${solicitud.tipo}`}
                  >

                    {/* CABECERA */}

                    <div className="sv-card-header">
                      <div className="sv-row">

                        <div style={{ flex: 1, minWidth: 0 }}>

                          <div className="sv-badges">

                            <span
                              className={claseTipo(
                                solicitud.tipo
                              )}
                            >
                              {nombreTipo(solicitud.tipo)}
                            </span>

                            <span
                              className={claseEstado(
                                solicitud.estado
                              )}
                            >
                              {nombreEstado(solicitud.estado)}
                            </span>

                            <span className="sv-badge sv-muted">
                              #{solicitud.id}
                            </span>

                          </div>

                          <h3 className="sv-card-title">
                            {solicitud.asunto}
                          </h3>

                          <p className="sv-card-subtitle">
                            {solicitud.junta_nombre}
                          </p>

                        </div>

                        <div>
                          <p className="sv-meta-label">
                            Enviada
                          </p>

                          <p className="sv-card-subtitle">
                            {formatearFecha(
                              solicitud.fecha_creacion
                            )}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* CONTENIDO */}

                    <div className="sv-card-body">

                      {/* MENSAJE DEL VECINO */}

                      <div>
                        <p className="sv-meta-label">
                          Tu mensaje
                        </p>

                        <div className="sv-message-box">
                          {solicitud.descripcion}
                        </div>
                      </div>

                      {/* RESPUESTA DE LA DIRECTIVA */}

                      {solicitud.respuesta && (
                        <div className="sv-answer">

                          <div className="sv-answer-heading">
                            <h4>
                              Respuesta de la Directiva
                            </h4>

                            <span className="sv-badge sv-success">
                              Respondida
                            </span>
                          </div>

                          <p className="sv-answer-text">
                            {solicitud.respuesta}
                          </p>

                          {solicitud.respondido_por_username && (
                            <div className="sv-answer-meta">
                              Respondido por{' '}
                              <strong>
                                {solicitud.respondido_por_username}
                              </strong>

                              {solicitud.fecha_respuesta && (
                                <>
                                  {' '}el{' '}
                                  {formatearFecha(
                                    solicitud.fecha_respuesta
                                  )}
                                </>
                              )}
                            </div>
                          )}

                        </div>
                      )}

                      {/* SIN RESPUESTA */}

                      {!solicitud.respuesta &&
                        solicitud.estado !== 'CERRADA' && (
                          <div
                            className="sv-alert sv-alert-neutral"
                            style={{ marginTop: 23, marginBottom: 0 }}
                          >
                            La directiva aún no ha registrado
                            una respuesta para esta solicitud.
                          </div>
                        )}

                      {/* PIE */}

                      <div className="sv-card-footer">

                        <span className="sv-card-subtitle">
                          Última actualización:{' '}
                          {formatearFecha(
                            solicitud.fecha_actualizacion
                          )}
                        </span>

                        <span
                          className={claseEstado(
                            solicitud.estado
                          )}
                        >
                          {nombreEstado(solicitud.estado)}
                        </span>

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            )}
          </section>
        )}

      </section>
    </main>
  )
}

export default SolicitudesVecinoPage
