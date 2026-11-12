
import { useEffect, useState } from 'react'
import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import { Link } from 'react-router-dom'

function MunicipalInicioPage() {
  const [puedeCambiarPerfil, setPuedeCambiarPerfil] = useState(false)

  useEffect(() => {
    let activo = true

    const comprobarPerfiles = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/sesion/', {
          credentials: 'include',
        })

        if (!response.ok) return

        const sesion: { roles?: number[] } = await response.json()
        if (activo) {
          setPuedeCambiarPerfil(Array.isArray(sesion.roles) && sesion.roles.length > 1)
        }
      } catch {
        // Si no se puede verificar la sesión, se oculta el acceso adicional.
      }
    }

    void comprobarPerfiles()
    return () => { activo = false }
  }, [])

  return (
    <main className="municipal-inicio">
      <style>{`
        .municipal-inicio,
        .municipal-inicio * {
          box-sizing: border-box;
        }

        .municipal-inicio {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 36px 24px 64px;
          color: #f8f2e4;
          background: #0d291e;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .municipal-inicio::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image:
            linear-gradient(
              120deg,
              rgba(5, 30, 20, 0.69),
              rgba(5, 31, 22, 0.77)
            ),
            url('/images/photo-1487958449943-2429e8be8625.jpg');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .municipal-inicio .mi-container {
          width: 100%;
          max-width: 1190px;
          margin: 0 auto;
        }

        .municipal-inicio .mi-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          padding: 36px;
          border: 1px solid rgba(220, 184, 105, 0.7);
          border-radius: 25px;
          background-image:
            linear-gradient(
              110deg,
              rgba(5, 35, 23, 0.91),
              rgba(6, 34, 24, 0.78)
            ),
            url('/images/photo-1497366754035-f200968a6e72.jpg');
          background-position: center;
          background-size: cover;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.23);
        }

        .municipal-inicio .mi-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .municipal-inicio h1,
        .municipal-inicio h2,
        .municipal-inicio h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #fff4dc;
        }

        .municipal-inicio h1 {
          margin: 0;
          font-size: clamp(33px, 4vw, 49px);
          font-weight: 700;
          line-height: 1.14;
        }

        .municipal-inicio .mi-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 15px;
          border: 1px solid rgba(224, 186, 98, 0.75);
          border-radius: 999px;
          background: rgba(13, 48, 32, 0.88);
          color: #f5d88d;
          font-size: 13px;
          font-weight: 700;
        }

        .municipal-inicio .mi-subtitle {
          max-width: 700px;
          margin: 16px 0 0;
          color: #e5e9db;
          font-size: 16px;
          line-height: 1.7;
        }

        .municipal-inicio .mi-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }

        .municipal-inicio .mi-logout {
          flex-shrink: 0;
        }

        .municipal-inicio .mi-switch-profile {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 11px 18px;
          border: 1px solid #9ccef4;
          border-radius: 13px;
          background: linear-gradient(110deg, #c8e7ff, #8ec5ed);
          color: #123047;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24);
          transition: filter .2s, transform .2s;
        }

        .municipal-inicio .mi-switch-profile:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          color: #123047;
        }

        .municipal-inicio .mi-logout button,
        .municipal-inicio .mi-logout a {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 11px 18px;
          border: 1px solid #f6db9c !important;
          border-radius: 13px !important;
          background: linear-gradient(
            110deg,
            #f3dda6,
            #d2ac60
          ) !important;
          color: #102a1e !important;
          font-size: 14px !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24);
          cursor: pointer;
        }

        .municipal-inicio .mi-logout button:hover,
        .municipal-inicio .mi-logout a:hover {
          background: #ffe7b0 !important;
          color: #102a1e !important;
        }

        .municipal-inicio .mi-intro-card {
          margin-top: 25px;
          padding: 30px 34px;
          border: 1px solid rgba(220, 184, 105, 0.57);
          border-radius: 23px;
          background-image:
            linear-gradient(
              110deg,
              rgba(9, 41, 29, 0.88),
              rgba(12, 45, 32, 0.81)
            ),
            url('/images/photo-1600607687939-ce8a6c25118c.jpg');
          background-position: center;
          background-size: cover;
        }

        .municipal-inicio .mi-overline {
          margin: 0 0 10px;
          color: #f0d28b;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .municipal-inicio .mi-intro-card h2 {
          margin: 0 0 12px;
          font-size: clamp(24px, 3vw, 34px);
        }

        .municipal-inicio .mi-intro-card p:last-child {
          max-width: 820px;
          margin: 0;
          color: #e2e9df;
          font-size: 15px;
          line-height: 1.75;
        }

        .municipal-inicio .mi-section-heading {
          margin: 32px 0 18px;
        }

        .municipal-inicio .mi-section-heading h2 {
          margin: 0 0 9px;
          font-size: clamp(25px, 3vw, 32px);
        }

        .municipal-inicio .mi-section-heading p {
          margin: 0;
          color: #e0e8dd;
          font-size: 15px;
        }

        .municipal-inicio .mi-module-card {
          overflow: hidden;
          border: 1px solid rgba(221, 184, 102, 0.7);
          border-radius: 24px;
          background-image:
            linear-gradient(
              130deg,
              rgba(6, 35, 24, 0.91),
              rgba(9, 41, 29, 0.83)
            ),
            url('/images/photo-1486406146926-c627a92ad1ab.jpg');
          background-position: center;
          background-size: cover;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.22);
        }

        .municipal-inicio .mi-module-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          min-height: 215px;
          padding: 34px;
        }

        .municipal-inicio .mi-module-text {
          flex: 1;
          min-width: 230px;
        }

        .municipal-inicio .mi-module-label {
          display: inline-block;
          margin-bottom: 16px;
          padding: 6px 12px;
          border: 1px solid rgba(225, 190, 106, 0.56);
          border-radius: 999px;
          background: rgba(5, 36, 25, 0.81);
          color: #f1d58f;
          font-size: 12px;
          font-weight: 700;
        }

        .municipal-inicio .mi-module-card h3 {
          margin: 0 0 12px;
          font-size: clamp(25px, 3vw, 32px);
        }

        .municipal-inicio .mi-module-card p {
          max-width: 640px;
          margin: 0;
          color: #e3e9df;
          font-size: 15px;
          line-height: 1.75;
        }

        .municipal-inicio .mi-module-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          padding: 14px 23px;
          border: 1px solid #f5d893;
          border-radius: 13px;
          background: linear-gradient(
            110deg,
            #f1dba4,
            #cda85e
          );
          color: #102b1e;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          text-align: center;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
          transition: background 0.2s, transform 0.2s;
        }

        .municipal-inicio .mi-module-button:hover {
          background: #ffe5a8;
          color: #102b1e;
          transform: translateY(-2px);
        }

        .municipal-inicio .mi-switch-profile:focus-visible,
        .municipal-inicio .mi-module-button:focus-visible,
        .municipal-inicio .mi-logout button:focus-visible,
        .municipal-inicio .mi-logout a:focus-visible {
          outline: 3px solid #ffe2a4;
          outline-offset: 4px;
        }

        .municipal-inicio .mi-footer {
          margin-top: 29px;
          color: #d2ddcf;
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 700px) {
          .municipal-inicio {
            padding: 18px 13px 40px;
          }

          .municipal-inicio .mi-header,
          .municipal-inicio .mi-intro-card,
          .municipal-inicio .mi-module-content {
            padding: 24px 20px;
          }

          .municipal-inicio .mi-actions,
          .municipal-inicio .mi-switch-profile,
          .municipal-inicio .mi-logout,
          .municipal-inicio .mi-logout button,
          .municipal-inicio .mi-logout a {
            width: 100%;
          }

          .municipal-inicio .mi-module-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .municipal-inicio .mi-module-button,
          .municipal-inicio .mi-switch-profile {
            transition: none;
          }
        }
      `}</style>

      <div className="mi-container">
        <header className="mi-header">
          <div>
            <div className="mi-title-row">
              <h1>Panel Municipal</h1>
              <span className="mi-badge">Municipal</span>
            </div>

            <p className="mi-subtitle">
              Sesión iniciada correctamente como Usuario Municipal.
              Accede a la información comunitaria disponible para
              apoyar la gestión territorial.
            </p>
          </div>

          <div className="mi-actions">
            {puedeCambiarPerfil && (
              <Link to="/seleccionar-perfil" className="mi-switch-profile">
                ↔ Cambiar perfil
              </Link>
            )}
            <div className="mi-logout">
              <CerrarSesionButton />
            </div>
          </div>
        </header>

        <section className="mi-intro-card">
          <p className="mi-overline">Gestión territorial</p>

          <h2>Información para tu comunidad</h2>

          <p>
            Consulta los indicadores agregados de las Juntas de Vecinos
            para conocer mejor las características de los sectores
            y apoyar la revisión de sus necesidades.
          </p>
        </section>

        <section aria-labelledby="modulos-municipales">
          <div className="mi-section-heading">
            <h2 id="modulos-municipales">
              Herramientas municipales
            </h2>
            <p>
              Selecciona el módulo que deseas consultar.
            </p>
          </div>

          <article className="mi-module-card">
            <div className="mi-module-content">
              <div className="mi-module-text">
                <span className="mi-module-label">
                  Análisis comunitario
                </span>

                <h3>Indicadores Comunitarios</h3>

                <p>
                  Consulta información agregada y comparativa
                  de las Juntas de Vecinos. Revisa las
                  caracterizaciones, los indicadores territoriales
                  y los datos disponibles por sector.
                </p>
              </div>

              <Link
                to="/municipal/indicadores"
                className="mi-module-button"
              >
                Ver Indicadores
              </Link>
            </div>
          </article>
        </section>

        <footer className="mi-footer">
          Plataforma de Gestión Comunitaria · Junta de Vecinos
        </footer>
      </div>
    </main>
  )
}

export default MunicipalInicioPage
