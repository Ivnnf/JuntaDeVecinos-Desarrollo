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
        }
    }
    const cancelarInscripcion = async (
        eventoId: number,
        inscripcionId: number
    ) => {
        try {
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
        }
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Actividades y Eventos
                        </h1>

                        <p className="text-base-content/70 mt-1">
                            Consulta las actividades programadas de tu Junta de Vecinos.
                        </p>
                    </div>

                    <Link
                        to="/vecino"
                        className="btn btn-outline"
                    >
                        Volver al Panel
                    </Link>

                </div>
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
                        No hay actividades o eventos programados.
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

                                        <span className="badge badge-success">
                                            Programado
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
                                            <strong>Inscritos:</strong>{' '}
                                            {evento.inscritos_actuales}
                                            {evento.cupo_maximo !== null
                                                ? ` de ${evento.cupo_maximo}`
                                                : ' (sin límite)'}
                                        </p>
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        {evento.inscrito ? (
                                            <button
                                                type="button"
                                                className="btn btn-error btn-outline"
                                                disabled={!evento.inscripcion_id}
                                                onClick={() => {
                                                    if (evento.inscripcion_id) {
                                                        void cancelarInscripcion(
                                                            evento.id,
                                                            evento.inscripcion_id
                                                        )
                                                    }
                                                }}
                                            >
                                                Cancelar inscripción
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={
                                                    evento.cupo_maximo !== null &&
                                                    evento.inscritos_actuales >= evento.cupo_maximo
                                                }
                                                onClick={() => {
                                                    void inscribirseEvento(evento.id)
                                                }}
                                            >
                                                {evento.cupo_maximo !== null &&
                                                    evento.inscritos_actuales >= evento.cupo_maximo
                                                    ? 'Sin cupos'
                                                    : 'Inscribirse'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default EventosVecinoPage