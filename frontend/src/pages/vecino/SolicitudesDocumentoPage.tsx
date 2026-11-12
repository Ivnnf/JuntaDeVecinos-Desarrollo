import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type TipoDocumento = {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

type HistorialSolicitudDocumento = {
  id: number
  estado_anterior: string | null
  estado_nuevo: string
  usuario_responsable: number
  usuario_responsable_username: string
  comentario_respuesta: string
  fecha_cambio: string
}

type ArchivoSolicitudDocumento = {
  id: number
  solicitud: number
  nombre_original: string
  tipo_uso: 'ADJUNTO' | 'DOCUMENTO_EMITIDO'
  subido_por: number
  subido_por_username: string
  fecha_subida: string
}

type EstadoDocumento = 'PENDIENTE' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA'

type SolicitudDocumento = {
  id: number
  numero_seguimiento: string
  tipo_documento: number
  tipo_documento_nombre: string
  vecino: number
  vecino_username: string
  junta_vecinos: number
  junta_nombre: string
  motivo: string
  estado_actual: EstadoDocumento
  responsable: number | null
  responsable_username: string | null
  fecha_solicitud: string
  fecha_resolucion: string | null
  historial: HistorialSolicitudDocumento[]
  archivos: ArchivoSolicitudDocumento[]
}

const API = 'http://localhost:8000'

const estadoNombre = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente'
    case 'EN_REVISION': return 'En revisión'
    case 'APROBADA': return 'Aprobada'
    case 'RECHAZADA': return 'Rechazada'
    default: return estado
  }
}

const estadoClase = (estado: EstadoDocumento) => {
  switch (estado) {
    case 'PENDIENTE': return 'dv-badge dv-warning'
    case 'EN_REVISION': return 'dv-badge dv-info'
    case 'APROBADA': return 'dv-badge dv-success'
    case 'RECHAZADA': return 'dv-badge dv-danger'
  }
}

const formatearFecha = (fecha: string) => {
  const valor = new Date(fecha)
  return Number.isNaN(valor.getTime())
    ? 'Sin fecha'
    : valor.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

const estilosDocumentoVecino = String.raw`
.documentos-vecino {
  --dv-crema: #f6efd9;
  --dv-suave: #cbd2c4;
  --dv-oro: #d7ac32;
  --dv-borde: rgba(215, 172, 50, .43);
  min-height: 100vh;
  padding: 32px 20px 48px;
  color: var(--dv-crema);
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #092318;
  background-image: linear-gradient(115deg, rgba(4, 23, 16, .67), rgba(4, 23, 16, .61)), url('/casitas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.documentos-vecino, .documentos-vecino * { box-sizing: border-box; }
.documentos-vecino .dv-container { max-width: 1380px; margin: 0 auto; }
.documentos-vecino h1, .documentos-vecino h2,
.documentos-vecino h3, .documentos-vecino h4 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  font-weight: 700;
}
.documentos-vecino .dv-muted { color: var(--dv-suave); line-height: 1.65; }
.documentos-vecino .dv-panel {
  border: 1px solid var(--dv-borde);
  border-radius: 23px;
  background-color: rgba(8, 29, 19, .90);
  box-shadow: 0 16px 38px rgba(3, 18, 12, .26);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.documentos-vecino .dv-hero {
  padding: 30px;
  margin-bottom: 24px;
  background-image: linear-gradient(115deg, rgba(6, 32, 23, .82), rgba(8, 42, 30, .79)), url('/directivas-inicio.webp');
  background-position: center;
  background-size: cover;
}
.documentos-vecino .dv-hero-row,
.documentos-vecino .dv-heading-row,
.documentos-vecino .dv-flex-between {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}
.documentos-vecino .dv-title-line { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.documentos-vecino .dv-hero h1 { margin: 0; font-size: clamp(30px, 3.1vw, 43px); }
.documentos-vecino .dv-hero p { margin: 14px 0 0; max-width: 730px; }
.documentos-vecino .dv-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 6px 12px;
  border: 1px solid rgba(215, 172, 50, .58);
  border-radius: 999px;
  background: rgba(215, 172, 50, .16);
  color: #f2d47c;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.documentos-vecino .dv-warning { background: rgba(160, 110, 28, .28); border-color: #e4bc58; color: #ffdf94; }
.documentos-vecino .dv-info { background: rgba(24, 88, 109, .30); border-color: #73b8c6; color: #b9ebf3; }
.documentos-vecino .dv-success { background: rgba(21, 102, 56, .36); border-color: #5eb07c; color: #b9f3cd; }
.documentos-vecino .dv-danger { background: rgba(112, 33, 33, .42); border-color: #d98787; color: #ffd1d1; }
.documentos-vecino .dv-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 43px;
  padding: 10px 19px;
  border: 1px solid #d7ac32;
  border-radius: 12px;
  background: rgba(215, 172, 50, .13);
  color: #f9e7b2;
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform .2s ease, filter .2s ease, background .2s ease;
}
.documentos-vecino .dv-button-primary {
  background: linear-gradient(115deg, #efd279, #cca12e);
  color: #102419;
  font-weight: 800;
}
.documentos-vecino .dv-button:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.documentos-vecino .dv-button:disabled { opacity: .55; cursor: not-allowed; }
.documentos-vecino .dv-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.documentos-vecino .dv-stat {
  min-height: 132px;
  padding: 23px;
  background-size: cover;
  background-position: center;
  transition: transform .2s ease, border-color .2s ease;
}
.documentos-vecino .dv-stat:hover { transform: translateY(-3px); border-color: rgba(239, 210, 121, .75); }
.documentos-vecino .dv-stat:nth-child(1) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)), url('/registro-vecino.webp'); }
.documentos-vecino .dv-stat:nth-child(2) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)), url('/directivas.webp'); }
.documentos-vecino .dv-stat:nth-child(3) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)), url('/gestion-directiva.webp'); }
.documentos-vecino .dv-stat:nth-child(4) { background-image: linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)), url('/casas.webp'); }
.documentos-vecino .dv-stat-label { margin: 0 0 20px; color: #e1e3d5; font-size: 15px; font-weight: 650; }
.documentos-vecino .dv-stat-number { color: #f0d375; font-size: 36px; font-weight: 800; line-height: 1; }
.documentos-vecino .dv-stat-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.documentos-vecino .dv-form {
  overflow: hidden;
  margin-bottom: 28px;
  background-image: linear-gradient(115deg, rgba(7, 32, 23, .87), rgba(8, 36, 27, .91)), url('/registro-vecino.webp');
  background-size: cover;
  background-position: center;
}
.documentos-vecino .dv-form-heading {
  padding: 26px 28px;
  border-bottom: 1px solid rgba(215, 172, 50, .35);
  background-image: linear-gradient(110deg, rgba(6, 31, 22, .77), rgba(6, 31, 22, .82)), url('/directivas-inicio.webp');
  background-size: cover;
  background-position: center;
}
.documentos-vecino .dv-form h2, .documentos-vecino .dv-history-section h2 { margin: 0; font-size: clamp(23px, 2.4vw, 31px); }
.documentos-vecino .dv-form-heading p { margin: 10px 0 0; }
.documentos-vecino .dv-form-body { padding: 28px; }
.documentos-vecino .dv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.documentos-vecino .dv-field { display: flex; flex-direction: column; min-width: 0; }
.documentos-vecino .dv-field-full { grid-column: 1 / -1; }
.documentos-vecino .dv-label { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 9px; color: #f7f0df; font-size: 14px; font-weight: 750; }
.documentos-vecino .dv-required { color: #ffc0b3; font-size: 12px; font-weight: 500; }
.documentos-vecino .dv-control {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  border: 1px solid rgba(215, 172, 50, .45);
  border-radius: 12px;
  background-color: #ecf1f5;
  color: #152e24;
  font: inherit;
  font-size: 14px;
  outline: none;
}
.documentos-vecino .dv-control::placeholder { color: #69776d; }
.documentos-vecino select.dv-control { cursor: pointer; }
.documentos-vecino textarea.dv-control { min-height: 138px; resize: vertical; }
.documentos-vecino .dv-hint { margin: 8px 0 0; color: #b9c8b8; font-size: 12px; line-height: 1.5; }
.documentos-vecino .dv-counter { align-self: flex-end; margin-top: 8px; color: #b9c8b8; font-size: 12px; }
.documentos-vecino .dv-preview, .documentos-vecino .dv-message, .documentos-vecino .dv-history-box {
  border: 1px solid rgba(215, 172, 50, .30);
  border-radius: 14px;
  background: rgba(4, 25, 17, .68);
  padding: 19px;
}
.documentos-vecino .dv-preview-title, .documentos-vecino .dv-meta-label { margin: 0 0 8px; color: #bfcdbd; font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; }
.documentos-vecino .dv-preview strong { color: #fbf4e2; }
.documentos-vecino .dv-form-actions { display: flex; justify-content: flex-end; margin-top: 25px; padding-top: 23px; border-top: 1px solid rgba(215, 172, 50, .25); }
.documentos-vecino .dv-alert { margin-bottom: 20px; padding: 14px 17px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
.documentos-vecino .dv-alert-success { color: #e1ffeb; border: 1px solid #68ad7a; background: rgba(21, 93, 53, .88); }
.documentos-vecino .dv-alert-error { color: #ffe2e2; border: 1px solid #c07878; background: rgba(112, 33, 33, .88); }
.documentos-vecino .dv-history-section {
  padding: 25px;
  background-image: linear-gradient(115deg, rgba(7, 32, 23, .84), rgba(8, 36, 27, .90)), url('/casitas.webp');
  background-size: cover;
  background-position: center;
}
.documentos-vecino .dv-history-heading { margin-bottom: 23px; padding: 2px 4px 20px; border-bottom: 1px solid rgba(215, 172, 50, .24); }
.documentos-vecino .dv-history-heading p { margin: 9px 0 0; }
.documentos-vecino .dv-list { display: flex; flex-direction: column; gap: 18px; }
.documentos-vecino .dv-document-card {
  overflow: hidden;
  background-image: linear-gradient(115deg, rgba(7, 30, 22, .91), rgba(8, 35, 26, .94)), url('/casas.webp');
  background-size: cover;
  background-position: center;
  transition: border-color .2s ease;
}
.documentos-vecino .dv-document-card:nth-child(even) { background-image: linear-gradient(115deg, rgba(7, 30, 22, .91), rgba(8, 35, 26, .94)), url('/sector.webp'); }
.documentos-vecino .dv-document-card:hover { border-color: rgba(239, 210, 121, .75); }
.documentos-vecino .dv-card-head { padding: 24px; border-bottom: 1px solid rgba(215, 172, 50, .25); }
.documentos-vecino .dv-card-head h3 { margin: 13px 0 8px; font-size: 23px; }
.documentos-vecino .dv-card-body { padding: 24px; }
.documentos-vecino .dv-date { color: #ccd7c9; font-size: 13px; }
.documentos-vecino .dv-message { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.75; }
.documentos-vecino .dv-card-section { margin-top: 22px; }
.documentos-vecino .dv-card-section h4 { margin: 0 0 6px; font-size: 20px; }
.documentos-vecino .dv-file-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.documentos-vecino .dv-file-item { display: flex; flex-direction: column; justify-content: space-between; gap: 15px; min-width: 0; padding: 17px; border: 1px solid rgba(215, 172, 50, .32); border-radius: 14px; background: rgba(4, 25, 17, .67); }
.documentos-vecino .dv-file-name { margin: 10px 0; overflow-wrap: anywhere; font-weight: 750; }
.documentos-vecino .dv-history-box { margin-top: 22px; }
.documentos-vecino .dv-history-item { padding: 15px; margin-top: 12px; border: 1px solid rgba(215, 172, 50, .28); border-radius: 12px; background: rgba(4, 25, 17, .72); }
.documentos-vecino .dv-history-item p { white-space: pre-wrap; overflow-wrap: anywhere; }
.documentos-vecino .dv-card-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 22px; padding-top: 19px; border-top: 1px solid rgba(215, 172, 50, .22); }
.documentos-vecino .dv-empty { padding: 55px 24px; text-align: center; background-image: linear-gradient(115deg, rgba(7, 30, 22, .84), rgba(8, 35, 26, .90)), url('/sector.webp'); background-size: cover; background-position: center; }
.documentos-vecino .dv-empty h3 { font-size: 24px; }
.documentos-vecino :is(a, button, input, select, textarea):focus-visible { outline: 2px solid #f0d375; outline-offset: 3px; }
@media (max-width: 980px) { .documentos-vecino .dv-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) {
  .documentos-vecino { padding: 18px 12px 32px; background-attachment: scroll; }
  .documentos-vecino .dv-grid, .documentos-vecino .dv-file-grid { grid-template-columns: 1fr; }
  .documentos-vecino .dv-field-full { grid-column: auto; }
  .documentos-vecino .dv-hero, .documentos-vecino .dv-form-body,
  .documentos-vecino .dv-form-heading, .documentos-vecino .dv-history-section { padding: 20px; }
  .documentos-vecino .dv-card-head, .documentos-vecino .dv-card-body { padding: 20px; }
}
@media (prefers-reduced-motion: reduce) { .documentos-vecino .dv-stat, .documentos-vecino .dv-button { transition: none; } }

/* Colores semánticos y diferenciación visual */
.documentos-vecino {
  --dv-pendiente:#f4c77c;
  --dv-revision:#8dcff4;
  --dv-aprobada:#8be1b3;
  --dv-rechazada:#f1a0aa;
  --dv-violeta:#c9b0ff;
}
.documentos-vecino .dv-stat { position: relative; overflow: hidden; border-top-width: 4px; }
.documentos-vecino .dv-stat:nth-child(1) { border-top-color:var(--dv-pendiente); }
.documentos-vecino .dv-stat:nth-child(2) { border-top-color:var(--dv-revision); }
.documentos-vecino .dv-stat:nth-child(3) { border-top-color:var(--dv-aprobada); }
.documentos-vecino .dv-stat:nth-child(4) { border-top-color:var(--dv-rechazada); }
.documentos-vecino .dv-stat:nth-child(1) .dv-stat-number { color:var(--dv-pendiente); }
.documentos-vecino .dv-stat:nth-child(2) .dv-stat-number { color:var(--dv-revision); }
.documentos-vecino .dv-stat:nth-child(3) .dv-stat-number { color:var(--dv-aprobada); }
.documentos-vecino .dv-stat:nth-child(4) .dv-stat-number { color:var(--dv-rechazada); }
.documentos-vecino .dv-warning { color:var(--dv-pendiente); border-color:rgba(244,199,124,.75); background:rgba(166,107,26,.22); }
.documentos-vecino .dv-info { color:var(--dv-revision); border-color:rgba(141,207,244,.72); background:rgba(26,94,126,.23); }
.documentos-vecino .dv-success { color:var(--dv-aprobada); border-color:rgba(139,225,179,.72); background:rgba(20,104,67,.23); }
.documentos-vecino .dv-danger { color:var(--dv-rechazada); border-color:rgba(241,160,170,.72); background:rgba(135,42,54,.23); }
.documentos-vecino .dv-document-card { border-left-width: 5px; }
.documentos-vecino .dv-estado-pendiente { border-left-color:var(--dv-pendiente); }
.documentos-vecino .dv-estado-en_revision { border-left-color:var(--dv-revision); }
.documentos-vecino .dv-estado-aprobada { border-left-color:var(--dv-aprobada); }
.documentos-vecino .dv-estado-rechazada { border-left-color:var(--dv-rechazada); }
.documentos-vecino .dv-form { border-top:4px solid var(--dv-revision); }
.documentos-vecino .dv-form-heading h2 { color:#c3eaff; }
.documentos-vecino .dv-history-section { border-top:4px solid var(--dv-violeta); }
.documentos-vecino .dv-history-section > .dv-history-heading h2 { color:#ded0ff; }
.documentos-vecino .dv-preview { border-left:3px solid var(--dv-revision); }
.documentos-vecino .dv-file-item:has(.dv-success) { border-left:3px solid var(--dv-aprobada); }
.documentos-vecino .dv-file-item:has(.dv-info) { border-left:3px solid var(--dv-revision); }
.documentos-vecino .dv-file-item .dv-button { border-color:#87c9ef; color:#d3edff; background:rgba(42,110,157,.22); }
.documentos-vecino .dv-file-item .dv-button:hover:not(:disabled) { background:rgba(56,137,187,.35); }
.documentos-vecino .dv-form .dv-button-primary { background:linear-gradient(110deg,#a2daf7,#4da7d8); border-color:#b6e6fc; color:#102f42; }
.documentos-vecino .dv-form .dv-button-primary:hover:not(:disabled) { background:linear-gradient(110deg,#c5eafd,#70bee9); }
.documentos-vecino .dv-history-box { border-left:3px solid var(--dv-violeta); }
.documentos-vecino .dv-history-item { border-left:3px solid rgba(201,176,255,.65); }
.documentos-vecino .dv-file-grid .dv-badge { overflow-wrap:anywhere; }
.documentos-vecino .dv-control:focus-visible { outline-color:#8dcff4; }
.documentos-vecino input[type=file].dv-control { padding:7px 12px; }
.documentos-vecino input[type=file].dv-control::file-selector-button { margin-right:14px; padding:9px 13px; border:0; border-radius:8px; background:#b0dcf7; color:#10354b; font-weight:750; cursor:pointer; }
@media (max-width:700px) { .documentos-vecino .dv-document-card { border-left-width:4px; } }
`

function SolicitudesDocumentoPage() {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([])
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([])
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [motivo, setMotivo] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [archivoKey, setArchivoKey] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let activo = true
    async function cargarDatos() {
      try {
        const [responseTipos, responseSolicitudes] = await Promise.all([
          fetch(`${API}/api/solicitudes/tipos-documento/`, { credentials: 'include' }),
          fetch(`${API}/api/solicitudes/documentos/`, { credentials: 'include' }),
        ])
        if (!responseTipos.ok) throw new Error('No fue posible cargar los tipos de documento.')
        if (!responseSolicitudes.ok) throw new Error('No fue posible cargar tus solicitudes de documentos.')

        const tipos = (await responseTipos.json()) as TipoDocumento[]
        const solicitudesCargadas = (await responseSolicitudes.json()) as SolicitudDocumento[]
        if (activo) {
          setTiposDocumento(tipos)
          setSolicitudes(solicitudesCargadas)
          if (tipos.length > 0) setTipoDocumento(String(tipos[0].id))
        }
      } catch (err) {
        if (activo) setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
      } finally {
        if (activo) setCargando(false)
      }
    }
    void cargarDatos()
    return () => { activo = false }
  }, [])

  async function crearSolicitud(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tipoDocumento) {
      setError('Debes seleccionar un tipo de documento.')
      return
    }
    setEnviando(true)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API}/api/solicitudes/documentos/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_documento: Number(tipoDocumento), motivo }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || data.tipo_documento?.[0] || data.motivo?.[0] || 'No fue posible enviar la solicitud.')
      }
      const nuevaSolicitud = data as SolicitudDocumento

      // Se conserva la carga separada de adjuntos mediante FormData.
      if (archivo) {
        const formData = new FormData()
        formData.append('archivo', archivo)
        const responseArchivo = await fetch(
          `${API}/api/solicitudes/documentos/${nuevaSolicitud.id}/archivos/`,
          { method: 'POST', credentials: 'include', body: formData }
        )
        if (!responseArchivo.ok) {
          const dataArchivo = await responseArchivo.json()
          throw new Error(dataArchivo.archivo?.[0] || dataArchivo.detail || 'La solicitud fue creada, pero no fue posible adjuntar el archivo.')
        }
      }

      // Refrescar el listado si hubo adjunto para incluirlo en el historial visible.
      // Si la recarga falla, se conserva la solicitud recién creada.
      let solicitudParaLista = nuevaSolicitud
      if (archivo) {
        try {
          const respuestaActualizada = await fetch(`${API}/api/solicitudes/documentos/`, { credentials: 'include' })
          if (respuestaActualizada.ok) {
            const listaActualizada = (await respuestaActualizada.json()) as SolicitudDocumento[]
            const actualizada = listaActualizada.find((item) => item.id === nuevaSolicitud.id)
            if (actualizada) solicitudParaLista = actualizada
          }
        } catch {
          // El envío ya fue exitoso, no se bloquea por un error de recarga.
        }
      }
      setSolicitudes((actuales) => [solicitudParaLista, ...actuales])
      setMotivo('')
      setArchivo(null)
      setArchivoKey((actual) => actual + 1)
      setMensaje(`Solicitud enviada correctamente. Número de seguimiento: ${nuevaSolicitud.numero_seguimiento}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  async function descargarArchivo(item: ArchivoSolicitudDocumento) {
    setError('')
    try {
      const response = await fetch(
        `${API}/api/solicitudes/documentos/archivos/${item.id}/descargar/`,
        { credentials: 'include' }
      )
      if (!response.ok) throw new Error('No fue posible descargar el archivo.')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = item.nombre_original
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al descargar el archivo.')
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado_actual === 'PENDIENTE').length
  const enRevision = solicitudes.filter((s) => s.estado_actual === 'EN_REVISION').length
  const aprobadas = solicitudes.filter((s) => s.estado_actual === 'APROBADA').length
  const rechazadas = solicitudes.filter((s) => s.estado_actual === 'RECHAZADA').length
  const tipoSeleccionado = tiposDocumento.find((t) => String(t.id) === tipoDocumento)
  const indicadores = [
    { titulo: 'Pendientes', valor: pendientes, etiqueta: 'Pendientes', clase: 'dv-warning' },
    { titulo: 'En revisión', valor: enRevision, etiqueta: 'Revisando', clase: 'dv-info' },
    { titulo: 'Aprobadas', valor: aprobadas, etiqueta: 'Aprobadas', clase: 'dv-success' },
    { titulo: 'Rechazadas', valor: rechazadas, etiqueta: 'Rechazadas', clase: 'dv-danger' },
  ]

  return (
    <main className="documentos-vecino">
      <style>{estilosDocumentoVecino}</style>
      <div className="dv-container">
        <header className="dv-panel dv-hero">
          <div className="dv-hero-row">
            <div>
              <div className="dv-title-line">
                <h1>Solicitud de Documentos</h1>
                <span className="dv-badge">Vecino</span>
              </div>
              <p className="dv-muted">Solicita documentos a tu Junta de Vecinos, adjunta antecedentes y revisa el estado de cada solicitud.</p>
            </div>
            <Link to="/vecino" className="dv-button">← Volver al Panel</Link>
          </div>
        </header>

        {!cargando && (
          <section className="dv-stats" aria-label="Resumen de solicitudes de documentos">
            {indicadores.map((item) => (
              <div key={item.titulo} className="dv-panel dv-stat">
                <p className="dv-stat-label">{item.titulo}</p>
                <div className="dv-stat-bottom">
                  <span className="dv-stat-number">{item.valor}</span>
                  <span className={`dv-badge ${item.clase}`}>{item.etiqueta}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        <form onSubmit={crearSolicitud} className="dv-panel dv-form">
          <div className="dv-form-heading">
            <div className="dv-title-line">
              <h2>Nueva solicitud de documento</h2>
              <span className="dv-badge dv-info">Nuevo</span>
            </div>
            <p className="dv-muted">Selecciona el documento que necesitas y explica brevemente el motivo de tu solicitud.</p>
          </div>

          <div className="dv-form-body">
            {mensaje && <div className="dv-alert dv-alert-success" role="status">{mensaje}</div>}
            {error && <div className="dv-alert dv-alert-error" role="alert">{error}</div>}

            {cargando ? (
              <p className="dv-muted" role="status">Cargando tipos de documento...</p>
            ) : (
              <>
                <div className="dv-grid">
                  <label className="dv-field">
                    <span className="dv-label">Tipo de documento <span className="dv-required">Obligatorio</span></span>
                    <select
                      className="dv-control"
                      value={tipoDocumento}
                      onChange={(event) => setTipoDocumento(event.target.value)}
                      required
                      disabled={tiposDocumento.length === 0}
                    >
                      {tiposDocumento.length === 0 && <option value="">No hay documentos disponibles</option>}
                      {tiposDocumento.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                      ))}
                    </select>
                    <span className="dv-hint">Selecciona el documento que deseas solicitar a la directiva.</span>
                  </label>

                  <div className="dv-preview">
                    <p className="dv-preview-title">Documento seleccionado</p>
                    <strong>{tipoSeleccionado?.nombre ?? 'Sin seleccionar'}</strong>
                    <p className="dv-muted" style={{ margin: '9px 0 0', fontSize: 14 }}>
                      {tipoSeleccionado?.descripcion || 'Este tipo de documento no tiene una descripción adicional.'}
                    </p>
                  </div>

                  <label className="dv-field dv-field-full">
                    <span className="dv-label">Motivo <span className="dv-required">Obligatorio</span></span>
                    <textarea
                      className="dv-control"
                      value={motivo}
                      onChange={(event) => setMotivo(event.target.value)}
                      placeholder="Indica para qué necesitas el documento."
                      required
                    />
                    <span className="dv-counter">{motivo.length} caracteres</span>
                  </label>

                  <label className="dv-field dv-field-full">
                    <span className="dv-label">Archivo adjunto <span className="dv-muted" style={{ fontWeight: 400, fontSize: 12 }}>Opcional</span></span>
                    <input
                      key={archivoKey}
                      type="file"
                      className="dv-control"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                    />
                    <span className="dv-hint">Máximo 10 MB. PDF, JPG, PNG, DOC o DOCX.</span>
                    {archivo && <span className="dv-badge" style={{ alignSelf: 'flex-start', marginTop: 8 }}>{archivo.name}</span>}
                  </label>
                </div>
                <div className="dv-form-actions">
                  <button type="submit" className="dv-button dv-button-primary" disabled={enviando || !tipoDocumento}>
                    {enviando ? 'Enviando...' : 'Solicitar documento'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>

        {!cargando && (
          <section className="dv-panel dv-history-section">
            <div className="dv-history-heading dv-heading-row">
              <div>
                <h2>Mis solicitudes de documentos</h2>
                <p className="dv-muted">Revisa el seguimiento, historial y archivos de tus solicitudes.</p>
              </div>
              {solicitudes.length > 0 && (
                <span className="dv-badge">{solicitudes.length} {solicitudes.length === 1 ? 'solicitud' : 'solicitudes'}</span>
              )}
            </div>

            {solicitudes.length === 0 ? (
              <div className="dv-panel dv-empty">
                <h3>No tienes solicitudes de documentos</h3>
                <p className="dv-muted">Cuando solicites un documento podrás revisar su estado y seguimiento en esta sección.</p>
              </div>
            ) : (
              <div className="dv-list">
                {solicitudes.map((solicitud) => (
                  <article key={solicitud.id} className={`dv-panel dv-document-card dv-estado-${solicitud.estado_actual.toLowerCase()}`}>
                    <div className="dv-card-head dv-flex-between">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="dv-title-line">
                          <span className={estadoClase(solicitud.estado_actual)}>{estadoNombre(solicitud.estado_actual)}</span>
                          <span className="dv-badge">{solicitud.numero_seguimiento}</span>
                        </div>
                        <h3>{solicitud.tipo_documento_nombre}</h3>
                        <p className="dv-muted" style={{ margin: 0 }}>{solicitud.junta_nombre}</p>
                        {solicitud.responsable_username && (
                          <p className="dv-muted" style={{ margin: '6px 0 0' }}>
                            Responsable: <strong style={{ color: '#fbf4e2' }}>{solicitud.responsable_username}</strong>
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="dv-meta-label">Solicitada</p>
                        <span className="dv-date">{formatearFecha(solicitud.fecha_solicitud)}</span>
                      </div>
                    </div>

                    <div className="dv-card-body">
                      <p className="dv-meta-label">Motivo</p>
                      <div className="dv-message">{solicitud.motivo}</div>

                      {solicitud.archivos.length > 0 && (
                        <div className="dv-card-section">
                          <div className="dv-flex-between">
                            <div>
                              <h4>Archivos</h4>
                              <p className="dv-muted" style={{ margin: 0 }}>Antecedentes adjuntos y documentos emitidos.</p>
                            </div>
                            <span className="dv-badge">{solicitud.archivos.length} {solicitud.archivos.length === 1 ? 'archivo' : 'archivos'}</span>
                          </div>
                          <div className="dv-file-grid">
                            {solicitud.archivos.map((item) => (
                              <div key={item.id} className="dv-file-item">
                                <div>
                                  <span className={item.tipo_uso === 'DOCUMENTO_EMITIDO' ? 'dv-badge dv-success' : 'dv-badge dv-info'}>
                                    {item.tipo_uso === 'DOCUMENTO_EMITIDO' ? 'Documento emitido' : 'Archivo adjunto'}
                                  </span>
                                  <p className="dv-file-name">{item.nombre_original}</p>
                                  <p className="dv-muted" style={{ fontSize: 12, margin: 0 }}>Subido por {item.subido_por_username}</p>
                                  <p className="dv-muted" style={{ fontSize: 12, margin: '4px 0 0' }}>{formatearFecha(item.fecha_subida)}</p>
                                </div>
                                <button type="button" className="dv-button" onClick={() => void descargarArchivo(item)}>Descargar</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {solicitud.historial.length > 0 && (
                        <div className="dv-history-box">
                          <div className="dv-flex-between">
                            <div>
                              <h4 style={{ margin: 0 }}>Historial</h4>
                              <p className="dv-muted" style={{ margin: '5px 0 0' }}>Cambios registrados durante la gestión de tu solicitud.</p>
                            </div>
                            <span className="dv-badge">{solicitud.historial.length} {solicitud.historial.length === 1 ? 'movimiento' : 'movimientos'}</span>
                          </div>
                          {solicitud.historial.map((registro) => (
                            <div key={registro.id} className="dv-history-item">
                              <div className="dv-flex-between">
                                <div className="dv-title-line">
                                  <span className={`dv-badge ${registro.estado_nuevo === 'PENDIENTE' ? 'dv-warning' : registro.estado_nuevo === 'EN_REVISION' ? 'dv-info' : registro.estado_nuevo === 'APROBADA' ? 'dv-success' : registro.estado_nuevo === 'RECHAZADA' ? 'dv-danger' : ''}`}>{estadoNombre(registro.estado_nuevo)}</span>
                                  <strong>{registro.usuario_responsable_username}</strong>
                                </div>
                                <span className="dv-date">{formatearFecha(registro.fecha_cambio)}</span>
                              </div>
                              {registro.comentario_respuesta && <p className="dv-muted" style={{ marginBottom: 0 }}>{registro.comentario_respuesta}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {solicitud.fecha_resolucion && (
                        <div className="dv-preview dv-card-section">
                          <span className="dv-muted">Fecha de resolución: </span>
                          <strong>{formatearFecha(solicitud.fecha_resolucion)}</strong>
                        </div>
                      )}

                      <div className="dv-card-footer">
                        <span className="dv-date">Solicitud #{solicitud.id}</span>
                        <span className={estadoClase(solicitud.estado_actual)}>{estadoNombre(solicitud.estado_actual)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default SolicitudesDocumentoPage
