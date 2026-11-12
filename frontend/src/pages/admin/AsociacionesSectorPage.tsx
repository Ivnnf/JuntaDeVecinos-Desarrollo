import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type VerificacionResidencia = {
  id: number
  tipo_documento: string
  estado:
  | 'PENDIENTE'
  | 'REVISION_MANUAL'
  | 'VALIDADA'
  | 'RECHAZADA'
  archivo_url: string | null
  nombre_extraido: string | null
  direccion_extraida: string | null
  comuna_extraida: string | null
  fecha_documento_extraida: string | null
  confianza_ocr: number | null
  documento_duplicado: boolean
  observacion_automatica: string | null
}

type AsociacionPendiente = {
  id: number
  username: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  email: string
  sector_id: number
  sector_nombre: string
  junta_id: number
  junta_nombre: string
  estado_asociacion_sector:
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'RECHAZADA'
  verificacion_residencia:
  | VerificacionResidencia
  | null
}

type FiltroEstado =
  | 'GENERAL'
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'RECHAZADA'
  | 'SIN_VERIFICACION'
  | 'REVISION_MANUAL'

// Estilos integrados: no necesita archivo CSS adicional.
const estilosAsociaciones = String.raw`
/* APT | Asociaciones Territoriales — estilo fotográfico integrado. */
.apt-asociaciones {
  --apt-verde-profundo: #0b2319;
  --apt-verde-tarjeta: #102b20;
  --apt-dorado: #d9ba68;
  --apt-crema: #fbf4e2;
  min-height: 100vh;
  color: #f4f2e8;
  background-color: #0b2319;
  background-image:
    linear-gradient(115deg, rgba(5, 28, 20, .76), rgba(5, 28, 20, .58)),
    url('/casitas.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
.apt-asociaciones > section { position: relative; }
.apt-asociaciones h1,
.apt-asociaciones h2,
.apt-asociaciones h3 {
  color: var(--apt-crema);
  font-family: Georgia, 'Times New Roman', serif;
  letter-spacing: -.015em;
}
.apt-asociaciones p, .apt-asociaciones td, .apt-asociaciones label {
  color: #f0f1e6;
}
.apt-asociaciones .text-base-content\/40,
.apt-asociaciones .text-base-content\/45,
.apt-asociaciones .text-base-content\/50,
.apt-asociaciones .text-base-content\/60,
.apt-asociaciones .text-base-content\/70 {
  color: #d9e0d3;
}
.apt-asociaciones .apt-asociaciones-encabezado,
.apt-asociaciones .apt-asociaciones-estadisticas > div,
.apt-asociaciones .apt-asociaciones-panel,
.apt-asociaciones .apt-asociaciones-cargando {
  border: 1px solid rgba(220, 185, 94, .43);
  border-radius: 1.5rem;
  box-shadow: 0 18px 45px rgba(4, 20, 13, .27);
  background-color: var(--apt-verde-tarjeta);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  overflow: hidden;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
/* Foto sutil del encabezado principal. */
.apt-asociaciones .apt-asociaciones-encabezado {
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .80), rgba(8, 42, 30, .77)),
    url('/asociaciones-directiva.webp');
  padding: 2rem;
  transition: border-color .25s ease;
}
.apt-asociaciones .apt-asociaciones-encabezado:hover {
  border-color: rgba(235, 205, 123, .65);
}
.apt-asociaciones .apt-asociaciones-encabezado h1 {
  font-size: clamp(2.1rem, 3.3vw, 3rem);
  line-height: 1.12;
}
/* Fotografías diferentes en los tres indicadores. */
.apt-asociaciones .apt-asociaciones-estadisticas > div {
  min-height: 132px;
  padding: 1.4rem;
  transition: transform .2s ease, border-color .2s ease;
}
.apt-asociaciones .apt-asociaciones-estadisticas > div:hover {
  transform: translateY(-2px);
  border-color: rgba(235, 205, 123, .72);
}
.apt-asociaciones .apt-asociaciones-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .85)),
    url('/registro-vecino.webp');
}
.apt-asociaciones .apt-asociaciones-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .78), rgba(8, 34, 24, .84)),
    url('/sector.webp');
}
.apt-asociaciones .apt-asociaciones-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)),
    url('/gestion-directiva.webp');
}
.apt-asociaciones .apt-asociaciones-estadisticas > div > p {
  color: #e3e7dc;
  font-size: .94rem;
}
.apt-asociaciones .apt-asociaciones-estadisticas .text-3xl,
.apt-asociaciones .apt-asociaciones-estadisticas .text-xl {
  color: #fff8e8;
  text-shadow: 0 2px 9px rgba(0,0,0,.28);
}
/* Un contenedor fotográfico único para filtros, título y tabla. */
.apt-asociaciones .apt-asociaciones-panel {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .86), rgba(8, 34, 24, .89)),
    url('/asociaciones-directiva.webp');
  padding: 1.5rem;
}
.apt-asociaciones .apt-asociaciones-filtros-estado {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  margin-bottom: 1.6rem;
  padding: .1rem 0 .1rem;
}
.apt-asociaciones .apt-asociaciones-filtros-territorio {
  padding: 1.3rem;
  border: 1px solid rgba(220, 185, 94, .34);
  border-radius: 1.15rem;
  background-color: rgba(6, 29, 19, .58);
  background-image:
    linear-gradient(115deg, rgba(6, 29, 19, .82), rgba(6, 29, 19, .87)),
    url('/sector.webp');
  background-size: cover;
  background-position: center;
}
.apt-asociaciones .apt-asociaciones-titulo-lista {
  border-top: 1px solid rgba(220, 185, 94, .22);
  padding-top: 1.25rem;
  margin-top: .25rem;
}
.apt-asociaciones .apt-asociaciones-tabla,
.apt-asociaciones .apt-asociaciones-sin-resultados {
  border: 1px solid rgba(220, 185, 94, .38);
  border-radius: 1.1rem;
  background-color: #0b281b;
  background-image:
    linear-gradient(115deg, rgba(7, 29, 20, .91), rgba(7, 29, 20, .94)),
    url('/casitas.webp');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.apt-asociaciones .apt-asociaciones-cargando {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .85), rgba(8, 34, 24, .87)),
    url('/directivas.webp');
}
/* Contraste accesible para tablas grandes y controles. */
.apt-asociaciones .apt-asociaciones-tabla .table {
  width: 100%;
  min-width: 1110px;
  background: transparent;
  color: #f6f4e9;
}
.apt-asociaciones .apt-asociaciones-tabla .table thead {
  background: rgba(5, 23, 16, .78);
  border-bottom: 1px solid rgba(220,185,94,.33);
}
.apt-asociaciones .apt-asociaciones-tabla .table thead th {
  color: #f4dfaa;
  font-size: .78rem;
  font-weight: 700;
  white-space: nowrap;
}
.apt-asociaciones .apt-asociaciones-tabla .table tbody tr {
  background: rgba(11, 39, 26, .17);
  border-bottom: 1px solid rgba(215, 183, 96, .18);
  transition: background-color .2s ease;
}
.apt-asociaciones .apt-asociaciones-tabla .table tbody tr:nth-child(even) {
  background: rgba(9, 36, 24, .37);
}
.apt-asociaciones .apt-asociaciones-tabla .table tbody tr:hover {
  background: rgba(51, 87, 62, .54);
}
.apt-asociaciones .apt-asociaciones-tabla .table td {
  color: #f3f2e8;
  vertical-align: middle;
  border-bottom-color: rgba(215, 183, 96, .12);
}
.apt-asociaciones .apt-asociaciones-tabla .rounded-full.bg-violet-500\/10 {
  background: rgba(220, 185, 94, .20);
  color: #f9dc8d;
  border: 1px solid rgba(220,185,94,.4);
}
.apt-asociaciones .select {
  width: 100%;
  min-height: 2.9rem;
  background-color: #092319;
  border: 1px solid rgba(220,185,94,.45);
  border-radius: .85rem;
  color: #f6f3e8;
  outline-color: #dabd76;
}
.apt-asociaciones .select:focus,
.apt-asociaciones .select:focus-visible {
  border-color: #e1bd6c;
  outline: 1px solid #e1bd6c;
}
.apt-asociaciones .select option {
  background: #102b20;
  color: #fbf4e2;
}
.apt-asociaciones .btn {
  border-radius: .75rem;
  font-weight: 700;
  transition: transform .2s ease, background-color .2s ease, border-color .2s ease;
}
.apt-asociaciones .btn:hover:not(:disabled) { transform: translateY(-1px); }
.apt-asociaciones .btn-primary {
  background: #d9ba68;
  border-color: #d9ba68;
  color: #142b1f;
}
.apt-asociaciones .btn-primary:hover:not(:disabled) {
  background: #ebcf87;
  border-color: #ebcf87;
}
.apt-asociaciones .btn-outline {
  background-color: rgba(7, 30, 20, .65);
  border-color: rgba(219, 188, 105, .57);
  color: #f3e3b5;
}
.apt-asociaciones .btn-outline:hover:not(:disabled) {
  background-color: rgba(211, 177, 97, .18);
  border-color: #f0d288;
  color: #fff3d3;
}
.apt-asociaciones .btn-warning:not(.btn-outline) {
  background: #e6c477;
  border-color: #e6c477;
  color: #1b281f;
}
.apt-asociaciones .btn-success:not(.btn-outline) {
  background: #90c6a0;
  border-color: #90c6a0;
  color: #0d291a;
}
.apt-asociaciones .btn-error:not(.btn-outline) {
  background: #b86c69;
  border-color: #b86c69;
  color: #fff;
}
.apt-asociaciones .btn-info:not(.btn-outline) {
  background: #a8c7c2;
  border-color: #a8c7c2;
  color: #10251f;
}
.apt-asociaciones .btn-neutral:not(.btn-outline) {
  background: #668176;
  border-color: #668176;
  color: #fff;
}
.apt-asociaciones .badge {
  border-color: rgba(231, 200, 123, .45);
  color: #f9ecc8;
  background-color: rgba(12, 47, 31, .75);
  font-weight: 650;
}
.apt-asociaciones .badge-success:not(.badge-outline) {
  color: #11291c;
  background: #a5d7ac;
  border-color: #a5d7ac;
}
.apt-asociaciones .badge-warning:not(.badge-outline) {
  color: #172b20;
  background: #e6c775;
  border-color: #e6c775;
}
.apt-asociaciones .badge-error:not(.badge-outline) {
  color: #fff;
  background: #a94742;
  border-color: #a94742;
}
.apt-asociaciones .badge-outline,
.apt-asociaciones .badge-ghost {
  background: rgba(8, 35, 24, .52);
  color: #f6eaca;
  border-color: rgba(228, 194, 111, .52);
}
.apt-asociaciones .alert {
  border-radius: 1rem;
  border-width: 1px;
}
.apt-asociaciones .alert-error { background-color: #3c1b1b; color: #ffe6e6; }
.apt-asociaciones .alert-success { background-color: #173f2a; color: #ddfce5; }
@media (max-width: 640px) {
  .apt-asociaciones .apt-asociaciones-encabezado,
  .apt-asociaciones .apt-asociaciones-panel { padding: 1.1rem; }
  .apt-asociaciones .apt-asociaciones-filtros-territorio { padding: 1rem; }
  .apt-asociaciones .apt-asociaciones-encabezado h1 { font-size: 2rem; }
  .apt-asociaciones { background-attachment: scroll; }
}
@media (prefers-reduced-motion: reduce) {
  .apt-asociaciones .btn,
  .apt-asociaciones .apt-asociaciones-estadisticas > div,
  .apt-asociaciones .apt-asociaciones-tabla .table tbody tr { transition: none; }
}


/* Tabla agrupada: datos completos, sin columnas estrechas ni correos cortados por letra. */
.apt-asociaciones .apt-asociaciones-tabla .apt-asociaciones-tabla-organizada {
  min-width: 930px;
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}
.apt-asociaciones .apt-asociaciones-tabla-organizada th:nth-child(1) { width: 29%; }
.apt-asociaciones .apt-asociaciones-tabla-organizada th:nth-child(2) { width: 27%; }
.apt-asociaciones .apt-asociaciones-tabla-organizada th:nth-child(3) { width: 26%; }
.apt-asociaciones .apt-asociaciones-tabla-organizada th:nth-child(4) { width: 18%; }
.apt-asociaciones .apt-asociaciones-tabla-organizada :is(td,th) {
  padding: 20px 17px;
  text-align: left;
  vertical-align: top;
}
.apt-asociaciones .apt-asociaciones-tabla-organizada thead th {
  color: #f5dfac;
  letter-spacing: .015em;
  background: rgba(4,24,16,.56);
}
.apt-asociaciones .apt-asociaciones-tabla-organizada tbody tr:nth-child(odd) {
  background: rgba(21,52,37,.6);
}
.apt-asociaciones .apt-asociaciones-tabla-organizada tbody tr:nth-child(even) {
  background: rgba(8,35,25,.78);
}
.apt-asociaciones .apt-asoc-persona { display:flex; align-items:center; gap:12px; min-width:0; }
.apt-asociaciones .apt-asoc-avatar {
  display:grid; place-items:center; flex:none; width:44px; height:44px;
  border-radius:50%; background:rgba(196,173,246,.19); color:#dfc9ff;
  border:1px solid rgba(196,173,246,.45); font-weight:800;
}
.apt-asociaciones .apt-asoc-persona-info { min-width:0; }
.apt-asociaciones .apt-asoc-nombre { margin:0; font-weight:750; line-height:1.4; overflow-wrap:break-word; }
.apt-asociaciones .apt-asoc-username { margin:4px 0 0; color:#cad8cb; font-size:12px; overflow-wrap:anywhere; }
.apt-asociaciones .apt-asoc-datos { margin-top:15px; padding-top:12px; border-top:1px solid rgba(219,188,105,.18); }
.apt-asociaciones .apt-asoc-dato { display:grid; grid-template-columns:48px minmax(0,1fr); gap:9px; margin-top:7px; font-size:13px; }
.apt-asociaciones .apt-asoc-etiqueta { color:#c0ccbd; font-size:11px; font-weight:750; letter-spacing:.045em; text-transform:uppercase; }
.apt-asociaciones .apt-asoc-email { overflow-wrap:anywhere; word-break:normal; line-height:1.5; }
.apt-asociaciones .apt-asoc-territorio { display:flex; flex-direction:column; align-items:flex-start; min-width:0; gap:5px; }
.apt-asociaciones .apt-asoc-junta { font-size:14px; font-weight:750; line-height:1.5; overflow-wrap:break-word; }
.apt-asociaciones .apt-asoc-etiqueta-sector { margin-top:13px; }
.apt-asociaciones .apt-asoc-sector { color:#b3e7f1; background:rgba(93,161,188,.12); border:1px solid rgba(122,202,226,.44); border-radius:9px; padding:5px 10px; font-size:13px; font-weight:700; overflow-wrap:anywhere; }
.apt-asociaciones .apt-asoc-estados { display:flex; flex-direction:column; align-items:flex-start; gap:13px; }
.apt-asociaciones .apt-asoc-estado-linea { display:flex; flex-direction:column; align-items:flex-start; gap:5px; }
.apt-asociaciones .apt-asoc-chip { display:inline-flex; align-items:center; min-height:27px; border:1px solid; border-radius:8px; padding:5px 11px; font-size:12px; font-weight:800; line-height:1.3; }
.apt-asociaciones .apt-asoc-chip-exito { color:#142a1e; background:#abe0b8; border-color:#abe0b8; }
.apt-asociaciones .apt-asoc-chip-pendiente { color:#fbe1a1; background:rgba(179,124,31,.17); border-color:rgba(241,193,109,.58); }
.apt-asociaciones .apt-asoc-chip-error { color:#ffc1c4; background:rgba(144,45,56,.24); border-color:rgba(243,151,158,.58); }
.apt-asociaciones .apt-asoc-chip-revision { color:#c7e7ff; background:rgba(52,111,167,.23); border-color:rgba(137,192,243,.56); }
.apt-asociaciones .apt-asoc-chip-neutro { color:#dde5df; background:rgba(197,209,202,.1); border-color:rgba(197,209,202,.4); }
.apt-asociaciones .apt-asoc-revisar { border:1px solid rgba(155,199,234,.58); border-radius:9px; background:rgba(60,119,164,.18); color:#c6e7ff; padding:9px 11px; font:inherit; font-size:12px; font-weight:750; cursor:pointer; text-align:left; }
.apt-asociaciones .apt-asoc-revisar:hover { background:rgba(60,119,164,.32); }
.apt-asociaciones .apt-asoc-acciones { display:flex; flex-direction:column; gap:9px; align-items:stretch; }
.apt-asociaciones .apt-asoc-acciones .btn { width:100%; min-height:34px; white-space:nowrap; }
.apt-asociaciones .apt-asoc-ayuda { font-size:11px; color:#d9c8a5; line-height:1.4; }
.apt-asociaciones .apt-asoc-resuelta { color:#c1d3c9; font-size:13px; }
.apt-asociaciones .apt-asoc-revisar:focus-visible { outline:2px solid #d9ba68; outline-offset:3px; }
@media (max-width: 900px) {
  .apt-asociaciones .apt-asociaciones-tabla-scroll { overflow:visible; }
  .apt-asociaciones .apt-asociaciones-tabla-organizada { display:block; min-width:0; }
  .apt-asociaciones .apt-asociaciones-tabla-organizada thead { display:none; }
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody { display:grid; gap:13px; padding:12px; }
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody tr {
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0;
    border:1px solid rgba(219,188,105,.35); border-radius:15px; overflow:hidden;
  }
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody td { display:block; min-width:0; padding:16px; border-bottom:1px solid rgba(219,188,105,.15); }
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody td::before { content:attr(data-label); display:block; margin-bottom:12px; color:#efd78f; font-size:12px; font-weight:800; letter-spacing:.03em; }
  .apt-asociaciones .apt-asoc-acciones { flex-direction:row; flex-wrap:wrap; }
  .apt-asociaciones .apt-asoc-acciones .btn { width:auto; flex:1; }
  .apt-asociaciones .apt-asoc-ayuda { width:100%; }
}
@media (max-width: 600px) {
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody tr { grid-template-columns:1fr; }
  .apt-asociaciones .apt-asociaciones-tabla-organizada tbody td { padding:16px; }
  .apt-asociaciones .apt-asoc-acciones .btn { min-width:110px; }
}

/* Modal original de verificación: apariencia consistente y contraste. */
.apt-asociaciones .modal { z-index: 1000; }
.apt-asociaciones .modal-box {
  max-height: min(90vh, 920px);
  overflow-y: auto;
  border: 1px solid rgba(220,185,94,.55);
  border-radius: 1.35rem;
  background: #102b20;
  color: #f6f0dd;
  box-shadow: 0 22px 70px rgba(0,0,0,.5);
}
.apt-asociaciones .modal-box .rounded-xl { border-color: rgba(220,185,94,.3); }
.apt-asociaciones .modal-box .bg-base-200\/50 { background: rgba(5,27,17,.6); }
.apt-asociaciones .modal-backdrop { background: rgba(0,0,0,.58); }
.apt-asociaciones .modal-box a.btn { white-space: normal; overflow-wrap: anywhere; }
`

function AsociacionesSectorPage() {


  const [asociaciones, setAsociaciones] =
    useState<AsociacionPendiente[]>([])

  const [cargando, setCargando] = useState(true)

  const [asociacionSeleccionada, setAsociacionSeleccionada] =
    useState<AsociacionPendiente | null>(null)

  const [procesandoId, setProcesandoId] =
    useState<number | null>(null)

  const [error, setError] = useState('')

  const [mensaje, setMensaje] = useState('')

  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('GENERAL')

  const [filtroJunta, setFiltroJunta] =
    useState<number | null>(null)

  const [filtroSector, setFiltroSector] =
    useState<number | null>(null)

  const cargarAsociaciones = async () => {
    setCargando(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/organizacion/asociaciones/',
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        setError(
          'No fue posible cargar las asociaciones pendientes.',
        )
        return
      }

      const data =
        (await response.json()) as AsociacionPendiente[]

      setAsociaciones(data)
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarAsociaciones()
  }, [])

  const juntasDisponibles = Array.from(
    new Map(
      asociaciones.map((asociacion) => [
        asociacion.junta_id,
        {
          id: asociacion.junta_id,
          nombre: asociacion.junta_nombre,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  const sectoresDisponibles = Array.from(
    new Map(
      asociaciones
        .filter(
          (asociacion) =>
            filtroJunta === null ||
            asociacion.junta_id === filtroJunta,
        )
        .map((asociacion) => [
          asociacion.sector_id,
          {
            id: asociacion.sector_id,
            nombre: asociacion.sector_nombre,
          },
        ]),
    ).values(),
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  const asociacionesFiltradas = asociaciones.filter(
    (asociacion) => {
      const coincideJunta =
        filtroJunta === null ||
        asociacion.junta_id === filtroJunta

      const coincideSector =
        filtroSector === null ||
        asociacion.sector_id === filtroSector

      if (!coincideJunta || !coincideSector) {
        return false
      }

      switch (filtroEstado) {
        case 'PENDIENTE':
          return (
            asociacion.estado_asociacion_sector ===
            'PENDIENTE'
          )

        case 'CONFIRMADA':
          return (
            asociacion.estado_asociacion_sector ===
            'CONFIRMADA'
          )

        case 'RECHAZADA':
          return (
            asociacion.estado_asociacion_sector ===
            'RECHAZADA'
          )

        case 'SIN_VERIFICACION':
          return (
            asociacion.verificacion_residencia === null
          )

        case 'REVISION_MANUAL':
          return (
            asociacion.verificacion_residencia?.estado ===
            'REVISION_MANUAL'
          )

        case 'GENERAL':
        default:
          return true
      }
    },
  )

  const configuracionFiltro = {
    GENERAL: {
      titulo: 'Todas las solicitudes',
      descripcion:
        'Consulta todas las solicitudes de asociación territorial.',
      resumen: 'Total de solicitudes',
    },
    PENDIENTE: {
      titulo: 'Solicitudes pendientes',
      descripcion:
        'Verifica los datos del vecino antes de resolver la solicitud.',
      resumen: 'Solicitudes pendientes',
    },
    CONFIRMADA: {
      titulo: 'Solicitudes aceptadas',
      descripcion:
        'Asociaciones territoriales que ya fueron confirmadas.',
      resumen: 'Solicitudes aceptadas',
    },
    RECHAZADA: {
      titulo: 'Solicitudes rechazadas',
      descripcion:
        'Asociaciones territoriales que fueron rechazadas.',
      resumen: 'Solicitudes rechazadas',
    },
    SIN_VERIFICACION: {
      titulo: 'Sin verificación',
      descripcion:
        'Vecinos que no poseen una verificación de residencia registrada.',
      resumen: 'Sin verificación',
    },
    REVISION_MANUAL: {
      titulo: 'Revisión manual',
      descripcion:
        'Verificaciones que requieren revisión manual.',
      resumen: 'Revisión manual',
    },
  }[filtroEstado]
  const resolverAsociacion = async (
    usuarioId: number,
    accion: 'CONFIRMAR' | 'RECHAZAR',
  ) => {
    setError('')
    setMensaje('')
    setProcesandoId(usuarioId)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/resolver-asociacion-sector/${usuarioId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            accion,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
          'No fue posible resolver la asociación.',
        )
        return
      }

      setAsociaciones((actuales) =>
        actuales.map((asociacion) =>
          asociacion.id === usuarioId
            ? {
              ...asociacion,
              estado_asociacion_sector:
                accion === 'CONFIRMAR'
                  ? 'CONFIRMADA'
                  : 'RECHAZADA',
            }
            : asociacion,
        ),
      )

      setMensaje(
        accion === 'CONFIRMAR'
          ? 'Asociación confirmada correctamente.'
          : 'Asociación rechazada correctamente.',
      )
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.',
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const resolverVerificacion = async (
    usuarioId: number,
    verificacionId: number,
    accion: 'REVISION_MANUAL' | 'VALIDAR',
  ) => {
    setError('')
    setMensaje('')
    setProcesandoId(usuarioId)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/verificaciones-residencia/${verificacionId}/resolver/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            accion,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
          'No fue posible actualizar la verificación.',
        )
        return
      }

      setAsociaciones((actuales) =>
        actuales.map((asociacion) =>
          asociacion.id === usuarioId &&
            asociacion.verificacion_residencia
            ? {
              ...asociacion,
              verificacion_residencia: {
                ...asociacion.verificacion_residencia,
                estado: data.estado,
              },
            }
            : asociacion,
        ),
      )
      setAsociacionSeleccionada((actual) => {
        if (
          !actual ||
          actual.id !== usuarioId ||
          !actual.verificacion_residencia
        ) {
          return actual
        }

        return {
          ...actual,
          verificacion_residencia: {
            ...actual.verificacion_residencia,
            estado: data.estado,
          },
        }
      })
      setMensaje(
        accion === 'VALIDAR'
          ? 'Residencia validada correctamente.'
          : 'Verificación enviada a revisión manual.',
      )
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.',
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const obtenerNombreCompleto = (
    asociacion: AsociacionPendiente,
  ) => {
    return [
      asociacion.nombres,
      asociacion.apellido_paterno,
      asociacion.apellido_materno,
    ]
      .filter(Boolean)
      .join(' ') || asociacion.username
  }

  const obtenerIniciales = (
    asociacion: AsociacionPendiente,
  ) => {
    const nombre = obtenerNombreCompleto(asociacion)

    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) =>
        parte.charAt(0).toUpperCase(),
      )
      .join('')
  }

  return (
    <main className="apt-asociaciones min-h-screen px-4 py-8">
      <style>{estilosAsociaciones}</style>
      <section className="mx-auto w-full max-w-7xl">

        {/* Encabezado */}
        <div className="apt-asociaciones-encabezado mb-7 rounded-3xl border p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Asociaciones Territoriales
                </h1>

                <span className="badge badge-warning badge-lg">
                  Administración
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Revisa las solicitudes de asociación territorial
                realizadas por los vecinos y confirma o rechaza
                su pertenencia a un sector.
              </p>
            </div>

            <Link
              to="/admin"
              className="btn btn-outline"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* Resumen */}
        {!cargando && (
          <div className="apt-asociaciones-estadisticas mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-violet-500/30 bg-base-100 p-5 shadow-sm">
              <p className="text-sm font-medium text-base-content/60">
                {configuracionFiltro.resumen}
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-3xl font-bold">
                  {asociacionesFiltradas.length}
                </span>

                <span className="badge badge-warning badge-outline">
                  Por revisar
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
              <p className="text-sm font-medium text-base-content/60">
                Tipo de gestión
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-xl font-bold">
                  Territorial
                </span>

                <span className="badge badge-primary badge-outline">
                  Sectores
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-base-content/60">
                Estado
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-xl font-bold">
                  Gestión activa
                </span>

                <span className="badge badge-success">
                  Disponible
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {mensaje && (
          <div className="alert alert-success mb-6 shadow-sm">
            <span>{mensaje}</span>
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div className="apt-asociaciones-cargando rounded-2xl border p-10 text-center shadow-sm">
            <span className="loading loading-spinner loading-lg" />

            <p className="mt-4 text-base-content/60">
              Cargando asociaciones pendientes...
            </p>
          </div>
        )}

        {!cargando && (
          <>
            <div className="apt-asociaciones-panel mb-7">
            {/* Filtros por estado */}
            <div className="apt-asociaciones-filtros-estado mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'GENERAL'
                  ? 'btn-primary'
                  : 'btn-outline'
                  }`}
                onClick={() => setFiltroEstado('GENERAL')}
              >
                General
              </button>

              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'PENDIENTE'
                  ? 'btn-warning'
                  : 'btn-outline'
                  }`}
                onClick={() => setFiltroEstado('PENDIENTE')}
              >
                Pendientes
              </button>

              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'CONFIRMADA'
                  ? 'btn-success'
                  : 'btn-outline'
                  }`}
                onClick={() => setFiltroEstado('CONFIRMADA')}
              >
                Aceptadas
              </button>

              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'RECHAZADA'
                  ? 'btn-error'
                  : 'btn-outline'
                  }`}
                onClick={() => setFiltroEstado('RECHAZADA')}
              >
                Rechazadas
              </button>

              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'SIN_VERIFICACION'
                  ? 'btn-neutral'
                  : 'btn-outline'
                  }`}
                onClick={() =>
                  setFiltroEstado('SIN_VERIFICACION')
                }
              >
                Sin verificación
              </button>

              <button
                type="button"
                className={`btn btn-sm ${filtroEstado === 'REVISION_MANUAL'
                  ? 'btn-info'
                  : 'btn-outline'
                  }`}
                onClick={() =>
                  setFiltroEstado('REVISION_MANUAL')
                }
              >
                Revisión manual
              </button>
            </div>
            {/* Filtros territoriales */}
            <div className="apt-asociaciones-filtros-territorio mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Junta vecinal
                </label>

                <select
                  className="select select-bordered w-full"
                  value={filtroJunta ?? ''}
                  onChange={(e) => {
                    const value = e.target.value

                    setFiltroJunta(
                      value === '' ? null : Number(value),
                    )

                    setFiltroSector(null)
                  }}
                >
                  <option value="">Todas las juntas</option>

                  {juntasDisponibles.map((junta) => (
                    <option
                      key={junta.id}
                      value={junta.id}
                    >
                      {junta.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Sector
                </label>

                <select
                  className="select select-bordered w-full"
                  value={filtroSector ?? ''}
                  onChange={(e) => {
                    const value = e.target.value

                    setFiltroSector(
                      value === '' ? null : Number(value),
                    )
                  }}
                >
                  <option value="">Todos los sectores</option>

                  {sectoresDisponibles.map((sector) => (
                    <option
                      key={sector.id}
                      value={sector.id}
                    >
                      {sector.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Título sección */}
            <div className="apt-asociaciones-titulo-lista mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {configuracionFiltro.titulo}
                </h2>

                <p className="mt-1 text-base-content/60">
                  {configuracionFiltro.descripcion}
                </p>
              </div>

              {asociacionesFiltradas.length > 0 && (
                <span className="badge badge-outline badge-lg">
                  {asociacionesFiltradas.length}{' '}
                  {asociacionesFiltradas.length === 1
                    ? 'solicitud'
                    : 'solicitudes'}
                </span>
              )}
            </div>

            {asociacionesFiltradas.length === 0 ? (
              <div className="apt-asociaciones-sin-resultados rounded-2xl border p-10 text-center shadow-sm">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                    ✓
                  </div>

                  <h3 className="text-xl font-bold">
                    No existen asociaciones pendientes
                  </h3>

                  <p className="mt-2 text-base-content/60">
                    Todas las solicitudes territoriales se encuentran
                    resueltas por el momento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="apt-asociaciones-tabla overflow-hidden rounded-2xl border shadow-sm">
                <div className="overflow-x-auto apt-asociaciones-tabla-scroll">
                  <table className="table apt-asociaciones-tabla-organizada">
                    <thead>
                      <tr>
                        <th>Vecino y contacto</th>
                        <th>Ubicación territorial</th>
                        <th>Estado y verificación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asociacionesFiltradas.map((asociacion) => {
                        const nombreCompleto = obtenerNombreCompleto(asociacion)
                        const procesando = procesandoId === asociacion.id
                        const verificacion = asociacion.verificacion_residencia

                        return (
                          <tr key={asociacion.id}>
                            <td data-label="Vecino y contacto">
                              <div className="apt-asoc-persona">
                                <div className="apt-asoc-avatar" aria-hidden="true">
                                  {obtenerIniciales(asociacion)}
                                </div>
                                <div className="apt-asoc-persona-info">
                                  <p className="apt-asoc-nombre">{nombreCompleto}</p>
                                  <p className="apt-asoc-username">@{asociacion.username}</p>
                                </div>
                              </div>
                              <div className="apt-asoc-datos">
                                <div className="apt-asoc-dato">
                                  <span className="apt-asoc-etiqueta">RUT</span>
                                  <span>{asociacion.rut || 'No informado'}</span>
                                </div>
                                <div className="apt-asoc-dato">
                                  <span className="apt-asoc-etiqueta">Correo</span>
                                  <span className="apt-asoc-email" title={asociacion.email}>
                                    {asociacion.email || 'No informado'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td data-label="Ubicación territorial">
                              <div className="apt-asoc-territorio">
                                <span className="apt-asoc-etiqueta">Junta de Vecinos</span>
                                <span className="apt-asoc-junta">{asociacion.junta_nombre}</span>
                                <span className="apt-asoc-etiqueta apt-asoc-etiqueta-sector">Sector</span>
                                <span className="apt-asoc-sector">{asociacion.sector_nombre}</span>
                              </div>
                            </td>
                            <td data-label="Estado y verificación">
                              <div className="apt-asoc-estados">
                                <div className="apt-asoc-estado-linea">
                                  <span className="apt-asoc-etiqueta">Asociación</span>
                                  <span className={
                                    asociacion.estado_asociacion_sector === 'CONFIRMADA'
                                      ? 'apt-asoc-chip apt-asoc-chip-exito'
                                      : asociacion.estado_asociacion_sector === 'RECHAZADA'
                                        ? 'apt-asoc-chip apt-asoc-chip-error'
                                        : 'apt-asoc-chip apt-asoc-chip-pendiente'
                                  }>
                                    {asociacion.estado_asociacion_sector === 'CONFIRMADA'
                                      ? 'Aceptada'
                                      : asociacion.estado_asociacion_sector === 'RECHAZADA'
                                        ? 'Rechazada'
                                        : 'Pendiente'}
                                  </span>
                                </div>
                                <div className="apt-asoc-estado-linea">
                                  <span className="apt-asoc-etiqueta">Residencia</span>
                                  <span className={
                                    !verificacion
                                      ? 'apt-asoc-chip apt-asoc-chip-neutro'
                                      : verificacion.estado === 'VALIDADA'
                                        ? 'apt-asoc-chip apt-asoc-chip-exito'
                                        : verificacion.estado === 'RECHAZADA'
                                          ? 'apt-asoc-chip apt-asoc-chip-error'
                                          : verificacion.estado === 'REVISION_MANUAL'
                                            ? 'apt-asoc-chip apt-asoc-chip-revision'
                                            : 'apt-asoc-chip apt-asoc-chip-pendiente'
                                  }>
                                    {!verificacion
                                      ? 'Sin verificación'
                                      : verificacion.estado === 'VALIDADA'
                                        ? 'Validada'
                                        : verificacion.estado === 'RECHAZADA'
                                          ? 'Rechazada'
                                          : verificacion.estado === 'REVISION_MANUAL'
                                            ? 'Revisión manual'
                                            : 'Pendiente'}
                                  </span>
                                </div>
                                {verificacion && (
                                  <button
                                    type="button"
                                    className="apt-asoc-revisar"
                                    onClick={() => setAsociacionSeleccionada(asociacion)}
                                  >
                                    Revisar comprobante
                                  </button>
                                )}
                              </div>
                            </td>
                            <td data-label="Acciones">
                              {asociacion.estado_asociacion_sector === 'PENDIENTE' ? (
                                <div className="apt-asoc-acciones">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    disabled={procesando || verificacion?.estado !== 'VALIDADA'}
                                    title={verificacion?.estado !== 'VALIDADA'
                                      ? 'Se requiere una residencia validada para confirmar la asociación.'
                                      : 'Confirmar asociación territorial'}
                                    onClick={() => void resolverAsociacion(asociacion.id, 'CONFIRMAR')}
                                  >
                                    {procesando && <span className="loading loading-spinner loading-xs" />}
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-error btn-outline"
                                    disabled={procesando}
                                    onClick={() => void resolverAsociacion(asociacion.id, 'RECHAZAR')}
                                  >
                                    Rechazar
                                  </button>
                                  {verificacion?.estado !== 'VALIDADA' && (
                                    <small className="apt-asoc-ayuda">
                                      Para confirmar, primero debe validarse la residencia.
                                    </small>
                                  )}
                                </div>
                              ) : (
                                <span className="apt-asoc-resuelta">Solicitud resuelta</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </div>
          </>
        )}
      </section>
      {asociacionSeleccionada && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="text-xl font-bold">
              Revisión de comprobante
            </h3>

            <p className="mt-2 text-sm text-base-content/60">
              {obtenerNombreCompleto(asociacionSeleccionada)}
            </p>
            {asociacionSeleccionada.verificacion_residencia && (() => {
              const verificacion =
                asociacionSeleccionada.verificacion_residencia

              return (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-base-300 p-4">
                      <p className="text-xs font-semibold uppercase text-base-content/50">
                        Tipo de comprobante
                      </p>

                      <p className="mt-1 font-medium">
                        {verificacion.tipo_documento}
                      </p>
                    </div>

                    <div className="rounded-xl border border-base-300 p-4">
                      <p className="text-xs font-semibold uppercase text-base-content/50">
                        Fecha detectada
                      </p>

                      <p className="mt-1 font-medium">
                        {verificacion.fecha_documento_extraida
                          ? new Date(
                            `${verificacion.fecha_documento_extraida}T00:00:00`,
                          ).toLocaleDateString('es-CL')
                          : 'No detectada'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-base-300 p-4">
                      <p className="text-xs font-semibold uppercase text-base-content/50">
                        Nombre detectado
                      </p>

                      <p className="mt-1 font-medium">
                        {verificacion.nombre_extraido ?? 'No detectado'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-base-300 p-4">
                      <p className="text-xs font-semibold uppercase text-base-content/50">
                        Confianza OCR
                      </p>

                      <p className="mt-1 font-medium">
                        {verificacion.confianza_ocr !== null
                          ? `${(
                            Number(verificacion.confianza_ocr) * 100
                          ).toFixed(0)}%`
                          : 'No disponible'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-base-300 p-4">
                    <p className="text-xs font-semibold uppercase text-base-content/50">
                      Dirección detectada
                    </p>

                    <p className="mt-1 font-medium">
                      {verificacion.direccion_extraida ?? 'No detectada'}
                    </p>

                    <p className="mt-1 text-sm text-base-content/60">
                      {verificacion.comuna_extraida ?? 'Comuna no detectada'}
                    </p>
                  </div>
                  {verificacion.documento_duplicado && (
                    <div className="alert alert-warning">
                      <span>
                        Este mismo archivo ya fue utilizado anteriormente en otra verificación.
                      </span>
                    </div>
                  )}

                  {verificacion.observacion_automatica && (
                    <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                      <p className="text-xs font-semibold uppercase text-base-content/50">
                        Análisis automático
                      </p>

                      <p className="mt-2 text-sm leading-6">
                        {verificacion.observacion_automatica}
                      </p>
                    </div>
                  )}

                  {verificacion.archivo_url && (
                    <a
                      href={verificacion.archivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      Ver comprobante adjunto
                    </a>
                  )}
                </div>
              )
            })()}
            <div className="modal-action">
              {asociacionSeleccionada.estado_asociacion_sector ===
                'PENDIENTE' &&
                asociacionSeleccionada.verificacion_residencia?.estado ===
                'REVISION_MANUAL' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={procesandoId === asociacionSeleccionada.id}
                    onClick={() =>
                      void resolverVerificacion(
                        asociacionSeleccionada.id,
                        asociacionSeleccionada.verificacion_residencia!.id,
                        'VALIDAR',
                      )
                    }
                  >
                    Validar residencia
                  </button>
                )}

              {asociacionSeleccionada.estado_asociacion_sector ===
                'PENDIENTE' &&
                asociacionSeleccionada.verificacion_residencia &&
                (
                  asociacionSeleccionada.verificacion_residencia.estado ===
                  'PENDIENTE' ||
                  asociacionSeleccionada.verificacion_residencia.estado ===
                  'RECHAZADA'
                ) && (
                  <button
                    type="button"
                    className="btn btn-warning"
                    disabled={procesandoId === asociacionSeleccionada.id}
                    onClick={() =>
                      void resolverVerificacion(
                        asociacionSeleccionada.id,
                        asociacionSeleccionada.verificacion_residencia!.id,
                        'REVISION_MANUAL',
                      )
                    }
                  >
                    Enviar a revisión manual
                  </button>
                )}
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setAsociacionSeleccionada(null)
                }
              >
                Cerrar
              </button>
            </div>
          </div>

          <button
            type="button"
            className="modal-backdrop"
            onClick={() =>
              setAsociacionSeleccionada(null)
            }
          >
            cerrar
          </button>
        </dialog>
      )}
    </main>
  )
}

export default AsociacionesSectorPage
