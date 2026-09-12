import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'


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
    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Sectores
                    </h1>

                    <p className="text-base-content/70 mt-2">
                        Administración de sectores asociados a las juntas de vecinos.
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

                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">
                            Nuevo sector
                        </h2>

                        <form
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            onSubmit={(event) => {
                                if (sectorEditando) {
                                    event.preventDefault()
                                    void actualizarSector()
                                } else {
                                    void crearSector(event)
                                }
                            }}
                        >
                            <div>
                                <label
                                    className="label"
                                    htmlFor="junta-vecinos"
                                >
                                    <span className="label-text">
                                        Junta de Vecinos
                                    </span>
                                </label>

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
                            </div>

                            <div>
                                <label
                                    className="label"
                                    htmlFor="nombre-sector"
                                >
                                    <span className="label-text">
                                        Nombre del sector
                                    </span>
                                </label>

                                <input
                                    id="nombre-sector"
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={nombre}
                                    onChange={(event) =>
                                        setNombre(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    className="label"
                                    htmlFor="descripcion-sector"
                                >
                                    <span className="label-text">
                                        Descripción
                                    </span>
                                </label>

                                <textarea
                                    id="descripcion-sector"
                                    className="textarea textarea-bordered w-full"
                                    value={descripcion}
                                    onChange={(event) =>
                                        setDescripcion(event.target.value)
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={activo}
                                        onChange={(event) =>
                                            setActivo(event.target.checked)
                                        }
                                    />

                                    <span className="label-text">
                                        Sector activo
                                    </span>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? 'Guardando...'
                                        : sectorEditando
                                            ? 'Actualizar sector'
                                            : 'Crear sector'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                                            <th>Sector</th>
                                            <th>Junta de Vecinos</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sectores.map((sector) => (
                                            <tr key={sector.id}>
                                                <td>{sector.nombre}</td>
                                                <td>{sector.junta_nombre}</td>
                                                <td>
                                                    {sector.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => comenzarEdicion(sector)}
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {sectores.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="text-center"
                                                >
                                                    No existen sectores registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-sm text-base-content/60 mt-4">
                                Juntas disponibles: {juntas.length}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}

export default SectoresPage