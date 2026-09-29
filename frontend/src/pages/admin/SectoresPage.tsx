import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
    id: number
    nombre: string
    comuna: string
    activa: boolean
}

type Sector = {
    id: number
    junta_vecinos: number
    junta_nombre: string
    nombre: string
    descripcion: string | null
    activo: boolean
    fecha_creacion: string
}

function SectoresPage() {
    const [sectores, setSectores] = useState<Sector[]>([])
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [activo, setActivo] = useState(true)

    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [sectorEditando, setSectorEditando] =
        useState<Sector | null>(null)

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true)
            setError('')

            try {
                const [sectoresResponse, juntasResponse] =
                    await Promise.all([
                        fetch(
                            'http://localhost:8000/api/organizacion/sectores/',
                            {
                                credentials: 'include',
                            },
                        ),
                        fetch(
                            'http://localhost:8000/api/organizacion/juntas/',
                            {
                                credentials: 'include',
                            },
                        ),
                    ])

                if (
                    !sectoresResponse.ok ||
                    !juntasResponse.ok
                ) {
                    setError(
                        'No fue posible cargar la información territorial.',
                    )
                    return
                }

                const sectoresData =
                    (await sectoresResponse.json()) as Sector[]

                const juntasData =
                    (await juntasResponse.json()) as JuntaVecinos[]

                setSectores(sectoresData)
                setJuntas(juntasData)
            } catch {
                setError(
                    'No fue posible comunicarse con el servidor.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarDatos()
    }, [])

    const crearSector: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault()

        setError('')
        setMensaje('')

        if (!juntaSeleccionada) {
            setError('Debe seleccionar una junta de vecinos.')
            return
        }

        setGuardando(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/sectores/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        nombre,
                        descripcion,
                        activo,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    data.nombre?.[0] ??
                    data.junta_vecinos?.[0] ??
                    'No fue posible crear el sector.',
                )
                return
            }

            setSectores((actuales) => [
                ...actuales,
                data as Sector,
            ])

            setJuntaSeleccionada('')
            setNombre('')
            setDescripcion('')
            setActivo(true)

            setMensaje('Sector creado correctamente.')
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }

    const comenzarEdicion = (sector: Sector) => {
        setSectorEditando(sector)

        setJuntaSeleccionada(
            String(sector.junta_vecinos)
        )

        setNombre(sector.nombre)
        setDescripcion(sector.descripcion ?? '')
        setActivo(sector.activo)

        setError('')
        setMensaje('')
    }

    const cancelarEdicion = () => {
        setSectorEditando(null)
        setJuntaSeleccionada('')
        setNombre('')
        setDescripcion('')
        setActivo(true)
        setError('')
        setMensaje('')
    }

    const actualizarSector = async () => {
        if (!sectorEditando) {
            return
        }

        setError('')
        setMensaje('')
        setGuardando(true)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/sectores/${sectorEditando.id}/`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        nombre,
                        descripcion,
                        activo,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    data.nombre?.[0] ??
                    data.junta_vecinos?.[0] ??
                    'No fue posible actualizar el sector.',
                )
                return
            }

            setSectores((actuales) =>
                actuales.map((sector) =>
                    sector.id === data.id
                        ? (data as Sector)
                        : sector,
                ),
            )

            setSectorEditando(null)
            setJuntaSeleccionada('')
            setNombre('')
            setDescripcion('')
            setActivo(true)

            setMensaje(
                'Sector actualizado correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }

    const sectoresActivos =
        sectores.filter((sector) => sector.activo).length

    const sectoresInactivos =
        sectores.length - sectoresActivos

    const juntasActivas =
        juntas.filter((junta) => junta.activa).length

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString(
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
                                    Sectores
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra los sectores territoriales asociados
                                a cada Junta de Vecinos.
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
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total sectores
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectores.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registrados
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectoresActivos}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectoresInactivos}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Juntas disponibles
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Activas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <div
                    className={`mb-6 overflow-hidden rounded-2xl border bg-base-100 shadow-sm ${
                        sectorEditando
                            ? 'border-amber-500/40'
                            : 'border-cyan-500/30'
                    }`}
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        {sectorEditando
                                            ? 'Editar sector'
                                            : 'Nuevo sector'}
                                    </h2>

                                    <span
                                        className={
                                            sectorEditando
                                                ? 'badge badge-warning badge-outline'
                                                : 'badge badge-info badge-outline'
                                        }
                                    >
                                        {sectorEditando
                                            ? `Editando #${sectorEditando.id}`
                                            : 'Nuevo registro'}
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    {sectorEditando
                                        ? 'Actualiza los datos del sector seleccionado.'
                                        : 'Registra un nuevo sector asociado a una Junta de Vecinos.'}
                                </p>
                            </div>

                            {sectorEditando && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </div>

                    <form
                        className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
                        onSubmit={(event) => {
                            if (sectorEditando) {
                                event.preventDefault()
                                void actualizarSector()
                            } else {
                                void crearSector(event)
                            }
                        }}
                    >
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
                                id="junta-vecinos"
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

                                {juntas.map((junta) => (
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
                                    Nombre del sector
                                </span>

                                <span className="label-text-alt text-error">
                                    Obligatorio
                                </span>
                            </div>

                            <input
                                id="nombre-sector"
                                type="text"
                                className="input input-bordered w-full"
                                value={nombre}
                                onChange={(event) =>
                                    setNombre(event.target.value)
                                }
                                placeholder="Ej: Sector Norte"
                                required
                            />
                        </label>

                        <label className="form-control md:col-span-2">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Descripción
                                </span>

                                <span className="label-text-alt">
                                    Opcional
                                </span>
                            </div>

                            <textarea
                                id="descripcion-sector"
                                className="textarea textarea-bordered min-h-28 w-full resize-y"
                                value={descripcion}
                                onChange={(event) =>
                                    setDescripcion(event.target.value)
                                }
                                placeholder="Describe brevemente el sector..."
                            />

                            <div className="mt-2 flex justify-end">
                                <span className="text-xs text-base-content/40">
                                    {descripcion.length} caracteres
                                </span>
                            </div>
                        </label>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary mt-0.5"
                                        checked={activo}
                                        onChange={(event) =>
                                            setActivo(event.target.checked)
                                        }
                                    />

                                    <div>
                                        <p className="font-semibold">
                                            Sector activo
                                        </p>

                                        <p className="mt-1 text-sm text-base-content/60">
                                            Los sectores activos pueden ser
                                            utilizados en las asociaciones
                                            territoriales de los vecinos.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-base-300 pt-5 md:col-span-2">
                            {sectorEditando && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar
                                </button>
                            )}

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
                                    : sectorEditando
                                        ? 'Actualizar sector'
                                        : 'Crear sector'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando sectores...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Sectores registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa y edita los sectores asociados a las
                                    juntas.
                                </p>
                            </div>

                            {sectores.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {sectores.length}{' '}
                                    {sectores.length === 1
                                        ? 'sector'
                                        : 'sectores'}
                                </span>
                            )}
                        </div>

                        {sectores.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-bold text-cyan-700">
                                        S
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen sectores registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea el primer sector utilizando el
                                        formulario superior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Sector</th>
                                                <th>Junta de Vecinos</th>
                                                <th>Descripción</th>
                                                <th>Estado</th>
                                                <th>Creación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {sectores.map((sector) => (
                                                <tr
                                                    key={sector.id}
                                                    className={
                                                        sectorEditando?.id === sector.id
                                                            ? 'bg-warning/5'
                                                            : 'hover'
                                                    }
                                                >
                                                    <td>
                                                        <div className="flex min-w-[180px] items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-700">
                                                                {sector.nombre
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold">
                                                                    {sector.nombre}
                                                                </p>

                                                                <p className="mt-1 text-xs text-base-content/45">
                                                                    Sector #{sector.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="font-medium">
                                                            {sector.junta_nombre}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="block max-w-xs text-sm text-base-content/70">
                                                            {sector.descripcion ||
                                                                'Sin descripción'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                sector.activo
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-ghost'
                                                            }
                                                        >
                                                            {sector.activo
                                                                ? 'Activo'
                                                                : 'Inactivo'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap text-sm text-base-content/60">
                                                        {formatearFecha(
                                                            sector.fecha_creacion
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    sectorEditando?.id === sector.id
                                                                        ? 'btn btn-sm btn-warning'
                                                                        : 'btn btn-sm btn-outline'
                                                                }
                                                                disabled={guardando}
                                                                onClick={() =>
                                                                    comenzarEdicion(sector)
                                                                }
                                                            >
                                                                {sectorEditando?.id === sector.id
                                                                    ? 'Editando'
                                                                    : 'Editar'}
                                                            </button>
                                                        </div>
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
            </section>
        </main>
    )
}

export default SectoresPage
