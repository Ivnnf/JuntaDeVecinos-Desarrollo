import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type SolicitudVecino = {
    id: number
    vecino: number
    vecino_username: string
    junta_vecinos: number
    junta_nombre: string
    tipo: 'CONSULTA' | 'RECLAMO' | 'SOLICITUD'
    asunto: string
    descripcion: string
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESPONDIDA' | 'CERRADA'
    fecha_creacion: string
    fecha_actualizacion: string
}

function SolicitudesVecinoPage() {
    const [solicitudes, setSolicitudes] =
        useState<SolicitudVecino[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [tipo, setTipo] =
        useState<'CONSULTA' | 'RECLAMO' | 'SOLICITUD'>('CONSULTA')

    const [asunto, setAsunto] =
        useState('')

    const [descripcion, setDescripcion] =
        useState('')

    const [enviando, setEnviando] =
        useState(false)

    const [mensaje, setMensaje] =
        useState('')
    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/solicitudes/solicitudes/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar tus solicitudes.'
                    )
                }

                const data =
                    (await response.json()) as SolicitudVecino[]

                setSolicitudes(data)
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

        void cargarSolicitudes()
    }, [])

    const crearSolicitud = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        try {
            setEnviando(true)
            setMensaje('')
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/solicitudes/solicitudes/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tipo,
                        asunto,
                        descripcion,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible enviar la solicitud.'
                )
            }

            const nuevaSolicitud =
                data as SolicitudVecino

            setSolicitudes((actuales) => [
                nuevaSolicitud,
                ...actuales,
            ])

            setTipo('CONSULTA')
            setAsunto('')
            setDescripcion('')

            setMensaje(
                'Solicitud enviada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setEnviando(false)
        }
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Consultas, Reclamos y Solicitudes
                        </h1>

                        <p className="text-base-content/70 mt-1">
                            Envía y revisa tus solicitudes a la Junta de Vecinos.
                        </p>
                    </div>

                    <Link
                        to="/vecino"
                        className="btn btn-outline"
                    >
                        Volver al Panel
                    </Link>
                </div>
                <form
                    onSubmit={crearSolicitud}
                    className="card bg-base-100 shadow mb-6"
                >
                    <div className="card-body">
                        <h2 className="card-title">
                            Nueva solicitud
                        </h2>

                        {mensaje && (
                            <div className="alert alert-success">
                                {mensaje}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Tipo
                            </span>

                            <select
                                className="select select-bordered"
                                value={tipo}
                                onChange={(e) =>
                                    setTipo(
                                        e.target.value as
                                        | 'CONSULTA'
                                        | 'RECLAMO'
                                        | 'SOLICITUD'
                                    )
                                }
                            >
                                <option value="CONSULTA">
                                    Consulta
                                </option>

                                <option value="RECLAMO">
                                    Reclamo
                                </option>

                                <option value="SOLICITUD">
                                    Solicitud
                                </option>
                            </select>
                        </label>

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Asunto
                            </span>

                            <input
                                type="text"
                                className="input input-bordered"
                                value={asunto}
                                onChange={(e) =>
                                    setAsunto(e.target.value)
                                }
                                maxLength={200}
                                required
                            />
                        </label>

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Descripción
                            </span>

                            <textarea
                                className="textarea textarea-bordered min-h-32"
                                value={descripcion}
                                onChange={(e) =>
                                    setDescripcion(e.target.value)
                                }
                                required
                            />
                        </label>

                        <div className="card-actions justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={enviando}
                            >
                                {enviando
                                    ? 'Enviando...'
                                    : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </form>
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">
                        Mis solicitudes
                    </h2>

                    {cargando && (
                        <div className="alert">
                            Cargando solicitudes...
                        </div>
                    )}

                    {!cargando && !error && solicitudes.length === 0 && (
                        <div className="alert">
                            No tienes solicitudes registradas.
                        </div>
                    )}

                    {!cargando && solicitudes.length > 0 && (
                        <div className="space-y-4">
                            {solicitudes.map((solicitud) => (
                                <article
                                    key={solicitud.id}
                                    className="card bg-base-100 shadow"
                                >
                                    <div className="card-body">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <span className="badge badge-outline mb-2">
                                                    {solicitud.tipo === 'CONSULTA'
                                                        ? 'Consulta'
                                                        : solicitud.tipo === 'RECLAMO'
                                                            ? 'Reclamo'
                                                            : 'Solicitud'}
                                                </span>

                                                <h3 className="card-title">
                                                    {solicitud.asunto}
                                                </h3>

                                                <p className="text-sm text-base-content/60">
                                                    {solicitud.junta_nombre}
                                                </p>
                                            </div>

                                            <span className="badge badge-primary">
                                                {solicitud.estado === 'PENDIENTE'
                                                    ? 'Pendiente'
                                                    : solicitud.estado === 'EN_PROCESO'
                                                        ? 'En proceso'
                                                        : solicitud.estado === 'RESPONDIDA'
                                                            ? 'Respondida'
                                                            : 'Cerrada'}
                                            </span>
                                        </div>

                                        <p className="whitespace-pre-wrap">
                                            {solicitud.descripcion}
                                        </p>

                                        <p className="text-sm text-base-content/60">
                                            Enviada el{' '}
                                            {new Date(
                                                solicitud.fecha_creacion
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

export default SolicitudesVecinoPage