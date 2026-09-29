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
            setGuardando(false)
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

    const directivasVigentes =
        directivas.filter(
            (directiva) => directiva.estado === 'VIGENTE'
        ).length

    const directivasFinalizadas =
        directivas.filter(
            (directiva) => directiva.estado === 'FINALIZADA'
        ).length

    const juntasActivas =
        juntas.filter(
            (junta) => junta.activa
        ).length

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) {
            return 'Sin fecha'
        }

        return new Date(`${fecha}T00:00:00`).toLocaleDateString(
            'es-CL',
            {
                dateStyle: 'medium',
            }
        )
    }

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Gestión de Directivas
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra las directivas asociadas a las
                                Juntas de Vecinos, sus períodos de vigencia y
                                sus integrantes.
                            </p>
                        </div>

                        <Link
                            to="/admin"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total directivas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivas.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registradas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Vigentes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivasVigentes}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Vigentes
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Finalizadas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivasFinalizadas}
                                </span>

                                <span className="badge badge-ghost">
                                    Históricas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Juntas activas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Disponibles
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nueva directiva */}
                <form
                    onSubmit={crearDirectiva}
                    className="mb-6 overflow-hidden rounded-2xl border border-rose-500/30 bg-base-100 shadow-sm"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Nueva Directiva
                                    </h2>

                                    <span className="badge badge-error badge-outline">
                                        Nuevo período
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Registra una nueva directiva asociada a una
                                    Junta de Vecinos activa.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-5 md:grid-cols-2">

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Junta de Vecinos
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered w-full"
                                    value={juntaSeleccionada}
                                    onChange={(event) =>
                                        setJuntaSeleccionada(
                                            event.target.value
                                        )
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
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Fecha de inicio
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

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
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Fecha de término
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={fechaFin}
                                    onChange={(event) =>
                                        setFechaFin(event.target.value)
                                    }
                                />
                            </label>

                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                    Estado inicial
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="badge badge-success badge-outline">
                                        Vigente
                                    </span>

                                    <span className="text-sm text-base-content/60">
                                        La nueva directiva se crea activa.
                                    </span>
                                </div>
                            </div>

                            <label className="form-control md:col-span-2">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Observación
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-28 w-full resize-y"
                                    value={observacion}
                                    onChange={(event) =>
                                        setObservacion(event.target.value)
                                    }
                                    placeholder="Agrega una observación relacionada con esta directiva..."
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {observacion.length} caracteres
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={guardando}
                            >
                                {guardando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {guardando
                                    ? 'Guardando...'
                                    : 'Crear Directiva'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando directivas...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Directivas registradas
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa su vigencia y administra sus integrantes.
                                </p>
                            </div>

                            {directivas.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {directivas.length}{' '}
                                    {directivas.length === 1
                                        ? 'directiva'
                                        : 'directivas'}
                                </span>
                            )}
                        </div>

                        {directivas.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-xl font-bold text-rose-700">
                                        D
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen directivas registradas
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea la primera directiva utilizando
                                        el formulario superior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Junta</th>
                                                <th>Fecha inicio</th>
                                                <th>Fecha término</th>
                                                <th>Estado</th>
                                                <th>Observación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {directivas.map((directiva) => (
                                                <tr
                                                    key={directiva.id}
                                                    className="hover"
                                                >
                                                    <td>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {directiva.junta_nombre}
                                                            </p>

                                                            <p className="mt-1 text-xs text-base-content/45">
                                                                Directiva #{directiva.id}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap">
                                                        {formatearFecha(
                                                            directiva.fecha_inicio
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap">
                                                        {formatearFecha(
                                                            directiva.fecha_fin
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                directiva.estado === 'VIGENTE'
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-ghost'
                                                            }
                                                        >
                                                            {directiva.estado === 'VIGENTE'
                                                                ? 'Vigente'
                                                                : 'Finalizada'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="block max-w-xs truncate text-sm text-base-content/60">
                                                            {directiva.observacion ||
                                                                'Sin observación'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {directiva.estado === 'VIGENTE' ? (
                                                            <div className="flex min-w-[260px] flex-wrap justify-end gap-2">
                                                                <Link
                                                                    to={`/directiva/gestion?directivaId=${directiva.id}`}
                                                                    className="btn btn-sm btn-primary"
                                                                >
                                                                    Gestionar integrantes
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-error btn-outline"
                                                                    onClick={() =>
                                                                        setDirectivaAFinalizar(
                                                                            directiva
                                                                        )
                                                                    }
                                                                >
                                                                    Finalizar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end">
                                                                <span className="text-sm text-base-content/50">
                                                                    Sin acciones
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Modal finalizar */}
                {directivaAFinalizar && (
                    <div className="modal modal-open">
                        <div className="modal-box rounded-2xl">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 font-bold text-error">
                                    !
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold">
                                        Finalizar Directiva
                                    </h3>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        Esta acción cambiará el estado de la
                                        directiva a finalizada.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl bg-base-200/60 p-4">
                                <p>
                                    ¿Deseas finalizar la directiva vigente de{' '}
                                    <strong>
                                        {directivaAFinalizar.junta_nombre}
                                    </strong>
                                    ?
                                </p>
                            </div>

                            <div className="alert alert-warning mt-4">
                                <span>
                                    Al finalizar la directiva, sus integrantes
                                    activos dejarán de tener cargos vigentes
                                    asociados a ella.
                                </span>
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
                                        void finalizarDirectiva(
                                            directivaAFinalizar
                                        )
                                    }
                                >
                                    {finalizando && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

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
