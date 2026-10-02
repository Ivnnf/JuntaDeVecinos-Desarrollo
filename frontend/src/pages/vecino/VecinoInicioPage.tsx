import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Notificacion = {
  id: number
  publicacion_id: number
  titulo_publicacion: string
  junta_nombre: string
  leida: boolean
  fecha_creacion: string
  fecha_lectura: string | null
}
type PerfilResumen = {
  sector_nombre: string | null
  junta_nombre: string | null
  estado_asociacion_sector:
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'RECHAZADA'
  | null
}
function VecinoInicioPage() {
  const [perfil, setPerfil] =
    useState<PerfilResumen | null>(null)

  const [cargandoPerfil, setCargandoPerfil] =
    useState(true)

  const [errorPerfil, setErrorPerfil] =
    useState('')
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
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargandoPerfil(true)
        setErrorPerfil('')

        const response = await fetch(
          'http://localhost:8000/api/auth/perfil/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener tu información territorial.',
          )
        }

        const data =
          (await response.json()) as PerfilResumen

        setPerfil(data)
      } catch (error) {
        setErrorPerfil(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.',
        )
      } finally {
        setCargandoPerfil(false)
      }
    }

    void cargarPerfil()
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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString(
      'es-CL',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Inicio del Vecino
                </h1>

                <span className="badge badge-primary badge-lg">
                  Vecino
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Accede a las actividades, solicitudes, documentos y
                comunicados de tu Junta de Vecinos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CambiarPerfilButton />
              <CerrarSesionButton />
            </div>
          </div>
        </div>
        {/* Información territorial */}
        <div className="mb-6 rounded-2xl border border-primary/30 bg-base-100 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
                Tu Junta de Vecinos
              </p>

              {cargandoPerfil ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm" />
                  <span className="text-sm text-base-content/60">
                    Cargando información...
                  </span>
                </div>
              ) : errorPerfil ? (
                <p className="mt-2 text-sm text-error">
                  {errorPerfil}
                </p>
              ) : perfil ? (
                perfil.estado_asociacion_sector === 'PENDIENTE' ? (
                  <>
                    <h2 className="mt-1 text-xl font-bold">
                      Solicitud de asociación pendiente
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm text-base-content/60">
                      Tu solicitud de asociación territorial está pendiente
                      de aprobación por la Directiva.
                    </p>

                    <div className="mt-3">
                      <span className="badge badge-warning">
                        Asociación pendiente
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-1 text-xl font-bold">
                      {perfil.junta_nombre ?? 'Sin Junta de Vecinos asociada'}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-base-content/70">
                        Sector:{' '}
                        <strong>
                          {perfil.sector_nombre ?? 'Sin sector asociado'}
                        </strong>
                      </span>

                      <span
                        className={
                          perfil.estado_asociacion_sector === 'CONFIRMADA'
                            ? 'badge badge-success'
                            : perfil.estado_asociacion_sector === 'RECHAZADA'
                              ? 'badge badge-error'
                              : 'badge badge-ghost'
                        }
                      >
                        {perfil.estado_asociacion_sector === 'CONFIRMADA'
                          ? 'Asociación confirmada'
                          : perfil.estado_asociacion_sector === 'RECHAZADA'
                            ? 'Asociación rechazada'
                            : 'Sin asociación'}
                      </span>
                    </div>
                  </>
                )
              ) : null}
            </div>

            <Link
              to="/vecino/perfil"
              className="btn btn-sm btn-outline"
            >
              Ver mi perfil
            </Link>
          </div>
        </div>
        {/* Resumen */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Notificaciones nuevas
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-3xl font-bold">
                {notificacionesNoLeidas}
              </span>

              <span
                className={
                  notificacionesNoLeidas > 0
                    ? 'badge badge-primary'
                    : 'badge badge-ghost'
                }
              >
                {notificacionesNoLeidas > 0
                  ? 'Pendientes'
                  : 'Al día'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Total notificaciones
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-3xl font-bold">
                {notificaciones.length}
              </span>

              <span className="badge badge-info badge-outline">
                Recibidas
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-base-content/60">
              Estado
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xl font-bold">
                Sesión activa
              </span>

              <span className="badge badge-success">
                Vecino
              </span>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Servicios
            </h2>

            <p className="mt-1 text-base-content/60">
              Selecciona el módulo que deseas consultar.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Eventos */}
            <div className="group flex h-full flex-col rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-700">
                  E
                </div>

                <h3 className="text-lg font-bold">
                  Actividades y Eventos
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Revisa las actividades comunitarias e inscríbete en los
                  eventos disponibles.
                </p>
              </div>

              <Link
                to="/vecino/eventos"
                className="btn w-full border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
              >
                Ver Eventos
              </Link>
            </div>

            {/* Solicitudes */}
            <div className="group flex h-full flex-col rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-lg font-bold text-amber-700">
                  S
                </div>

                <h3 className="text-lg font-bold">
                  Consultas y Solicitudes
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Envía consultas, reclamos o solicitudes y revisa el avance
                  de tus gestiones.
                </p>
              </div>

              <Link
                to="/vecino/solicitudes"
                className="btn w-full border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700"
              >
                Ver Solicitudes
              </Link>
            </div>
            {/* Seguimiento */}
            <div className="group flex h-full flex-col rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-lg font-bold text-indigo-700">
                  SG
                </div>

                <h3 className="text-lg font-bold">
                  Seguimiento de Solicitudes
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Revisa en un solo lugar el estado, las respuestas y el historial
                  de tus solicitudes.
                </p>
              </div>

              <Link
                to="/vecino/seguimiento"
                className="btn w-full border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700"
              >
                Ver Seguimiento
              </Link>

            </div>
            {/* Mensajería */}
            <div className="group flex h-full flex-col rounded-2xl border border-rose-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-lg font-bold text-rose-700">
                  M
                </div>

                <h3 className="text-lg font-bold">
                  Mensajería
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Comunícate directamente con la directiva de tu Junta de Vecinos.
                </p>
              </div>

              <Link
                to="/vecino/mensajeria"
                className="btn w-full border-rose-600 bg-rose-600 text-white hover:border-rose-700 hover:bg-rose-700"
              >
                Ver Mensajes
              </Link>
            </div>
            {/* Documentos */}
            <div className="group flex h-full flex-col rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-bold text-cyan-700">
                  D
                </div>

                <h3 className="text-lg font-bold">
                  Solicitud de Documentos
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Solicita documentos a la directiva y consulta el estado de
                  cada solicitud.
                </p>
              </div>

              <Link
                to="/vecino/documentos"
                className="btn w-full border-cyan-600 bg-cyan-600 text-white hover:border-cyan-700 hover:bg-cyan-700"
              >
                Solicitar Documentos
              </Link>
            </div>

            {/* Mi Perfil */}
            <div className="group flex h-full flex-col rounded-2xl border border-violet-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-lg font-bold text-violet-700">
                  P
                </div>

                <h3 className="text-lg font-bold">
                  Mi Perfil
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  Revisa y actualiza tus datos personales y administra tu
                  asociación territorial.
                </p>
              </div>

              <Link
                to="/vecino/perfil"
                className="btn w-full border-violet-600 bg-violet-600 text-white hover:border-violet-700 hover:bg-violet-700"
              >
                Ver Mi Perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="border-b border-base-300 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Notificaciones
                </h2>

                <p className="mt-1 text-base-content/60">
                  Comunicados recientes publicados por tu Junta de Vecinos.
                </p>
              </div>

              {!cargando && (
                <span className="badge badge-outline badge-lg">
                  {notificacionesNoLeidas}{' '}
                  {notificacionesNoLeidas === 1
                    ? 'sin leer'
                    : 'sin leer'}
                </span>
              )}
            </div>
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="p-6">
              <div className="alert border border-base-300 bg-base-100">
                <span className="loading loading-spinner loading-sm" />
                <span>
                  Cargando notificaciones...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-6">
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            </div>
          )}

          {!cargando && !error && (
            <>
              {notificaciones.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                    ✓
                  </div>

                  <h3 className="text-xl font-bold">
                    No tienes notificaciones
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-base-content/60">
                    Cuando la directiva publique nuevos comunicados,
                    aparecerán en esta sección.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-base-300">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-5 transition-colors hover:bg-base-200/40 ${!notificacion.leida
                        ? 'bg-primary/[0.03]'
                        : ''
                        }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 flex-1 gap-4">
                          <div
                            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${notificacion.leida
                              ? 'bg-base-200 text-base-content/50'
                              : 'bg-primary/10 text-primary'
                              }`}
                          >
                            {notificacion.leida ? '✓' : '!'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
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

                              <span className="text-xs text-base-content/45">
                                {formatearFecha(
                                  notificacion.fecha_creacion
                                )}
                              </span>
                            </div>

                            <h3 className="font-bold leading-snug">
                              {notificacion.titulo_publicacion}
                            </h3>

                            <p className="mt-1 text-sm text-base-content/60">
                              {notificacion.junta_nombre}
                            </p>

                            {notificacion.leida &&
                              notificacion.fecha_lectura && (
                                <p className="mt-2 text-xs text-base-content/40">
                                  Leída el{' '}
                                  {formatearFecha(
                                    notificacion.fecha_lectura
                                  )}
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                          <Link
                            to={`/vecino/publicaciones/${notificacion.publicacion_id}?notificacion=${notificacion.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            Ver comunicado
                          </Link>

                          {!notificacion.leida && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() =>
                                void marcarComoLeida(
                                  notificacion
                                )
                              }
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default VecinoInicioPage
