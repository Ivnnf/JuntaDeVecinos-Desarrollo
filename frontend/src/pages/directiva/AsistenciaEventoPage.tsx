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
    const { id } = useParams()

    const [inscripciones, setInscripciones] =
        useState<InscripcionEvento[]>([])

    const [asistencias, setAsistencias] =
        useState<AsistenciaEvento[]>([])

    const [cargandoInscripciones, setCargandoInscripciones] =
        useState(true)

    const [cargandoAsistencias, setCargandoAsistencias] =
        useState(true)

    const [procesandoInscripcionId, setProcesandoInscripcionId] =
        useState<number | null>(null)

    const [error, setError] =
        useState('')

    const cargando =
        cargandoInscripciones || cargandoAsistencias

    useEffect(() => {
        const cargarInscripciones = async () => {
            if (!id) {
                setCargandoInscripciones(false)
                return
            }

            try {
                setCargandoInscripciones(true)
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
                setCargandoInscripciones(false)
            }
        }

        void cargarInscripciones()
    }, [id])

    useEffect(() => {
        const cargarAsistencias = async () => {
            if (!id) {
                setCargandoAsistencias(false)
                return
            }

            try {
                setCargandoAsistencias(true)

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
            } finally {
                setCargandoAsistencias(false)
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
            setProcesandoInscripcionId(inscripcionId)

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
        } finally {
            setProcesandoInscripcionId(null)
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
        inscripcionId: number,
        estado: 'PRESENTE' | 'AUSENTE'
    ) => {
        try {
            setError('')
            setProcesandoInscripcionId(inscripcionId)

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
        } finally {
            setProcesandoInscripcionId(null)
        }
    }

    const inscritosActivos =
        inscripciones.filter(
            (inscripcion) =>
                inscripcion.estado === 'INSCRITO'
        )

    const presentes =
        asistencias.filter(
            (asistencia) =>
                asistencia.estado === 'PRESENTE'
        ).length

    const ausentes =
        asistencias.filter(
            (asistencia) =>
                asistencia.estado === 'AUSENTE'
        ).length

    const pendientes =
        inscritosActivos.filter(
            (inscripcion) =>
                !obtenerAsistencia(inscripcion.id)
        ).length

    const tituloEvento =
        inscripciones[0]?.evento_titulo ?? 'Evento seleccionado'

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Registro de Asistencia
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Evento #{id}
                                </span>
                            </div>

                            <p className="text-base-content/70">
                                Registra y administra la asistencia de los
                                vecinos inscritos en la actividad.
                            </p>
                        </div>

                        <Link
                            to="/directiva/eventos"
                            className="btn btn-outline"
                        >
                            ← Volver a Eventos
                        </Link>
                    </div>
                </div>

                {/* Información del evento */}
                {!cargando && !error && inscripciones.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                                    Actividad
                                </p>

                                <h2 className="text-2xl font-bold">
                                    {tituloEvento}
                                </h2>

                                <p className="mt-2 text-sm text-base-content/60">
                                    Control de participantes y asistencia
                                    registrada.
                                </p>
                            </div>

                            <span className="badge badge-success badge-lg">
                                Registro habilitado
                            </span>
                        </div>
                    </div>
                )}

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando información de asistencia...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Resumen */}
                {!cargando && !error && inscripciones.length > 0 && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inscritos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {inscritosActivos.length}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Presentes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {presentes}
                                </span>

                                <span className="badge badge-success">
                                    Presente
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-red-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Ausentes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {ausentes}
                                </span>

                                <span className="badge badge-error">
                                    Ausente
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Pendientes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {pendientes}
                                </span>

                                <span className="badge badge-warning badge-outline">
                                    Sin registrar
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sin inscritos */}
                {!cargando &&
                    !error &&
                    inscripciones.length === 0 && (
                        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                            <div className="mx-auto max-w-md">
                                <h2 className="text-xl font-bold">
                                    No hay vecinos inscritos
                                </h2>

                                <p className="mt-2 text-base-content/60">
                                    Todavía no existen participantes
                                    registrados para este evento.
                                </p>

                                <Link
                                    to="/directiva/eventos"
                                    className="btn btn-primary mt-6"
                                >
                                    Volver a Eventos
                                </Link>
                            </div>
                        </div>
                    )}

                {/* Tabla */}
                {!cargando &&
                    !error &&
                    inscripciones.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Vecinos inscritos
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Marca a cada participante como
                                            presente o ausente.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline badge-lg">
                                        {inscripciones.length}{' '}
                                        {inscripciones.length === 1
                                            ? 'registro'
                                            : 'registros'}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[760px]">

                                    <thead className="bg-base-200/60">
                                        <tr>
                                            <th className="pl-6">
                                                Vecino
                                            </th>

                                            <th>
                                                Estado inscripción
                                            </th>

                                            <th>
                                                Asistencia
                                            </th>

                                            <th className="pr-6 text-right">
                                                Acción
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {inscripciones.map(
                                            (inscripcion) => {
                                                const asistencia =
                                                    obtenerAsistencia(
                                                        inscripcion.id
                                                    )

                                                const procesando =
                                                    procesandoInscripcionId ===
                                                    inscripcion.id

                                                const cancelada =
                                                    inscripcion.estado ===
                                                    'CANCELADA'

                                                return (
                                                    <tr
                                                        key={inscripcion.id}
                                                        className="transition-colors hover:bg-base-200/50"
                                                    >
                                                        <td className="pl-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                                    {inscripcion.usuario_username
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold">
                                                                        {
                                                                            inscripcion.usuario_username
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-base-content/50">
                                                                        Participante
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {cancelada ? (
                                                                <span className="badge badge-ghost">
                                                                    Cancelada
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-success badge-outline">
                                                                    Inscrito
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td>
                                                            {cancelada ? (
                                                                <span className="text-sm text-base-content/40">
                                                                    No aplica
                                                                </span>
                                                            ) : asistencia ? (
                                                                asistencia.estado ===
                                                                'PRESENTE' ? (
                                                                    <span className="badge badge-success">
                                                                        Presente
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge badge-error">
                                                                        Ausente
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="badge badge-warning badge-outline">
                                                                    Pendiente
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="pr-6">
                                                            <div className="flex justify-end">
                                                                {cancelada ? (
                                                                    <span className="text-sm text-base-content/40">
                                                                        Sin acciones
                                                                    </span>
                                                                ) : asistencia ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            procesando
                                                                        }
                                                                        className="btn btn-sm btn-outline"
                                                                        onClick={() => {
                                                                            void actualizarAsistencia(
                                                                                asistencia.id,
                                                                                inscripcion.id,
                                                                                asistencia.estado ===
                                                                                    'PRESENTE'
                                                                                    ? 'AUSENTE'
                                                                                    : 'PRESENTE'
                                                                            )
                                                                        }}
                                                                    >
                                                                        {procesando && (
                                                                            <span className="loading loading-spinner loading-xs" />
                                                                        )}

                                                                        {asistencia.estado ===
                                                                        'PRESENTE'
                                                                            ? 'Marcar Ausente'
                                                                            : 'Marcar Presente'}
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                procesando
                                                                            }
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => {
                                                                                void registrarAsistencia(
                                                                                    inscripcion.id,
                                                                                    'PRESENTE'
                                                                                )
                                                                            }}
                                                                        >
                                                                            {procesando && (
                                                                                <span className="loading loading-spinner loading-xs" />
                                                                            )}

                                                                            Presente
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                procesando
                                                                            }
                                                                            className="btn btn-sm btn-outline btn-error"
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
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </section>
        </main>
    )
}

export default AsistenciaEventoPage