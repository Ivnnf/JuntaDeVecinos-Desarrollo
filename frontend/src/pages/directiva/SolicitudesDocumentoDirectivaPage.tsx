import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type HistorialSolicitudDocumento = {
    id: number
    estado_anterior: string | null
    estado_nuevo: string
    usuario_responsable: number
    usuario_responsable_username: string
    comentario_respuesta: string
    fecha_cambio: string
}

type ArchivoSolicitudDocumento = {
    id: number
    solicitud: number
    nombre_original: string
    tipo_uso: 'ADJUNTO' | 'DOCUMENTO_EMITIDO'
    subido_por: number
    subido_por_username: string
    fecha_subida: string
}

type SolicitudDocumento = {
    id: number
    numero_seguimiento: string
    tipo_documento: number
    tipo_documento_nombre: string
    vecino: number
    vecino_username: string
    junta_vecinos: number
    junta_nombre: string
    motivo: string
    estado_actual:
        | 'PENDIENTE'
        | 'EN_REVISION'
        | 'APROBADA'
        | 'RECHAZADA'
    responsable: number | null
    responsable_username: string | null
    fecha_solicitud: string
    fecha_resolucion: string | null
    historial: HistorialSolicitudDocumento[]
    archivos: ArchivoSolicitudDocumento[]
}

function SolicitudesDocumentoDirectivaPage() {
    const [archivosEmitidos, setArchivosEmitidos] =
        useState<Record<number, File | null>>({})

    const [subiendoArchivoId, setSubiendoArchivoId] =
        useState<number | null>(null)

    const [solicitudes, setSolicitudes] =
        useState<SolicitudDocumento[]>([])

    const [comentarios, setComentarios] =
        useState<Record<number, string>>({})

    const [cargando, setCargando] =
        useState(true)

    const [guardandoId, setGuardandoId] =
        useState<number | null>(null)

    const [error, setError] =
        useState('')

    const [mensaje, setMensaje] =
        useState('')

    const cargarSolicitudes = async () => {
        try {
            setCargando(true)
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/solicitudes/directiva/documentos/',
                {
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(
                    'No fue posible cargar las solicitudes de documentos.'
                )
            }

            const data =
                (await response.json()) as SolicitudDocumento[]

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

    useEffect(() => {
        void cargarSolicitudes()
    }, [])

    const actualizarEstado = (
        id: number,
        estado: SolicitudDocumento['estado_actual']
    ) => {
        setSolicitudes((actuales) =>
            actuales.map((solicitud) =>
                solicitud.id === id
                    ? {
                        ...solicitud,
                        estado_actual: estado,
                    }
                    : solicitud
            )
        )
    }

    const guardarSolicitud = async (
        solicitud: SolicitudDocumento
    ) => {
        try {
            setGuardandoId(solicitud.id)
            setError('')
            setMensaje('')

            const response = await fetch(
                `http://localhost:8000/api/solicitudes/directiva/documentos/${solicitud.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado_actual:
                            solicitud.estado_actual,
                        comentario_respuesta:
                            comentarios[solicitud.id] ?? '',
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.estado_actual?.[0] ||
                    'No fue posible guardar los cambios.'
                )
            }

            const solicitudActualizada =
                data as SolicitudDocumento

            setSolicitudes((actuales) =>
                actuales.map((item) =>
                    item.id === solicitudActualizada.id
                        ? solicitudActualizada
                        : item
                )
            )

            setComentarios((actuales) => ({
                ...actuales,
                [solicitud.id]: '',
            }))

            setMensaje(
                `Solicitud ${solicitud.numero_seguimiento} actualizada correctamente.`
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error al guardar la solicitud.'
            )
        } finally {
            setGuardandoId(null)
        }
    }

    const subirDocumentoEmitido = async (
        solicitud: SolicitudDocumento
    ) => {
        const archivo =
            archivosEmitidos[solicitud.id]

        if (!archivo) {
            setError(
                'Debes seleccionar un archivo antes de subirlo.'
            )
            return
        }

        try {
            setSubiendoArchivoId(solicitud.id)
            setError('')
            setMensaje('')

            const formData = new FormData()

            formData.append(
                'archivo',
                archivo
            )

            const response = await fetch(
                `http://localhost:8000/api/solicitudes/directiva/documentos/${solicitud.id}/archivo-emitido/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                }
            )

            if (!response.ok) {
                const data = await response.json()

                throw new Error(
                    data.archivo?.[0] ||
                    data.detail ||
                    'No fue posible subir el documento emitido.'
                )
            }

            setArchivosEmitidos((actuales) => ({
                ...actuales,
                [solicitud.id]: null,
            }))

            await cargarSolicitudes()

            setMensaje(
                `Documento emitido para ${solicitud.numero_seguimiento} subido correctamente.`
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error al subir el documento.'
            )
        } finally {
            setSubiendoArchivoId(null)
        }
    }

    const descargarArchivo = async (
        archivo: ArchivoSolicitudDocumento
    ) => {
        try {
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/solicitudes/documentos/archivos/${archivo.id}/descargar/`,
                {
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(
                    'No fue posible descargar el archivo.'
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
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error al descargar el archivo.'
            )
        }
    }

    const nombreEstado = (
        estado: SolicitudDocumento['estado_actual']
    ) => {
        if (estado === 'PENDIENTE') {
            return 'Pendiente'
        }

        if (estado === 'EN_REVISION') {
            return 'En revisión'
        }

        if (estado === 'APROBADA') {
            return 'Aprobada'
        }

        return 'Rechazada'
    }

    const claseEstado = (
        estado: SolicitudDocumento['estado_actual']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'badge badge-warning badge-outline'
            case 'EN_REVISION':
                return 'badge badge-info badge-outline'
            case 'APROBADA':
                return 'badge badge-success'
            case 'RECHAZADA':
                return 'badge badge-error badge-outline'
            default:
                return 'badge badge-outline'
        }
    }

    const bordeEstado = (
        estado: SolicitudDocumento['estado_actual']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'border-amber-500/30'
            case 'EN_REVISION':
                return 'border-blue-500/30'
            case 'APROBADA':
                return 'border-emerald-500/30'
            case 'RECHAZADA':
                return 'border-red-500/30'
            default:
                return 'border-base-300'
        }
    }

    const nombreEstadoHistorial = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'Pendiente'
            case 'EN_REVISION':
                return 'En revisión'
            case 'APROBADA':
                return 'Aprobada'
            case 'RECHAZADA':
                return 'Rechazada'
            default:
                return estado
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
                solicitud.estado_actual === 'PENDIENTE'
        ).length

    const enRevision =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado_actual === 'EN_REVISION'
        ).length

    const aprobadas =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado_actual === 'APROBADA'
        ).length

    const rechazadas =
        solicitudes.filter(
            (solicitud) =>
                solicitud.estado_actual === 'RECHAZADA'
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
                                    Solicitudes de Documentos
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Gestión
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Revisa, gestiona y emite los documentos
                                solicitados por los vecinos de la junta.
                            </p>
                        </div>

                        <Link
                            to="/directiva"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Mensaje */}
                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />
                        <span>
                            Cargando solicitudes de documentos...
                        </span>
                    </div>
                )}

                {!cargando && (
                    <>
                        {/* Resumen */}
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
                                    En revisión
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {enRevision}
                                    </span>

                                    <span className="badge badge-info badge-outline">
                                        Revisando
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Aprobadas
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {aprobadas}
                                    </span>

                                    <span className="badge badge-success badge-outline">
                                        Aprobadas
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-red-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Rechazadas
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {rechazadas}
                                    </span>

                                    <span className="badge badge-error badge-outline">
                                        Rechazadas
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Título listado */}
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Solicitudes recibidas
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Administra el estado, los archivos y el
                                    historial de cada solicitud.
                                </p>
                            </div>

                            {solicitudes.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {solicitudes.length}{' '}
                                    {solicitudes.length === 1
                                        ? 'solicitud'
                                        : 'solicitudes'}
                                </span>
                            )}
                        </div>

                        {solicitudes.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                                        ✓
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No hay solicitudes de documentos
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Actualmente no existen solicitudes
                                        de documentos para gestionar.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {solicitudes.map((solicitud) => (
                                    <article
                                        key={solicitud.id}
                                        className={`overflow-hidden rounded-2xl border bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md ${bordeEstado(
                                            solicitud.estado_actual
                                        )}`}
                                    >
                                        {/* Cabecera */}
                                        <div className="border-b border-base-300 p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-5">
                                                <div className="min-w-0 flex-1">

                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span className={claseEstado(
                                                            solicitud.estado_actual
                                                        )}>
                                                            {nombreEstado(
                                                                solicitud.estado_actual
                                                            )}
                                                        </span>

                                                        <span className="badge badge-ghost font-mono">
                                                            {solicitud.numero_seguimiento}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl font-bold">
                                                        {solicitud.tipo_documento_nombre}
                                                    </h3>

                                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-base-content/60">
                                                        <span>
                                                            Vecino:{' '}
                                                            <strong className="font-semibold text-base-content/80">
                                                                {solicitud.vecino_username}
                                                            </strong>
                                                        </span>

                                                        <span>
                                                            Junta:{' '}
                                                            <strong className="font-semibold text-base-content/80">
                                                                {solicitud.junta_nombre}
                                                            </strong>
                                                        </span>

                                                        {solicitud.responsable_username && (
                                                            <span>
                                                                Responsable:{' '}
                                                                <strong className="font-semibold text-base-content/80">
                                                                    {solicitud.responsable_username}
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
                                                        Solicitada
                                                    </p>

                                                    <p className="mt-1 text-sm text-base-content/60">
                                                        {formatearFecha(
                                                            solicitud.fecha_solicitud
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">

                                            {/* Motivo */}
                                            <div className="mb-6">
                                                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                                                    Motivo de la solicitud
                                                </p>

                                                <div className="rounded-xl bg-base-200/70 p-5">
                                                    <p className="whitespace-pre-wrap leading-relaxed">
                                                        {solicitud.motivo}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Gestión */}
                                            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                                                <label className="form-control">
                                                    <div className="label">
                                                        <span className="label-text font-semibold">
                                                            Estado
                                                        </span>
                                                    </div>

                                                    <select
                                                        className="select select-bordered w-full"
                                                        value={
                                                            solicitud.estado_actual
                                                        }
                                                        onChange={(event) =>
                                                            actualizarEstado(
                                                                solicitud.id,
                                                                event.target.value as SolicitudDocumento['estado_actual']
                                                            )
                                                        }
                                                    >
                                                        <option value="PENDIENTE">
                                                            Pendiente
                                                        </option>

                                                        <option value="EN_REVISION">
                                                            En revisión
                                                        </option>

                                                        <option value="APROBADA">
                                                            Aprobada
                                                        </option>

                                                        <option value="RECHAZADA">
                                                            Rechazada
                                                        </option>
                                                    </select>

                                                    <span className="mt-2 text-xs text-base-content/50">
                                                        Actualiza el avance de
                                                        la solicitud.
                                                    </span>
                                                </label>

                                                <label className="form-control">
                                                    <div className="label">
                                                        <span className="label-text font-semibold">
                                                            Comentario para el vecino
                                                        </span>
                                                    </div>

                                                    <textarea
                                                        className="textarea textarea-bordered min-h-32 w-full resize-y"
                                                        placeholder="Escribe una observación o respuesta..."
                                                        value={
                                                            comentarios[
                                                                solicitud.id
                                                            ] ?? ''
                                                        }
                                                        onChange={(event) =>
                                                            setComentarios(
                                                                (actuales) => ({
                                                                    ...actuales,
                                                                    [solicitud.id]:
                                                                        event.target.value,
                                                                })
                                                            )
                                                        }
                                                    />

                                                    <div className="mt-2 flex justify-end">
                                                        <span className="text-xs text-base-content/40">
                                                            {(comentarios[
                                                                solicitud.id
                                                            ] ?? '').length}{' '}
                                                            caracteres
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Archivos */}
                                            {solicitud.archivos.length > 0 && (
                                                <div className="mt-6">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-bold">
                                                                Archivos
                                                            </h4>

                                                            <p className="mt-1 text-sm text-base-content/60">
                                                                Documentos adjuntos y emitidos asociados a esta solicitud.
                                                            </p>
                                                        </div>

                                                        <span className="badge badge-outline">
                                                            {solicitud.archivos.length}{' '}
                                                            {solicitud.archivos.length === 1
                                                                ? 'archivo'
                                                                : 'archivos'}
                                                        </span>
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {solicitud.archivos.map((archivo) => (
                                                            <div
                                                                key={archivo.id}
                                                                className="flex h-full flex-col justify-between gap-4 rounded-xl border border-base-300 bg-base-100 p-4"
                                                            >
                                                                <div>
                                                                    <div className="mb-2">
                                                                        <span
                                                                            className={
                                                                                archivo.tipo_uso === 'DOCUMENTO_EMITIDO'
                                                                                    ? 'badge badge-success badge-outline'
                                                                                    : 'badge badge-info badge-outline'
                                                                            }
                                                                        >
                                                                            {archivo.tipo_uso === 'DOCUMENTO_EMITIDO'
                                                                                ? 'Documento emitido'
                                                                                : 'Adjunto del vecino'}
                                                                        </span>
                                                                    </div>

                                                                    <p className="break-words font-semibold">
                                                                        {archivo.nombre_original}
                                                                    </p>

                                                                    <p className="mt-2 text-xs text-base-content/50">
                                                                        Subido por{' '}
                                                                        {archivo.subido_por_username}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-base-content/50">
                                                                        {formatearFecha(
                                                                            archivo.fecha_subida
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline w-full"
                                                                    onClick={() =>
                                                                        void descargarArchivo(archivo)
                                                                    }
                                                                >
                                                                    Descargar
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documento emitido */}
                                            {solicitud.estado_actual === 'APROBADA' && (
                                                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                                                    <div className="mb-4">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-bold">
                                                                Documento emitido
                                                            </h4>

                                                            <span className="badge badge-success badge-outline">
                                                                Solicitud aprobada
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-sm text-base-content/60">
                                                            Adjunta el documento final que será entregado al vecino.
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                                        <label className="form-control flex-1">
                                                            <div className="label">
                                                                <span className="label-text font-semibold">
                                                                    Seleccionar archivo
                                                                </span>
                                                            </div>

                                                            <input
                                                                type="file"
                                                                className="file-input file-input-bordered w-full"
                                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                onChange={(event) =>
                                                                    setArchivosEmitidos((actuales) => ({
                                                                        ...actuales,
                                                                        [solicitud.id]:
                                                                            event.target.files?.[0] ?? null,
                                                                    }))
                                                                }
                                                            />
                                                        </label>

                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            disabled={
                                                                subiendoArchivoId === solicitud.id ||
                                                                !archivosEmitidos[solicitud.id]
                                                            }
                                                            onClick={() =>
                                                                void subirDocumentoEmitido(solicitud)
                                                            }
                                                        >
                                                            {subiendoArchivoId === solicitud.id && (
                                                                <span className="loading loading-spinner loading-sm" />
                                                            )}

                                                            {subiendoArchivoId === solicitud.id
                                                                ? 'Subiendo...'
                                                                : 'Subir documento'}
                                                        </button>
                                                    </div>

                                                    <p className="mt-3 text-xs text-base-content/50">
                                                        Máximo 10 MB. Formatos permitidos:
                                                        PDF, JPG, PNG, DOC y DOCX.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Historial */}
                                            {solicitud.historial.length > 0 && (
                                                <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/40 p-5">
                                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-bold">
                                                                Historial de gestión
                                                            </h4>

                                                            <p className="mt-1 text-sm text-base-content/60">
                                                                Cambios y comentarios registrados para esta solicitud.
                                                            </p>
                                                        </div>

                                                        <span className="badge badge-outline">
                                                            {solicitud.historial.length}{' '}
                                                            {solicitud.historial.length === 1
                                                                ? 'movimiento'
                                                                : 'movimientos'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {solicitud.historial.map(
                                                            (registro) => (
                                                                <div
                                                                    key={registro.id}
                                                                    className="relative rounded-xl border border-base-300 bg-base-100 p-4"
                                                                >
                                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="badge badge-outline">
                                                                                {nombreEstadoHistorial(
                                                                                    registro.estado_nuevo
                                                                                )}
                                                                            </span>

                                                                            <span className="text-sm font-medium">
                                                                                {
                                                                                    registro.usuario_responsable_username
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <span className="text-xs text-base-content/50">
                                                                            {formatearFecha(
                                                                                registro.fecha_cambio
                                                                            )}
                                                                        </span>
                                                                    </div>

                                                                    {registro.comentario_respuesta && (
                                                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-base-content/70">
                                                                            {
                                                                                registro.comentario_respuesta
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resolución */}
                                            {solicitud.fecha_resolucion && (
                                                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                                                    <span className="font-semibold">
                                                        Fecha de resolución:
                                                    </span>

                                                    <span>
                                                        {formatearFecha(
                                                            solicitud.fecha_resolucion
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-5">
                                                <div className="text-xs text-base-content/40">
                                                    Solicitud #{solicitud.id}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    disabled={
                                                        guardandoId ===
                                                        solicitud.id
                                                    }
                                                    onClick={() =>
                                                        void guardarSolicitud(
                                                            solicitud
                                                        )
                                                    }
                                                >
                                                    {guardandoId ===
                                                    solicitud.id ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-sm" />
                                                            Guardando...
                                                        </>
                                                    ) : (
                                                        'Guardar cambios'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    )
}

export default SolicitudesDocumentoDirectivaPage
