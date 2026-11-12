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

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin fecha'
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return 'Sin fecha'
  return valor.toLocaleString('es-CL', {
    dateStyle: 'medium', timeStyle: 'short',
  })
}

function claseEstado(estado: string) {
  const valor = estado.toUpperCase()
  if (['APROB', 'RESPOND'].some((texto) => valor.includes(texto))) {
    return 'ss-badge ss-success'
  }
  if (['CERRAD', 'FINALIZ'].some((texto) => valor.includes(texto))) return 'ss-badge ss-muted'
  if (['RECHAZ', 'CANCEL'].some((texto) => valor.includes(texto))) {
    return 'ss-badge ss-danger'
  }
  if (['PROCESO', 'REVISION', 'REVISIÓN'].some((texto) => valor.includes(texto))) {
    return 'ss-badge ss-info'
  }
  if (valor.includes('PENDIENTE')) return 'ss-badge ss-warning'
  return 'ss-badge'
}

const estilosSeguimiento = String.raw`
.seguimiento-bosque {
  --ss-oro: #d7ac32;
  --ss-crema: #f6efd9;
  --ss-suave: #cbd2c4;
  min-height: 100vh;
  padding: 32px 20px 48px;
  color: var(--ss-crema);
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #092318;
  background-image: linear-gradient(115deg, rgba(4, 23, 16, .66), rgba(4, 23, 16, .59)), url('/vecino-seguimiento.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.seguimiento-bosque, .seguimiento-bosque * { box-sizing: border-box; }
.seguimiento-bosque .ss-container { width: 100%; max-width: 1480px; margin: 0 auto; }
.seguimiento-bosque h1, .seguimiento-bosque h2,
.seguimiento-bosque h3, .seguimiento-bosque h4 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.25;
  font-weight: 700;
}
.seguimiento-bosque .ss-title { margin: 0; font-size: clamp(30px, 3vw, 42px); }
.seguimiento-bosque .ss-heading { margin: 0; font-size: clamp(24px, 2.6vw, 30px); }
.seguimiento-bosque .ss-subtitle { margin: 10px 0 0; color: var(--ss-suave); font-size: 15px; line-height: 1.7; }
.seguimiento-bosque .ss-panel {
  border: 1px solid rgba(215, 172, 50, .43);
  border-radius: 22px;
  background-color: rgba(8, 29, 19, .91);
  box-shadow: 0 16px 38px rgba(3, 18, 12, .26);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.seguimiento-bosque .ss-row { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 20px; }
.seguimiento-bosque .ss-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 12px; }
.seguimiento-bosque .ss-header {
  padding: 30px; margin-bottom: 26px;
  background-image: linear-gradient(115deg, rgba(6, 32, 23, .81), rgba(8, 42, 30, .80)), url('/directivas-inicio.webp');
  background-size: cover; background-position: center;
}
.seguimiento-bosque .ss-badge {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  padding: 6px 14px; border-radius: 999px;
  border: 1px solid rgba(215, 172, 50, .55);
  background: rgba(215, 172, 50, .15); color: #f1d47a;
  font-size: 12px; font-weight: 750; line-height: 1.4;
}
.seguimiento-bosque .ss-warning { background: rgba(180, 113, 22, .25); border-color: #e4b94f; color: #ffdf94; }
.seguimiento-bosque .ss-info { background: rgba(31, 104, 121, .26); border-color: #68b5c6; color: #b8e9f2; }
.seguimiento-bosque .ss-success { background: rgba(28, 125, 78, .25); border-color: #50b77d; color: #a6eac4; }
.seguimiento-bosque .ss-danger { background: rgba(145, 43, 45, .26); border-color: #e67474; color: #ffc4c1; }
.seguimiento-bosque .ss-muted { background: rgba(230, 230, 210, .08); border-color: rgba(220, 220, 200, .32); color: #e6e9df; }
.seguimiento-bosque .ss-button {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 10px 19px;
  border: 1px solid #d7ac32; border-radius: 12px;
  background: rgba(215, 172, 50, .15); color: #f9e7b2;
  font: inherit; font-size: 14px; font-weight: 750;
  text-align: center; text-decoration: none; cursor: pointer;
  transition: background .2s ease, transform .2s ease, border-color .2s ease;
}
.seguimiento-bosque .ss-button:hover:not(:disabled) { background: rgba(215, 172, 50, .34); color: #fff4d2; transform: translateY(-2px); }
.seguimiento-bosque .ss-button-primary { background: linear-gradient(115deg, #e4c55b, #c49a28); color: #102419; font-weight: 800; }
.seguimiento-bosque .ss-button-primary:hover:not(:disabled) { background: linear-gradient(115deg, #f0d67c, #dfb646); color: #102419; }
.seguimiento-bosque .ss-button:disabled { opacity: .55; cursor: not-allowed; }
.seguimiento-bosque .ss-button-small { min-height: 36px; padding: 7px 14px; font-size: 12px; }
.seguimiento-bosque .ss-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 17px; margin-bottom: 26px; }
.seguimiento-bosque .ss-stat {
  min-width: 0; min-height: 135px; padding: 24px;
  background-size: cover; background-position: center;
  transition: transform .2s ease, border-color .2s ease;
}
.seguimiento-bosque .ss-stat:nth-child(1) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .85)), url('/casas.webp'); }
.seguimiento-bosque .ss-stat:nth-child(2) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .85)), url('/registro-vecino.webp'); }
.seguimiento-bosque .ss-stat:nth-child(3) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .85)), url('/directivas.webp'); }
.seguimiento-bosque .ss-stat:nth-child(4) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .85)), url('/gestion-directiva.webp'); }
.seguimiento-bosque .ss-stat:hover { transform: translateY(-3px); border-color: rgba(240, 211, 117, .75); }
.seguimiento-bosque .ss-stat-label { margin: 0 0 19px; color: #e1e5d8; font-size: 15px; font-weight: 650; }
.seguimiento-bosque .ss-stat-bottom { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.seguimiento-bosque .ss-stat-value { color: #f0d375; font-size: 36px; line-height: 1; font-weight: 800; }
.seguimiento-bosque .ss-alert { margin-bottom: 20px; padding: 16px 20px; border: 1px solid #d98787; border-radius: 13px; background: rgba(112, 33, 33, .87); color: #ffe4e4; }
.seguimiento-bosque .ss-loading, .seguimiento-bosque .ss-empty {
  padding: 56px 25px; text-align: center;
  background-image: linear-gradient(115deg, rgba(7, 31, 22, .86), rgba(8, 36, 27, .90)), url('/sector.webp');
  background-size: cover; background-position: center;
}
.seguimiento-bosque .ss-empty h2 { font-size: 26px; margin: 0 0 12px; }
.seguimiento-bosque .ss-empty p { max-width: 570px; margin: 0 auto 22px; }
.seguimiento-bosque .ss-empty-icon { display: grid; place-items: center; width: 66px; height: 66px; margin: 0 auto 18px; border-radius: 50%; background: rgba(215, 172, 50, .19); color: #f0d375; font-size: 29px; font-weight: 800; }
.seguimiento-bosque .ss-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.seguimiento-bosque .ss-list-section {
  padding: 25px;
  background-image: linear-gradient(115deg, rgba(7, 31, 22, .86), rgba(8, 36, 27, .90)), url('/casitas.webp');
  background-size: cover; background-position: center;
}
.seguimiento-bosque .ss-section-heading { padding-bottom: 21px; margin-bottom: 22px; border-bottom: 1px solid rgba(215, 172, 50, .27); }
.seguimiento-bosque .ss-list { display: flex; flex-direction: column; gap: 18px; }
.seguimiento-bosque .ss-card {
  overflow: hidden;
  background-image: linear-gradient(115deg, rgba(7, 30, 22, .91), rgba(8, 35, 26, .94)), url('/casas.webp');
  background-size: cover; background-position: center;
  transition: border-color .2s ease;
}
.seguimiento-bosque .ss-card:nth-child(even) { background-image: linear-gradient(115deg, rgba(7, 30, 22, .91), rgba(8, 35, 26, .94)), url('/sector.webp'); }
.seguimiento-bosque .ss-card:hover { border-color: rgba(240, 211, 117, .77); }
.seguimiento-bosque .ss-card-new { border-color: rgba(232, 180, 75, .88); }
.seguimiento-bosque .ss-card-header { padding: 25px; }
.seguimiento-bosque .ss-card-title { margin: 12px 0 18px; font-size: clamp(22px, 2.4vw, 27px); }
.seguimiento-bosque .ss-number { color: #f0d375; font-family: monospace; font-size: 13px; font-weight: 800; overflow-wrap: anywhere; }
.seguimiento-bosque .ss-badges { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.seguimiento-bosque .ss-data-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
.seguimiento-bosque .ss-data-box { padding: 16px; min-width: 0; border: 1px solid rgba(215, 172, 50, .24); border-radius: 13px; background: rgba(3, 20, 12, .57); }
.seguimiento-bosque .ss-label { display: block; margin: 0 0 9px; color: #c4d0c0; font-size: 11px; font-weight: 750; letter-spacing: .5px; text-transform: uppercase; }
.seguimiento-bosque .ss-value { margin: 0; color: #f6efd9; font-size: 14px; font-weight: 650; overflow-wrap: anywhere; }
.seguimiento-bosque .ss-detail-area { padding: 24px; border-top: 1px solid rgba(215, 172, 50, .28); background: rgba(3, 20, 12, .25); }
.seguimiento-bosque .ss-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.seguimiento-bosque .ss-detail-box {
  padding: 22px; min-width: 0; border: 1px solid rgba(215, 172, 50, .28); border-radius: 17px;
  background-image: linear-gradient(115deg, rgba(7, 30, 22, .90), rgba(8, 35, 26, .94)), url('/directivas-inicio.webp');
  background-size: cover; background-position: center;
}
.seguimiento-bosque .ss-detail-box:nth-child(2) { background-image: linear-gradient(115deg, rgba(7, 30, 22, .90), rgba(8, 35, 26, .94)), url('/registro-vecino.webp'); }
.seguimiento-bosque .ss-detail-box:nth-child(3) { background-image: linear-gradient(115deg, rgba(7, 30, 22, .90), rgba(8, 35, 26, .94)), url('/gestion-directiva.webp'); }
.seguimiento-bosque .ss-detail-full { grid-column: 1 / -1; }
.seguimiento-bosque .ss-detail-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.seguimiento-bosque .ss-detail-heading h4 { margin: 0; font-size: 21px; }
.seguimiento-bosque .ss-text-box { padding: 18px; border: 1px solid rgba(215, 172, 50, .22); border-radius: 13px; background: rgba(3, 20, 12, .59); color: #f1f0e4; font-size: 14px; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.seguimiento-bosque .ss-answer { border-color: rgba(80, 183, 125, .46); background: rgba(17, 84, 51, .33); }
.seguimiento-bosque .ss-files { display: flex; flex-direction: column; gap: 12px; }
.seguimiento-bosque .ss-file { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; padding: 16px; border: 1px solid rgba(215, 172, 50, .25); border-radius: 12px; background: rgba(3, 20, 12, .58); }
.seguimiento-bosque .ss-file-name { margin: 0; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
.seguimiento-bosque .ss-muted-text { color: #cbd2c4; font-size: 13px; line-height: 1.6; }
.seguimiento-bosque .ss-history { display: flex; flex-direction: column; gap: 17px; }
.seguimiento-bosque .ss-history-item { display: flex; align-items: flex-start; gap: 15px; }
.seguimiento-bosque .ss-history-number { display: grid; place-items: center; flex-shrink: 0; width: 35px; height: 35px; border: 1px solid rgba(215, 172, 50, .40); border-radius: 50%; background: rgba(215, 172, 50, .20); color: #f0d375; font-size: 13px; font-weight: 800; }
.seguimiento-bosque .ss-history-content { flex: 1; min-width: 0; padding-bottom: 18px; border-bottom: 1px solid rgba(215, 172, 50, .18); }
.seguimiento-bosque .ss-history-item:last-child .ss-history-content { padding-bottom: 0; border-bottom: none; }
.seguimiento-bosque .ss-history-meta { margin: 12px 0; color: #cbd2c4; font-size: 12px; line-height: 1.7; }
.seguimiento-bosque :is(button, a):focus-visible { outline: 2px solid #f0d375; outline-offset: 3px; }
@media (max-width: 1100px) { .seguimiento-bosque .ss-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .seguimiento-bosque .ss-detail-grid { grid-template-columns: 1fr; } .seguimiento-bosque .ss-detail-full { grid-column: auto; } }
@media (max-width: 650px) {
  .seguimiento-bosque { padding: 18px 12px 32px; background-attachment: scroll; }
  .seguimiento-bosque .ss-header, .seguimiento-bosque .ss-card-header, .seguimiento-bosque .ss-detail-area, .seguimiento-bosque .ss-list-section { padding: 20px; }
  .seguimiento-bosque .ss-data-grid { grid-template-columns: 1fr; }
  .seguimiento-bosque .ss-stats { gap: 12px; }
  .seguimiento-bosque .ss-stat { padding: 18px; }
  .seguimiento-bosque .ss-stat-value { font-size: 29px; }
  .seguimiento-bosque .ss-detail-box { padding: 18px; }
}

/* APT: indicadores claramente diferenciados */
.seguimiento-bosque .ss-stat { border-top: 5px solid #e9ce92; }
.seguimiento-bosque .ss-stat.ss-total { border-top-color: #cbb4fb; }
.seguimiento-bosque .ss-stat.ss-warning { border-top-color: #f1c57c; }
.seguimiento-bosque .ss-stat.ss-muted { border-top-color: #a8b7c5; }
.seguimiento-bosque .ss-stat.ss-success { border-top-color: #8bdfb1; }
.seguimiento-bosque .ss-stat.ss-info { border-top-color: #8dcff6; }
.seguimiento-bosque .ss-stat.ss-total .ss-stat-value { color: #cbb4fb; }
.seguimiento-bosque .ss-stat.ss-warning .ss-stat-value { color: #f1c57c; }
.seguimiento-bosque .ss-stat.ss-muted .ss-stat-value { color: #b8c8d5; }
.seguimiento-bosque .ss-stat.ss-success .ss-stat-value { color: #8bdfb1; }
.seguimiento-bosque .ss-stat.ss-info .ss-stat-value { color: #8dcff6; }
/* Solicitudes vecinales verdes; documentos celestes; novedades ámbar */
.seguimiento-bosque .ss-card.ss-origin-neighbor { border-left: 5px solid #8bdfb1; }
.seguimiento-bosque .ss-card.ss-origin-document { border-left: 5px solid #8dcff6; }
.seguimiento-bosque .ss-card.ss-card-new { box-shadow: inset 0 3px 0 #eec271, 0 16px 38px rgba(3,18,12,.26); }
.seguimiento-bosque .ss-card.ss-origin-neighbor .ss-card-title { color: #b7efd0; }
.seguimiento-bosque .ss-card.ss-origin-document .ss-card-title { color: #b9e4ff; }
/* Respuesta, adjuntos, historial y acciones */
.seguimiento-bosque .ss-detail-box:has(.ss-answer) { border-top: 4px solid #87dcae; }
.seguimiento-bosque .ss-file.ss-file-attachment { border-left: 4px solid #8dcff6; }
.seguimiento-bosque .ss-file.ss-file-issued { border-left: 4px solid #8bdfb1; }
.seguimiento-bosque .ss-download-button { background: linear-gradient(115deg,#9bdaf6,#6dbce8); border-color: #b4e5fc; color: #113449; }
.seguimiento-bosque .ss-download-button:hover:not(:disabled) { background: #b8e9ff; color: #113449; }
.seguimiento-bosque .ss-history-number { background: rgba(189,163,250,.22); color: #d5c3ff; border-color: #bda3fa; }
.seguimiento-bosque .ss-history-content .ss-badge.ss-success { border-color: #7fd2a4; }
.seguimiento-bosque .ss-history-content .ss-badge.ss-danger { border-color: #ed929b; }
.seguimiento-bosque .ss-detail-heading h4 { color: #f7e5b5; }

@media (prefers-reduced-motion: reduce) { .seguimiento-bosque .ss-button, .seguimiento-bosque .ss-stat { transition: none; } }
`

function SeguimientoSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudSeguimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [solicitudExpandida, setSolicitudExpandida] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<string | null>(null)

  useEffect(() => {
    const controlador = new AbortController()
    const cargarSolicitudes = async () => {
      try {
        const response = await fetch(`${API}/api/solicitudes/seguimiento/`, {
          credentials: 'include', signal: controlador.signal,
        })
        if (!response.ok) throw new Error('No se pudo cargar el seguimiento de solicitudes.')
        const data = (await response.json()) as SolicitudSeguimiento[]
        if (!controlador.signal.aborted) {
          setSolicitudes(data)
          setError('')
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar las solicitudes.')
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }
    void cargarSolicitudes()
    return () => controlador.abort()
  }, [])

  async function alternarDetalle(solicitud: SolicitudSeguimiento) {
    const claveSolicitud = `${solicitud.origen}-${solicitud.id}`
    if (solicitudExpandida === claveSolicitud) {
      setSolicitudExpandida(null)
      return
    }
    setSolicitudExpandida(claveSolicitud)
    setErrorAccion('')
    if (!solicitud.tiene_novedades) return
    const tipoRuta = solicitud.origen === 'VECINAL' ? 'vecinal' : 'documento'
    setProcesando(claveSolicitud)
    try {
      const response = await fetch(
        `${API}/api/solicitudes/seguimiento/${tipoRuta}/${solicitud.id}/revisar/`,
        { method: 'POST', credentials: 'include' },
      )
      if (!response.ok) throw new Error('No se pudo marcar la solicitud como revisada.')
      setSolicitudes((actuales) => actuales.map((item) =>
        item.id === solicitud.id && item.origen === solicitud.origen
          ? { ...item, tiene_novedades: false }
          : item,
      ))
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : 'No se pudo actualizar la solicitud.')
    } finally {
      setProcesando(null)
    }
  }

  async function descargarArchivo(archivo: ArchivoSolicitud) {
    const claveArchivo = `archivo-${archivo.id}`
    setProcesando(claveArchivo)
    setErrorAccion('')
    try {
      const response = await fetch(
        `${API}/api/solicitudes/documentos/archivos/${archivo.id}/descargar/`,
        { credentials: 'include' },
      )
      if (!response.ok) throw new Error('No se pudo descargar el archivo.')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = archivo.nombre_original
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : 'Ocurrió un error al descargar.')
    } finally {
      setProcesando(null)
    }
  }

  const solicitudesConNovedades = solicitudes.filter((item) => item.tiene_novedades).length
  const solicitudesVecinales = solicitudes.filter((item) => item.origen === 'VECINAL').length
  const solicitudesDocumento = solicitudes.filter((item) => item.origen === 'DOCUMENTO').length
  const indicadores = [
    { titulo: 'Total solicitudes', valor: solicitudes.length, etiqueta: 'Registradas', clase: '' },
    { titulo: 'Con novedades', valor: solicitudesConNovedades, etiqueta: solicitudesConNovedades > 0 ? 'Nuevas' : 'Al día', clase: solicitudesConNovedades > 0 ? 'ss-warning' : 'ss-muted' },
    { titulo: 'Solicitudes vecinales', valor: solicitudesVecinales, etiqueta: 'Vecinales', clase: 'ss-success' },
    { titulo: 'Documentos', valor: solicitudesDocumento, etiqueta: 'Documentos', clase: 'ss-info' },
  ]

  return (
    <main className="seguimiento-bosque">
      <style>{estilosSeguimiento}</style>
      <section className="ss-container">
        <header className="ss-panel ss-header">
          <div className="ss-row">
            <div>
              <div className="ss-title-row">
                <h1 className="ss-title">Seguimiento de Solicitudes</h1>
                <span className="ss-badge">Vecino</span>
              </div>
              <p className="ss-subtitle">Revisa en un solo lugar el estado, las respuestas y el historial de tus solicitudes vecinales y de documentos.</p>
            </div>
            <Link to="/vecino" className="ss-button">← Volver al Panel</Link>
          </div>
        </header>

        {!cargando && !error && (
          <div className="ss-stats">
            {indicadores.map((item) => (
              <div key={item.titulo} className={`ss-panel ss-stat ${item.clase || 'ss-total'}`}>
                <p className="ss-stat-label">{item.titulo}</p>
                <div className="ss-stat-bottom">
                  <span className="ss-stat-value">{item.valor}</span>
                  <span className={`ss-badge ${item.clase}`}>{item.etiqueta}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {cargando && (
          <div className="ss-panel ss-loading" role="status">
            <p className="ss-subtitle">Cargando seguimiento de solicitudes...</p>
          </div>
        )}
        {!cargando && error && <div className="ss-alert" role="alert">{error}</div>}
        {errorAccion && <div className="ss-alert" role="alert">{errorAccion}</div>}

        {!cargando && !error && solicitudes.length === 0 && (
          <div className="ss-panel ss-empty">
            <div className="ss-empty-icon">S</div>
            <h2>Aún no tienes solicitudes</h2>
            <p className="ss-subtitle">Tus consultas, reclamos y solicitudes de documentos aparecerán aquí cuando realices una gestión.</p>
            <div className="ss-actions">
              <Link to="/vecino/solicitudes" className="ss-button ss-button-primary">Ir a Solicitudes</Link>
              <Link to="/vecino/documentos" className="ss-button">Solicitar Documento</Link>
            </div>
          </div>
        )}

        {!cargando && !error && solicitudes.length > 0 && (
          <section className="ss-panel ss-list-section">
            <div className="ss-row ss-section-heading">
              <div>
                <h2 className="ss-heading">Mis solicitudes</h2>
                <p className="ss-subtitle">Selecciona una solicitud para revisar su información completa.</p>
              </div>
              <span className="ss-badge">{solicitudes.length} {solicitudes.length === 1 ? 'solicitud' : 'solicitudes'}</span>
            </div>

            <div className="ss-list">
              {solicitudes.map((solicitud) => {
                const clave = `${solicitud.origen}-${solicitud.id}`
                const expandida = solicitudExpandida === clave
                return (
                  <article key={clave} className={`ss-panel ss-card ${solicitud.origen === 'VECINAL' ? 'ss-origin-neighbor' : 'ss-origin-document'} ${solicitud.tiene_novedades ? 'ss-card-new' : ''}`}>
                    <div className="ss-card-header">
                      <div className="ss-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ss-badges">
                            <span className="ss-number">{solicitud.numero_seguimiento}</span>
                            <span className={solicitud.origen === 'VECINAL' ? 'ss-badge ss-success' : 'ss-badge ss-info'}>
                              {solicitud.origen === 'VECINAL' ? 'Solicitud vecinal' : 'Documento'}
                            </span>
                            {solicitud.tiene_novedades && <span className="ss-badge ss-warning">Nueva actualización</span>}
                          </div>
                          <h3 className="ss-card-title">{solicitud.titulo}</h3>
                          <div className="ss-data-grid">
                            <div className="ss-data-box">
                              <span className="ss-label">Tipo</span>
                              <p className="ss-value">{solicitud.tipo}</p>
                            </div>
                            <div className="ss-data-box">
                              <span className="ss-label">Fecha de ingreso</span>
                              <p className="ss-value">{formatearFecha(solicitud.fecha_ingreso)}</p>
                            </div>
                            <div className="ss-data-box">
                              <span className="ss-label">Estado actual</span>
                              <span className={claseEstado(solicitud.estado_actual)}>{solicitud.estado_actual}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ss-button"
                          aria-expanded={expandida}
                          disabled={procesando === clave}
                          onClick={() => void alternarDetalle(solicitud)}
                        >
                          {procesando === clave ? 'Revisando...' : expandida ? 'Ocultar detalle' : 'Ver detalle'}
                        </button>
                      </div>
                    </div>

                    {expandida && (
                      <div className="ss-detail-area">
                        <div className="ss-detail-grid">
                          <section className="ss-detail-box">
                            <div className="ss-detail-heading">
                              <h4>Respuesta</h4>
                              {solicitud.fecha_respuesta && <span className="ss-muted-text">{formatearFecha(solicitud.fecha_respuesta)}</span>}
                            </div>
                            {solicitud.respuesta_final ? (
                              <div className="ss-text-box ss-answer">{solicitud.respuesta_final}</div>
                            ) : (
                              <div className="ss-text-box">Esta solicitud todavía no registra una respuesta final.</div>
                            )}
                          </section>

                          <section className="ss-detail-box">
                            <div className="ss-detail-heading">
                              <h4>Archivos</h4>
                              <span className="ss-badge">{solicitud.archivos.length}</span>
                            </div>
                            {solicitud.archivos.length === 0 ? (
                              <p className="ss-muted-text">No hay archivos asociados a esta solicitud.</p>
                            ) : (
                              <div className="ss-files">
                                {solicitud.archivos.map((archivo) => (
                                  <div key={archivo.id} className={`ss-file ${archivo.tipo_uso === 'DOCUMENTO_EMITIDO' ? 'ss-file-issued' : 'ss-file-attachment'}`}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p className="ss-file-name">{archivo.nombre_original}</p>
                                      <p className="ss-muted-text">{formatearFecha(archivo.fecha_subida)}</p>
                                      <span className={`ss-badge ${archivo.tipo_uso === 'DOCUMENTO_EMITIDO' ? 'ss-success' : 'ss-info'}`}>{archivo.tipo_uso === 'DOCUMENTO_EMITIDO' ? 'Documento emitido' : 'Adjunto'}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="ss-button ss-button-small ss-download-button"
                                      disabled={procesando === `archivo-${archivo.id}`}
                                      onClick={() => void descargarArchivo(archivo)}
                                    >
                                      {procesando === `archivo-${archivo.id}` ? 'Descargando...' : 'Descargar'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </section>

                          <section className="ss-detail-box ss-detail-full">
                            <div className="ss-detail-heading">
                              <h4>Historial de cambios</h4>
                              <span className="ss-badge">{solicitud.historial.length} {solicitud.historial.length === 1 ? 'cambio' : 'cambios'}</span>
                            </div>
                            {solicitud.historial.length === 0 ? (
                              <p className="ss-muted-text">No existen cambios registrados todavía.</p>
                            ) : (
                              <div className="ss-history">
                                {solicitud.historial.map((historial, index) => (
                                  <div key={historial.id} className="ss-history-item">
                                    <div className="ss-history-number">{index + 1}</div>
                                    <div className="ss-history-content">
                                      <div className="ss-badges">
                                        {historial.estado_anterior && (
                                          <>
                                            <span className="ss-badge ss-muted">{historial.estado_anterior}</span>
                                            <span className="ss-muted-text">→</span>
                                          </>
                                        )}
                                        <span className={claseEstado(historial.estado_nuevo)}>{historial.estado_nuevo}</span>
                                      </div>
                                      <p className="ss-history-meta">
                                        {formatearFecha(historial.fecha_cambio)}
                                        {historial.usuario_responsable && <> · Responsable: {historial.usuario_responsable}</>}
                                      </p>
                                      {historial.comentario_respuesta && (
                                        <div className="ss-text-box">{historial.comentario_respuesta}</div>
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
