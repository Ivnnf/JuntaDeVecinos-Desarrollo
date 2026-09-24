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

    useEffect(() => {
        async function cargarCargos() {
            try {
                const response = await fetch('http://localhost:8000/api/organizacion/cargos/', {
                    credentials: 'include',
                })

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
        }
    }
    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold">
                    Gestión de Cargos
                </h1>

                <p className="mt-2 text-base-content/70">
                    Administración de los cargos disponibles para las directivas.
                </p>
                <form
                    onSubmit={crearCargo}
                    className="card bg-base-100 mt-6 p-6 shadow"
                >
                    <h2 className="text-xl font-bold">
                        Crear nuevo cargo
                    </h2>

                    <div className="grid gap-4 mt-4 md:grid-cols-2">
                        <div>
                            <label className="label">
                                <span className="label-text">Nombre</span>
                            </label>

                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={nombre}
                                onChange={(event) => setNombre(event.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Descripción</span>
                            </label>

                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={descripcion}
                                onChange={(event) => setDescripcion(event.target.value)}
                            />
                        </div>
                    </div>

                    <label className="label cursor-pointer justify-start gap-3 mt-4">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={permiteMultiples}
                            onChange={(event) =>
                                setPermiteMultiples(event.target.checked)
                            }
                        />

                        <span className="label-text">
                            Permitir múltiples integrantes con este cargo
                        </span>
                    </label>

                    <div className="mt-4">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={guardando}
                        >
                            {guardando ? 'Guardando...' : 'Crear cargo'}
                        </button>
                    </div>
                </form>
                <Link
                    to="/admin"
                    className="btn btn-outline mt-4"
                >
                    Volver al Panel de Administración
                </Link>

                {cargando && (
                    <div className="mt-6">
                        Cargando cargos...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-6">
                        {error}
                    </div>
                )}

                {!cargando && !error && (
                    <div className="overflow-x-auto mt-6">
                        <table className="table">
                            <thead>
                                <tr>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Permite múltiples</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </tr>
                            </thead>

                            <tbody>
                                {cargos.map((cargo) => (
                                    <tr key={cargo.id}>
                                        <td>{cargo.nombre}</td>

                                        <td>
                                            {cargo.descripcion || 'Sin descripción'}
                                        </td>

                                        <td>
                                            {cargo.permite_multiples ? 'Sí' : 'No'}
                                        </td>

                                        <td>
                                            {cargo.activo ? 'Activo' : 'Inactivo'}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline"
                                                onClick={() => cambiarEstadoCargo(cargo)}
                                            >
                                                {cargo.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {cargos.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            No existen cargos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}

export default CargosPage