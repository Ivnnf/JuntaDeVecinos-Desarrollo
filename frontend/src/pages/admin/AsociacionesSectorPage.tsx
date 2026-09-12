import { useEffect, useState } from 'react'

type AsociacionPendiente = {
  id: number
  username: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  email: string
  sector_id: number
  sector_nombre: string
  junta_id: number
  junta_nombre: string
  estado_asociacion_sector: string
}

function AsociacionesSectorPage() {
  const [asociaciones, setAsociaciones] =
    useState<AsociacionPendiente[]>([])

  const [cargando, setCargando] = useState(true)
  const [procesandoId, setProcesandoId] =
    useState<number | null>(null)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarAsociaciones = async () => {
    setCargando(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/organizacion/asociaciones-pendientes/',
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        setError(
          'No fue posible cargar las asociaciones pendientes.',
        )
        return
      }

      const data =
        (await response.json()) as AsociacionPendiente[]

      setAsociaciones(data)
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarAsociaciones()
  }, [])

  const resolverAsociacion = async (
    usuarioId: number,
    accion: 'CONFIRMAR' | 'RECHAZAR',
  ) => {
    setError('')
    setMensaje('')
    setProcesandoId(usuarioId)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/resolver-asociacion-sector/${usuarioId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            accion,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
            'No fue posible resolver la asociación.',
        )
        return
      }

      setAsociaciones((actuales) =>
        actuales.filter(
          (asociacion) =>
            asociacion.id !== usuarioId,
        ),
      )

      setMensaje(
        accion === 'CONFIRMAR'
          ? 'Asociación confirmada correctamente.'
          : 'Asociación rechazada correctamente.',
      )
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.',
      )
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Asociaciones territoriales pendientes
          </h1>

          <p className="text-base-content/70 mt-2">
            Confirma o rechaza las solicitudes de sector realizadas por vecinos.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {mensaje && (
          <div className="alert alert-success mb-4">
            <span>{mensaje}</span>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vecino</th>
                      <th>RUT</th>
                      <th>Correo</th>
                      <th>Junta</th>
                      <th>Sector</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {asociaciones.map((asociacion) => {
                      const nombreCompleto = [
                        asociacion.nombres,
                        asociacion.apellido_paterno,
                        asociacion.apellido_materno,
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <tr key={asociacion.id}>
                          <td>
                            {nombreCompleto ||
                              asociacion.username}
                          </td>

                          <td>
                            {asociacion.rut ?? '-'}
                          </td>

                          <td>
                            {asociacion.email}
                          </td>

                          <td>
                            {asociacion.junta_nombre}
                          </td>

                          <td>
                            {asociacion.sector_nombre}
                          </td>

                          <td>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                disabled={
                                  procesandoId ===
                                  asociacion.id
                                }
                                onClick={() =>
                                  void resolverAsociacion(
                                    asociacion.id,
                                    'CONFIRMAR',
                                  )
                                }
                              >
                                Confirmar
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-error"
                                disabled={
                                  procesandoId ===
                                  asociacion.id
                                }
                                onClick={() =>
                                  void resolverAsociacion(
                                    asociacion.id,
                                    'RECHAZAR',
                                  )
                                }
                              >
                                Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {asociaciones.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center"
                        >
                          No existen asociaciones pendientes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default AsociacionesSectorPage