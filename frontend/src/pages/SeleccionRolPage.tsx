import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CerrarSesionButton from '../components/auth/CerrarSesionButton'

type Sesion = {
  roles: number[]
}

function SeleccionRolPage() {
  const navigate = useNavigate()

  const [roles, setRoles] =
    useState<number[]>([])

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          'http://localhost:8000/api/auth/sesion/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener la sesión del usuario.',
          )
        }

        const data =
          (await response.json()) as Sesion

        setRoles(data.roles ?? [])
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

    void cargarSesion()
  }, [])

  if (cargando) {
    return (
      <main className="min-h-screen bg-base-200 px-4 py-8">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-base-300 bg-base-100 px-8 py-10 text-center shadow-sm">
            <span className="loading loading-spinner loading-lg" />

            <p className="mt-4 text-base-content/60">
              Cargando perfiles disponibles...
            </p>
          </div>
        </section>
      </main>
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
                  Seleccionar perfil
                </h1>

                <span className="badge badge-primary badge-lg">
                  Acceso
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Elige el perfil con el que deseas trabajar. Cada perfil
                habilita funciones diferentes dentro de la plataforma.
              </p>
            </div>

            <CerrarSesionButton />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Resumen */}
        {!error && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
              <p className="text-sm font-medium text-base-content/60">
                Perfiles disponibles
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-3xl font-bold">
                  {roles.length}
                </span>

                <span className="badge badge-primary badge-outline">
                  Habilitados
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
              <p className="text-sm font-medium text-base-content/60">
                Estado de sesión
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-xl font-bold">
                  Activa
                </span>

                <span className="badge badge-success">
                  Conectado
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-base-content/60">
                Acceso
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-xl font-bold">
                  Según rol
                </span>

                <span className="badge badge-ghost">
                  Seguro
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Título sección */}
        {!error && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Perfiles disponibles
            </h2>

            <p className="mt-1 text-base-content/60">
              Selecciona uno de los perfiles habilitados para tu cuenta.
            </p>
          </div>
        )}

        {/* Sin perfiles */}
        {!error && roles.length === 0 && (
          <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-xl font-bold text-warning">
                !
              </div>

              <h3 className="text-xl font-bold">
                No tienes perfiles disponibles
              </h3>

              <p className="mt-2 text-base-content/60">
                Tu cuenta no tiene roles habilitados para ingresar a la
                plataforma.
              </p>
            </div>
          </div>
        )}

        {/* Roles */}
        {!error && roles.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">

            {/* Vecino */}
            {roles.includes(3) && (
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex-1 p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-700">
                        V
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          Vecino
                        </h3>

                        <p className="mt-1 text-sm text-base-content/60">
                          Participación y servicios comunitarios.
                        </p>
                      </div>
                    </div>

                    <span className="badge badge-success badge-outline">
                      Disponible
                    </span>
                  </div>

                  <p className="mb-5 leading-relaxed text-base-content/70">
                    Accede a las funciones disponibles para vecinos y realiza
                    tus gestiones directamente con la Junta de Vecinos.
                  </p>

                  <div className="rounded-xl bg-base-200/60 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                      Funciones principales
                    </p>

                    <div className="grid gap-2 text-sm text-base-content/70">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-success badge-xs" />
                        Actividades y eventos
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-success badge-xs" />
                        Consultas, reclamos y solicitudes
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-success badge-xs" />
                        Solicitud de documentos
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-success badge-xs" />
                        Perfil personal
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-base-300 p-4">
                  <button
                    type="button"
                    className="btn w-full border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                    onClick={() =>
                      navigate('/vecino')
                    }
                  >
                    Entrar como Vecino
                  </button>
                </div>
              </article>
            )}

            {/* Directiva */}
            {roles.includes(2) && (
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-indigo-500/30 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex-1 p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-lg font-bold text-indigo-700">
                        D
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          Directiva
                        </h3>

                        <p className="mt-1 text-sm text-base-content/60">
                          Gestión de la Junta de Vecinos.
                        </p>
                      </div>
                    </div>

                    <span className="badge badge-primary badge-outline">
                      Disponible
                    </span>
                  </div>

                  <p className="mb-5 leading-relaxed text-base-content/70">
                    Accede a las herramientas de administración y gestión
                    operativa de la Directiva.
                  </p>

                  <div className="rounded-xl bg-base-200/60 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                      Funciones principales
                    </p>

                    <div className="grid gap-2 text-sm text-base-content/70">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-xs" />
                        Gestión de Directiva
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-xs" />
                        Comunicados
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-xs" />
                        Actividades y eventos
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-xs" />
                        Consultas y solicitudes
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-xs" />
                        Solicitudes de documentos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-base-300 p-4">
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={() =>
                      navigate('/directiva')
                    }
                  >
                    Entrar como Directiva
                  </button>
                </div>
              </article>
            )}

            {/* Administrador */}
            {roles.includes(1) && (
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex-1 p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-lg font-bold text-amber-700">
                        A
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          Administrador
                        </h3>

                        <p className="mt-1 text-sm text-base-content/60">
                          Administración general de la plataforma.
                        </p>
                      </div>
                    </div>

                    <span className="badge badge-warning badge-outline">
                      Disponible
                    </span>
                  </div>

                  <p className="mb-5 leading-relaxed text-base-content/70">
                    Accede a la configuración general, gestión de usuarios,
                    roles y administración global de la plataforma.
                  </p>

                  <div className="rounded-xl bg-base-200/60 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                      Alcance
                    </p>

                    <div className="grid gap-2 text-sm text-base-content/70">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-warning badge-xs" />
                        Gestión de usuarios
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-warning badge-xs" />
                        Roles y permisos
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge badge-warning badge-xs" />
                        Configuración general
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-base-300 p-4">
                  <button
                    type="button"
                    className="btn w-full border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700"
                    onClick={() =>
                      navigate('/admin')
                    }
                  >
                    Entrar como Administrador
                  </button>
                </div>
              </article>
            )}

            {/* Municipal */}
            {roles.includes(4) && (
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex-1 p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-bold text-cyan-700">
                        M
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          Municipal
                        </h3>

                        <p className="mt-1 text-sm text-base-content/60">
                          Funciones de gestión municipal.
                        </p>
                      </div>
                    </div>

                    <span className="badge badge-info badge-outline">
                      Disponible
                    </span>
                  </div>

                  <p className="mb-5 leading-relaxed text-base-content/70">
                    Accede a las funciones municipales disponibles dentro de la
                    plataforma.
                  </p>

                  <div className="rounded-xl bg-base-200/60 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                      Perfil municipal
                    </p>

                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <span className="badge badge-info badge-xs" />
                      Acceso a herramientas municipales
                    </div>
                  </div>
                </div>

                <div className="border-t border-base-300 p-4">
                  <button
                    type="button"
                    className="btn w-full border-cyan-600 bg-cyan-600 text-white hover:border-cyan-700 hover:bg-cyan-700"
                    onClick={() =>
                      navigate('/municipal')
                    }
                  >
                    Entrar como Municipal
                  </button>
                </div>
              </article>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default SeleccionRolPage
