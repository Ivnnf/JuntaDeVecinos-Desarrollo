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

    const cancelarEdicion = () => {
        setJuntaEditando(null)
        setNombre('')
        setComuna('')
        setDescripcion('')
        setError('')
        setMensaje('')
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

    const juntasActivas =
        juntas.filter((junta) => junta.activa).length

    const juntasInactivas =
        juntas.length - juntasActivas

    const comunasConJuntas =
        new Set(
            juntas.map((junta) => junta.comuna)
        ).size

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
                                    Juntas de Vecinos
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra las Juntas de Vecinos registradas
                                en la plataforma y su información territorial.
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
                                Total juntas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntas.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registradas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasInactivas}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Comunas con juntas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {comunasConJuntas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Comunas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form
                    onSubmit={(event) => {
                        event.preventDefault()

                        if (juntaEditando) {
                            void actualizarJunta()
                        } else {
                            void crearJunta(event)
                        }
                    }}
                    className={`mb-6 overflow-hidden rounded-2xl border bg-base-100 shadow-sm ${
                        juntaEditando
                            ? 'border-amber-500/40'
                            : 'border-emerald-500/30'
                    }`}
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        {juntaEditando
                                            ? 'Editar Junta de Vecinos'
                                            : 'Nueva Junta de Vecinos'}
                                    </h2>

                                    <span
                                        className={
                                            juntaEditando
                                                ? 'badge badge-warning badge-outline'
                                                : 'badge badge-success badge-outline'
                                        }
                                    >
                                        {juntaEditando
                                            ? `Editando #${juntaEditando.id}`
                                            : 'Nuevo registro'}
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    {juntaEditando
                                        ? 'Actualiza la información de la junta seleccionada.'
                                        : 'Registra una nueva Junta de Vecinos en la plataforma.'}
                                </p>
                            </div>

                            {juntaEditando && (
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

                    <div className="p-6">
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
                                    placeholder="Ej: Junta de Vecinos Villa Esperanza"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Comuna
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

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
                                    className="textarea textarea-bordered min-h-28 w-full resize-y"
                                    value={descripcion}
                                    onChange={(event) =>
                                        setDescripcion(event.target.value)
                                    }
                                    placeholder="Agrega una breve descripción de la Junta de Vecinos..."
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {descripcion.length} caracteres
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">
                            {juntaEditando && (
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
                                    : juntaEditando
                                        ? 'Guardar Cambios'
                                        : 'Crear Junta'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando juntas de vecinos...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        {/* Título listado */}
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Juntas registradas
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa y edita la información de las juntas
                                    existentes.
                                </p>
                            </div>

                            {juntas.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {juntas.length}{' '}
                                    {juntas.length === 1
                                        ? 'junta'
                                        : 'juntas'}
                                </span>
                            )}
                        </div>

                        {juntas.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-700">
                                        J
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen juntas registradas
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea la primera Junta de Vecinos
                                        utilizando el formulario superior.
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
                                                <th>Comuna</th>
                                                <th>Descripción</th>
                                                <th>Estado</th>
                                                <th>Creación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {juntas.map((junta) => (
                                                <tr
                                                    key={junta.id}
                                                    className={
                                                        juntaEditando?.id === junta.id
                                                            ? 'bg-warning/5'
                                                            : 'hover'
                                                    }
                                                >
                                                    <td>
                                                        <div className="flex min-w-[220px] items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-700">
                                                                {junta.nombre
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold">
                                                                    {junta.nombre}
                                                                </p>

                                                                <p className="mt-1 text-xs text-base-content/45">
                                                                    Junta #{junta.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="badge badge-info badge-outline whitespace-nowrap">
                                                            {junta.comuna}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="block max-w-xs text-sm text-base-content/70">
                                                            {junta.descripcion ||
                                                                'Sin descripción'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                junta.activa
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-ghost'
                                                            }
                                                        >
                                                            {junta.activa
                                                                ? 'Activa'
                                                                : 'Inactiva'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap text-sm text-base-content/60">
                                                        {formatearFecha(
                                                            junta.fecha_creacion
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    juntaEditando?.id === junta.id
                                                                        ? 'btn btn-sm btn-warning'
                                                                        : 'btn btn-sm btn-outline'
                                                                }
                                                                disabled={guardando}
                                                                onClick={() =>
                                                                    comenzarEdicion(junta)
                                                                }
                                                            >
                                                                {juntaEditando?.id === junta.id
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

export default JuntasVecinosPage
