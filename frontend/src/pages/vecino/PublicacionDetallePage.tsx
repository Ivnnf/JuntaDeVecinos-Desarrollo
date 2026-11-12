
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

type AdjuntoPublicacion = {
  id: number
  archivo: string
  nombre_original: string
  fecha_subida: string
}

type Publicacion = {
  id: number
  directiva: number
  junta_nombre: string
  autor: number
  autor_username: string
  titulo: string
  contenido: string
  fecha_publicacion: string
  activa: boolean
  adjuntos: AdjuntoPublicacion[]
}

const API = 'http://localhost:8000'

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return 'Sin información'
  return valor.toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const estilosPublicacion = String.raw`
.publicacion-detalle-apt {
  --pd-crema: #f7efd9;
  --pd-oro: #d7ac32;
  --pd-suave: #cfdbcb;
  --pd-borde: rgba(215, 172, 50, .44);
  min-height: 100vh;
  padding: 34px 20px 56px;
  color: var(--pd-crema);
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #082219;
  background-image:
    linear-gradient(120deg, rgba(3, 23, 16, .63), rgba(4, 27, 18, .68)),
    url('/casitas.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.publicacion-detalle-apt,
.publicacion-detalle-apt * { box-sizing: border-box; }
.publicacion-detalle-apt .pd-container {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
}
.publicacion-detalle-apt h1,
.publicacion-detalle-apt h2,
.publicacion-detalle-apt h3 {
  margin: 0;
  color: #fcf3dd;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  line-height: 1.2;
}
.publicacion-detalle-apt .pd-muted {
  color: var(--pd-suave);
  font-size: 14px;
  line-height: 1.75;
}
.publicacion-detalle-apt .pd-panel {
  border: 1px solid var(--pd-borde);
  border-radius: 23px;
  background-color: rgba(8, 32, 23, .89);
  box-shadow: 0 16px 40px rgba(0, 0, 0, .23);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
.publicacion-detalle-apt .pd-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
  padding: 18px 22px;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .79), rgba(8, 42, 30, .84)),
    url('/sector.webp');
  background-position: center;
  background-size: cover;
}
.publicacion-detalle-apt .pd-button {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 19px;
  border: 1px solid rgba(215, 172, 50, .72);
  border-radius: 12px;
  background: rgba(215, 172, 50, .13);
  color: #ffe9a7;
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease;
}
.publicacion-detalle-apt .pd-button:hover {
  background: rgba(215, 172, 50, .29);
  color: #fff4ca;
  transform: translateY(-2px);
}
.publicacion-detalle-apt .pd-button-primary {
  background: linear-gradient(115deg, #efd279, #cda12e);
  color: #102419;
  border-color: #d7ac32;
  font-weight: 800;
}
.publicacion-detalle-apt .pd-button-primary:hover {
  background: linear-gradient(115deg, #f5df90, #dfb747);
  color: #102419;
}
.publicacion-detalle-apt .pd-button-small {
  min-height: 37px;
  padding: 8px 15px;
  font-size: 13px;
}
.publicacion-detalle-apt .pd-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 28px;
  padding: 6px 13px;
  border: 1px solid rgba(215, 172, 50, .57);
  border-radius: 999px;
  background: rgba(215, 172, 50, .15);
  color: #f7d67c;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.3;
}
.publicacion-detalle-apt .pd-badge-success {
  border-color: rgba(95, 194, 134, .6);
  background: rgba(25, 110, 65, .3);
  color: #b7f1cc;
}
.publicacion-detalle-apt .pd-badge-muted {
  border-color: rgba(214, 219, 204, .34);
  background: rgba(211, 215, 199, .1);
  color: #e1e7d9;
}
.publicacion-detalle-apt .pd-badge-info {
  border-color: rgba(104, 181, 198, .55);
  background: rgba(31, 104, 121, .27);
  color: #c4edf5;
}
.publicacion-detalle-apt .pd-post {
  overflow: hidden;
  background-image:
    linear-gradient(115deg, rgba(7, 29, 21, .88), rgba(7, 33, 23, .92)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}
.publicacion-detalle-apt .pd-hero {
  padding: 34px 35px;
  border-bottom: 1px solid rgba(215, 172, 50, .34);
  background-image:
    linear-gradient(115deg, rgba(6, 30, 22, .75), rgba(6, 30, 22, .85)),
    url('/directivas-inicio.webp');
  background-size: cover;
  background-position: center;
}
.publicacion-detalle-apt .pd-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.publicacion-detalle-apt .pd-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}
.publicacion-detalle-apt .pd-overline {
  margin: 18px 0 9px;
  color: #e9d79b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.publicacion-detalle-apt .pd-title {
  max-width: 740px;
  font-size: clamp(32px, 3.5vw, 49px);
  overflow-wrap: anywhere;
}
.publicacion-detalle-apt .pd-meta-box {
  min-width: 150px;
  padding: 15px 18px;
  border: 1px solid rgba(215, 172, 50, .32);
  border-radius: 14px;
  background: rgba(4, 22, 15, .55);
}
.publicacion-detalle-apt .pd-meta-label {
  display: block;
  margin-bottom: 7px;
  color: #bfcfba;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .5px;
  text-transform: uppercase;
}
.publicacion-detalle-apt .pd-byline {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 23px;
  color: #d7e1d1;
  font-size: 14px;
}
.publicacion-detalle-apt .pd-content {
  padding: 32px 35px 36px;
}
.publicacion-detalle-apt .pd-section {
  padding: 26px;
  border: 1px solid rgba(215, 172, 50, .34);
  border-radius: 18px;
  background-image:
    linear-gradient(115deg, rgba(5, 29, 19, .85), rgba(7, 35, 24, .91)),
    url('/registro-vecino.webp');
  background-size: cover;
  background-position: center;
}
.publicacion-detalle-apt .pd-section-title {
  margin-bottom: 18px;
  color: #e9d79b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}
.publicacion-detalle-apt .pd-body-text {
  margin: 0;
  padding: 23px 25px;
  border: 1px solid rgba(215, 172, 50, .24);
  border-radius: 15px;
  background: rgba(3, 21, 14, .67);
  color: #faf3e2;
  font-size: 16px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.publicacion-detalle-apt .pd-files-section {
  margin-top: 23px;
  background-image:
    linear-gradient(115deg, rgba(5, 29, 19, .84), rgba(7, 35, 24, .91)),
    url('/gestion-directiva.webp');
}
.publicacion-detalle-apt .pd-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 22px;
}
.publicacion-detalle-apt .pd-section-head h2 {
  font-size: clamp(23px, 2.4vw, 30px);
}
.publicacion-detalle-apt .pd-section-head p {
  margin: 8px 0 0;
}
.publicacion-detalle-apt .pd-file-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.publicacion-detalle-apt .pd-file {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 17px;
  padding: 20px;
  border: 1px solid rgba(215, 172, 50, .38);
  border-radius: 15px;
  background-image:
    linear-gradient(115deg, rgba(4, 27, 18, .88), rgba(4, 29, 20, .93)),
    url('/sector.webp');
  background-size: cover;
  background-position: center;
}
.publicacion-detalle-apt .pd-file:nth-child(even) {
  background-image:
    linear-gradient(115deg, rgba(4, 27, 18, .88), rgba(4, 29, 20, .93)),
    url('/casitas.webp');
}
.publicacion-detalle-apt .pd-file-name {
  margin: 12px 0 0;
  color: #fff4dc;
  font-size: 15px;
  font-weight: 750;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.publicacion-detalle-apt .pd-file-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.publicacion-detalle-apt .pd-file-actions .pd-button { flex: 1; }
.publicacion-detalle-apt .pd-empty {
  padding: 22px;
  border: 1px dashed rgba(215, 172, 50, .42);
  border-radius: 14px;
  background: rgba(3, 21, 14, .62);
  color: #d2dbce;
  font-size: 14px;
}
.publicacion-detalle-apt .pd-feedback {
  padding: 22px 24px;
  margin-bottom: 18px;
  background-image:
    linear-gradient(115deg, rgba(6, 31, 22, .83), rgba(6, 31, 22, .9)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
  color: #f4ecd9;
}
.publicacion-detalle-apt .pd-error {
  border-color: rgba(227, 122, 122, .7);
  color: #ffe0dc;
}
.publicacion-detalle-apt :is(a, button):focus-visible {
  outline: 2px solid #f0d375;
  outline-offset: 3px;
}

/* Identidad cromática por función, sin alterar el contenido ni el comportamiento. */
.publicacion-detalle-apt .pd-content-section {
  border-color: rgba(145, 207, 249, .62);
  box-shadow: inset 4px 0 0 #91cff9;
}
.publicacion-detalle-apt .pd-content-section .pd-section-title {
  color: #b9e5ff;
}
.publicacion-detalle-apt .pd-files-section {
  border-color: rgba(191, 164, 246, .65);
  box-shadow: inset 4px 0 0 #bea4f6;
}
.publicacion-detalle-apt .pd-files-section h2 { color: #e0d2ff; }
.publicacion-detalle-apt .pd-file {
  border-color: rgba(129, 205, 239, .45);
  border-left: 4px solid #84ceef;
}
.publicacion-detalle-apt .pd-file:nth-child(even) {
  border-left-color: #c7adf5;
}
.publicacion-detalle-apt .pd-button-view {
  background: rgba(38, 113, 156, .28);
  border-color: #8ecff6;
  color: #d9f1ff;
}
.publicacion-detalle-apt .pd-button-view:hover {
  background: rgba(53, 143, 194, .5);
  color: #fff;
}
.publicacion-detalle-apt .pd-button-download {
  background: linear-gradient(115deg, #a4e6c0, #68c898);
  border-color: #8fddb0;
  color: #0b2a1b;
}
.publicacion-detalle-apt .pd-button-download:hover {
  background: linear-gradient(115deg, #bbf3d2, #84dcad);
  color: #0b2a1b;
}
.publicacion-detalle-apt .pd-overline { color: #f3d58f; }
.publicacion-detalle-apt .pd-badge-success { border-color: #8fddb0; color: #c6f7dc; }
.publicacion-detalle-apt .pd-badge-muted { border-color: #b6c5cf; color: #e3e9ee; }
.publicacion-detalle-apt .pd-error { background: rgba(100, 30, 37, .86); }

@media (max-width: 700px) {
  .publicacion-detalle-apt {
    padding: 18px 12px 32px;
    background-attachment: scroll;
  }
  .publicacion-detalle-apt .pd-toolbar { padding: 15px; }
  .publicacion-detalle-apt .pd-hero,
  .publicacion-detalle-apt .pd-content { padding: 22px; }
  .publicacion-detalle-apt .pd-section { padding: 17px; }
  .publicacion-detalle-apt .pd-body-text {
    padding: 17px;
    font-size: 15px;
  }
  .publicacion-detalle-apt .pd-file-grid { grid-template-columns: 1fr; }
  .publicacion-detalle-apt .pd-meta-box { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .publicacion-detalle-apt .pd-button { transition: none; }
}
`

function PublicacionDetallePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const notificacionId = searchParams.get('notificacion')

  const [publicacion, setPublicacion] = useState<Publicacion | null>(null)
  const [idCargado, setIdCargado] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Marcar la notificación como leída.
  useEffect(() => {
    if (!notificacionId) return

    async function marcarNotificacionComoLeida() {
      try {
        const response = await fetch(
          `${API}/api/comunicaciones/notificaciones/${notificacionId}/`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leida: true }),
          }
        )

        if (!response.ok) {
          console.error('No fue posible marcar la notificación como leída.')
        }
      } catch (err) {
        console.error(
          'No fue posible marcar la notificación como leída.',
          err
        )
      }
    }

    void marcarNotificacionComoLeida()
  }, [notificacionId])

  // Cargar el comunicado.
  useEffect(() => {
    if (!id) return

    const controlador = new AbortController()

    async function cargarPublicacion() {
      try {
        const response = await fetch(
          `${API}/api/comunicaciones/publicaciones/${id}/detalle/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )

        if (!response.ok) {
          throw new Error('No fue posible cargar el comunicado.')
        }

        const data = (await response.json()) as Publicacion

        if (!controlador.signal.aborted) {
          setPublicacion(data)
          setError('')
          setIdCargado(id ?? null)
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.'
          )
          setIdCargado(id ?? null)
        }
      }
    }

    void cargarPublicacion()

    return () => controlador.abort()
  }, [id])

  const cargando = Boolean(id) && idCargado !== id

  const mostrarPublicacion =
    !cargando &&
    !error &&
    publicacion?.id.toString() === id

  return (
    <main className="publicacion-detalle-apt">
      <style>{estilosPublicacion}</style>

      <section className="pd-container">
        <nav
          className="pd-panel pd-toolbar"
          aria-label="Navegación del comunicado"
        >
          <Link to="/vecino" className="pd-button">
            ← Volver al Panel
          </Link>

          {mostrarPublicacion && publicacion && (
            <span
              className={
                publicacion.activa
                  ? 'pd-badge pd-badge-success'
                  : 'pd-badge pd-badge-muted'
              }
            >
              {publicacion.activa
                ? 'Comunicado activo'
                : 'Comunicado inactivo'}
            </span>
          )}
        </nav>

        {cargando && (
          <div className="pd-panel pd-feedback" role="status">
            Cargando comunicado...
          </div>
        )}

        {(!id || error) && (
          <div className="pd-panel pd-feedback pd-error" role="alert">
            {error || 'No se encontró el identificador del comunicado.'}
          </div>
        )}

        {mostrarPublicacion && publicacion && (
          <article className="pd-panel pd-post">
            <header className="pd-hero">
              <div className="pd-heading-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pd-badges">
                    <span className="pd-badge">Comunicado</span>
                    <span className="pd-badge pd-badge-muted">
                      #{publicacion.id}
                    </span>
                  </div>

                  <p className="pd-overline">
                    {publicacion.junta_nombre}
                  </p>

                  <h1 className="pd-title">
                    {publicacion.titulo}
                  </h1>
                </div>

                <div className="pd-meta-box">
                  <span className="pd-meta-label">
                    Publicado
                  </span>
                  <span className="pd-muted">
                    {formatearFecha(publicacion.fecha_publicacion)}
                  </span>
                </div>
              </div>

              <div className="pd-byline">
                <span>Publicado por</span>
                <span className="pd-badge">
                  {publicacion.autor_username}
                </span>
              </div>
            </header>

            <div className="pd-content">
              <section
                className="pd-section"
                aria-label="Contenido del comunicado"
              >
                <p className="pd-section-title">
                  Comunicado
                </p>

                <div className="pd-body-text">
                  {publicacion.contenido}
                </div>
              </section>

              <section
                className="pd-section pd-files-section"
                aria-label="Adjuntos del comunicado"
              >
                <div className="pd-section-head">
                  <div>
                    <h2>Archivos adjuntos</h2>
                    <p className="pd-muted">
                      Documentos asociados a este comunicado.
                    </p>
                  </div>

                  <span className="pd-badge">
                    {publicacion.adjuntos.length}{' '}
                    {publicacion.adjuntos.length === 1
                      ? 'archivo'
                      : 'archivos'}
                  </span>
                </div>

                {publicacion.adjuntos.length === 0 ? (
                  <div className="pd-empty">
                    Este comunicado no contiene archivos adjuntos.
                  </div>
                ) : (
                  <div className="pd-file-grid">
                    {publicacion.adjuntos.map((adjunto) => (
                      <div
                        key={adjunto.id}
                        className="pd-file"
                      >
                        <div>
                          <div className="pd-badges">
                            <span className="pd-badge pd-badge-info">
                              Adjunto
                            </span>

                            <span className="pd-muted">
                              {formatearFecha(adjunto.fecha_subida)}
                            </span>
                          </div>

                          <p className="pd-file-name">
                            {adjunto.nombre_original}
                          </p>
                        </div>

                        <div className="pd-file-actions">
                          <a
                            href={`${API}/api/comunicaciones/adjuntos/${adjunto.id}/descargar/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pd-button pd-button-small pd-button-view"
                          >
                            Ver
                          </a>

                          <a
                            href={`${API}/api/comunicaciones/adjuntos/${adjunto.id}/descargar/?download=1`}
                            className="pd-button pd-button-primary pd-button-small pd-button-download"
                          >
                            Descargar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </article>
        )}
      </section>
    </main>
  )
}

export default PublicacionDetallePage
