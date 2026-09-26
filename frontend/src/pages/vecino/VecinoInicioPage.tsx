import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import { useEffect, useState } from 'react'

type Notificacion = {
  id: number
  publicacion_id: number
  titulo_publicacion: string
  junta_nombre: string
  leida: boolean
  fecha_creacion: string
  fecha_lectura: string | null
}


function VecinoInicioPage() {
  const [notificaciones, setNotificaciones] =
    useState<Notificacion[]>([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          'http://localhost:8000/api/comunicaciones/notificaciones/',
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible cargar las notificaciones.'
          )
        }

        const data =
          (await response.json()) as Notificacion[]

        setNotificaciones(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.'
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarNotificaciones()
  }, [])

  const notificacionesNoLeidas =
    notificaciones.filter(
      (notificacion) => !notificacion.leida
    ).length
  async function marcarComoLeida(
    notificacion: Notificacion
  ) {
    if (notificacion.leida) {
      return
    }

    setError('')

    try {
      const response = await fetch(
        `http://localhost:8000/api/comunicaciones/notificaciones/${notificacion.id}/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leida: true,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'No fue posible marcar la notificación como leída.'
        )
      }

      setNotificaciones((actuales) =>
        actuales.map((item) =>
          item.id === notificacion.id
            ? data
            : item
        )
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      )
    }
  }
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <section className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Inicio del Vecino
              </h1>

              <p className="text-base-content/70 mt-2">
                Sesión iniciada correctamente como Vecino.
              </p>
              <div className="mt-4">
                <span className="badge badge-primary badge-lg">
                  {notificacionesNoLeidas} notificación
                  {notificacionesNoLeidas === 1 ? '' : 'es'} pendiente
                  {notificacionesNoLeidas === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <CerrarSesionButton />
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-bold">
              Notificaciones
            </h2>

            {cargando && (
              <div className="alert mt-4">
                Cargando notificaciones...
              </div>
            )}

            {error && (
              <div className="alert alert-error mt-4">
                {error}
              </div>
            )}

            {!cargando && !error && (
              <div className="mt-4 space-y-3">
                {notificaciones.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className="card bg-base-200"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">
                            {notificacion.titulo_publicacion}
                          </h3>

                          <p className="text-sm text-base-content/60">
                            {notificacion.junta_nombre}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={
                              notificacion.leida
                                ? 'badge badge-ghost'
                                : 'badge badge-primary'
                            }
                          >
                            {notificacion.leida
                              ? 'Leída'
                              : 'Nueva'}
                          </span>

                          {!notificacion.leida && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() =>
                                marcarComoLeida(notificacion)
                              }
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notificaciones.length === 0 && (
                  <div className="alert">
                    No tienes notificaciones.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default VecinoInicioPage