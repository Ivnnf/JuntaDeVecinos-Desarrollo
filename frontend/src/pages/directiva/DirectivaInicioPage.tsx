import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
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
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <section className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Panel de Directiva
              </h1>

              <p className="text-base-content/70 mt-2">
                Sesión iniciada correctamente como integrante de la Directiva.
              </p>
              {cargando && (
                <div className="alert mt-4">
                  Cargando información de la directiva...
                </div>
              )}

              {error && (
                <div className="alert alert-error mt-4">
                  {error}
                </div>
              )}
              {directivaVigente && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold">
                    {directivaVigente.directiva.junta_nombre}
                  </h2>

                  <p className="text-base-content/70 mt-1">
                    Directiva vigente desde{' '}
                    {new Date(
                      `${directivaVigente.directiva.fecha_inicio}T00:00:00`,
                    ).toLocaleDateString('es-CL')}
                  </p>
                  <Link
                    to="/directiva/gestion"
                    className="btn btn-primary mt-4"
                  >
                    Gestionar Directiva
                  </Link>
                  <Link
                    to="/directiva/publicaciones"
                    className="btn btn-primary mt-4"
                  >
                    Comunicados
                  </Link>
                </div>
              )}
              {directivaVigente && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Integrantes de la Directiva
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Usuario</th>
                          <th>Cargo</th>
                        </tr>
                      </thead>

                      <tbody>
                        {directivaVigente.integrantes.map((integrante) => (
                          <tr key={integrante.id}>
                            <td>
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
                              {integrante.cargo_nombre}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <CerrarSesionButton />
          </div>
        </div>
      </section>
    </main>
  )
}

export default DirectivaInicioPage