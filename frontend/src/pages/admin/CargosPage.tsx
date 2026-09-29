import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Cargo = {
    id: number
    nombre: string
    descripcion: string | null
    permite_multiples: boolean
    activo: boolean
}

function CargosPage() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [permiteMultiples, setPermiteMultiples] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [procesandoId, setProcesandoId] = useState<number | null>(null)

    useEffect(() => {
        async function cargarCargos() {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/cargos/',
                    {
                        credentials: 'include',
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'No fue posible cargar los cargos.'
                    )
                }

                setCargos(data)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error al cargar los cargos.'
                )
            } finally {
                setCargando(false)
            }
        }

        cargarCargos()
    }, [])

    async function crearCargo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setGuardando(true)
        setError('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/cargos/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre,
                        descripcion,
                        permite_multiples: permiteMultiples,
                        activo: true,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail || 'No fue posible crear el cargo.'
                )
            }

            setCargos((actuales) => [...actuales, data])
            setNombre('')
            setDescripcion('')
            setPermiteMultiples(false)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al crear el cargo.'
            )
        } finally {
            setGuardando(false)
        }
    }

    async function cambiarEstadoCargo(cargo: Cargo) {
        setError('')
        setProcesandoId(cargo.id)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/cargos/${cargo.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        activo: !cargo.activo,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail || 'No fue posible actualizar el cargo.'
                )
            }

            setCargos((actuales) =>
                actuales.map((item) =>
                    item.id === cargo.id ? data : item
                )
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al actualizar el cargo.'
            )
        } finally {
            setProcesandoId(null)
        }
    }

    const cargosActivos = cargos.filter((cargo) => cargo.activo).length
    const cargosInactivos = cargos.length - cargosActivos
    const cargosMultiples = cargos.filter(
        (cargo) => cargo.permite_multiples
    ).length

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Gestión de Cargos
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra los cargos disponibles para las
                                directivas y define cuáles permiten múltiples
                                integrantes.
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

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total cargos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargos.length}
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
                                    {cargosActivos}
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
                                    {cargosInactivos}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Permiten múltiples
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargosMultiples}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Múltiples
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Crear cargo */}
                <form
                    onSubmit={crearCargo}
                    className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-base-100 shadow-sm"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Crear nuevo cargo
                                    </h2>

                                    <span className="badge badge-warning badge-outline">
                                        Nuevo
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Define un nuevo cargo para las directivas.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="alert alert-error mb-6">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Nombre
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={nombre}
                                    onChange={(event) =>
                                        setNombre(event.target.value)
                                    }
                                    placeholder="Ej: Presidente"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Descripción
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={descripcion}
                                    onChange={(event) =>
                                        setDescripcion(event.target.value)
                                    }
                                    placeholder="Describe brevemente las funciones del cargo"
                                />
                            </label>
                        </div>

                        <div className="mt-5 rounded-xl border border-base-300 bg-base-200/50 p-4">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary mt-0.5"
                                    checked={permiteMultiples}
                                    onChange={(event) =>
                                        setPermiteMultiples(event.target.checked)
                                    }
                                />

                                <div>
                                    <p className="font-semibold">
                                        Permitir múltiples integrantes
                                    </p>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        Activa esta opción si más de una persona
                                        puede ocupar este cargo simultáneamente
                                        dentro de una directiva.
                                    </p>
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
                                    : 'Crear cargo'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando cargos...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        {/* Listado */}
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Cargos registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa el estado y configuración de cada cargo.
                                </p>
                            </div>

                            {cargos.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {cargos.length}{' '}
                                    {cargos.length === 1
                                        ? 'cargo'
                                        : 'cargos'}
                                </span>
                            )}
                        </div>

                        {cargos.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-xl font-bold text-warning">
                                        C
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen cargos registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea el primer cargo utilizando el
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
                                                <th>Nombre</th>
                                                <th>Descripción</th>
                                                <th>Permite múltiples</th>
                                                <th>Estado</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {cargos.map((cargo) => {
                                                const procesando =
                                                    procesandoId === cargo.id

                                                return (
                                                    <tr
                                                        key={cargo.id}
                                                        className="hover"
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-bold text-amber-700">
                                                                    {cargo.nombre
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </div>

                                                                <span className="font-semibold">
                                                                    {cargo.nombre}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="text-sm text-base-content/70">
                                                                {cargo.descripcion ||
                                                                    'Sin descripción'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    cargo.permite_multiples
                                                                        ? 'badge badge-info badge-outline'
                                                                        : 'badge badge-ghost'
                                                                }
                                                            >
                                                                {cargo.permite_multiples
                                                                    ? 'Sí'
                                                                    : 'No'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    cargo.activo
                                                                        ? 'badge badge-success badge-outline'
                                                                        : 'badge badge-ghost'
                                                                }
                                                            >
                                                                {cargo.activo
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        cargo.activo
                                                                            ? 'btn btn-sm btn-error btn-outline'
                                                                            : 'btn btn-sm btn-success btn-outline'
                                                                    }
                                                                    disabled={procesando}
                                                                    onClick={() =>
                                                                        void cambiarEstadoCargo(cargo)
                                                                    }
                                                                >
                                                                    {procesando && (
                                                                        <span className="loading loading-spinner loading-xs" />
                                                                    )}

                                                                    {procesando
                                                                        ? 'Procesando...'
                                                                        : cargo.activo
                                                                            ? 'Desactivar'
                                                                            : 'Activar'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
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

export default CargosPage
