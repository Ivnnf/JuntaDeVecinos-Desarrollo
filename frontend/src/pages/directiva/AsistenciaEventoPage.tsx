import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type InscripcionEvento = {
    id: number
    evento: number
    evento_titulo: string
    usuario: number
    usuario_username: string
    estado: 'INSCRITO' | 'CANCELADA'
    fecha_inscripcion: string
    fecha_cancelacion: string | null
}

type AsistenciaEvento = {
    id: number
    inscripcion: number
    usuario_username: string
    evento_titulo: string
    estado: 'PRESENTE' | 'AUSENTE'
    registrado_por: number
    registrado_por_username: string
    fecha_registro: string
    fecha_actualizacion: string
}

function AsistenciaEventoPage() {

    const [asistencias, setAsistencias] =
        useState<AsistenciaEvento[]>([])

    const { id } = useParams()

    const [inscripciones, setInscripciones] =
        useState<InscripcionEvento[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')
    useEffect(() => {
        const cargarInscripciones = async () => {
            if (!id) {
                return
            }

            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    `http://localhost:8000/api/eventos/eventos/${id}/inscripciones/`,
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los vecinos inscritos.'
                    )
                }

                const data =
                    (await response.json()) as InscripcionEvento[]

                setInscripciones(data)
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

        void cargarInscripciones()
    }, [id])

    useEffect(() => {
        const cargarAsistencias = async () => {
            if (!id) {
                return
            }

            try {
                const response = await fetch(
                    `http://localhost:8000/api/eventos/eventos/${id}/asistencias/`,
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar las asistencias.'
                    )
                }

                const data =
                    (await response.json()) as AsistenciaEvento[]

                setAsistencias(data)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.'
                )
            }
        }

        void cargarAsistencias()
    }, [id])

    const registrarAsistencia = async (
        inscripcionId: number,
        estado: 'PRESENTE' | 'AUSENTE'
    ) => {
        if (!id) {
            return
        }

        try {
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/eventos/eventos/${id}/asistencias/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inscripcion: inscripcionId,
                        estado,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.inscripcion?.[0] ||
                    data.detail ||
                    'No fue posible registrar la asistencia.'
                )
            }

            const nuevaAsistencia =
                data as AsistenciaEvento

            setAsistencias((actuales) => [
                ...actuales,
                nuevaAsistencia,
            ])
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        }
    }

    const obtenerAsistencia = (
        inscripcionId: number
    ) => {
        return asistencias.find(
            (asistencia) =>
                asistencia.inscripcion === inscripcionId
        )
    }

    const actualizarAsistencia = async (
        asistenciaId: number,
        estado: 'PRESENTE' | 'AUSENTE'
    ) => {
        try {
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/eventos/asistencias/${asistenciaId}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible corregir la asistencia.'
                )
            }

            const asistenciaActualizada =
                data as AsistenciaEvento

            setAsistencias((actuales) =>
                actuales.map((asistencia) =>
                    asistencia.id === asistenciaActualizada.id
                        ? asistenciaActualizada
                        : asistencia
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
                            Registro de Asistencia
                        </h1>

                        <p className="text-base-content/70 mt-1">
                            Evento seleccionado: {id}
                        </p>
                    </div>

                    <Link
                        to="/directiva/eventos"
                        className="btn btn-outline"
                    >
                        Volver a Eventos
                    </Link>
                </div>
                {cargando && (
                    <div className="alert">
                        Cargando vecinos inscritos...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!cargando && !error && inscripciones.length === 0 && (
                    <div className="alert">
                        No hay vecinos inscritos en este evento.
                    </div>
                )}

                {!cargando && !error && inscripciones.length > 0 && (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">
                                Vecinos inscritos
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Vecino</th>
                                            <th>Estado inscripción</th>
                                            <th>Asistencia</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {inscripciones.map((inscripcion) => (
                                            <tr key={inscripcion.id}>
                                                <td>
                                                    {inscripcion.usuario_username}
                                                </td>

                                                <td>
                                                    <span className="badge badge-success">
                                                        Inscrito
                                                    </span>
                                                </td>

                                                <td>
                                                    {(() => {
                                                        const asistencia = obtenerAsistencia(
                                                            inscripcion.id
                                                        )

                                                        if (asistencia) {
                                                            return (
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className={
                                                                            asistencia.estado === 'PRESENTE'
                                                                                ? 'badge badge-success'
                                                                                : 'badge badge-error'
                                                                        }
                                                                    >
                                                                        {asistencia.estado === 'PRESENTE'
                                                                            ? 'Presente'
                                                                            : 'Ausente'}
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-outline"
                                                                        onClick={() => {
                                                                            void actualizarAsistencia(
                                                                                asistencia.id,
                                                                                asistencia.estado === 'PRESENTE'
                                                                                    ? 'AUSENTE'
                                                                                    : 'PRESENTE'
                                                                            )
                                                                        }}
                                                                    >
                                                                        {asistencia.estado === 'PRESENTE'
                                                                            ? 'Cambiar a Ausente'
                                                                            : 'Cambiar a Presente'}
                                                                    </button>
                                                                </div>
                                                            )
                                                        }

                                                        return (
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => {
                                                                        void registrarAsistencia(
                                                                            inscripcion.id,
                                                                            'PRESENTE'
                                                                        )
                                                                    }}
                                                                >
                                                                    Presente
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-error btn-outline"
                                                                    onClick={() => {
                                                                        void registrarAsistencia(
                                                                            inscripcion.id,
                                                                            'AUSENTE'
                                                                        )
                                                                    }}
                                                                >
                                                                    Ausente
                                                                </button>
                                                            </div>
                                                        )
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}

export default AsistenciaEventoPage