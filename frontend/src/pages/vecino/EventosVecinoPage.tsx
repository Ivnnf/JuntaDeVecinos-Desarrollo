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
    inscrito: boolean
    inscripcion_id: number | null
    inscritos_actuales: number
}

function EventosVecinoPage() {
    const [eventos, setEventos] =
        useState<Evento[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [procesandoEventoId, setProcesandoEventoId] =
        useState<number | null>(null)

    useEffect(() => {
        const cargarEventos = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/eventos/vecino/eventos/',
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

    const inscribirseEvento = async (
        eventoId: number
    ) => {
        try {
            setProcesandoEventoId(eventoId)
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/eventos/inscripciones/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        evento: eventoId,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.evento?.[0] ||
                    data.detail ||
                    'No fue posible realizar la inscripción.'
                )
            }

            setEventos((actuales) =>
                actuales.map((evento) =>
                    evento.id === eventoId
                        ? {
                            ...evento,
                            inscrito: true,
                            inscripcion_id: data.id,
                            inscritos_actuales:
                                evento.inscritos_actuales + 1,
                        }
                        : evento
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setProcesandoEventoId(null)
        }
    }

    const cancelarInscripcion = async (
        eventoId: number,
        inscripcionId: number
    ) => {
        try {
            setProcesandoEventoId(eventoId)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/eventos/inscripciones/${inscripcionId}/cancelar/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.estado?.[0] ||
                    data.detail ||
                    'No fue posible cancelar la inscripción.'
                )
            }

            setEventos((actuales) =>
                actuales.map((evento) =>
                    evento.id === eventoId
                        ? {
                            ...evento,
                            inscrito: false,
                            inscripcion_id: null,
                            inscritos_actuales: Math.max(
                                0,
                                evento.inscritos_actuales - 1
                            ),
                        }
                        : evento
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setProcesandoEventoId(null)
        }
    }

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString(
            'es-CL',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            }
        )
    }

    const nombreEstado = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'Programado'
            case 'CANCELADO':
                return 'Cancelado'
            case 'FINALIZADO':
                return 'Finalizado'
            default:
                return estado
        }
    }

    const claseEstado = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'badge badge-success badge-outline'
            case 'CANCELADO':
                return 'badge badge-error badge-outline'
            case 'FINALIZADO':
                return 'badge badge-ghost'
            default:
                return 'badge badge-outline'
        }
    }

    const bordeEstado = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'border-emerald-500/30'
            case 'CANCELADO':
                return 'border-red-500/30'
            case 'FINALIZADO':
                return 'border-base-300'
            default:
                return 'border-base-300'
        }
    }

    const disponibles =
        eventos.filter(
            (evento) =>
                evento.estado === 'PROGRAMADO'
        ).length

    const inscritos =
        eventos.filter(
            (evento) =>
                evento.inscrito
        ).length

    const conCupos =
        eventos.filter(
            (evento) =>
                evento.estado === 'PROGRAMADO' &&
                (
                    evento.cupo_maximo === null ||
                    evento.inscritos_actuales < evento.cupo_maximo
                )
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
                                    Actividades y Eventos
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Consulta las actividades programadas por tu
                                Junta de Vecinos y administra tus inscripciones.
                            </p>
                        </div>

                        <Link
                            to="/vecino"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Eventos programados
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {disponibles}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Disponibles
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Mis inscripciones
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {inscritos}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Inscrito
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                            <p className="text-sm font-medium text-base-content/60">
                                Con cupos disponibles
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {conCupos}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Con cupo
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando actividades y eventos...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {!cargando && !error && (
                    <div>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Eventos disponibles
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa los detalles y confirma tu
                                    participación.
                                </p>
                            </div>

                            {eventos.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {eventos.length}{' '}
                                    {eventos.length === 1
                                        ? 'evento'
                                        : 'eventos'}
                                </span>
                            )}
                        </div>

                        {eventos.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-700">
                                        E
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No hay eventos programados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Cuando la directiva publique nuevas
                                        actividades aparecerán en esta sección.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-5 lg:grid-cols-2">
                                {eventos.map((evento) => {
                                    const sinCupos =
                                        evento.cupo_maximo !== null &&
                                        evento.inscritos_actuales >=
                                        evento.cupo_maximo

                                    const procesando =
                                        procesandoEventoId === evento.id

                                    return (
                                        <article
                                            key={evento.id}
                                            className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bordeEstado(
                                                evento.estado
                                            )}`}
                                        >
                                            <div className="flex-1 p-6">

                                                {/* Cabecera */}
                                                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                                                            {evento.junta_nombre}
                                                        </p>

                                                        <h3 className="text-xl font-bold leading-snug">
                                                            {evento.titulo}
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <span
                                                            className={claseEstado(
                                                                evento.estado
                                                            )}
                                                        >
                                                            {nombreEstado(
                                                                evento.estado
                                                            )}
                                                        </span>

                                                        {evento.inscrito && (
                                                            <span className="badge badge-primary">
                                                                Inscrito
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Descripción */}
                                                <p className="mb-5 whitespace-pre-wrap leading-relaxed text-base-content/70">
                                                    {evento.descripcion}
                                                </p>

                                                {/* Datos */}
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl bg-base-200/60 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                            Lugar
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {evento.lugar}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl bg-base-200/60 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                            Cupos
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {evento.cupo_maximo !== null
                                                                ? `${evento.inscritos_actuales} de ${evento.cupo_maximo}`
                                                                : `${evento.inscritos_actuales} inscritos · Sin límite`}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl bg-base-200/60 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                            Inicio
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium">
                                                            {formatearFecha(
                                                                evento.fecha_inicio
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl bg-base-200/60 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                            Término
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium">
                                                            {evento.fecha_fin
                                                                ? formatearFecha(
                                                                    evento.fecha_fin
                                                                )
                                                                : 'Sin definir'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Estado cupo */}
                                                {evento.estado === 'PROGRAMADO' && (
                                                    <div className="mt-5">
                                                        {sinCupos && !evento.inscrito ? (
                                                            <div className="alert alert-warning">
                                                                <span>
                                                                    Este evento ya no tiene cupos disponibles.
                                                                </span>
                                                            </div>
                                                        ) : evento.inscrito ? (
                                                            <div className="alert alert-success">
                                                                <span>
                                                                    Ya estás inscrito en esta actividad.
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                                                <p className="text-sm text-base-content/70">
                                                                    Hay cupos disponibles para esta actividad.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            {evento.estado === 'PROGRAMADO' && (
                                                <div className="border-t border-base-300 p-4">
                                                    <div className="flex justify-end">
                                                        {evento.inscrito ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-error btn-outline"
                                                                disabled={
                                                                    !evento.inscripcion_id ||
                                                                    procesando
                                                                }
                                                                onClick={() => {
                                                                    if (evento.inscripcion_id) {
                                                                        void cancelarInscripcion(
                                                                            evento.id,
                                                                            evento.inscripcion_id
                                                                        )
                                                                    }
                                                                }}
                                                            >
                                                                {procesando && (
                                                                    <span className="loading loading-spinner loading-xs" />
                                                                )}

                                                                {procesando
                                                                    ? 'Cancelando...'
                                                                    : 'Cancelar inscripción'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-primary"
                                                                disabled={
                                                                    sinCupos ||
                                                                    procesando
                                                                }
                                                                onClick={() => {
                                                                    void inscribirseEvento(
                                                                        evento.id
                                                                    )
                                                                }}
                                                            >
                                                                {procesando && (
                                                                    <span className="loading loading-spinner loading-xs" />
                                                                )}

                                                                {procesando
                                                                    ? 'Inscribiendo...'
                                                                    : sinCupos
                                                                        ? 'Sin cupos'
                                                                        : 'Inscribirse'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default EventosVecinoPage
