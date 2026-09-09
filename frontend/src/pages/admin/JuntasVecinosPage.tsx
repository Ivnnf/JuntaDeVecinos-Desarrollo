import { useEffect, useState } from 'react'

type JuntaVecinos = {
    id: number
    nombre: string
    comuna: string
    descripcion: string | null
    activa: boolean
    fecha_creacion: string
}

const COMUNAS_RM = [
    'Alhué',
    'Buin',
    'Calera de Tango',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'Curacaví',
    'El Bosque',
    'El Monte',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'Isla de Maipo',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Lampa',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'María Pinto',
    'Melipilla',
    'Ñuñoa',
    'Padre Hurtado',
    'Paine',
    'Pedro Aguirre Cerda',
    'Peñaflor',
    'Peñalolén',
    'Pirque',
    'Providencia',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Joaquín',
    'San José de Maipo',
    'San Miguel',
    'San Pedro',
    'San Ramón',
    'Santiago',
    'Talagante',
    'Tiltil',
    'Vitacura',
] as const

function JuntasVecinosPage() {
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [comuna, setComuna] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [juntaEditando, setJuntaEditando] =
        useState<JuntaVecinos | null>(null)


    useEffect(() => {
        const cargarJuntas = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/juntas/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar las juntas de vecinos.'
                    )
                }

                const data = await response.json()
                setJuntas(data)
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

        cargarJuntas()
    }, [])
    const crearJunta = async (event: React.FormEvent) => {
        event.preventDefault()

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/juntas/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nombre,
                        comuna,
                        descripcion,
                        activa: true,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible crear la junta de vecinos.'
                )
            }

            setJuntas((actuales) => [
                ...actuales,
                data,
            ])

            setNombre('')
            setComuna('')
            setDescripcion('')

            setMensaje(
                'Junta de vecinos creada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setGuardando(false)
        }
    }

    const comenzarEdicion = (junta: JuntaVecinos) => {
        setJuntaEditando(junta)

        setNombre(junta.nombre)
        setComuna(junta.comuna)
        setDescripcion(junta.descripcion ?? '')

        setMensaje('')
        setError('')
    }
    const actualizarJunta = async () => {
        if (!juntaEditando) {
            return
        }

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/juntas/${juntaEditando.id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nombre,
                        comuna,
                        descripcion,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible actualizar la junta de vecinos.'
                )
            }

            setJuntas((actuales) =>
                actuales.map((junta) =>
                    junta.id === data.id
                        ? data
                        : junta
                )
            )

            setJuntaEditando(null)
            setNombre('')
            setComuna('')
            setDescripcion('')

            setMensaje(
                'Junta de vecinos actualizada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setGuardando(false)
        }
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Juntas de Vecinos
                    </h1>

                    <p className="text-base-content/70 mt-2">
                        Administración de juntas vecinales registradas.
                    </p>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()

                        if (juntaEditando) {
                            actualizarJunta()
                        } else {
                            crearJunta(event)
                        }
                    }}
                    className="card bg-base-100 shadow mb-6"
                >
                    <div className="card-body">
                        <h2 className="card-title">
                            {juntaEditando
                                ? 'Editar Junta de Vecinos'
                                : 'Nueva Junta de Vecinos'}
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Nombre
                                </span>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={nombre}
                                    onChange={(event) =>
                                        setNombre(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Comuna
                                </span>

                                <select
                                    className="select select-bordered w-full"
                                    value={comuna}
                                    onChange={(event) =>
                                        setComuna(event.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Seleccione una comuna
                                    </option>

                                    {COMUNAS_RM.map((nombreComuna) => (
                                        <option
                                            key={nombreComuna}
                                            value={nombreComuna}
                                        >
                                            {nombreComuna}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Descripción
                            </span>

                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={descripcion}
                                onChange={(event) =>
                                    setDescripcion(event.target.value)
                                }
                            />
                        </label>

                        {mensaje && (
                            <div className="alert alert-success">
                                {mensaje}
                            </div>
                        )}

                        <div className="card-actions justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={guardando}
                            >
                                {guardando
                                    ? 'Guardando...'
                                    : juntaEditando
                                        ? 'Guardar Cambios'
                                        : 'Crear Junta'}
                            </button>
                        </div>
                    </div>
                </form>
                {cargando && (
                    <div className="alert">
                        Cargando juntas de vecinos...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!cargando && !error && (
                    <div className="overflow-x-auto bg-base-100 rounded-box shadow">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Comuna</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {juntas.map((junta) => (
                                    <tr key={junta.id}>
                                        <td>{junta.nombre}</td>
                                        <td>{junta.comuna}</td>
                                        <td>
                                            {junta.activa
                                                ? 'Activa'
                                                : 'Inactiva'}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline"
                                                onClick={() => comenzarEdicion(junta)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {juntas.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center"
                                        >
                                            No existen juntas registradas.
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

export default JuntasVecinosPage