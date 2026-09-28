import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type Evento = {
    id: number
    directiva: number
    junta_nombre: string
    creador: number
    creador_username: string
    titulo: string
    descripcion: string
    lugar: string
    fecha_inicio: string
    fecha_fin: string | null
    cupo_maximo: number | null
    estado: 'PROGRAMADO' | 'CANCELADO' | 'FINALIZADO'
    fecha_creacion: string
    fecha_actualizacion: string
}

type IntegranteDirectiva = {
    id: number
    directiva: number
    activo: boolean
}

function EventosPage() {
    const [eventos, setEventos] =
        useState<Evento[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [lugar, setLugar] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [cupoMaximo, setCupoMaximo] = useState('')
    const [directivaId, setDirectivaId] = useState<number | null>(null)

    const [creando, setCreando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [eventoACancelar, setEventoACancelar] =
        useState<Evento | null>(null)
    const [eventoAEditar, setEventoAEditar] =
        useState<Evento | null>(null)

    useEffect(() => {
        const cargarEventos = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/eventos/eventos/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los eventos.'
                    )
                }

                const data =
                    (await response.json()) as Evento[]

                setEventos(data)
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

        void cargarEventos()
    }, [])

    useEffect(() => {
        const cargarDirectivaActiva = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/integrantes-directiva/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible obtener la directiva activa.'
                    )
                }

                const data =
                    (await response.json()) as IntegranteDirectiva[]

                const integranteActivo = data.find(
                    (integrante) => integrante.activo
                )

                if (integranteActivo) {
                    setDirectivaId(
                        integranteActivo.directiva
                    )
                }
            } catch (error) {
                console.error(
                    'Error al obtener la directiva activa:',
                    error
                )
            }
        }

        void cargarDirectivaActiva()
    }, [])

    const crearEvento = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!directivaId) {
            setMensaje(
                'No se encontró una directiva activa para este usuario.'
            )
            return
        }

        try {
            setCreando(true)
            setMensaje('')

            const url = eventoAEditar
                ? `http://localhost:8000/api/eventos/eventos/${eventoAEditar.id}/`
                : 'http://localhost:8000/api/eventos/eventos/'

            const method = eventoAEditar
                ? 'PATCH'
                : 'POST'

            const response = await fetch(
                url,
                {
                    method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        directiva: directivaId,
                        titulo,
                        descripcion,
                        lugar,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin || null,
                        cupo_maximo:
                            cupoMaximo !== ''
                                ? Number(cupoMaximo)
                                : null,
                        estado: 'PROGRAMADO',
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible guardar el evento.'
                )
            }

            const eventoGuardado = data as Evento

            if (eventoAEditar) {
                setEventos((actuales) =>
                    actuales.map((evento) =>
                        evento.id === eventoGuardado.id
                            ? eventoGuardado
                            : evento
                    )
                )

                setMensaje(
                    'Evento actualizado correctamente.'
                )
            } else {
                setEventos((actuales) => [
                    ...actuales,
                    eventoGuardado,
                ])

                setMensaje(
                    'Evento creado correctamente.'
                )
            }

            setTitulo('')
            setDescripcion('')
            setLugar('')
            setFechaInicio('')
            setFechaFin('')
            setCupoMaximo('')
            setEventoAEditar(null)
        } catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setCreando(false)
        }
    }


    const cancelarEvento = async (
        eventoId: number
    ) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/eventos/eventos/${eventoId}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado: 'CANCELADO',
                    }),
                }
            )

            if (!response.ok) {
                throw new Error(
                    'No fue posible cancelar el evento.'
                )
            }

            const eventoActualizado =
                (await response.json()) as Evento

            setEventos((actuales) =>
                actuales.map((evento) =>
                    evento.id === eventoActualizado.id
                        ? eventoActualizado
                        : evento
                )
            )
        } catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        }
    }
    const prepararEdicion = (evento: Evento) => {
        setEventoAEditar(evento)

        setTitulo(evento.titulo)
        setDescripcion(evento.descripcion)
        setLugar(evento.lugar)

        setFechaInicio(
            evento.fecha_inicio.slice(0, 16)
        )

        setFechaFin(
            evento.fecha_fin
                ? evento.fecha_fin.slice(0, 16)
                : ''
        )

        setCupoMaximo(
            evento.cupo_maximo !== null
                ? String(evento.cupo_maximo)
                : ''
        )

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Actividades y Eventos
                        </h1>

                        <p className="text-base-content/70 mt-1">
                            Gestión de actividades comunitarias.
                        </p>
                    </div>

                    <Link
                        to="/directiva"
                        className="btn btn-outline"
                    >
                        Volver al Panel
                    </Link>
                </div>

                <form
                    onSubmit={crearEvento}
                    className="card bg-base-100 shadow mb-6"
                >
                    <div className="card-body">
                        <h2 className="card-title">
                            {eventoAEditar
                                ? 'Editar evento'
                                : 'Crear nuevo evento'}
                        </h2>

                        {mensaje && (
                            <div className="alert">
                                {mensaje}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Título
                                </span>

                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={titulo}
                                    onChange={(e) =>
                                        setTitulo(e.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Lugar
                                </span>

                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={lugar}
                                    onChange={(e) =>
                                        setLugar(e.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Fecha de inicio
                                </span>

                                <input
                                    type="datetime-local"
                                    className="input input-bordered"
                                    value={fechaInicio}
                                    onChange={(e) =>
                                        setFechaInicio(e.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Fecha de término
                                </span>

                                <input
                                    type="datetime-local"
                                    className="input input-bordered"
                                    value={fechaFin}
                                    onChange={(e) =>
                                        setFechaFin(e.target.value)
                                    }
                                />
                            </label>

                            <label className="form-control">
                                <span className="label-text mb-1">
                                    Cupo máximo
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    className="input input-bordered"
                                    value={cupoMaximo}
                                    onChange={(e) =>
                                        setCupoMaximo(e.target.value)
                                    }
                                    placeholder="Sin límite"
                                />
                            </label>
                        </div>

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Descripción
                            </span>

                            <textarea
                                className="textarea textarea-bordered min-h-28"
                                value={descripcion}
                                onChange={(e) =>
                                    setDescripcion(e.target.value)
                                }
                                required
                            />
                        </label>

                        <div className="card-actions justify-end">
                            {eventoAEditar && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setEventoAEditar(null)
                                        setTitulo('')
                                        setDescripcion('')
                                        setLugar('')
                                        setFechaInicio('')
                                        setFechaFin('')
                                        setCupoMaximo('')
                                        setMensaje('')
                                    }}
                                >
                                    Cancelar edición
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={creando}
                            >
                                {creando
                                    ? 'Guardando...'
                                    : eventoAEditar
                                        ? 'Guardar cambios'
                                        : 'Crear evento'}
                            </button>
                        </div>
                    </div>
                </form>

                {cargando && (
                    <div className="alert">
                        Cargando eventos...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!cargando && !error && eventos.length === 0 && (
                    <div className="alert">
                        No hay eventos registrados.
                    </div>
                )}

                {!cargando && !error && eventos.length > 0 && (
                    <div className="grid gap-4">
                        {eventos.map((evento) => (
                            <article
                                key={evento.id}
                                className="card bg-base-100 shadow"
                            >
                                <div className="card-body">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-base-content/60">
                                                {evento.junta_nombre}
                                            </p>

                                            <h2 className="card-title">
                                                {evento.titulo}
                                            </h2>
                                        </div>

                                        <span className="badge badge-outline">
                                            {evento.estado}
                                        </span>
                                    </div>

                                    <p className="whitespace-pre-wrap">
                                        {evento.descripcion}
                                    </p>

                                    <div className="text-sm space-y-1">
                                        <p>
                                            <strong>Lugar:</strong>{' '}
                                            {evento.lugar}
                                        </p>

                                        <p>
                                            <strong>Inicio:</strong>{' '}
                                            {new Date(
                                                evento.fecha_inicio
                                            ).toLocaleString()}
                                        </p>

                                        {evento.fecha_fin && (
                                            <p>
                                                <strong>Término:</strong>{' '}
                                                {new Date(
                                                    evento.fecha_fin
                                                ).toLocaleString()}
                                            </p>
                                        )}

                                        <p>
                                            <strong>Cupo:</strong>{' '}
                                            {evento.cupo_maximo ?? 'Sin límite'}
                                        </p>

                                        <p>
                                            <strong>Creado por:</strong>{' '}
                                            {evento.creador_username}
                                        </p>
                                        {evento.estado === 'PROGRAMADO' && (
                                            <div className="card-actions justify-end mt-4">
                                                <Link
                                                    to={`/directiva/eventos/${evento.id}/asistencia`}
                                                    className="btn btn-primary"
                                                >
                                                    Registrar asistencia
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() => prepararEdicion(evento)}
                                                >
                                                    Editar evento
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-error btn-outline"
                                                    onClick={() => setEventoACancelar(evento)}
                                                >
                                                    Cancelar evento
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            {eventoACancelar && (
                <dialog
                    open
                    className="modal"
                >
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Confirmar cancelación
                        </h3>

                        <p className="py-4">
                            ¿Deseas cancelar el evento{' '}
                            <strong>{eventoACancelar.titulo}</strong>?
                        </p>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => setEventoACancelar(null)}
                            >
                                Volver
                            </button>

                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={() => {
                                    void cancelarEvento(eventoACancelar.id)
                                    setEventoACancelar(null)
                                }}
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </main>
    )
}

export default EventosPage