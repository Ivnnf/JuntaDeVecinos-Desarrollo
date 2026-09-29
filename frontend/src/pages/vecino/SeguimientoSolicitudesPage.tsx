import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type HistorialSolicitud = {
    id: number
    estado_anterior: string | null
    estado_nuevo: string
    usuario_responsable: string
    comentario_respuesta: string
    fecha_cambio: string
}

type ArchivoSolicitud = {
    id: number
    nombre_original: string
    tipo_uso: string
    fecha_subida: string
}

type SolicitudSeguimiento = {
    id: number
    origen: 'VECINAL' | 'DOCUMENTO'
    numero_seguimiento: string
    tipo: string
    titulo: string
    fecha_ingreso: string
    estado_actual: string
    tiene_novedades: boolean
    respuesta_final: string
    fecha_respuesta: string | null
    historial: HistorialSolicitud[]
    archivos: ArchivoSolicitud[]
}

function SeguimientoSolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<SolicitudSeguimiento[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [solicitudExpandida, setSolicitudExpandida] =
        useState<string | null>(null)

    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/solicitudes/seguimiento/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No se pudo cargar el seguimiento de solicitudes.',
                    )
                }

                const data: SolicitudSeguimiento[] = await response.json()

                setSolicitudes(data)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error al cargar las solicitudes.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarSolicitudes()
    }, [])

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) {
            return 'Sin fecha'
        }

        return new Date(fecha).toLocaleString(
            'es-CL',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            },
        )
    }
    const alternarDetalle = async (
        solicitud: SolicitudSeguimiento,
    ) => {
        const claveSolicitud =
            `${solicitud.origen}-${solicitud.id}`

        const estaExpandida =
            solicitudExpandida === claveSolicitud

        if (estaExpandida) {
            setSolicitudExpandida(null)
            return
        }

        setSolicitudExpandida(claveSolicitud)

        if (!solicitud.tiene_novedades) {
            return
        }

        const tipoRuta =
            solicitud.origen === 'VECINAL'
                ? 'vecinal'
                : 'documento'

        try {
            const response = await fetch(
                `http://localhost:8000/api/solicitudes/seguimiento/${tipoRuta}/${solicitud.id}/revisar/`,
                {
                    method: 'POST',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                throw new Error(
                    'No se pudo marcar la solicitud como revisada.',
                )
            }

            setSolicitudes((actuales) =>
                actuales.map((item) =>
                    item.id === solicitud.id &&
                        item.origen === solicitud.origen
                        ? {
                            ...item,
                            tiene_novedades: false,
                        }
                        : item,
                ),
            )
        } catch (error) {
            console.error(error)
        }
    }
    const descargarArchivo = async (
        archivo: ArchivoSolicitud,
    ) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/solicitudes/documentos/archivos/${archivo.id}/descargar/`,
                {
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                throw new Error(
                    'No se pudo descargar el archivo.',
                )
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            const enlace = document.createElement('a')

            enlace.href = url
            enlace.download = archivo.nombre_original

            document.body.appendChild(enlace)
            enlace.click()
            enlace.remove()

            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error(error)
        }
    }
    const claseEstado = (estado: string) => {


        const estadoNormalizado = estado.toUpperCase()

        if (
            estadoNormalizado.includes('APROB') ||
            estadoNormalizado.includes('RESPOND') ||
            estadoNormalizado.includes('CERRAD') ||
            estadoNormalizado.includes('FINALIZ')
        ) {
            return 'badge badge-success badge-outline'
        }

        if (
            estadoNormalizado.includes('RECHAZ') ||
            estadoNormalizado.includes('CANCEL')
        ) {
            return 'badge badge-error badge-outline'
        }

        if (
            estadoNormalizado.includes('PROCESO') ||
            estadoNormalizado.includes('REVISION') ||
            estadoNormalizado.includes('REVISIÓN')
        ) {
            return 'badge badge-info badge-outline'
        }

        if (estadoNormalizado.includes('PENDIENTE')) {
            return 'badge badge-warning badge-outline'
        }

        return 'badge badge-primary badge-outline'
    }

    const solicitudesConNovedades =
        solicitudes.filter(
            (solicitud) => solicitud.tiene_novedades,
        ).length

    const solicitudesVecinales =
        solicitudes.filter(
            (solicitud) => solicitud.origen === 'VECINAL',
        ).length

    const solicitudesDocumento =
        solicitudes.filter(
            (solicitud) => solicitud.origen === 'DOCUMENTO',
        ).length

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Seguimiento de Solicitudes
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Revisa en un solo lugar el estado, las respuestas y el
                                historial de tus solicitudes vecinales y de documentos.
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

                {!cargando && !error && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total solicitudes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {solicitudes.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registradas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Con novedades
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {solicitudesConNovedades}
                                </span>

                                <span
                                    className={
                                        solicitudesConNovedades > 0
                                            ? 'badge badge-warning'
                                            : 'badge badge-ghost'
                                    }
                                >
                                    {solicitudesConNovedades > 0
                                        ? 'Nuevas'
                                        : 'Al día'}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Solicitudes vecinales
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {solicitudesVecinales}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Vecinales
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Documentos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {solicitudesDocumento}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Documentos
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando seguimiento de solicitudes...
                        </p>
                    </div>
                )}

                {!cargando && error && (
                    <div className="alert alert-error shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {!cargando && !error && solicitudes.length === 0 && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <div className="mx-auto max-w-md">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                S
                            </div>

                            <h2 className="text-xl font-bold">
                                Aún no tienes solicitudes
                            </h2>

                            <p className="mt-2 text-base-content/60">
                                Tus consultas, reclamos y solicitudes de documentos aparecerán
                                aquí cuando realices una gestión.
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Link
                                    to="/vecino/solicitudes"
                                    className="btn btn-primary"
                                >
                                    Ir a Solicitudes
                                </Link>

                                <Link
                                    to="/vecino/documentos"
                                    className="btn btn-outline"
                                >
                                    Solicitar Documento
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {!cargando && !error && solicitudes.length > 0 && (
                    <>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Mis solicitudes
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Selecciona una solicitud para revisar su información completa.
                                </p>
                            </div>

                            <span className="badge badge-outline badge-lg">
                                {solicitudes.length}{' '}
                                {solicitudes.length === 1
                                    ? 'solicitud'
                                    : 'solicitudes'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {solicitudes.map((solicitud) => {
                                const claveSolicitud =
                                    `${solicitud.origen}-${solicitud.id}`

                                const expandida =
                                    solicitudExpandida === claveSolicitud

                                return (
                                    <article
                                        key={claveSolicitud}
                                        className={`overflow-hidden rounded-2xl border bg-base-100 shadow-sm transition-all ${solicitud.tiene_novedades
                                            ? 'border-amber-500/40'
                                            : 'border-base-300'
                                            }`}
                                    >
                                        <div className="p-5 sm:p-6">
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-sm font-semibold text-primary">
                                                            {solicitud.numero_seguimiento}
                                                        </span>

                                                        <span
                                                            className={
                                                                solicitud.origen === 'VECINAL'
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-info badge-outline'
                                                            }
                                                        >
                                                            {solicitud.origen === 'VECINAL'
                                                                ? 'Solicitud vecinal'
                                                                : 'Documento'}
                                                        </span>

                                                        {solicitud.tiene_novedades && (
                                                            <span className="badge badge-warning">
                                                                Nueva actualización
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="mt-3 text-xl font-bold">
                                                        {solicitud.titulo}
                                                    </h3>

                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                        <div className="rounded-xl bg-base-200/60 p-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                                Tipo
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium">
                                                                {solicitud.tipo}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-base-200/60 p-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                                Fecha de ingreso
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium">
                                                                {formatearFecha(
                                                                    solicitud.fecha_ingreso,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-base-200/60 p-3 sm:col-span-2 xl:col-span-1">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                                Estado actual
                                                            </p>

                                                            <div className="mt-1">
                                                                <span className={claseEstado(solicitud.estado_actual)}>
                                                                    {solicitud.estado_actual}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => {
                                                            void alternarDetalle(solicitud)
                                                        }}
                                                    >
                                                        {expandida
                                                            ? 'Ocultar detalle'
                                                            : 'Ver detalle'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandida && (
                                            <div className="border-t border-base-300 bg-base-200/20 p-5 sm:p-6">
                                                <div className="grid gap-5 lg:grid-cols-2">
                                                    <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
                                                        <div className="mb-4 flex items-center justify-between gap-3">
                                                            <h4 className="text-lg font-bold">
                                                                Respuesta
                                                            </h4>

                                                            {solicitud.fecha_respuesta && (
                                                                <span className="text-xs text-base-content/45">
                                                                    {formatearFecha(
                                                                        solicitud.fecha_respuesta,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {solicitud.respuesta_final ? (
                                                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                                    {solicitud.respuesta_final}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                                <p className="text-sm text-base-content/60">
                                                                    Esta solicitud todavía no registra una
                                                                    respuesta final.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </section>

                                                    <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
                                                        <div className="mb-4 flex items-center justify-between gap-3">
                                                            <h4 className="text-lg font-bold">
                                                                Archivos
                                                            </h4>

                                                            <span className="badge badge-outline">
                                                                {solicitud.archivos.length}
                                                            </span>
                                                        </div>

                                                        {solicitud.archivos.length === 0 ? (
                                                            <p className="text-sm text-base-content/60">
                                                                No hay archivos asociados a esta solicitud.
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {solicitud.archivos.map((archivo) => (
                                                                    <div
                                                                        key={archivo.id}
                                                                        className="rounded-xl border border-base-300 bg-base-200/40 p-3"
                                                                    >
                                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                                            <div className="min-w-0">
                                                                                <p className="break-all text-sm font-semibold">
                                                                                    {archivo.nombre_original}
                                                                                </p>

                                                                                <p className="mt-1 text-xs text-base-content/50">
                                                                                    {formatearFecha(
                                                                                        archivo.fecha_subida,
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                <span className="badge badge-ghost badge-sm">
                                                                                    {archivo.tipo_uso}
                                                                                </span>

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-xs btn-outline"
                                                                                    onClick={() => {
                                                                                        void descargarArchivo(archivo)
                                                                                    }}
                                                                                >
                                                                                    Descargar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </section>

                                                    <section className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
                                                        <div className="mb-4 flex items-center justify-between gap-3">
                                                            <h4 className="text-lg font-bold">
                                                                Historial
                                                            </h4>

                                                            <span className="badge badge-outline">
                                                                {solicitud.historial.length}{' '}
                                                                {solicitud.historial.length === 1
                                                                    ? 'cambio'
                                                                    : 'cambios'}
                                                            </span>
                                                        </div>

                                                        {solicitud.historial.length === 0 ? (
                                                            <p className="text-sm text-base-content/60">
                                                                No existen cambios registrados todavía.
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {solicitud.historial.map(
                                                                    (historial, index) => (
                                                                        <div
                                                                            key={historial.id}
                                                                            className="flex gap-4"
                                                                        >
                                                                            <div className="flex flex-col items-center">
                                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                                                    {index + 1}
                                                                                </div>

                                                                                {index <
                                                                                    solicitud.historial.length - 1 && (
                                                                                        <div className="mt-2 h-full w-px bg-base-300" />
                                                                                    )}
                                                                            </div>

                                                                            <div className="min-w-0 flex-1 pb-4">
                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                    {historial.estado_anterior && (
                                                                                        <>
                                                                                            <span className="badge badge-ghost badge-sm">
                                                                                                {historial.estado_anterior}
                                                                                            </span>

                                                                                            <span className="text-xs text-base-content/40">
                                                                                                →
                                                                                            </span>
                                                                                        </>
                                                                                    )}

                                                                                    <span className={claseEstado(historial.estado_nuevo)}>
                                                                                        {historial.estado_nuevo}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
                                                                                    <span>
                                                                                        {formatearFecha(
                                                                                            historial.fecha_cambio,
                                                                                        )}
                                                                                    </span>

                                                                                    {historial.usuario_responsable && (
                                                                                        <span>
                                                                                            Responsable:{' '}
                                                                                            {historial.usuario_responsable}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {historial.comentario_respuesta && (
                                                                                    <p className="mt-3 whitespace-pre-wrap rounded-xl bg-base-200/60 p-3 text-sm leading-relaxed text-base-content/70">
                                                                                        {historial.comentario_respuesta}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </section>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}

export default SeguimientoSolicitudesPage
