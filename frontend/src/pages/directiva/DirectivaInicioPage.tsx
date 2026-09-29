import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
  const [juntaId, setJuntaId] =
    useState<number | null>(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [directivaVigente, setDirectivaVigente] =
    useState<DirectivaVigente | null>(null)

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
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">
        {/* Encabezado */}
        <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Panel de Directiva
                </h1>

                <span className="badge badge-primary badge-lg">
                  Directiva
                </span>
              </div>

              <p className="text-base-content/70">
                Gestión y administración de la Junta de Vecinos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CambiarPerfilButton />
              <CerrarSesionButton />
            </div>
          </div>
        </div>

        {cargando && (
          <div className="alert mb-6">
            <span className="loading loading-spinner loading-sm" />
            <span>
              Cargando información de la directiva...
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {directivaVigente && (
          <>
            {/* Información de la Junta */}
            <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                    Junta de Vecinos
                  </p>

                  <h2 className="text-2xl font-bold">
                    {directivaVigente.directiva.junta_nombre}
                  </h2>

                  <p className="mt-2 text-base-content/70">
                    Directiva vigente desde{' '}
                    <strong>
                      {new Date(
                        `${directivaVigente.directiva.fecha_inicio}T00:00:00`,
                      ).toLocaleDateString('es-CL')}
                    </strong>
                  </p>
                </div>

                <span className="badge badge-success badge-lg">
                  Vigente
                </span>
              </div>
            </div>

            {/* Módulos */}
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">
                  Gestión
                </h2>

                <p className="mt-1 text-base-content/60">
                  Selecciona el módulo que deseas administrar.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Gestión Directiva */}
                <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">
                      Gestión de Directiva
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      Integrantes, cargos y organización de la directiva.
                    </p>
                  </div>

                  <Link
                    to="/directiva/gestion"
                    className="btn w-full border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700"
                  >
                    Gestionar Directiva
                  </Link>
                </div>

                {/* Comunicados */}
                <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">
                      Comunicados
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      Publica información y avisos para los vecinos.
                    </p>
                  </div>

                  <Link
                    to="/directiva/publicaciones"
                    className="btn w-full border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
                  >
                    Ver Comunicados
                  </Link>
                </div>

                {/* Eventos */}
                <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">
                      Actividades y Eventos
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      Organiza actividades, inscripciones y asistencia.
                    </p>
                  </div>

                  <Link
                    to="/directiva/eventos"
                    className="btn w-full border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                  >
                    Gestionar Eventos
                  </Link>
                </div>

                {/* Solicitudes */}
                <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">
                      Consultas y Solicitudes
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      Responde consultas, reclamos y solicitudes vecinales.
                    </p>
                  </div>

                  <Link
                    to="/directiva/solicitudes"
                    className="btn w-full border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700"
                  >
                    Gestionar Solicitudes
                  </Link>
                </div>

                {/* Documentos */}
                <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">
                      Solicitudes de Documentos
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      Revisa, aprueba y emite documentos comunitarios.
                    </p>
                  </div>

                  <Link
                    to="/directiva/documentos"
                    className="btn w-full border-cyan-600 bg-cyan-600 text-white hover:border-cyan-700 hover:bg-cyan-700"
                  >
                    Gestionar Documentos
                  </Link>
                </div>
              </div>
            </div>

            {/* Integrantes */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <div className="border-b border-base-300 p-6">
                <h2 className="text-2xl font-bold">
                  Integrantes de la Directiva
                </h2>

                <p className="mt-1 text-base-content/60">
                  Miembros activos de la directiva vigente.
                </p>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Cargo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {directivaVigente.integrantes.map(
                      (integrante) => (
                        <tr key={integrante.id}>
                          <td className="font-medium">
                            {[
                              integrante.usuario_nombres,
                              integrante.usuario_apellido_paterno,
                            ]
                              .filter(Boolean)
                              .join(' ') || '-'}
                          </td>

                          <td>
                            {integrante.usuario_username}
                          </td>

                          <td>
                            <span className="badge badge-outline">
                              {integrante.cargo_nombre}
                            </span>
                          </td>

                          <td>
                            {integrante.activo ? (
                              <span className="badge badge-success">
                                Activo
                              </span>
                            ) : (
                              <span className="badge badge-ghost">
                                Inactivo
                              </span>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default DirectivaInicioPage