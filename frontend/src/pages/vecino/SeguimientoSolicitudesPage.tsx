
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type HistorialSolicitud = {
  id: number
  estado_anterior: string | null
  estado_nuevo: string
  usuario_responsable: string
  comentario_respuesta: string
  fecha_cambio: string
}

type ArchivoSolicitud = {
  id: number
  nombre_original: string
  tipo_uso: string
  fecha_subida: string
}

type SolicitudSeguimiento = {
  id: number
  origen: 'VECINAL' | 'DOCUMENTO'
  numero_seguimiento: string
  tipo: string
  titulo: string
  fecha_ingreso: string
  estado_actual: string
  tiene_novedades: boolean
  respuesta_final: string
  fecha_respuesta: string | null
  historial: HistorialSolicitud[]
  archivos: ArchivoSolicitud[]
}

const API = 'http://localhost:8000'

function SeguimientoSolicitudesPage() {
  const [solicitudes, setSolicitudes] =
    useState<SolicitudSeguimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [solicitudExpandida, setSolicitudExpandida] =
    useState<string | null>(null)
  const [procesando, setProcesando] =
    useState<string | null>(null)

  // =====================================
  // CARGAR SOLICITUDES
  // =====================================

  useEffect(() => {
    const controlador = new AbortController()

    const cargarSolicitudes = async () => {
      try {
        const response = await fetch(
          `${API}/api/solicitudes/seguimiento/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )

        if (!response.ok) {
          throw new Error(
            'No se pudo cargar el seguimiento de solicitudes.'
          )
        }

        const data =
          (await response.json()) as SolicitudSeguimiento[]

        if (!controlador.signal.aborted) {
          setSolicitudes(data)
          setError('')
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al cargar las solicitudes.'
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

  // =====================================
  // FORMATEAR FECHAS
  // =====================================

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Sin fecha'

    const valor = new Date(fecha)

    if (Number.isNaN(valor.getTime())) {
      return 'Sin fecha'
    }

    return valor.toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // =====================================
  // ABRIR DETALLE Y MARCAR REVISADO
  // =====================================

  const alternarDetalle = async (
    solicitud: SolicitudSeguimiento
  ) => {
    const claveSolicitud =
      `${solicitud.origen}-${solicitud.id}`

    if (solicitudExpandida === claveSolicitud) {
      setSolicitudExpandida(null)
      return
    }

    setSolicitudExpandida(claveSolicitud)
    setErrorAccion('')

    if (!solicitud.tiene_novedades) return

    const tipoRuta =
      solicitud.origen === 'VECINAL'
        ? 'vecinal'
        : 'documento'

    setProcesando(claveSolicitud)

    try {
      const response = await fetch(
        `${API}/api/solicitudes/seguimiento/${tipoRuta}/${solicitud.id}/revisar/`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(
          'No se pudo marcar la solicitud como revisada.'
        )
      }

      setSolicitudes((actuales) =>
        actuales.map((item) =>
          item.id === solicitud.id &&
          item.origen === solicitud.origen
            ? {
                ...item,
                tiene_novedades: false,
              }
            : item
        )
      )
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la solicitud.'
      )
    } finally {
      setProcesando(null)
    }
  }

  // =====================================
  // DESCARGAR ARCHIVOS
  // =====================================

  const descargarArchivo = async (
    archivo: ArchivoSolicitud
  ) => {
    const claveArchivo = `archivo-${archivo.id}`
    setProcesando(claveArchivo)
    setErrorAccion('')

    try {
      const response = await fetch(
        `${API}/api/solicitudes/documentos/archivos/${archivo.id}/descargar/`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(
          'No se pudo descargar el archivo.'
        )
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = archivo.nombre_original

      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al descargar.'
      )
    } finally {
      setProcesando(null)
    }
  }

  // =====================================
  // COLORES DE ESTADOS
  // =====================================

  const claseEstado = (estado: string) => {
    const valor = estado.toUpperCase()

    if (
      valor.includes('APROB') ||
      valor.includes('RESPOND') ||
      valor.includes('CERRAD') ||
      valor.includes('FINALIZ')
    ) {
      return 'ss-badge ss-success'
    }

    if (
      valor.includes('RECHAZ') ||
      valor.includes('CANCEL')
    ) {
      return 'ss-badge ss-danger'
    }

    if (
      valor.includes('PROCESO') ||
      valor.includes('REVISION') ||
      valor.includes('REVISIÓN')
    ) {
      return 'ss-badge ss-info'
    }

    if (valor.includes('PENDIENTE')) {
      return 'ss-badge ss-warning'
    }

    return 'ss-badge'
  }

  // =====================================
  // ESTADÍSTICAS
  // =====================================

  const solicitudesConNovedades = solicitudes.filter(
    (solicitud) => solicitud.tiene_novedades
  ).length

  const solicitudesVecinales = solicitudes.filter(
    (solicitud) => solicitud.origen === 'VECINAL'
  ).length

  const solicitudesDocumento = solicitudes.filter(
    (solicitud) => solicitud.origen === 'DOCUMENTO'
  ).length

  const indicadores = [
    {
      titulo: 'Total solicitudes',
      valor: solicitudes.length,
      etiqueta: 'Registradas',
      clase: '',
    },
    {
      titulo: 'Con novedades',
      valor: solicitudesConNovedades,
      etiqueta:
        solicitudesConNovedades > 0 ? 'Nuevas' : 'Al día',
      clase:
        solicitudesConNovedades > 0
          ? 'ss-warning'
          : 'ss-muted',
    },
    {
      titulo: 'Solicitudes vecinales',
      valor: solicitudesVecinales,
      etiqueta: 'Vecinales',
      clase: 'ss-success',
    },
    {
      titulo: 'Documentos',
      valor: solicitudesDocumento,
      etiqueta: 'Documentos',
      clase: 'ss-info',
    },
  ]

  return (
    <main className="seguimiento-bosque">
      <style>{`
        /* =====================================
           FONDO FOTOGRÁFICO
           ===================================== */

        .seguimiento-bosque {
          --ss-oro: #d7ac32;
          --ss-crema: #f6efd9;
          --ss-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 20px;

          background-color: #092318;

          background-image:
            linear-gradient(
              120deg,
              rgba(4,23,16,0.35),
              rgba(4,23,16,0.48)
            ),
            url('/vecino-seguimiento.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: var(--ss-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .seguimiento-bosque,
        .seguimiento-bosque * {
          box-sizing: border-box;
        }

        .seguimiento-bosque .ss-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* PANELES */

        .seguimiento-bosque .ss-panel {
          background: rgba(8,29,19,0.74);
          border: 1px solid rgba(215,172,50,0.35);
          border-radius: 22px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.18);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TEXTOS */

        .seguimiento-bosque h1,
        .seguimiento-bosque h2,
        .seguimiento-bosque h3,
        .seguimiento-bosque h4 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--ss-crema);
          line-height: 1.25;
        }

        .seguimiento-bosque .ss-title {
          margin: 0;
          font-size: clamp(30px,3vw,42px);
        }

        .seguimiento-bosque .ss-heading {
          margin: 0;
          font-size: 29px;
        }

        .seguimiento-bosque .ss-subtitle {
          color: var(--ss-suave);
          font-size: 15px;
          line-height: 1.7;
          margin: 9px 0 0;
        }

        /* ENCABEZADO */

        .seguimiento-bosque .ss-header {
          padding: 30px;
          margin-bottom: 28px;
        }

        .seguimiento-bosque .ss-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .seguimiento-bosque .ss-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 12px;
        }

        /* BADGES */

        .seguimiento-bosque .ss-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 15px;
          border-radius: 999px;
          border: 1px solid rgba(215,172,50,0.55);
          background: rgba(215,172,50,0.15);
          color: #edce70;
          font-size: 13px;
          font-weight: 700;
        }

        .seguimiento-bosque .ss-warning {
          background: rgba(180,113,22,0.25);
          border-color: rgba(232,180,75,0.65);
          color: #ffdf94;
        }

        .seguimiento-bosque .ss-info {
          background: rgba(31,104,121,0.24);
          border-color: rgba(104,181,198,0.55);
          color: #b8e9f2;
        }

        .seguimiento-bosque .ss-success {
          background: rgba(28,125,78,0.25);
          border-color: rgba(80,183,125,0.60);
          color: #a6eac4;
        }

        .seguimiento-bosque .ss-danger {
          background: rgba(145,43,45,0.26);
          border-color: rgba(230,116,116,0.60);
          color: #ffc4c1;
        }

        .seguimiento-bosque .ss-muted {
          background: rgba(230,230,210,0.08);
          border-color: rgba(220,220,200,0.25);
          color: #e6e9df;
        }

        /* BOTONES */

        .seguimiento-bosque .ss-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 45px;
          padding: 11px 22px;
          border: 1px solid rgba(215,172,50,0.70);
          border-radius: 13px;
          background: rgba(215,172,50,0.18);
          color: #f8e8b4;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .seguimiento-bosque .ss-button:hover {
          background: rgba(215,172,50,0.36);
          color: #fff4d2;
          transform: translateY(-2px);
        }

        .seguimiento-bosque .ss-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );
          color: #102419;
          font-weight: 800;
        }

        .seguimiento-bosque .ss-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
        }

        .seguimiento-bosque .ss-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .seguimiento-bosque .ss-button-small {
          min-height: 36px;
          padding: 7px 14px;
          font-size: 12px;
        }

        /* INDICADORES */

        .seguimiento-bosque .ss-stats {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 20px;
          margin-bottom: 29px;
        }

        .seguimiento-bosque .ss-stat {
          padding: 24px 25px;
          min-width: 0;
          transition: transform 0.2s ease;
        }

        .seguimiento-bosque .ss-stat:hover {
          transform: translateY(-2px);
        }

        .seguimiento-bosque .ss-stat-label {
          color: #cbd2c4;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 18px;
        }

        .seguimiento-bosque .ss-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .seguimiento-bosque .ss-stat-value {
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
          color: #d7ac32;
        }

        /* ESTADOS */

        .seguimiento-bosque .ss-loading,
        .seguimiento-bosque .ss-empty {
          padding: 58px 25px;
          text-align: center;
        }

        .seguimiento-bosque .ss-empty-icon {
          display: grid;
          place-items: center;
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: rgba(215,172,50,0.17);
          color: #edce70;
          font-size: 28px;
          font-weight: 800;
        }

        .seguimiento-bosque .ss-empty h2 {
          margin: 0 0 12px;
          font-size: 26px;
        }

        .seguimiento-bosque .ss-empty p {
          max-width: 500px;
          margin: 0 auto 22px;
          color: #cbd2c4;
          line-height: 1.8;
        }

        .seguimiento-bosque .ss-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 13px;
        }

        .seguimiento-bosque .ss-alert {
          padding: 17px 20px;
          margin-bottom: 22px;
          border-radius: 13px;
          background: rgba(118,33,35,0.85);
          border: 1px solid rgba(231,104,104,0.55);
          color: #ffe4e4;
          font-size: 14px;
        }

        /* TARJETAS DE SOLICITUDES */

        .seguimiento-bosque .ss-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .seguimiento-bosque .ss-card {
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .seguimiento-bosque .ss-card:hover {
          border-color: rgba(215,172,50,0.70);
        }

        .seguimiento-bosque .ss-card-new {
          border-color: rgba(232,180,75,0.85);
        }

        .seguimiento-bosque .ss-card-header {
          padding: 26px;
        }

        .seguimiento-bosque .ss-card-title {
          font-size: 25px;
          margin: 12px 0 18px;
        }

        .seguimiento-bosque .ss-number {
          color: #edce70;
          font-family: monospace;
          font-size: 13px;
          font-weight: 800;
        }

        .seguimiento-bosque .ss-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .seguimiento-bosque .ss-data-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 13px;
        }

        .seguimiento-bosque .ss-data-box {
          padding: 16px;
          border: 1px solid rgba(215,172,50,0.18);
          border-radius: 13px;
          background: rgba(3,20,12,0.48);
          min-width: 0;
        }

        .seguimiento-bosque .ss-label {
          display: block;
          margin: 0 0 9px;
          color: #b8c7b6;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .seguimiento-bosque .ss-value {
          margin: 0;
          color: #f6efd9;
          font-size: 14px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        /* DETALLES */

        .seguimiento-bosque .ss-detail-area {
          padding: 25px;
          border-top: 1px solid rgba(215,172,50,0.23);
          background: rgba(3,20,12,0.19);
        }

        .seguimiento-bosque .ss-detail-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 20px;
        }

        .seguimiento-bosque .ss-detail-box {
          padding: 23px;
          min-width: 0;
          border: 1px solid rgba(215,172,50,0.25);
          border-radius: 17px;
          background: rgba(8,29,19,0.62);
        }

        .seguimiento-bosque .ss-detail-full {
          grid-column: 1 / -1;
        }

        .seguimiento-bosque .ss-detail-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 19px;
        }

        .seguimiento-bosque .ss-detail-heading h4 {
          font-size: 22px;
          margin: 0;
        }

        .seguimiento-bosque .ss-text-box {
          padding: 18px;
          border-radius: 13px;
          border: 1px solid rgba(215,172,50,0.15);
          background: rgba(3,20,12,0.40);
          color: #e5e8d9;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .seguimiento-bosque .ss-answer {
          border-color: rgba(80,183,125,0.40);
          background: rgba(17,84,51,0.20);
        }

        /* ARCHIVOS */

        .seguimiento-bosque .ss-files {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .seguimiento-bosque .ss-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          padding: 16px;
          border-radius: 12px;
          background: rgba(3,20,12,0.43);
          border: 1px solid rgba(215,172,50,0.19);
        }

        .seguimiento-bosque .ss-file-name {
          margin: 0;
          font-weight: 650;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .seguimiento-bosque .ss-muted-text {
          color: #cbd2c4;
          font-size: 13px;
          line-height: 1.6;
        }

        /* HISTORIAL */

        .seguimiento-bosque .ss-history {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .seguimiento-bosque .ss-history-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .seguimiento-bosque .ss-history-number {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: rgba(215,172,50,0.20);
          border: 1px solid rgba(215,172,50,0.40);
          color: #f0d375;
          font-size: 13px;
          font-weight: 800;
        }

        .seguimiento-bosque .ss-history-content {
          flex: 1;
          min-width: 0;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(215,172,50,0.18);
        }

        .seguimiento-bosque .ss-history-item:last-child
        .ss-history-content {
          border-bottom: none;
        }

        .seguimiento-bosque .ss-history-meta {
          margin: 12px 0;
          color: #cbd2c4;
          font-size: 12px;
          line-height: 1.7;
        }

        .seguimiento-bosque button:focus-visible,
        .seguimiento-bosque a:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media(max-width: 1100px) {
          .seguimiento-bosque .ss-stats {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width: 900px) {
          .seguimiento-bosque .ss-detail-grid {
            grid-template-columns: 1fr;
          }

          .seguimiento-bosque .ss-detail-full {
            grid-column: auto;
          }
        }

        @media(max-width: 650px) {
          .seguimiento-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .seguimiento-bosque .ss-header,
          .seguimiento-bosque .ss-card-header,
          .seguimiento-bosque .ss-detail-area {
            padding: 22px;
          }

          .seguimiento-bosque .ss-data-grid {
            grid-template-columns: 1fr;
          }

          .seguimiento-bosque .ss-stats {
            gap: 12px;
          }

          .seguimiento-bosque .ss-stat {
            padding: 18px;
          }

          .seguimiento-bosque .ss-stat-value {
            font-size: 29px;
          }

          .seguimiento-bosque .ss-detail-box {
            padding: 18px;
          }
        }
      `}</style>

      <section className="ss-container">

        {/* ENCABEZADO */}

        <header className="ss-panel ss-header">
          <div className="ss-row">
            <div>
              <div className="ss-title-row">
                <h1 className="ss-title">
                  Seguimiento de Solicitudes
                </h1>
                <span className="ss-badge">
                  Vecino
                </span>
              </div>

              <p className="ss-subtitle">
                Revisa en un solo lugar el estado, las
                respuestas y el historial de tus solicitudes
                vecinales y de documentos.
              </p>
            </div>

            <Link to="/vecino" className="ss-button">
              ← Volver al Panel
            </Link>
          </div>
        </header>

        {/* INDICADORES */}

        {!cargando && !error && (
          <div className="ss-stats">
            {indicadores.map((item) => (
              <div
                key={item.titulo}
                className="ss-panel ss-stat"
              >
                <p className="ss-stat-label">
                  {item.titulo}
                </p>

                <div className="ss-stat-bottom">
                  <span className="ss-stat-value">
                    {item.valor}
                  </span>
                  <span
                    className={`ss-badge ${item.clase}`}
                  >
                    {item.etiqueta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CARGANDO */}

        {cargando && (
          <div
            className="ss-panel ss-loading"
            role="status"
          >
            <p className="ss-subtitle">
              Cargando seguimiento de solicitudes...
            </p>
          </div>
        )}

        {/* ERRORES */}

        {!cargando && error && (
          <div className="ss-alert" role="alert">
            {error}
          </div>
        )}

        {errorAccion && (
          <div className="ss-alert" role="alert">
            {errorAccion}
          </div>
        )}

        {/* SIN SOLICITUDES */}

        {!cargando && !error &&
          solicitudes.length === 0 && (
          <div className="ss-panel ss-empty">
            <div className="ss-empty-icon">
              S
            </div>

            <h2>
              Aún no tienes solicitudes
            </h2>

            <p>
              Tus consultas, reclamos y solicitudes de
              documentos aparecerán aquí cuando realices
              una gestión.
            </p>

            <div className="ss-actions">
              <Link
                to="/vecino/solicitudes"
                className="ss-button ss-button-primary"
              >
                Ir a Solicitudes
              </Link>

              <Link
                to="/vecino/documentos"
                className="ss-button"
              >
                Solicitar Documento
              </Link>
            </div>
          </div>
        )}

        {/* LISTADO */}

        {!cargando && !error &&
          solicitudes.length > 0 && (
          <section>

            <div
              className="ss-row"
              style={{ marginBottom: 22 }}
            >
              <div>
                <h2 className="ss-heading">
                  Mis solicitudes
                </h2>
                <p className="ss-subtitle">
                  Selecciona una solicitud para revisar
                  su información completa.
                </p>
              </div>

              <span className="ss-badge">
                {solicitudes.length}{' '}
                {solicitudes.length === 1
                  ? 'solicitud'
                  : 'solicitudes'}
              </span>
            </div>

            <div className="ss-list">

              {solicitudes.map((solicitud) => {
                const clave =
                  `${solicitud.origen}-${solicitud.id}`

                const expandida =
                  solicitudExpandida === clave

                return (
                  <article
                    key={clave}
                    className={`ss-panel ss-card ${
                      solicitud.tiene_novedades
                        ? 'ss-card-new'
                        : ''
                    }`}
                  >
                    <div className="ss-card-header">
                      <div className="ss-row">

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div className="ss-badges">
                            <span className="ss-number">
                              {solicitud.numero_seguimiento}
                            </span>

                            <span
                              className={
                                solicitud.origen === 'VECINAL'
                                  ? 'ss-badge ss-success'
                                  : 'ss-badge ss-info'
                              }
                            >
                              {solicitud.origen === 'VECINAL'
                                ? 'Solicitud vecinal'
                                : 'Documento'}
                            </span>

                            {solicitud.tiene_novedades && (
                              <span className="ss-badge ss-warning">
                                Nueva actualización
                              </span>
                            )}
                          </div>

                          <h3 className="ss-card-title">
                            {solicitud.titulo}
                          </h3>

                          <div className="ss-data-grid">
                            <div className="ss-data-box">
                              <span className="ss-label">
                                Tipo
                              </span>
                              <p className="ss-value">
                                {solicitud.tipo}
                              </p>
                            </div>

                            <div className="ss-data-box">
                              <span className="ss-label">
                                Fecha de ingreso
                              </span>
                              <p className="ss-value">
                                {formatearFecha(
                                  solicitud.fecha_ingreso
                                )}
                              </p>
                            </div>

                            <div className="ss-data-box">
                              <span className="ss-label">
                                Estado actual
                              </span>
                              <span
                                className={claseEstado(
                                  solicitud.estado_actual
                                )}
                              >
                                {solicitud.estado_actual}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="ss-button"
                          aria-expanded={expandida}
                          disabled={procesando === clave}
                          onClick={() => {
                            void alternarDetalle(solicitud)
                          }}
                        >
                          {procesando === clave
                            ? 'Revisando...'
                            : expandida
                              ? 'Ocultar detalle'
                              : 'Ver detalle'}
                        </button>

                      </div>
                    </div>

                    {/* DETALLES EXPANDIBLES */}

                    {expandida && (
                      <div className="ss-detail-area">
                        <div className="ss-detail-grid">

                          {/* RESPUESTA */}

                          <section className="ss-detail-box">
                            <div className="ss-detail-heading">
                              <h4>Respuesta</h4>

                              {solicitud.fecha_respuesta && (
                                <span className="ss-muted-text">
                                  {formatearFecha(
                                    solicitud.fecha_respuesta
                                  )}
                                </span>
                              )}
                            </div>

                            {solicitud.respuesta_final ? (
                              <div className="ss-text-box ss-answer">
                                {solicitud.respuesta_final}
                              </div>
                            ) : (
                              <div className="ss-text-box">
                                Esta solicitud todavía no
                                registra una respuesta final.
                              </div>
                            )}
                          </section>

                          {/* ARCHIVOS */}

                          <section className="ss-detail-box">
                            <div className="ss-detail-heading">
                              <h4>Archivos</h4>
                              <span className="ss-badge">
                                {solicitud.archivos.length}
                              </span>
                            </div>

                            {solicitud.archivos.length === 0 ? (
                              <p className="ss-muted-text">
                                No hay archivos asociados
                                a esta solicitud.
                              </p>
                            ) : (
                              <div className="ss-files">
                                {solicitud.archivos.map(
                                  (archivo) => (
                                  <div
                                    key={archivo.id}
                                    className="ss-file"
                                  >
                                    <div
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                      }}
                                    >
                                      <p className="ss-file-name">
                                        {archivo.nombre_original}
                                      </p>

                                      <p className="ss-muted-text">
                                        {formatearFecha(
                                          archivo.fecha_subida
                                        )}
                                      </p>

                                      <span className="ss-badge ss-muted">
                                        {archivo.tipo_uso}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      className="ss-button ss-button-small"
                                      disabled={
                                        procesando ===
                                        `archivo-${archivo.id}`
                                      }
                                      onClick={() => {
                                        void descargarArchivo(
                                          archivo
                                        )
                                      }}
                                    >
                                      {procesando ===
                                      `archivo-${archivo.id}`
                                        ? 'Descargando...'
                                        : 'Descargar'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </section>

                          {/* HISTORIAL */}

                          <section className="ss-detail-box ss-detail-full">
                            <div className="ss-detail-heading">
                              <h4>
                                Historial de cambios
                              </h4>

                              <span className="ss-badge">
                                {solicitud.historial.length}{' '}
                                {solicitud.historial.length === 1
                                  ? 'cambio'
                                  : 'cambios'}
                              </span>
                            </div>

                            {solicitud.historial.length === 0 ? (
                              <p className="ss-muted-text">
                                No existen cambios
                                registrados todavía.
                              </p>
                            ) : (
                              <div className="ss-history">

                                {solicitud.historial.map(
                                  (historial, index) => (
                                  <div
                                    key={historial.id}
                                    className="ss-history-item"
                                  >
                                    <div className="ss-history-number">
                                      {index + 1}
                                    </div>

                                    <div className="ss-history-content">
                                      <div className="ss-badges">

                                        {historial.estado_anterior && (
                                          <>
                                            <span className="ss-badge ss-muted">
                                              {historial.estado_anterior}
                                            </span>

                                            <span className="ss-muted-text">
                                              →
                                            </span>
                                          </>
                                        )}

                                        <span
                                          className={claseEstado(
                                            historial.estado_nuevo
                                          )}
                                        >
                                          {historial.estado_nuevo}
                                        </span>
                                      </div>

                                      <p className="ss-history-meta">
                                        {formatearFecha(
                                          historial.fecha_cambio
                                        )}

                                        {historial.usuario_responsable && (
                                          <>
                                            {' · Responsable: '}
                                            {historial.usuario_responsable}
                                          </>
                                        )}
                                      </p>

                                      {historial.comentario_respuesta && (
                                        <div className="ss-text-box">
                                          {historial.comentario_respuesta}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}

                              </div>
                            )}
                          </section>

                        </div>
                      </div>
                    )}

                  </article>
                )
              })}

            </div>
          </section>
        )}

      </section>
    </main>
  )
}

export default SeguimientoSolicitudesPage
