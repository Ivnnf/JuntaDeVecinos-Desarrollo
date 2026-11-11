import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type PerfilTerritorial = {
  sector_nombre: string | null
  junta_comuna: string | null
}

type IntegranteDirectiva = {
  id: number
  usuario: number
  junta_id: number
  directiva: number
}

type DirectivaVigente = {
  directiva: {
    id: number
    junta_vecinos: number
    junta_nombre: string
    junta_comuna: string
    fecha_inicio: string
    fecha_fin: string | null
    estado: string
    observacion: string | null
  }
  integrantes: {
    id: number
    usuario: number
    usuario_username: string
    usuario_nombres: string
    usuario_apellido_paterno: string
    cargo: number
    cargo_nombre: string
    junta_id: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    activo: boolean
  }[]
}

function DirectivaInicioPage() {

  const [perfilTerritorial, setPerfilTerritorial] =
    useState<PerfilTerritorial | null>(null)

  const [, setPerfil] =
    useState<PerfilTerritorial | null>(null)

  const [juntaId, setJuntaId] =
    useState<number | null>(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [directivaVigente, setDirectivaVigente] =
    useState<DirectivaVigente | null>(null)
  useEffect(() => {
    const cargarPerfilTerritorial = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/auth/perfil/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          return
        }

        const data =
          (await response.json()) as PerfilTerritorial

        setPerfilTerritorial(data)
      } catch {
        // La información principal de la directiva
        // puede seguir mostrándose.
      }
    }

    void cargarPerfilTerritorial()
  }, [])
  useEffect(() => {
    const cargarJuntaDirectiva = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          'http://localhost:8000/api/organizacion/integrantes-directiva/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener la directiva actual.',
          )
        }

        const data =
          (await response.json()) as IntegranteDirectiva[]

        if (data.length === 0) {
          throw new Error(
            'No se encontró una directiva vigente asociada al usuario.',
          )
        }

        setJuntaId(data[0].junta_id)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.',
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarJuntaDirectiva()
  }, [])
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/auth/perfil/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener el perfil del usuario.',
          )
        }

        const data =
          (await response.json()) as PerfilTerritorial

        setPerfil(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.',
        )
      }
    }

    void cargarPerfil()
  }, [])
  useEffect(() => {
    if (juntaId === null) {
      return
    }

    const cargarDirectivaVigente = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          `http://localhost:8000/api/organizacion/juntas/${juntaId}/directiva-vigente/`,
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          const data = await response.json()

          throw new Error(
            data.detail ??
            'No fue posible obtener la directiva vigente.',
          )
        }

        const data =
          (await response.json()) as DirectivaVigente

        setDirectivaVigente(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.',
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarDirectivaVigente()
  }, [juntaId])

  return (
    <main className="di-page">
      <style>{`
        .di-page { --di-gold:#e2bf68; --di-cream:#f9f2df; --di-muted:#d1ddcf; color:var(--di-cream); min-height:100vh; padding:32px 22px 70px; position:relative; isolation:isolate; font-family:'Segoe UI',Arial,sans-serif; background:#071d14; }
        .di-page::before { content:''; position:fixed; inset:0; z-index:-2; background:linear-gradient(115deg,rgba(3,22,15,.77),rgba(5,32,21,.68)),url('/images/photo-1441974231531-c6227db76b6e.jpg') center/cover no-repeat; pointer-events:none; }
        .di-page::after { content:''; position:fixed; inset:0; z-index:-1; background:radial-gradient(circle at 85% 5%,rgba(230,184,72,.12),transparent 35%); pointer-events:none; }
        .di-page, .di-page * { box-sizing:border-box; }
        .di-wrap { max-width:1160px; width:100%; margin:0 auto; }
        .di-panel { position:relative; isolation:isolate; overflow:hidden; border:1px solid rgba(225,187,90,.43); background:rgba(6,33,22,.86); border-radius:22px; box-shadow:0 14px 35px rgba(0,0,0,.28); }
        .di-photo::before { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(115deg,rgba(4,25,17,.87),rgba(8,41,27,.77)),var(--di-photo) center/cover no-repeat; pointer-events:none; }
        .di-hero { --di-photo:url('/images/photo-1473448912268-2022ce9509d8.jpg'); padding:32px; margin-bottom:22px; }
        .di-hero-row { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:22px; }
        .di-hero-buttons { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
        .di-hero-buttons button, .di-hero-buttons a { border-radius:12px !important; }
        /* El botón de salida conserva contraste incluso sin hover. */
        .di-logout :is(button,a,[role="button"]) {
          display:inline-flex !important; align-items:center; justify-content:center;
          min-height:42px; padding:10px 18px !important;
          background:#e2bf68 !important; background-image:none !important;
          color:#10291e !important; -webkit-text-fill-color:#10291e !important;
          border:1px solid #f3d78c !important; border-radius:12px !important;
          opacity:1 !important; visibility:visible !important;
          font-weight:800 !important; text-decoration:none !important;
          box-shadow:0 3px 13px rgba(0,0,0,.29) !important;
          transition:background-color .18s,box-shadow .18s !important;
        }
        .di-logout :is(button,a,[role="button"]) :is(span,svg) { color:inherit !important; }
        .di-logout :is(button,a,[role="button"]):hover {
          background:#f5dc91 !important; color:#10291e !important;
          -webkit-text-fill-color:#10291e !important;
          box-shadow:0 5px 18px rgba(0,0,0,.36) !important;
        }
        .di-logout :is(button,a,[role="button"]):disabled { opacity:.65 !important; }
        .di-heading { display:flex; align-items:center; flex-wrap:wrap; gap:14px; }
        .di-page h1,.di-page h2,.di-page h3 { font-family:Georgia,'Times New Roman',serif; color:var(--di-cream); line-height:1.26; margin:0; }
        .di-page h1 { font-size:clamp(30px,3.5vw,45px); }
        .di-page h2 { font-size:clamp(24px,2.6vw,31px); }
        .di-page h3 { font-size:23px; }
        .di-page .di-muted { color:var(--di-muted); line-height:1.7; }
        .di-page .di-lead { margin:12px 0 0; }
        .di-badge { border:1px solid rgba(225,187,90,.62); color:#f4d985; background:rgba(216,175,67,.16); border-radius:999px; padding:6px 14px; font-size:12px; font-weight:750; white-space:nowrap; }
        .di-active { color:#b7f1cd; background:rgba(19,92,59,.54); border-color:rgba(120,230,166,.54); }
        .di-notice { padding:18px 22px; margin-bottom:22px; }
        .di-error { background:rgba(104,28,35,.94); border-color:rgba(240,133,145,.65); color:#ffe3e1; }
        .di-junta { --di-photo:url('/images/photo-1500534623283-312aade485b7.jpg'); padding:28px 30px; margin-bottom:28px; }
        .di-junta-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:18px; }
        .di-kicker { color:#f4d985; font-size:12px; font-weight:800; letter-spacing:.11em; text-transform:uppercase; margin:0 0 9px; }
        .di-junta-meta { display:flex; flex-wrap:wrap; gap:8px 22px; margin:12px 0 8px; color:var(--di-muted); }
        .di-junta-meta strong,.di-since strong { color:var(--di-cream); }
        .di-since { color:var(--di-muted); margin:8px 0 0; }
        .di-section-heading { margin-bottom:16px; }
        .di-section-heading p { margin:7px 0 0; }
        .di-modules { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:17px; margin-bottom:30px; }
        .di-module { padding:23px; min-height:233px; display:flex; flex-direction:column; justify-content:space-between; transition:transform .2s, box-shadow .2s; }
        .di-module:hover { transform:translateY(-3px); box-shadow:0 18px 34px rgba(0,0,0,.34); }
        .di-module[data-variant='gestion'] { --di-photo:url('/images/photo-1521737711867-e3b97375f902.jpg'); }
        .di-module[data-variant='publicaciones'] { --di-photo:url('/images/photo-1497366754035-f200968a6e72.jpg'); }
        .di-module[data-variant='eventos'] { --di-photo:url('/images/photo-1511795409834-ef04bbd61622.jpg'); }
        .di-module[data-variant='solicitudes'] { --di-photo:url('/images/photo-1450101499163-c8848c66ca85.jpg'); }
        .di-module[data-variant='mensajeria'] { --di-photo:url('/images/photo-1516321318423-f06f85e504b3.jpg'); }
        .di-module[data-variant='asociaciones'] { --di-photo:url('/images/photo-1529156069898-49953e39b3ac.jpg'); }
        .di-module[data-variant='caracterizacion'] { --di-photo:url('/images/photo-1449158743715-0a90ebb6d2d8.jpg'); }
        .di-module[data-variant='documentos'] { --di-photo:url('/images/photo-1497366811353-6870744d04b2.jpg'); }
        .di-module p { margin:10px 0 18px; font-size:14px; }
        .di-module-link { display:flex; align-items:center; justify-content:center; width:100%; min-height:45px; padding:11px 15px; color:#172617; font-weight:800; font-size:14px; text-align:center; text-decoration:none; border-radius:11px; border:1px solid #e4c778; background:linear-gradient(115deg,#f2d994,#d1ac55); transition:filter .2s; }
        .di-module-link:hover { filter:brightness(1.12); }

        /* Identidad cromática por módulo: acento, borde, título y acción.
           La fotografía y la paleta general verde bosque permanecen intactas. */
        .di-module[data-variant='gestion']          { --di-accent:#b5a3fa; --di-accent-bright:#d1c5ff; --di-action:#ac98ed; --di-action-end:#d1c3ff; --di-ink:#241b44; --di-rgb:181,163,250; }
        .di-module[data-variant='publicaciones']    { --di-accent:#7cc8f2; --di-accent-bright:#b8e6ff; --di-action:#74bee7; --di-action-end:#b3e3fa; --di-ink:#123047; --di-rgb:124,200,242; }
        .di-module[data-variant='eventos']          { --di-accent:#7dd9ab; --di-accent-bright:#b9f7d8; --di-action:#75d4a5; --di-action-end:#b6efd2; --di-ink:#103a29; --di-rgb:125,217,171; }
        .di-module[data-variant='solicitudes']      { --di-accent:#efc173; --di-accent-bright:#ffdfa3; --di-action:#e9b865; --di-action-end:#f7d99c; --di-ink:#473014; --di-rgb:239,193,115; }
        .di-module[data-variant='mensajeria']       { --di-accent:#eda3bf; --di-accent-bright:#ffd3e4; --di-action:#e99cba; --di-action-end:#f8c7db; --di-ink:#482338; --di-rgb:237,163,191; }
        .di-module[data-variant='asociaciones']     { --di-accent:#83ded7; --di-accent-bright:#b5f9f3; --di-action:#76d5ce; --di-action-end:#b1eee9; --di-ink:#103c3a; --di-rgb:131,222,215; }
        .di-module[data-variant='caracterizacion']  { --di-accent:#b9d990; --di-accent-bright:#ddf3b9; --di-action:#afd17f; --di-action-end:#d9eeae; --di-ink:#283c18; --di-rgb:185,217,144; }
        .di-module[data-variant='documentos']       { --di-accent:#e8aa93; --di-accent-bright:#ffd4c2; --di-action:#e3a18a; --di-action-end:#f7c9b5; --di-ink:#4a291e; --di-rgb:232,170,147; }

        .di-page .di-module {
          border-color: rgba(var(--di-rgb),.58);
          box-shadow: inset 0 3px 0 var(--di-accent), 0 14px 35px rgba(0,0,0,.28);
          background-color: rgba(5,32,23,.9);
        }
        .di-page .di-module::after {
          content:''; pointer-events:none; position:absolute; top:0; right:0;
          width:145px; height:145px; border-radius:50%;
          background:radial-gradient(circle,rgba(var(--di-rgb),.18),transparent 70%);
          transform:translate(35%,-35%); z-index:-1;
        }
        .di-page .di-module h3 { color:var(--di-accent-bright); }
        .di-page .di-module h3::before {
          content:''; display:inline-block; width:9px; height:9px;
          margin:0 10px 2px 0; border-radius:3px; background:var(--di-accent);
          box-shadow:0 0 0 4px rgba(var(--di-rgb),.15);
        }
        .di-page .di-module .di-muted { color:#e0e8dc; }
        .di-page .di-module .di-module-link {
          background:linear-gradient(115deg,var(--di-action-end),var(--di-action));
          border-color:var(--di-accent-bright);
          color:var(--di-ink);
          box-shadow:0 5px 14px rgba(0,0,0,.23);
          transition:transform .18s ease, filter .18s ease, box-shadow .18s ease;
        }
        .di-page .di-module .di-module-link:hover {
          filter:brightness(1.07); transform:translateY(-1px);
          box-shadow:0 8px 18px rgba(0,0,0,.32);
        }
        .di-page .di-module:hover {
          border-color:var(--di-accent-bright);
          box-shadow:inset 0 3px 0 var(--di-accent),0 19px 38px rgba(0,0,0,.38);
        }
        .di-page .di-module .di-module-link:focus-visible {
          outline:3px solid var(--di-accent-bright); outline-offset:3px;
        }
        @media(prefers-reduced-motion:reduce) {
          .di-page .di-module .di-module-link { transition:none; }
          .di-page .di-module .di-module-link:hover { transform:none; }
        }

        .di-module-link:focus-visible,.di-page a:focus-visible,.di-page button:focus-visible { outline:3px solid #f7d579; outline-offset:3px; }
        .di-table-panel { --di-photo:url('/images/photo-1521737711867-e3b97375f902.jpg'); margin-bottom:20px; }
        .di-table-head { padding:25px 28px 20px; border-bottom:1px solid rgba(225,187,90,.27); }
        .di-table-head p { margin:9px 0 0; }
        .di-table-scroll { overflow-x:auto; padding:12px 20px 22px; }
        .di-table { width:100%; border-collapse:collapse; min-width:590px; text-align:left; color:var(--di-cream); }
        .di-table th { padding:15px 13px; color:#f4d985; font-size:13px; border-bottom:1px solid rgba(225,187,90,.38); }
        .di-table td { padding:16px 13px; border-bottom:1px solid rgba(225,187,90,.19); overflow-wrap:anywhere; }
        .di-table tbody tr:last-child td { border-bottom:0; }
        .di-table .di-badge { display:inline-block; }
        @media(max-width:950px) { .di-modules { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:630px) { .di-page { padding:16px 12px 40px; } .di-hero,.di-junta { padding:23px 20px; } .di-hero-buttons { width:100%; } .di-modules { grid-template-columns:1fr; gap:13px; } .di-module { min-height:185px; padding:20px; } .di-table-head { padding:22px 20px; } .di-table-scroll { padding:10px 10px 18px; } }
        @media(prefers-reduced-motion:reduce) { .di-module,.di-module-link { transition:none; } }
      `}</style>
      <section className="di-wrap">
        <header className="di-panel di-photo di-hero">
          <div className="di-hero-row">
            <div>
              <div className="di-heading"><h1>Panel de Directiva</h1><span className="di-badge">Directiva</span></div>
              <p className="di-muted di-lead">Gestión y administración de la Junta de Vecinos.</p>
            </div>
            <div className="di-hero-buttons">
              <CambiarPerfilButton />
              <div className="di-logout">
                <CerrarSesionButton />
              </div>
            </div>
          </div>
        </header>

        {cargando && <div className="di-panel di-notice" role="status">Cargando información de la directiva...</div>}
        {error && <div className="di-panel di-notice di-error" role="alert">{error}</div>}

        {directivaVigente && (
          <>
            <section className="di-panel di-photo di-junta">
              <div className="di-junta-row">
                <div>
                  <p className="di-kicker">Tu Junta de Vecinos</p>
                  <h2>{directivaVigente.directiva.junta_nombre}</h2>
                  <div className="di-junta-meta">
                    <span>Sector: <strong>{perfilTerritorial?.sector_nombre ?? 'Sin sector asociado'}</strong></span>
                    <span>Comuna: <strong>{directivaVigente.directiva.junta_comuna ?? perfilTerritorial?.junta_comuna ?? 'Sin comuna asociada'}</strong></span>
                  </div>
                  <p className="di-since">Directiva vigente desde <strong>{new Date(`${directivaVigente.directiva.fecha_inicio}T00:00:00`).toLocaleDateString('es-CL')}</strong></p>
                </div>
                <span className="di-badge di-active">Vigente</span>
              </div>
            </section>

            <section aria-labelledby="di-modulos-title">
              <div className="di-section-heading"><h2 id="di-modulos-title">Gestión</h2><p className="di-muted">Selecciona el módulo que deseas administrar.</p></div>
              <div className="di-modules">
                <article className="di-panel di-photo di-module" data-variant="gestion">
                  <div><h3>Gestión de Directiva</h3><p className="di-muted">Integrantes, cargos y organización de la directiva.</p></div>
                  <Link to="/directiva/gestion" className="di-module-link">Gestionar Directiva</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="publicaciones">
                  <div><h3>Comunicados</h3><p className="di-muted">Publica información y avisos para los vecinos.</p></div>
                  <Link to="/directiva/publicaciones" className="di-module-link">Ver Comunicados</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="eventos">
                  <div><h3>Actividades y Eventos</h3><p className="di-muted">Organiza actividades, inscripciones y asistencia.</p></div>
                  <Link to="/directiva/eventos" className="di-module-link">Gestionar Eventos</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="solicitudes">
                  <div><h3>Consultas y Solicitudes</h3><p className="di-muted">Responde consultas, reclamos y solicitudes vecinales.</p></div>
                  <Link to="/directiva/solicitudes" className="di-module-link">Gestionar Solicitudes</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="mensajeria">
                  <div><h3>Mensajería</h3><p className="di-muted">Revisa y responde los mensajes enviados por los vecinos.</p></div>
                  <Link to="/directiva/mensajeria" className="di-module-link">Ver Mensajes</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="asociaciones">
                  <div><h3>Asociaciones pendientes</h3><p className="di-muted">Revisa y resuelve solicitudes de vecinos que desean asociarse a tu Junta de Vecinos.</p></div>
                  <Link to="/directiva/asociaciones" className="di-module-link">Ver Solicitudes</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="caracterizacion">
                  <div><h3>Caracterización Comunitaria</h3><p className="di-muted">Consulta estadísticas agregadas sobre los hogares pertenecientes a tu Junta de Vecinos.</p></div>
                  <Link to="/directiva/caracterizacion" className="di-module-link">Ver Estadísticas</Link>
                </article>
                <article className="di-panel di-photo di-module" data-variant="documentos">
                  <div><h3>Solicitudes de Documentos</h3><p className="di-muted">Revisa, aprueba y emite documentos comunitarios.</p></div>
                  <Link to="/directiva/documentos" className="di-module-link">Gestionar Documentos</Link>
                </article>
              </div>
            </section>

            <section className="di-panel di-photo di-table-panel">
              <div className="di-table-head">
                <h2>Integrantes de la Directiva</h2>
                <p className="di-muted">Miembros activos de la directiva vigente.</p>
              </div>
              <div className="di-table-scroll">
                <table className="di-table">
                  <thead><tr><th>Nombre</th><th>Usuario</th><th>Cargo</th><th>Estado</th></tr></thead>
                  <tbody>
                    {directivaVigente.integrantes.map((integrante) => (
                      <tr key={integrante.id}>
                        <td>{[integrante.usuario_nombres, integrante.usuario_apellido_paterno].filter(Boolean).join(' ') || '-'}</td>
                        <td>{integrante.usuario_username}</td>
                        <td><span className="di-badge">{integrante.cargo_nombre}</span></td>
                        <td><span className={`di-badge ${integrante.activo ? 'di-active' : ''}`}>{integrante.activo ? 'Activo' : 'Inactivo'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default DirectivaInicioPage
