import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
type PerfilVecino = {
  username: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  email: string
  fecha_nacimiento: string | null
  sector_id: number | null
  sector_nombre: string | null
  junta_id: number | null
  junta_nombre: string | null
  estado_asociacion_sector:
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'RECHAZADA'
    | null
  fecha_confirmacion_sector: string | null
}
type SectorDisponible = {
  id: number
  junta_vecinos: number
  junta_nombre: string
  nombre: string
  descripcion: string | null
  activo: boolean
}
const API = 'http\://localhost:8000'
function MiPerfilPage() {
  const [perfil, setPerfil] = useState<PerfilVecino | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorPerfil, setErrorPerfil] = useState('')
  const [errorSectores, setErrorSectores] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [sectores, setSectores] = useState<SectorDisponible[]>([])
  const [sectorSeleccionado, setSectorSeleccionado] = useState('')
  const [cargandoSectores, setCargandoSectores] = useState(true)
  const [solicitandoSector, setSolicitandoSector] = useState(false)
  const [nombres, setNombres] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [email, setEmail] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  // CARGAR INFORMACIÓN PERSONAL
  useEffect(() => {
    const controlador = new AbortController()
    const cargarPerfil = async () => {
      try {
        const response = await fetch(`${API}/api/auth/perfil/`, {
          credentials: 'include',
          signal: controlador.signal,
        })
        if (!response.ok) {
          throw new Error(
            'No fue posible obtener la información del perfil.'
          )
        }
        const data = (await response.json()) as PerfilVecino
        if (!controlador.signal.aborted) {
          setPerfil(data)
          setNombres(data.nombres ?? '')
          setApellidoPaterno(data.apellido_paterno ?? '')
          setApellidoMaterno(data.apellido_materno ?? '')
          setEmail(data.email ?? '')
          setFechaNacimiento(data.fecha_nacimiento ?? '')
          setErrorPerfil('')
        }
      } catch {
        if (!controlador.signal.aborted) {
          setErrorPerfil(
            'No fue posible obtener la información del perfil.'
          )
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }
    void cargarPerfil()
    return () => controlador.abort()
  }, [])
  // CARGAR SECTORES
  useEffect(() => {
    const controlador = new AbortController()
    const cargarSectores = async () => {
      try {
        const response = await fetch(
          `${API}/api/organizacion/sectores-disponibles/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )
        if (!response.ok) {
          throw new Error(
            'No fue posible obtener los sectores disponibles.'
          )
        }
        const data =
          (await response.json()) as SectorDisponible[]
        if (!controlador.signal.aborted) {
          setSectores(data)
          setErrorSectores('')
        }
      } catch {
        if (!controlador.signal.aborted) {
          setErrorSectores(
            'No fue posible obtener los sectores disponibles.'
          )
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoSectores(false)
        }
      }
    }
    void cargarSectores()
    return () => controlador.abort()
  }, [])
  // GUARDAR PERFIL
  const guardarPerfil = async () => {
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API}/api/auth/perfil/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          email,
          fecha_nacimiento: fechaNacimiento || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        const detalle = Object.values(data)
          .flat()
          .find((valor) => typeof valor === 'string')
        setError(
          typeof detalle === 'string'
            ? detalle
            : 'No fue posible actualizar el perfil.'
        )
        return
      }
      const perfilActualizado =
        (data.perfil ?? data) as PerfilVecino
      setPerfil(perfilActualizado)
      setMensaje(
        data.message ?? 'Perfil actualizado correctamente.'
      )
      setEditando(false)
    } catch {
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setGuardando(false)
    }
  }
  // SOLICITAR ASOCIACIÓN TERRITORIAL
  const solicitarAsociacionSector = async () => {
    if (!sectorSeleccionado) {
      setError('Debe seleccionar un sector.')
      return
    }
    setError('')
    setMensaje('')
    setSolicitandoSector(true)
    try {
      const response = await fetch(
        `${API}/api/organizacion/solicitar-asociacion-sector/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sector_id: Number(sectorSeleccionado),
          }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        setError(
          data.detail ??
            'No fue posible solicitar la asociación territorial.'
        )
        return
      }
      const perfilResponse = await fetch(
        `${API}/api/auth/perfil/`,
        { credentials: 'include' }
      )
      if (perfilResponse.ok) {
        const nuevoPerfil =
          (await perfilResponse.json()) as PerfilVecino
        setPerfil(nuevoPerfil)
      }
      setSectorSeleccionado('')
      setMensaje(
        'Solicitud de asociación territorial enviada correctamente.'
      )
    } catch {
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setSolicitandoSector(false)
    }
  }
  const cancelarEdicion = () => {
    if (!perfil) return
    setNombres(perfil.nombres ?? '')
    setApellidoPaterno(perfil.apellido_paterno ?? '')
    setApellidoMaterno(perfil.apellido_materno ?? '')
    setEmail(perfil.email ?? '')
    setFechaNacimiento(perfil.fecha_nacimiento ?? '')
    setError('')
    setEditando(false)
  }
  const nombreCompleto = perfil
    ? [
        perfil.nombres,
        perfil.apellido_paterno,
        perfil.apellido_materno,
      ].filter(Boolean).join(' ') || perfil.username
    : ''
  const iniciales = nombreCompleto
    ? nombreCompleto
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join('')
    : '?'
  const nombreEstado = (
    estado: PerfilVecino['estado_asociacion_sector']
  ) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente'
      case 'CONFIRMADA':
        return 'Confirmada'
      case 'RECHAZADA':
        return 'Rechazada'
      default:
        return 'Sin asociación'
    }
  }
  const claseEstado = (
    estado: PerfilVecino['estado_asociacion_sector']
  ) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'mp-badge mp-warning'
      case 'CONFIRMADA':
        return 'mp-badge mp-green'
      case 'RECHAZADA':
        return 'mp-badge mp-red'
      default:
        return 'mp-badge mp-muted'
    }
  }
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Sin información'
    const fechaNormalizada = fecha.includes('T')
      ? new Date(fecha)
      : new Date(`${fecha}T00:00:00`)
    return Number.isNaN(fechaNormalizada.getTime())
      ? 'Sin información'
      : fechaNormalizada.toLocaleDateString('es-CL', {
          dateStyle: 'medium',
        })
  }
  const sectorElegido = sectores.find(
    (sector) => String(sector.id) === sectorSeleccionado
  )
  return (
    <main className="mi-perfil-bosque">
      <style>{`
        /* =====================================
           FONDO CORREGIDO: IMAGEN EN PUBLIC
           ===================================== */
        .mi-perfil-bosque {
          --mp-oro: #d7ac32;
          --mp-oro-claro: #f0d375;
          --mp-crema: #f6efd9;
          --mp-suave: #cbd2c4;
          min-height: 100vh;
          padding: 32px 20px;
          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/vecino-perfil.webp');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
          color: var(--mp-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .mi-perfil-bosque,
        .mi-perfil-bosque * {
          box-sizing: border-box;
        }
        .mi-perfil-bosque .mp-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }
        /* PANELES TRANSPARENTES */
        .mi-perfil-bosque .mp-panel {
          background: rgba(8, 29, 19, 0.74);
          border: 1px solid rgba(215, 172, 50, 0.35);
          border-radius: 22px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        /* TIPOGRAFÍA */
        .mi-perfil-bosque h1,
        .mi-perfil-bosque h2,
        .mi-perfil-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--mp-crema);
          line-height: 1.25;
        }
        .mi-perfil-bosque .mp-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }
        .mi-perfil-bosque .mp-heading {
          margin: 0;
          font-size: 27px;
          font-weight: 700;
        }
        .mi-perfil-bosque .mp-subtitle {
          margin: 8px 0 0;
          color: var(--mp-suave);
          font-size: 15px;
          line-height: 1.7;
        }
        /* ENCABEZADO */
        .mi-perfil-bosque .mp-header {
          padding: 30px;
          margin-bottom: 25px;
        }
        .mi-perfil-bosque .mp-row-between {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }
        .mi-perfil-bosque .mp-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 12px;
        }
        /* ETIQUETAS */
        .mi-perfil-bosque .mp-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 15px;
          border-radius: 999px;
          background: rgba(215, 172, 50, 0.14);
          border: 1px solid rgba(215, 172, 50, 0.50);
          color: #edce70;
          font-size: 13px;
          font-weight: 700;
        }
        .mi-perfil-bosque .mp-green {
          background: rgba(28, 125, 78, 0.25);
          border-color: rgba(80, 183, 125, 0.60);
          color: #a6eac4;
        }
        .mi-perfil-bosque .mp-warning {
          background: rgba(180, 113, 22, 0.25);
          border-color: rgba(232, 180, 75, 0.65);
          color: #ffdf94;
        }
        .mi-perfil-bosque .mp-red {
          background: rgba(145, 43, 45, 0.26);
          border-color: rgba(230, 116, 116, 0.60);
          color: #ffc4c1;
        }
        .mi-perfil-bosque .mp-muted {
          background: rgba(230, 230, 210, 0.08);
          border-color: rgba(220, 220, 200, 0.25);
          color: #e6e9df;
        }
        /* BOTONES DORADOS */
        .mi-perfil-bosque .mp-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 11px 22px;
          border-radius: 13px;
          border: 1px solid rgba(215, 172, 50, 0.70);
          background: rgba(215, 172, 50, 0.16);
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
        .mi-perfil-bosque .mp-button:hover {
          background: rgba(215, 172, 50, 0.32);
          color: #fff4d2;
          transform: translateY(-1px);
        }
        .mi-perfil-bosque .mp-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );
          color: #102419;
          border-color: #d7ac32;
          font-weight: 800;
        }
        .mi-perfil-bosque .mp-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
        }
        .mi-perfil-bosque .mp-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }
        /* ALERTAS */
        .mi-perfil-bosque .mp-alert {
          padding: 16px 20px;
          border-radius: 13px;
          margin-bottom: 22px;
          font-size: 14px;
          line-height: 1.6;
        }
        .mi-perfil-bosque .mp-alert-error {
          background: rgba(118, 33, 35, 0.85);
          border: 1px solid rgba(231, 104, 104, 0.55);
          color: #ffe4e4;
        }
        .mi-perfil-bosque .mp-alert-success {
          background: rgba(18, 93, 57, 0.83);
          border: 1px solid rgba(102, 201, 140, 0.50);
          color: #dbffe6;
        }
        /* RESUMEN DEL PERFIL */
        .mi-perfil-bosque .mp-profile-summary {
          padding: 27px 30px;
          margin-bottom: 25px;
        }
        .mi-perfil-bosque .mp-profile-left {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 0;
        }
        .mi-perfil-bosque .mp-avatar {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(215, 172, 50, 0.18);
          border: 1px solid rgba(215, 172, 50, 0.45);
          color: #f0d375;
          font-size: 24px;
          font-weight: 800;
        }
        .mi-perfil-bosque .mp-profile-name {
          margin: 0;
          font-size: 27px;
        }
        .mi-perfil-bosque .mp-username {
          margin: 7px 0 12px;
          color: #becbbd;
          font-size: 14px;
        }
        .mi-perfil-bosque .mp-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }
        /* ORGANIZACIÓN DE TARJETAS */
        .mi-perfil-bosque .mp-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.25fr) minmax(0, 0.75fr);
          gap: 24px;
        }
        .mi-perfil-bosque .mp-card {
          overflow: hidden;
          align-self: start;
        }
        .mi-perfil-bosque .mp-card-header {
          padding: 24px 27px;
          border-bottom: 1px solid rgba(215, 172, 50, 0.22);
        }
        .mi-perfil-bosque .mp-card-body {
          padding: 26px;
        }
        /* INFORMACIÓN PERSONAL */
        .mi-perfil-bosque .mp-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }
        .mi-perfil-bosque .mp-info-box {
          padding: 16px;
          min-width: 0;
          border-radius: 14px;
          background: rgba(3, 20, 12, 0.42);
          border: 1px solid rgba(215, 172, 50, 0.18);
        }
        .mi-perfil-bosque .mp-info-label {
          margin: 0 0 8px;
          color: #b8c7b6;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .mi-perfil-bosque .mp-info-value {
          margin: 0;
          font-size: 15px;
          font-weight: 650;
          color: #f6efd9;
          overflow-wrap: anywhere;
        }
        .mi-perfil-bosque .mp-span-full {
          grid-column: 1 / -1;
        }
        /* FORMULARIOS */
        .mi-perfil-bosque .mp-field-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 9px;
          color: #f0eddf;
          font-size: 14px;
          font-weight: 650;
        }
        .mi-perfil-bosque .mp-field-hint {
          font-size: 12px;
          font-weight: 400;
          color: #bbc4b7;
        }
        .mi-perfil-bosque .mp-input {
          width: 100%;
          min-height: 49px;
          padding: 12px 15px;
          background: rgba(3, 20, 12, 0.68);
          border: 1px solid rgba(215, 172, 50, 0.36);
          border-radius: 12px;
          color: #f6efd9;
          font: inherit;
          font-size: 14px;
          outline: none;
        }
        .mi-perfil-bosque .mp-input:focus {
          border-color: #e8c657;
          box-shadow: 0 0 0 3px rgba(215, 172, 50, 0.16);
        }
        .mi-perfil-bosque .mp-input:disabled {
          background: rgba(4, 15, 10, 0.45);
          color: #aab9aa;
          opacity: 1;
        }
        .mi-perfil-bosque .mp-input option {
          color: #f6efd9;
          background: #102b1d;
        }
        .mi-perfil-bosque input[type="date"] {
          color-scheme: dark;
        }
        .mi-perfil-bosque .mp-form-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 20px;
          margin-top: 4px;
          border-top: 1px solid rgba(215, 172, 50, 0.22);
        }
        /* ASOCIACIÓN TERRITORIAL */
        .mi-perfil-bosque .mp-territorial-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .mi-perfil-bosque .mp-territorial-form {
          margin-top: 24px;
          padding-top: 23px;
          border-top: 1px solid rgba(215, 172, 50, 0.22);
        }
        .mi-perfil-bosque .mp-status-notice {
          padding: 17px;
          border: 1px solid rgba(215, 172, 50, 0.33);
          border-radius: 13px;
          background: rgba(215, 172, 50, 0.09);
          color: #ecdfbf;
          font-size: 14px;
          line-height: 1.7;
        }
        .mi-perfil-bosque .mp-success-notice {
          margin-top: 20px;
          border-color: rgba(80, 183, 125, 0.55);
          background: rgba(28, 125, 78, 0.18);
          color: #c8f4d7;
        }
        /* ACCESIBILIDAD */
        .mi-perfil-bosque button:focus-visible,
        .mi-perfil-bosque a:focus-visible,
        .mi-perfil-bosque .mp-input:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }
        /* RESPONSIVE */
        @media (max-width: 950px) {
          .mi-perfil-bosque .mp-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 650px) {
          .mi-perfil-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }
          .mi-perfil-bosque .mp-header,
          .mi-perfil-bosque .mp-profile-summary,
          .mi-perfil-bosque .mp-card-header,
          .mi-perfil-bosque .mp-card-body {
            padding: 22px;
          }
          .mi-perfil-bosque .mp-info-grid {
            grid-template-columns: 1fr;
          }
          .mi-perfil-bosque .mp-profile-left {
            align-items: flex-start;
          }
          .mi-perfil-bosque .mp-avatar {
            width: 58px;
            height: 58px;
            font-size: 20px;
          }
          .mi-perfil-bosque .mp-profile-name {
            font-size: 22px;
          }
          .mi-perfil-bosque .mp-span-full {
            grid-column: auto;
          }
        }
      `}</style>
      <section className="mp-container">
        {/* ENCABEZADO */}
        <header className="mp-panel mp-header">
          <div className="mp-row-between">
            <div>
              <div className="mp-title-row">
                <h1 className="mp-title">Mi Perfil</h1>
                <span className="mp-badge">Vecino</span>
              </div>
              <p className="mp-subtitle">
                Revisa y actualiza tus datos personales
                y administra tu asociación territorial.
              </p>
            </div>
            <Link to="/vecino" className="mp-button">
              ← Volver al Panel
            </Link>
          </div>
        </header>
        {/* ESTADOS Y MENSAJES */}
        {cargando && (
          <div className="mp-alert mp-panel" role="status">
            Cargando información del perfil...
          </div>
        )}
        {errorPerfil && (
          <div className="mp-alert mp-alert-error" role="alert">
            {errorPerfil}
          </div>
        )}
        {errorSectores &&
          !cargando &&
          perfil &&
          (perfil.estado_asociacion_sector === null ||
            perfil.estado_asociacion_sector === 'RECHAZADA') && (
            <div className="mp-alert mp-alert-error" role="alert">
              {errorSectores}
            </div>
          )}
        {error && (
          <div className="mp-alert mp-alert-error" role="alert">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="mp-alert mp-alert-success" role="status">
            {mensaje}
          </div>
        )}
        {!cargando && perfil && (
          <>
            {/* RESUMEN DEL USUARIO */}
            <section className="mp-panel mp-profile-summary">
              <div className="mp-row-between">
                <div className="mp-profile-left">
                  <div className="mp-avatar">
                    {iniciales}
                  </div>
                  <div>
                    <h2 className="mp-profile-name">
                      {nombreCompleto}
                    </h2>
                    <p className="mp-username">
                      @{perfil.username}
                    </p>
                    <div className="mp-badges">
                      <span
                        className={claseEstado(
                          perfil.estado_asociacion_sector
                        )}
                      >
                        {nombreEstado(
                          perfil.estado_asociacion_sector
                        )}
                      </span>
                      {perfil.junta_nombre && (
                        <span className="mp-badge">
                          {perfil.junta_nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!editando && (
                  <button
                    type="button"
                    className="mp-button mp-button-primary"
                    onClick={() => {
                      setMensaje('')
                      setEditando(true)
                    }}
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </section>
            {/* CARACTERIZACIÓN COMUNITARIA — acceso conservado del original */}
            <section
              className="mp-panel"
              style={{ padding: '26px 30px', marginBottom: 25 }}
            >
              <div className="mp-row-between" style={{ alignItems: 'center' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="mp-title-row" style={{ marginBottom: 8 }}>
                    <h2 className="mp-heading">Caracterización comunitaria</h2>
                    <span className="mp-badge mp-green">Información del hogar</span>
                  </div>
                  <p className="mp-subtitle">
                    Registra información general de tu hogar para apoyar
                    la planificación de tu Junta de Vecinos.
                  </p>
                </div>
                <Link
                  to="/vecino/caracterizacion"
                  className="mp-button mp-button-primary"
                >
                  Ver / Actualizar
                </Link>
              </div>
            </section>
            <div className="mp-grid">
              {/* INFORMACIÓN PERSONAL */}
              <section className="mp-panel mp-card">
                <div className="mp-card-header">
                  <h2 className="mp-heading">
                    Información personal
                  </h2>
                  <p className="mp-subtitle">
                    Datos asociados a tu cuenta de vecino.
                  </p>
                </div>
                <div className="mp-card-body">
                  {!editando ? (
                    <div className="mp-info-grid">
                      {[
                        ['Nombre de usuario', perfil.username],
                        ['RUT', perfil.rut],
                        ['Nombres', perfil.nombres],
                        ['Apellido paterno', perfil.apellido_paterno],
                        ['Apellido materno', perfil.apellido_materno],
                        ['Correo electrónico', perfil.email],
                      ].map(([etiqueta, valor]) => (
                        <div
                          key={etiqueta}
                          className="mp-info-box"
                        >
                          <p className="mp-info-label">
                            {etiqueta}
                          </p>
                          <p className="mp-info-value">
                            {valor || 'Sin información'}
                          </p>
                        </div>
                      ))}
                      <div className="mp-info-box mp-span-full">
                        <p className="mp-info-label">
                          Fecha de nacimiento
                        </p>
                        <p className="mp-info-value">
                          {formatearFecha(
                            perfil.fecha_nacimiento
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mp-info-grid">
                      <label>
                        <span className="mp-field-label">
                          Nombre de usuario
                          <span className="mp-field-hint">
                            No editable
                          </span>
                        </span>
                        <input
                          className="mp-input"
                          value={perfil.username}
                          disabled
                        />
                      </label>
                      <label>
                        <span className="mp-field-label">
                          RUT
                          <span className="mp-field-hint">
                            No editable
                          </span>
                        </span>
                        <input
                          className="mp-input"
                          value={perfil.rut ?? ''}
                          disabled
                        />
                      </label>
                      <label>
                        <span className="mp-field-label">
                          Nombres
                        </span>
                        <input
                          className="mp-input"
                          value={nombres}
                          onChange={(event) =>
                            setNombres(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span className="mp-field-label">
                          Apellido paterno
                        </span>
                        <input
                          className="mp-input"
                          value={apellidoPaterno}
                          onChange={(event) =>
                            setApellidoPaterno(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span className="mp-field-label">
                          Apellido materno
                        </span>
                        <input
                          className="mp-input"
                          value={apellidoMaterno}
                          onChange={(event) =>
                            setApellidoMaterno(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span className="mp-field-label">
                          Correo electrónico
                        </span>
                        <input
                          type="email"
                          className="mp-input"
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                        />
                      </label>
                      <label className="mp-span-full">
                        <span className="mp-field-label">
                          Fecha de nacimiento
                        </span>
                        <input
                          type="date"
                          className="mp-input"
                          value={fechaNacimiento}
                          onChange={(event) =>
                            setFechaNacimiento(event.target.value)
                          }
                        />
                      </label>
                      <div className="mp-form-actions mp-span-full">
                        <button
                          type="button"
                          className="mp-button"
                          disabled={guardando}
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="mp-button mp-button-primary"
                          disabled={guardando}
                          onClick={() => void guardarPerfil()}
                        >
                          {guardando
                            ? 'Guardando...'
                            : 'Guardar cambios'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
              {/* ASOCIACIÓN TERRITORIAL */}
              <section className="mp-panel mp-card">
                <div className="mp-card-header">
                  <div className="mp-row-between">
                    <div>
                      <h2 className="mp-heading">
                        Asociación territorial
                      </h2>
                      <p className="mp-subtitle">
                        Sector y Junta de Vecinos vinculados
                        a tu cuenta.
                      </p>
                    </div>
                    <span
                      className={claseEstado(
                        perfil.estado_asociacion_sector
                      )}
                    >
                      {nombreEstado(
                        perfil.estado_asociacion_sector
                      )}
                    </span>
                  </div>
                </div>
                <div className="mp-card-body">
                  {perfil.sector_id ? (
                    <div className="mp-territorial-list">
                      <div className="mp-info-box">
                        <p className="mp-info-label">
                          Junta de Vecinos
                        </p>
                        <p className="mp-info-value">
                          {perfil.junta_nombre ?? '-'}
                        </p>
                      </div>
                      <div className="mp-info-box">
                        <p className="mp-info-label">
                          Sector
                        </p>
                        <p className="mp-info-value">
                          {perfil.sector_nombre ?? '-'}
                        </p>
                      </div>
                      {perfil.fecha_confirmacion_sector && (
                        <div className="mp-info-box">
                          <p className="mp-info-label">
                            Fecha de confirmación
                          </p>
                          <p className="mp-info-value">
                            {formatearFecha(
                              perfil.fecha_confirmacion_sector
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mp-status-notice">
                      <strong>
                        Aún no tienes un sector asociado
                      </strong>
                      <p style={{ margin: '7px 0 0' }}>
                        {perfil.estado_asociacion_sector === 'PENDIENTE'
                          ? 'Tu asociación todavía no ha sido confirmada.'
                          : 'Selecciona tu sector para enviar una solicitud de asociación.'}
                      </p>
                    </div>
                  )}
                  {(perfil.estado_asociacion_sector === null ||
                    perfil.estado_asociacion_sector === 'RECHAZADA') && (
                    <div className="mp-territorial-form">
                      <label>
                        <span className="mp-field-label">
                          Sector
                        </span>
                        <select
                          className="mp-input"
                          value={sectorSeleccionado}
                          onChange={(event) =>
                            setSectorSeleccionado(event.target.value)
                          }
                          disabled={
                            cargandoSectores ||
                            solicitandoSector ||
                            Boolean(errorSectores)
                          }
                        >
                          <option value="">
                            Seleccione un sector
                          </option>
                          {sectores.map((sector) => (
                            <option
                              key={sector.id}
                              value={sector.id}
                            >
                              {sector.junta_nombre} - {sector.nombre}
                            </option>
                          ))}
                        </select>
                        {cargandoSectores && (
                          <p className="mp-subtitle">
                            Cargando sectores disponibles...
                          </p>
                        )}
                      </label>
                      {sectorElegido && (
                        <div
                          className="mp-info-box"
                          style={{ marginTop: 15 }}
                        >
                          <p className="mp-info-value">
                            {sectorElegido.nombre}
                          </p>
                          <p className="mp-subtitle">
                            {sectorElegido.descripcion ||
                              'Sin descripción adicional.'}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        className="mp-button mp-button-primary"
                        style={{
                          width: '100%',
                          marginTop: 20,
                        }}
                        disabled={
                          cargandoSectores ||
                          solicitandoSector ||
                          Boolean(errorSectores) ||
                          !sectorSeleccionado
                        }
                        onClick={() =>
                          void solicitarAsociacionSector()
                        }
                      >
                        {solicitandoSector
                          ? 'Enviando solicitud...'
                          : 'Solicitar asociación'}
                      </button>
                    </div>
                  )}
                  {perfil.estado_asociacion_sector === 'PENDIENTE' && (
                    <div
                      className="mp-status-notice"
                      style={{ marginTop: 20 }}
                    >
                      Tu solicitud de asociación territorial
                      está pendiente de revisión por la Directiva.
                    </div>
                  )}
                  {perfil.estado_asociacion_sector === 'CONFIRMADA' && (
                    <div className="mp-status-notice mp-success-notice">
                      Tu asociación territorial se encuentra
                      confirmada.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
export default MiPerfilPage
