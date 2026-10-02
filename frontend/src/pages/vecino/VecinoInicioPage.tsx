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
  const [mostrarNotificaciones, setMostrarNotificaciones] =
    useState(false)
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

            <div className="flex flex-wrap items-center gap-3">

              {/* Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarNotificaciones(
                      (mostrar) => !mostrar,
                    )
                  }
                  className="btn btn-outline relative h-12 w-12 p-0"
                  aria-label="Notificaciones"
                  title="Notificaciones"
                >
                  {/* Campana */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 1 5.454 1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.312 8.642 23.848 23.848 0 0 1 5.454-1.31m5.715 0a24.255 24.255 0 0 0-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>

                  {/* Burbuja contador */}
                  {notificacionesNoLeidas > 0 && (
                    <span className="badge badge-primary badge-sm absolute -right-2 -top-2 min-w-5">
                      {notificacionesNoLeidas > 9
                        ? '9+'
                        : notificacionesNoLeidas}
                    </span>
                  )}
                </button>

                {/* Panel desplegable */}
                {mostrarNotificaciones && (
                  <div className="absolute right-0 z-50 mt-3 w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">

                    {/* Cabecera */}
                    <div className="border-b border-base-300 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold">
                            Notificaciones
                          </h3>

                          <p className="mt-1 text-xs text-base-content/50">
                            Comunicados de tu Junta de Vecinos
                          </p>
                        </div>

                        <span
                          className={
                            notificacionesNoLeidas > 0
                              ? 'badge badge-primary'
                              : 'badge badge-ghost'
                          }
                        >
                          {notificacionesNoLeidas}{' '}
                          {notificacionesNoLeidas === 1
                            ? 'sin leer'
                            : 'sin leer'}
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="max-h-[430px] overflow-y-auto">

                      {cargando && (
                        <div className="flex items-center justify-center gap-3 p-8">
                          <span className="loading loading-spinner loading-sm" />

                          <span className="text-sm text-base-content/60">
                            Cargando...
                          </span>
                        </div>
                      )}

                      {!cargando && error && (
                        <div className="p-4">
                          <div className="alert alert-error text-sm">
                            {error}
                          </div>
                        </div>
                      )}

                      {!cargando &&
                        !error &&
                        notificaciones.length === 0 && (
                          <div className="p-8 text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
                              ✓
                            </div>

                            <p className="font-semibold">
                              No tienes notificaciones
                            </p>

                            <p className="mt-1 text-sm text-base-content/50">
                              Los nuevos comunicados aparecerán aquí.
                            </p>
                          </div>
                        )}

                      {!cargando &&
                        !error &&
                        notificaciones.map((notificacion) => (
                          <div
                            key={notificacion.id}
                            className={`border-b border-base-300 p-4 last:border-b-0 ${!notificacion.leida
                                ? 'bg-primary/[0.05]'
                                : ''
                              }`}
                          >
                            <div className="flex gap-3">

                              {/* Burbuja */}
                              <div
                                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notificacion.leida
                                    ? 'bg-base-200 text-base-content/40'
                                    : 'bg-primary/15 text-primary'
                                  }`}
                              >
                                {notificacion.leida ? '✓' : '!'}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <span
                                    className={
                                      notificacion.leida
                                        ? 'badge badge-ghost badge-sm'
                                        : 'badge badge-primary badge-sm'
                                    }
                                  >
                                    {notificacion.leida
                                      ? 'Leída'
                                      : 'Nueva'}
                                  </span>

                                  <span className="text-xs text-base-content/40">
                                    {formatearFecha(
                                      notificacion.fecha_creacion,
                                    )}
                                  </span>
                                </div>

                                <p className="font-semibold leading-snug">
                                  {notificacion.titulo_publicacion}
                                </p>

                                <p className="mt-1 text-xs text-base-content/50">
                                  {notificacion.junta_nombre}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Link
                                    to={`/vecino/publicaciones/${notificacion.publicacion_id}?notificacion=${notificacion.id}`}
                                    className="btn btn-primary btn-xs"
                                    onClick={() =>
                                      setMostrarNotificaciones(false)
                                    }
                                  >
                                    Ver comunicado
                                  </Link>

                                  {!notificacion.leida && (
                                    <button
                                      type="button"
                                      className="btn btn-outline btn-xs"
                                      onClick={() =>
                                        void marcarComoLeida(
                                          notificacion,
                                        )
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
                    </div>
                  </div>
                )}
              </div>

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

        
      </section>
    </main>
  )
}

export default VecinoInicioPage
