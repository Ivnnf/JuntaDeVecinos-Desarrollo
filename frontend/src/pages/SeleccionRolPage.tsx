import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CerrarSesionButton from '../components/auth/CerrarSesionButton'

type Sesion = {
  roles: number[]
}

type Perfil = {
  id: number
  nombre: string
  inicial: string
  subtitulo: string
  descripcion: string
  tituloFunciones: string
  funciones: string[]
  ruta: string
  claseFoto: string
}

const PERFILES: Perfil[] = [
  {
    id: 3,
    nombre: 'Vecino',
    inicial: 'V',
    subtitulo: 'Participación y servicios comunitarios',
    descripcion: 'Participa en tu comunidad y realiza tus gestiones directamente con la Junta de Vecinos.',
    tituloFunciones: 'Funciones principales',
    funciones: ['Actividades y eventos', 'Consultas, reclamos y solicitudes', 'Solicitud de documentos', 'Perfil personal'],
    ruta: '/vecino',
    claseFoto: 'sr-vecino',
  },
  {
    id: 2,
    nombre: 'Directiva',
    inicial: 'D',
    subtitulo: 'Gestión de la Junta de Vecinos',
    descripcion: 'Organiza el trabajo comunitario con las herramientas de administración de tu directiva.',
    tituloFunciones: 'Funciones principales',
    funciones: ['Gestión de Directiva', 'Comunicados', 'Actividades y eventos', 'Consultas y solicitudes', 'Solicitudes de documentos'],
    ruta: '/directiva',
    claseFoto: 'sr-directiva',
  },
  {
    id: 1,
    nombre: 'Administrador',
    inicial: 'A',
    subtitulo: 'Administración general de la plataforma',
    descripcion: 'Accede a la configuración general y a la gestión de usuarios, roles y permisos.',
    tituloFunciones: 'Alcance',
    funciones: ['Gestión de usuarios', 'Roles y permisos', 'Configuración general'],
    ruta: '/admin',
    claseFoto: 'sr-admin',
  },
  {
    id: 4,
    nombre: 'Municipal',
    inicial: 'M',
    subtitulo: 'Funciones de gestión municipal',
    descripcion: 'Accede a las herramientas municipales disponibles para tu cuenta dentro de la plataforma.',
    tituloFunciones: 'Perfil municipal',
    funciones: ['Indicadores comunitarios', 'Filtros territoriales', 'Análisis municipal', 'Exportación CSV'],
    ruta: '/municipal',
    claseFoto: 'sr-municipal',
  },
]

function SeleccionRolPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<number[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarSesion() {
      try {
        const response = await fetch('http://localhost:8000/api/auth/sesion/', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('No fue posible obtener la sesión del usuario.')
        }

        const data = (await response.json()) as Sesion
        if (activo) {
          setRoles(Array.isArray(data.roles) ? data.roles : [])
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarSesion()
    return () => {
      activo = false
    }
  }, [])

  const disponibles = PERFILES.filter((perfil) => roles.includes(perfil.id))

  return (
    <main className="seleccion-rol-bosque">
      <style>{`
        .seleccion-rol-bosque,
        .seleccion-rol-bosque * { box-sizing: border-box; }
        .seleccion-rol-bosque {
          --sr-oro: #dbb86b;
          --sr-crema: #fff4dc;
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 34px 22px 65px;
          color: #f2f1e6;
          background: #10271e;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .seleccion-rol-bosque::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: -1;
          background-image:
            linear-gradient(110deg, rgba(5,25,17,.74), rgba(8,34,23,.59)),
            url('/images/photo-1600607687939-ce8a6c25118c.jpg');
          background-position: center;
          background-size: cover;
          pointer-events: none;
        }
        .seleccion-rol-bosque .sr-container { width: 100%; max-width: 1200px; margin: 0 auto; }
        .seleccion-rol-bosque .sr-hero,
        .seleccion-rol-bosque .sr-stat,
        .seleccion-rol-bosque .sr-profile,
        .seleccion-rol-bosque .sr-empty,
        .seleccion-rol-bosque .sr-loading {
          border: 1px solid rgba(222,183,102,.63);
          border-radius: 23px;
          box-shadow: 0 12px 38px rgba(0,0,0,.22);
        }
        .seleccion-rol-bosque .sr-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding: 34px 36px;
          background-image:
            linear-gradient(100deg, rgba(7,35,25,.92), rgba(8,38,29,.73)),
            url('/images/photo-1497366811353-6870744d04b2.jpg');
          background-size: cover;
          background-position: center;
        }
        .seleccion-rol-bosque .sr-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 13px; }
        .seleccion-rol-bosque h1,
        .seleccion-rol-bosque h2,
        .seleccion-rol-bosque h3 { font-family: Georgia, 'Times New Roman', serif; color: var(--sr-crema); }
        .seleccion-rol-bosque h1 { margin: 0; font-size: clamp(30px, 4vw, 45px); line-height: 1.17; }
        .seleccion-rol-bosque .sr-badge {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(238,208,140,.6);
          border-radius: 999px;
          padding: 5px 13px;
          background: rgba(17,50,35,.72);
          color: #f3d894;
          font-size: 12px;
          font-weight: 750;
        }
        .seleccion-rol-bosque .sr-description { margin: 15px 0 0; max-width: 660px; line-height: 1.75; color: #e1e8db; font-size: 15px; }
        .seleccion-rol-bosque .sr-logout { display: flex; align-items: center; }
        .seleccion-rol-bosque .sr-logout button,
        .seleccion-rol-bosque .sr-logout a {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 10px 17px !important;
          background: #dcb86b !important;
          color: #10291e !important;
          border: 1px solid #f4db9d !important;
          border-radius: 11px !important;
          font-size: 14px !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          box-shadow: 0 4px 12px rgba(0,0,0,.25);
          cursor: pointer;
        }
        .seleccion-rol-bosque .sr-logout button:hover,
        .seleccion-rol-bosque .sr-logout a:hover { background: #f6dda2 !important; color: #10291e !important; }
        .seleccion-rol-bosque .sr-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; margin-top: 20px; }
        .seleccion-rol-bosque .sr-stat {
          min-height: 122px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          background-position: center;
          background-size: cover;
        }
        .seleccion-rol-bosque .sr-stat:nth-child(1) {
          background-image: linear-gradient(115deg,rgba(7,37,27,.91),rgba(9,43,31,.77)),url('/images/photo-1600566753190-17f0baa2a6c3.jpg');
        }
        .seleccion-rol-bosque .sr-stat:nth-child(2) {
          background-image: linear-gradient(115deg,rgba(7,37,27,.91),rgba(9,43,31,.77)),url('/images/photo-1497366754035-f200968a6e72.jpg');
        }
        .seleccion-rol-bosque .sr-stat:nth-child(3) {
          background-image: linear-gradient(115deg,rgba(7,37,27,.91),rgba(9,43,31,.77)),url('/images/photo-1600607687920-4e2a09cf159d.jpg');
        }
        .seleccion-rol-bosque .sr-stat-label { font-size: 14px; font-weight: 650; color: #e5e9df; }
        .seleccion-rol-bosque .sr-stat-line { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .seleccion-rol-bosque .sr-stat-value { font-size: 28px; font-weight: 800; color: #fff5d9; }
        .seleccion-rol-bosque .sr-section-title { margin: 29px 0 17px; }
        .seleccion-rol-bosque .sr-section-title h2 { font-size: 27px; margin: 0 0 7px; }
        .seleccion-rol-bosque .sr-section-title p { margin: 0; color: #e0e9dc; font-size: 14px; }
        .seleccion-rol-bosque .sr-profiles { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
        .seleccion-rol-bosque .sr-profile {
          display: flex;
          flex-direction: column;
          min-height: 410px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .seleccion-rol-bosque .sr-profile:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,0,0,.32); }
        .seleccion-rol-bosque .sr-vecino {
          background-image: linear-gradient(155deg,rgba(8,39,26,.9),rgba(5,29,22,.94)),url('/images/photo-1529156069898-49953e39b3ac.jpg');
        }
        .seleccion-rol-bosque .sr-directiva {
          background-image: linear-gradient(155deg,rgba(8,39,26,.9),rgba(5,29,22,.94)),url('/images/photo-1497366811353-6870744d04b2.jpg');
        }
        .seleccion-rol-bosque .sr-admin {
          background-image: linear-gradient(155deg,rgba(8,39,26,.9),rgba(5,29,22,.94)),url('/images/photo-1486406146926-c627a92ad1ab.jpg');
        }
        .seleccion-rol-bosque .sr-municipal {
          background-image: linear-gradient(155deg,rgba(8,39,26,.9),rgba(5,29,22,.94)),url('/images/photo-1487958449943-2429e8be8625.jpg');
        }
        .seleccion-rol-bosque .sr-profile-body { padding: 25px; flex: 1; }
        .seleccion-rol-bosque .sr-profile-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .seleccion-rol-bosque .sr-identidad { display: flex; align-items: center; gap: 14px; }
        .seleccion-rol-bosque .sr-icon {
          width: 52px;
          height: 52px;
          flex: 0 0 52px;
          display: grid;
          place-items: center;
          border: 1px solid #f1d894;
          border-radius: 14px;
          background: linear-gradient(130deg,#f2dfaa,#caa45c);
          color: #102b1f;
          font-size: 23px;
          font-weight: 850;
        }
        .seleccion-rol-bosque .sr-profile h3 { font-size: 25px; margin: 0 0 6px; }
        .seleccion-rol-bosque .sr-subtitle { color: #e8e4d2; font-size: 13px; line-height: 1.55; margin: 0; }
        .seleccion-rol-bosque .sr-profile-description { margin: 19px 0; color: #e4ecdf; font-size: 14px; line-height: 1.7; }
        .seleccion-rol-bosque .sr-function-box {
          padding: 17px 19px;
          border: 1px solid rgba(222,183,102,.4);
          border-radius: 15px;
          background: rgba(4,24,17,.72);
        }
        .seleccion-rol-bosque .sr-function-title { margin: 0 0 11px; font-size: 12px; letter-spacing: 1px; color: #e7d39c; font-weight: 800; text-transform: uppercase; }
        .seleccion-rol-bosque .sr-function-list { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
        .seleccion-rol-bosque .sr-function-list li { display: flex; gap: 9px; color: #e9efe5; font-size: 13px; line-height: 1.5; }
        .seleccion-rol-bosque .sr-mark { color: #edd390; font-weight: 900; }
        .seleccion-rol-bosque .sr-profile-footer { border-top: 1px solid rgba(222,183,102,.4); padding: 17px 23px; background: rgba(5,23,17,.69); }
        .seleccion-rol-bosque .sr-enter {
          display: block;
          width: 100%;
          min-height: 48px;
          border: 1px solid #f2d693;
          border-radius: 12px;
          background: linear-gradient(100deg,#f3dfab,#cda85e);
          color: #112b20;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
        }
        .seleccion-rol-bosque .sr-enter:hover { background: linear-gradient(100deg,#ffeab9,#e2bd74); }
        .seleccion-rol-bosque .sr-empty,
        .seleccion-rol-bosque .sr-loading {
          padding: 42px 25px;
          text-align: center;
          background-image: linear-gradient(rgba(7,38,27,.9),rgba(7,38,27,.92)),url('/images/photo-1600585154340-be6161a56a0c.jpg');
          background-position: center;
          background-size: cover;
        }
        .seleccion-rol-bosque .sr-empty h2 { margin: 0 0 12px; font-size: 25px; }
        .seleccion-rol-bosque .sr-empty p,
        .seleccion-rol-bosque .sr-loading p { margin: 0; color: #e4e9de; line-height: 1.7; }
        .seleccion-rol-bosque .sr-alert { margin: 19px 0; padding: 17px 20px; color: #ffe4d5; background: rgba(79,30,26,.93); border: 1px solid #e3a292; border-radius: 14px; }
        .seleccion-rol-bosque .sr-spinner { width: 34px; height: 34px; border: 3px solid rgba(245,220,162,.25); border-top-color: #efcf83; border-radius: 50%; margin: 0 auto 15px; animation: sr-spin .8s linear infinite; }
        @keyframes sr-spin { to { transform: rotate(360deg); } }
        .seleccion-rol-bosque button:focus-visible,
        .seleccion-rol-bosque a:focus-visible { outline: 3px solid #ffe5a9; outline-offset: 3px; }

        /* Identidad cromática profesional, diferenciada por perfil */
        .seleccion-rol-bosque .sr-profile {
          --sr-acento:#e6c985;
          --sr-acento-suave:rgba(230,201,133,.18);
          --sr-acento-borde:rgba(230,201,133,.7);
          border:1px solid var(--sr-acento-borde);
          box-shadow: 0 13px 35px rgba(0,0,0,.26), inset 0 4px 0 var(--sr-acento);
          position:relative;
        }
        .seleccion-rol-bosque .sr-profile::before {
          content:''; position:absolute; top:0; left:0; right:0; height:5px;
          background:var(--sr-acento); z-index:1;
        }
        .seleccion-rol-bosque .sr-vecino {
          --sr-acento:#8ce2b5; --sr-acento-suave:rgba(67,161,113,.22);
          --sr-acento-borde:rgba(140,226,181,.68);
        }
        .seleccion-rol-bosque .sr-directiva {
          --sr-acento:#bba6fa; --sr-acento-suave:rgba(131,104,208,.23);
          --sr-acento-borde:rgba(187,166,250,.70);
        }
        .seleccion-rol-bosque .sr-admin {
          --sr-acento:#f2c77b; --sr-acento-suave:rgba(203,151,64,.24);
          --sr-acento-borde:rgba(242,199,123,.72);
        }
        .seleccion-rol-bosque .sr-municipal {
          --sr-acento:#87d7f5; --sr-acento-suave:rgba(83,163,198,.23);
          --sr-acento-borde:rgba(135,215,245,.70);
        }
        .seleccion-rol-bosque .sr-profile .sr-icon {
          color:var(--sr-acento); background:var(--sr-acento-suave);
          border:1px solid var(--sr-acento-borde);
          box-shadow:0 0 0 5px rgba(0,0,0,.12);
        }
        .seleccion-rol-bosque .sr-profile h3,
        .seleccion-rol-bosque .sr-profile .sr-function-title,
        .seleccion-rol-bosque .sr-profile .sr-mark { color:var(--sr-acento); }
        .seleccion-rol-bosque .sr-profile .sr-badge {
          color:var(--sr-acento); border-color:var(--sr-acento-borde);
          background:var(--sr-acento-suave);
        }
        .seleccion-rol-bosque .sr-profile .sr-function-box {
          border-color:var(--sr-acento-borde);
          background:linear-gradient(120deg,rgba(4,23,18,.81),var(--sr-acento-suave));
        }
        .seleccion-rol-bosque .sr-profile .sr-profile-footer {
          border-top-color:var(--sr-acento-borde);
        }
        .seleccion-rol-bosque .sr-profile .sr-enter {
          color:#11271f; border-color:var(--sr-acento);
          background:linear-gradient(105deg,var(--sr-acento),color-mix(in srgb,var(--sr-acento) 76%,white));
          box-shadow:0 5px 18px rgba(0,0,0,.25);
          transition:transform .18s ease,filter .18s ease;
        }
        .seleccion-rol-bosque .sr-profile .sr-enter:hover {
          filter:brightness(1.08); transform:translateY(-1px);
          background:var(--sr-acento);
        }
        .seleccion-rol-bosque .sr-stat:nth-child(1) {border-top:4px solid #bba6fa;}
        .seleccion-rol-bosque .sr-stat:nth-child(2) {border-top:4px solid #8ce2b5;}
        .seleccion-rol-bosque .sr-stat:nth-child(3) {border-top:4px solid #87d7f5;}
        .seleccion-rol-bosque .sr-stat:nth-child(1) .sr-stat-value {color:#d2c3ff;}
        .seleccion-rol-bosque .sr-stat:nth-child(2) .sr-stat-value {color:#a5f1c9;}
        .seleccion-rol-bosque .sr-stat:nth-child(3) .sr-stat-value {color:#a5e2fb;}
        .seleccion-rol-bosque .sr-profile:focus-within {
          outline:2px solid var(--sr-acento); outline-offset:3px;
        }
        @media (prefers-reduced-motion:reduce) {
          .seleccion-rol-bosque .sr-profile .sr-enter {transition:none;}
        }

        @media (max-width: 850px) {
          .seleccion-rol-bosque { padding: 20px 14px 45px; }
          .seleccion-rol-bosque .sr-profiles { grid-template-columns: 1fr; }
          .seleccion-rol-bosque .sr-hero { padding: 27px 24px; }
        }
        @media (max-width: 620px) {
          .seleccion-rol-bosque .sr-stats { grid-template-columns: 1fr; }
          .seleccion-rol-bosque .sr-stat { min-height: 104px; }
          .seleccion-rol-bosque .sr-profile-body { padding: 20px; }
          .seleccion-rol-bosque .sr-hero { padding: 24px 20px; }
          .seleccion-rol-bosque .sr-logout { width: 100%; }
          .seleccion-rol-bosque .sr-logout button,
          .seleccion-rol-bosque .sr-logout a { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .seleccion-rol-bosque .sr-spinner { animation: none; }
          .seleccion-rol-bosque .sr-profile { transition: none; }
        }
      `}</style>

      <div className="sr-container">
        <header className="sr-hero">
          <div>
            <div className="sr-heading">
              <h1>Seleccionar perfil</h1>
              <span className="sr-badge">Acceso</span>
            </div>
            <p className="sr-description">
              Elige el perfil con el que deseas trabajar. Cada perfil habilita funciones
              diferentes dentro de la plataforma, según los permisos de tu cuenta.
            </p>
          </div>
          <div className="sr-logout">
            <CerrarSesionButton />
          </div>
        </header>

        {cargando ? (
          <section className="sr-loading" role="status" aria-live="polite" style={{ marginTop: 22 }}>
            <div className="sr-spinner" aria-hidden="true" />
            <p>Cargando perfiles disponibles...</p>
          </section>
        ) : error ? (
          <div className="sr-alert" role="alert">{error}</div>
        ) : (
          <>
            <section className="sr-stats" aria-label="Resumen de acceso">
              <div className="sr-stat">
                <span className="sr-stat-label">Perfiles disponibles</span>
                <div className="sr-stat-line">
                  <strong className="sr-stat-value">{disponibles.length}</strong>
                  <span className="sr-badge">Habilitados</span>
                </div>
              </div>
              <div className="sr-stat">
                <span className="sr-stat-label">Estado de sesión</span>
                <div className="sr-stat-line">
                  <strong className="sr-stat-value">Activa</strong>
                  <span className="sr-badge">Conectado</span>
                </div>
              </div>
              <div className="sr-stat">
                <span className="sr-stat-label">Acceso</span>
                <div className="sr-stat-line">
                  <strong className="sr-stat-value">Según rol</strong>
                  <span className="sr-badge">Seguro</span>
                </div>
              </div>
            </section>

            <div className="sr-section-title">
              <h2>Perfiles disponibles</h2>
              <p>Selecciona uno de los perfiles habilitados para tu cuenta.</p>
            </div>

            {disponibles.length === 0 ? (
              <section className="sr-empty">
                <h2>No tienes perfiles disponibles</h2>
                <p>Tu cuenta no tiene roles habilitados para ingresar a la plataforma.</p>
              </section>
            ) : (
              <section className="sr-profiles" aria-label="Perfiles de acceso">
                {disponibles.map((perfil) => (
                  <article className={`sr-profile ${perfil.claseFoto}`} key={perfil.id}>
                    <div className="sr-profile-body">
                      <div className="sr-profile-header">
                        <div className="sr-identidad">
                          <span className="sr-icon" aria-hidden="true">{perfil.inicial}</span>
                          <div>
                            <h3>{perfil.nombre}</h3>
                            <p className="sr-subtitle">{perfil.subtitulo}</p>
                          </div>
                        </div>
                        <span className="sr-badge">Disponible</span>
                      </div>
                      <p className="sr-profile-description">{perfil.descripcion}</p>
                      <div className="sr-function-box">
                        <p className="sr-function-title">{perfil.tituloFunciones}</p>
                        <ul className="sr-function-list">
                          {perfil.funciones.map((funcion) => (
                            <li key={funcion}>
                              <span className="sr-mark" aria-hidden="true">✓</span>
                              <span>{funcion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="sr-profile-footer">
                      <button
                        type="button"
                        className="sr-enter"
                        onClick={() => navigate(perfil.ruta)}
                      >
                        Entrar como {perfil.nombre}
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default SeleccionRolPage
