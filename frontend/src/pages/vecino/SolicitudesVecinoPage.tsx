import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type SolicitudVecino = {
    id: number
    vecino: number
    vecino_username: string
    junta_vecinos: number
    junta_nombre: string
    tipo: 'CONSULTA' | 'RECLAMO' | 'SOLICITUD'
    asunto: string
    descripcion: string
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESPONDIDA' | 'CERRADA'
    respuesta: string
    respondido_por: number | null
    respondido_por_username: string | null
    fecha_respuesta: string | null
    fecha_creacion: string
    fecha_actualizacion: string
}

function SolicitudesVecinoPage() {
    const [solicitudes, setSolicitudes] =
        useState<SolicitudVecino[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [tipo, setTipo] =
        useState<'CONSULTA' | 'RECLAMO' | 'SOLICITUD'>('CONSULTA')

    const [asunto, setAsunto] =
        useState('')

    const [descripcion, setDescripcion] =
        useState('')

    const [enviando, setEnviando] =
        useState(false)

    const [mensaje, setMensaje] =
        useState('')

    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/solicitudes/solicitudes/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar tus solicitudes.'
                    )
                }

                const data =
                    (await response.json()) as SolicitudVecino[]

                setSolicitudes(data)
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

        void cargarSolicitudes()
    }, [])

    const crearSolicitud = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        try {
            setEnviando(true)
            setMensaje('')
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/solicitudes/solicitudes/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tipo,
                        asunto,
                        descripcion,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible enviar la solicitud.'
                )
            }

            const nuevaSolicitud =
                data as SolicitudVecino

            setSolicitudes((actuales) => [
                nuevaSolicitud,
                ...actuales,
            ])

            setTipo('CONSULTA')
            setAsunto('')
            setDescripcion('')

            setMensaje(
                'Solicitud enviada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setEnviando(false)
        }
    }

    const nombreTipo = (
        tipoSolicitud: SolicitudVecino['tipo']
    ) => {
        switch (tipoSolicitud) {
            case 'CONSULTA':
                return 'Consulta'
            case 'RECLAMO':
                return 'Reclamo'
            case 'SOLICITUD':
                return 'Solicitud'
            default:
                return tipoSolicitud
        }
    }

    const nombreEstado = (
        estado: SolicitudVecino['estado']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'Pendiente'
            case 'EN_PROCESO':
                return 'En proceso'
            case 'RESPONDIDA':
                return 'Respondida'
            case 'CERRADA':
                return 'Cerrada'
            default:
                return estado
        }
    }

    const claseTipo = (
        tipoSolicitud: SolicitudVecino['tipo']
    ) => {
        switch (tipoSolicitud) {
            case 'CONSULTA':
                return 'badge badge-info badge-outline'
            case 'RECLAMO':
                return 'badge badge-error badge-outline'
            case 'SOLICITUD':
                return 'badge badge-primary badge-outline'
            default:
                return 'badge badge-outline'
        }
    }

    const claseEstado = (
        estado: SolicitudVecino['estado']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'badge badge-warning badge-outline'
            case 'EN_PROCESO':
                return 'badge badge-info badge-outline'
            case 'RESPONDIDA':
                return 'badge badge-success'
            case 'CERRADA':
                return 'badge badge-ghost'
            default:
                return 'badge badge-outline'
        }
    }

    const bordeTipo = (
        tipoSolicitud: SolicitudVecino['tipo']
    ) => {
        switch (tipoSolicitud) {
            case 'CONSULTA':
                return 'border-blue-500/30'
            case 'RECLAMO':
                return 'border-red-500/30'
            case 'SOLICITUD':
                return 'border-indigo-500/30'
            default:
                return 'border-base-300'
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

    const pendientes =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado === 'PENDIENTE'
        ).length

    const enProceso =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado === 'EN_PROCESO'
        ).length

    const respondidas =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado === 'RESPONDIDA'
        ).length

    const cerradas =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado === 'CERRADA'
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
                                    Consultas, Reclamos y Solicitudes
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Envía nuevas solicitudes a tu Junta de Vecinos
                                y revisa el estado de las gestiones que ya has
                                realizado.
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
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Pendientes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {pendientes}
                                </span>

                                <span className="badge badge-warning badge-outline">
                                    Pendientes
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                En proceso
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {enProceso}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Gestionando
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Respondidas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {respondidas}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Respondidas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Cerradas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cerradas}
                                </span>

                                <span className="badge badge-ghost">
                                    Finalizadas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form
                    onSubmit={crearSolicitud}
                    className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Nueva solicitud
                                    </h2>

                                    <span className="badge badge-primary badge-outline">
                                        Nuevo
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Completa los datos para enviar una nueva
                                    gestión a la directiva.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">

                        {mensaje && (
                            <div className="alert alert-success mb-6">
                                <span>{mensaje}</span>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error mb-6">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Tipo
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered w-full"
                                    value={tipo}
                                    onChange={(e) =>
                                        setTipo(
                                            e.target.value as
                                                | 'CONSULTA'
                                                | 'RECLAMO'
                                                | 'SOLICITUD'
                                        )
                                    }
                                >
                                    <option value="CONSULTA">
                                        Consulta
                                    </option>

                                    <option value="RECLAMO">
                                        Reclamo
                                    </option>

                                    <option value="SOLICITUD">
                                        Solicitud
                                    </option>
                                </select>

                                <span className="mt-2 text-xs text-base-content/50">
                                    Selecciona la categoría que mejor represente
                                    tu gestión.
                                </span>
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Asunto
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={asunto}
                                    onChange={(e) =>
                                        setAsunto(e.target.value)
                                    }
                                    maxLength={200}
                                    placeholder="Ej: Consulta sobre actividad comunitaria"
                                    required
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {asunto.length}/200
                                    </span>
                                </div>
                            </label>

                            <label className="form-control md:col-span-2">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Descripción
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-36 w-full resize-y"
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    placeholder="Explica tu consulta, reclamo o solicitud con el mayor detalle posible..."
                                    required
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {descripcion.length} caracteres
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={enviando}
                            >
                                {enviando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {enviando
                                    ? 'Enviando...'
                                    : 'Enviar solicitud'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando tus solicitudes...
                        </span>
                    </div>
                )}

                {/* Listado */}
                {!cargando && (
                    <div>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Mis solicitudes
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Consulta el estado y las respuestas de la
                                    directiva.
                                </p>
                            </div>

                            {solicitudes.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {solicitudes.length}{' '}
                                    {solicitudes.length === 1
                                        ? 'registro'
                                        : 'registros'}
                                </span>
                            )}
                        </div>

                        {solicitudes.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                        +
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        Aún no tienes solicitudes
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Cuando envíes una consulta, reclamo o
                                        solicitud podrás revisar su avance en
                                        esta sección.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {solicitudes.map((solicitud) => (
                                    <article
                                        key={solicitud.id}
                                        className={`overflow-hidden rounded-2xl border bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md ${bordeTipo(
                                            solicitud.tipo
                                        )}`}
                                    >
                                        {/* Cabecera */}
                                        <div className="border-b border-base-300 p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-5">
                                                <div className="min-w-0 flex-1">

                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span className={claseTipo(
                                                            solicitud.tipo
                                                        )}>
                                                            {nombreTipo(
                                                                solicitud.tipo
                                                            )}
                                                        </span>

                                                        <span className={claseEstado(
                                                            solicitud.estado
                                                        )}>
                                                            {nombreEstado(
                                                                solicitud.estado
                                                            )}
                                                        </span>

                                                        <span className="badge badge-ghost">
                                                            #{solicitud.id}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl font-bold">
                                                        {solicitud.asunto}
                                                    </h3>

                                                    <p className="mt-2 text-sm text-base-content/60">
                                                        {solicitud.junta_nombre}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
                                                        Enviada
                                                    </p>

                                                    <p className="mt-1 text-sm text-base-content/60">
                                                        {formatearFecha(
                                                            solicitud.fecha_creacion
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">

                                            {/* Descripción */}
                                            <div>
                                                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                                                    Tu mensaje
                                                </p>

                                                <div className="rounded-xl bg-base-200/70 p-5">
                                                    <p className="whitespace-pre-wrap leading-relaxed">
                                                        {solicitud.descripcion}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Respuesta */}
                                            {solicitud.respuesta && (
                                                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <h4 className="font-bold">
                                                            Respuesta de la Directiva
                                                        </h4>

                                                        <span className="badge badge-success badge-outline">
                                                            Respondida
                                                        </span>
                                                    </div>

                                                    <p className="whitespace-pre-wrap leading-relaxed">
                                                        {solicitud.respuesta}
                                                    </p>

                                                    {solicitud.respondido_por_username && (
                                                        <div className="mt-4 border-t border-emerald-500/20 pt-4 text-sm text-base-content/60">
                                                            Respondido por{' '}
                                                            <strong className="font-semibold text-base-content/80">
                                                                {
                                                                    solicitud.respondido_por_username
                                                                }
                                                            </strong>

                                                            {solicitud.fecha_respuesta && (
                                                                <>
                                                                    {' '}
                                                                    el{' '}
                                                                    <span className="font-medium">
                                                                        {formatearFecha(
                                                                            solicitud.fecha_respuesta
                                                                        )}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Sin respuesta */}
                                            {!solicitud.respuesta &&
                                                solicitud.estado !== 'CERRADA' && (
                                                    <div className="mt-6 rounded-xl border border-base-300 bg-base-200/40 p-4">
                                                        <p className="text-sm text-base-content/60">
                                                            La directiva aún no ha
                                                            registrado una respuesta
                                                            para esta solicitud.
                                                        </p>
                                                    </div>
                                                )}

                                            {/* Pie */}
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-5">
                                                <span className="text-xs text-base-content/40">
                                                    Última actualización:{' '}
                                                    {formatearFecha(
                                                        solicitud.fecha_actualizacion
                                                    )}
                                                </span>

                                                <span className={claseEstado(
                                                    solicitud.estado
                                                )}>
                                                    {nombreEstado(
                                                        solicitud.estado
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default SolicitudesVecinoPage
