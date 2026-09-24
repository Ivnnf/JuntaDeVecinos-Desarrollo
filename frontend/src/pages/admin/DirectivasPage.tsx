import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
    id: number
    nombre: string
    comuna: string
    descripcion: string | null
    activa: boolean
    fecha_creacion: string
}

type Directiva = {
    id: number
    junta_vecinos: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    estado: 'VIGENTE' | 'FINALIZADA'
    observacion: string | null
}

function DirectivasPage() {
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
    const [directivas, setDirectivas] = useState<Directiva[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [observacion, setObservacion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [directivaAFinalizar, setDirectivaAFinalizar] =
        useState<Directiva | null>(null)

    const [finalizando, setFinalizando] = useState(false)

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [responseJuntas, responseDirectivas] =
                    await Promise.all([
                        fetch(
                            'http://localhost:8000/api/organizacion/juntas/',
                            {
                                credentials: 'include',
                            }
                        ),
                        fetch(
                            'http://localhost:8000/api/organizacion/directivas/',
                            {
                                credentials: 'include',
                            }
                        ),
                    ])

                if (!responseJuntas.ok) {
                    throw new Error(
                        'No fue posible cargar las juntas de vecinos.'
                    )
                }

                if (!responseDirectivas.ok) {
                    throw new Error(
                        'No fue posible cargar las directivas.'
                    )
                }

                const juntasData = await responseJuntas.json()
                const directivasData = await responseDirectivas.json()

                setJuntas(juntasData)
                setDirectivas(directivasData)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error al cargar la información.'
                )
            } finally {
                setCargando(false)
            }
        }

        cargarDatos()
    }, [])
    async function crearDirectiva(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/directivas/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin || null,
                        estado: 'VIGENTE',
                        observacion: observacion || null,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.estado?.[0] ||
                    data.detail ||
                    'No fue posible crear la directiva.'
                )
            }

            setDirectivas((actuales) => [
                data,
                ...actuales,
            ])

            setJuntaSeleccionada('')
            setFechaInicio('')
            setFechaFin('')
            setObservacion('')

            setMensaje(
                'Directiva creada correctamente.'
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al crear la directiva.'
            )
        } finally {
            setFinalizando(false)
            setDirectivaAFinalizar(null)
        }
    }
    async function finalizarDirectiva(directiva: Directiva) {
        setFinalizando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/directivas/${directiva.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado: 'FINALIZADA',
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible finalizar la directiva.'
                )
            }

            setDirectivas((actuales) =>
                actuales.map((item) =>
                    item.id === directiva.id
                        ? data
                        : item
                )
            )

            setMensaje(
                'Directiva finalizada correctamente.'
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al finalizar la directiva.'
            )
        } finally {
            setFinalizando(false)
            setDirectivaAFinalizar(null)
        }
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold">
                    Gestión de Directivas
                </h1>

                <p className="text-base-content/70 mt-2">
                    Administración de las directivas asociadas a las juntas de vecinos.
                </p>

                <Link
                    to="/admin"
                    className="btn btn-outline mt-4"
                >
                    Volver al Panel de Administración
                </Link>
                <form
                    onSubmit={crearDirectiva}
                    className="card bg-base-100 shadow mt-6"
                >
                    <div className="card-body">
                        <h2 className="card-title">
                            Nueva Directiva
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Junta de Vecinos
                                </span>

                                <select
                                    className="select select-bordered w-full"
                                    value={juntaSeleccionada}
                                    onChange={(event) =>
                                        setJuntaSeleccionada(event.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Seleccione una junta
                                    </option>

                                    {juntas
                                        .filter((junta) => junta.activa)
                                        .map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={junta.id}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Fecha de inicio
                                </span>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={fechaInicio}
                                    onChange={(event) =>
                                        setFechaInicio(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Fecha de término
                                </span>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={fechaFin}
                                    onChange={(event) =>
                                        setFechaFin(event.target.value)
                                    }
                                />
                            </label>
                        </div>

                        <label className="form-control mt-4">
                            <span className="label-text mb-1">
                                Observación
                            </span>

                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={observacion}
                                onChange={(event) =>
                                    setObservacion(event.target.value)
                                }
                            />
                        </label>

                        {mensaje && (
                            <div className="alert alert-success mt-4">
                                {mensaje}
                            </div>
                        )}

                        <div className="card-actions justify-end mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={guardando}
                            >
                                {guardando
                                    ? 'Guardando...'
                                    : 'Crear Directiva'}
                            </button>
                        </div>
                    </div>
                </form>
                {cargando && (
                    <div className="alert mt-6">
                        Cargando directivas...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-6">
                        {error}
                    </div>
                )}

                {!cargando && !error && (
                    <div className="overflow-x-auto bg-base-100 rounded-box shadow mt-6">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Junta</th>
                                    <th>Fecha inicio</th>
                                    <th>Fecha término</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {directivas.map((directiva) => (
                                    <tr key={directiva.id}>
                                        <td>{directiva.junta_nombre}</td>
                                        <td>{directiva.fecha_inicio}</td>
                                        <td>
                                            {directiva.fecha_fin ?? 'Sin fecha'}
                                        </td>
                                        <td>{directiva.estado}</td>
                                        <td>
                                            {directiva.estado === 'VIGENTE' ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        to={`/directiva/gestion?directivaId=${directiva.id}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        Gestionar integrantes
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline btn-error"
                                                        onClick={() => setDirectivaAFinalizar(directiva)}
                                                    >
                                                        Finalizar
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-base-content/60">
                                                    Sin acciones
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {directivas.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            No existen directivas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {directivaAFinalizar && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="text-lg font-bold">
                                Finalizar Directiva
                            </h3>

                            <p className="py-4">
                                ¿Deseas finalizar la directiva vigente de{' '}
                                <strong>
                                    {directivaAFinalizar.junta_nombre}
                                </strong>
                                ?
                            </p>

                            <div className="alert alert-warning">
                                Al finalizar la directiva, sus integrantes activos
                                dejarán de tener cargos vigentes asociados a ella.
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={finalizando}
                                    onClick={() =>
                                        setDirectivaAFinalizar(null)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-error"
                                    disabled={finalizando}
                                    onClick={() =>
                                        finalizarDirectiva(
                                            directivaAFinalizar
                                        )
                                    }
                                >
                                    {finalizando
                                        ? 'Finalizando...'
                                        : 'Finalizar Directiva'}
                                </button>
                            </div>
                        </div>

                        <div
                            className="modal-backdrop"
                            onClick={() => {
                                if (!finalizando) {
                                    setDirectivaAFinalizar(null)
                                }
                            }}
                        />
                    </div>
                )}
            </section>
        </main>
    )
}

export default DirectivasPage