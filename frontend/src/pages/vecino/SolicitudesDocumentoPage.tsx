import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type TipoDocumento = {
    id: number
    nombre: string
    descripcion: string | null
    activo: boolean
}

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

function SolicitudesDocumentoPage() {
    const [tiposDocumento, setTiposDocumento] =
        useState<TipoDocumento[]>([])

    const [solicitudes, setSolicitudes] =
        useState<SolicitudDocumento[]>([])

    const [tipoDocumento, setTipoDocumento] =
        useState('')

    const [motivo, setMotivo] =
        useState('')

    const [archivo, setArchivo] =
        useState<File | null>(null)

    const [cargando, setCargando] =
        useState(true)

    const [enviando, setEnviando] =
        useState(false)

    const [error, setError] =
        useState('')

    const [mensaje, setMensaje] =
        useState('')

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true)
                setError('')

                const [
                    responseTipos,
                    responseSolicitudes,
                ] = await Promise.all([
                    fetch(
                        'http://localhost:8000/api/solicitudes/tipos-documento/',
                        {
                            credentials: 'include',
                        }
                    ),
                    fetch(
                        'http://localhost:8000/api/solicitudes/documentos/',
                        {
                            credentials: 'include',
                        }
                    ),
                ])

                if (!responseTipos.ok) {
                    throw new Error(
                        'No fue posible cargar los tipos de documento.'
                    )
                }

                if (!responseSolicitudes.ok) {
                    throw new Error(
                        'No fue posible cargar tus solicitudes de documentos.'
                    )
                }

                const tipos =
                    (await responseTipos.json()) as TipoDocumento[]

                const solicitudesCargadas =
                    (await responseSolicitudes.json()) as SolicitudDocumento[]

                setTiposDocumento(tipos)
                setSolicitudes(solicitudesCargadas)

                if (tipos.length > 0) {
                    setTipoDocumento(
                        String(tipos[0].id)
                    )
                }
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

        void cargarDatos()
    }, [])

    const crearSolicitud = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!tipoDocumento) {
            setError(
                'Debes seleccionar un tipo de documento.'
            )
            return
        }

        try {
            setEnviando(true)
            setMensaje('')
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/solicitudes/documentos/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tipo_documento: Number(tipoDocumento),
                        motivo,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.tipo_documento?.[0] ||
                    data.motivo?.[0] ||
                    'No fue posible enviar la solicitud.'
                )
            }

            const nuevaSolicitud =
                data as SolicitudDocumento

            if (archivo) {
                const formData = new FormData()

                formData.append(
                    'archivo',
                    archivo
                )

                const responseArchivo = await fetch(
                    `http://localhost:8000/api/solicitudes/documentos/${nuevaSolicitud.id}/archivos/`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    }
                )

                if (!responseArchivo.ok) {
                    const dataArchivo =
                        await responseArchivo.json()

                    throw new Error(
                        dataArchivo.archivo?.[0] ||
                        dataArchivo.detail ||
                        'La solicitud fue creada, pero no fue posible adjuntar el archivo.'
                    )
                }
            }

            setSolicitudes((actuales) => [
                nuevaSolicitud,
                ...actuales,
            ])

            setMotivo('')

            setMensaje(
                `Solicitud enviada correctamente. Número de seguimiento: ${nuevaSolicitud.numero_seguimiento}`
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

    const obtenerNombreEstado = (
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

    const tipoSeleccionado =
        tiposDocumento.find(
            (tipo) =>
                String(tipo.id) === tipoDocumento
        )

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Solicitud de Documentos
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Solicita documentos a tu Junta de Vecinos,
                                adjunta antecedentes y revisa el estado de cada
                                solicitud.
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
                )}

                {/* Nueva solicitud */}
                <form
                    onSubmit={crearSolicitud}
                    className="mb-6 overflow-hidden rounded-2xl border border-cyan-500/30 bg-base-100 shadow-sm"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Nueva solicitud de documento
                                    </h2>

                                    <span className="badge badge-info badge-outline">
                                        Nuevo
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Selecciona el documento que necesitas y
                                    explica brevemente el motivo de tu solicitud.
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

                        {cargando ? (
                            <div className="alert border border-base-300 bg-base-100">
                                <span className="loading loading-spinner loading-sm" />

                                <span>
                                    Cargando tipos de documento...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-5 md:grid-cols-2">

                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Tipo de documento
                                            </span>

                                            <span className="label-text-alt text-error">
                                                Obligatorio
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={tipoDocumento}
                                            onChange={(event) =>
                                                setTipoDocumento(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            disabled={
                                                cargando ||
                                                tiposDocumento.length === 0
                                            }
                                        >
                                            {tiposDocumento.length === 0 && (
                                                <option value="">
                                                    No hay documentos disponibles
                                                </option>
                                            )}

                                            {tiposDocumento.map((tipo) => (
                                                <option
                                                    key={tipo.id}
                                                    value={tipo.id}
                                                >
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        <span className="mt-2 text-xs text-base-content/50">
                                            Selecciona el documento que deseas
                                            solicitar a la directiva.
                                        </span>
                                    </label>

                                    <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                            Documento seleccionado
                                        </p>

                                        <p className="mt-2 font-bold">
                                            {tipoSeleccionado?.nombre ??
                                                'Sin seleccionar'}
                                        </p>

                                        <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                                            {tipoSeleccionado?.descripcion ||
                                                'Este tipo de documento no tiene una descripción adicional.'}
                                        </p>
                                    </div>

                                    <label className="form-control md:col-span-2">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Motivo
                                            </span>

                                            <span className="label-text-alt text-error">
                                                Obligatorio
                                            </span>
                                        </div>

                                        <textarea
                                            className="textarea textarea-bordered min-h-36 w-full resize-y"
                                            value={motivo}
                                            onChange={(event) =>
                                                setMotivo(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Indica para qué necesitas el documento."
                                            required
                                        />

                                        <div className="mt-2 flex justify-end">
                                            <span className="text-xs text-base-content/40">
                                                {motivo.length} caracteres
                                            </span>
                                        </div>
                                    </label>

                                    <label className="form-control md:col-span-2">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Archivo adjunto
                                            </span>

                                            <span className="label-text-alt">
                                                Opcional
                                            </span>
                                        </div>

                                        <input
                                            type="file"
                                            className="file-input file-input-bordered w-full"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(event) =>
                                                setArchivo(
                                                    event.target.files?.[0] ?? null
                                                )
                                            }
                                        />

                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs text-base-content/50">
                                                Máximo 10 MB. PDF, JPG, PNG,
                                                DOC o DOCX.
                                            </span>

                                            {archivo && (
                                                <span className="badge badge-info badge-outline">
                                                    {archivo.name}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            enviando ||
                                            !tipoDocumento
                                        }
                                    >
                                        {enviando && (
                                            <span className="loading loading-spinner loading-sm" />
                                        )}

                                        {enviando
                                            ? 'Enviando...'
                                            : 'Solicitar documento'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>

                {/* Listado */}
                {!cargando && (
                    <div>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Mis solicitudes de documentos
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa el seguimiento, historial y archivos
                                    de tus solicitudes.
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
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-bold text-cyan-700">
                                        D
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No tienes solicitudes de documentos
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Cuando solicites un documento podrás
                                        revisar su estado y seguimiento en esta
                                        sección.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {solicitudes.map(
                                    (solicitud) => (
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
                                                            <span
                                                                className={claseEstado(
                                                                    solicitud.estado_actual
                                                                )}
                                                            >
                                                                {obtenerNombreEstado(
                                                                    solicitud.estado_actual
                                                                )}
                                                            </span>

                                                            <span className="badge badge-ghost font-mono">
                                                                {
                                                                    solicitud.numero_seguimiento
                                                                }
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-bold">
                                                            {
                                                                solicitud.tipo_documento_nombre
                                                            }
                                                        </h3>

                                                        <p className="mt-2 text-sm text-base-content/60">
                                                            {
                                                                solicitud.junta_nombre
                                                            }
                                                        </p>

                                                        {solicitud.responsable_username && (
                                                            <p className="mt-1 text-sm text-base-content/60">
                                                                Responsable:{' '}
                                                                <strong className="font-semibold text-base-content/80">
                                                                    {
                                                                        solicitud.responsable_username
                                                                    }
                                                                </strong>
                                                            </p>
                                                        )}
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
                                                <div>
                                                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                                                        Motivo
                                                    </p>

                                                    <div className="rounded-xl bg-base-200/70 p-5">
                                                        <p className="whitespace-pre-wrap leading-relaxed">
                                                            {solicitud.motivo}
                                                        </p>
                                                    </div>
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
                                                                    Antecedentes adjuntos y
                                                                    documentos emitidos.
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
                                                            {solicitud.archivos.map(
                                                                (archivo) => (
                                                                    <div
                                                                        key={archivo.id}
                                                                        className="flex h-full flex-col justify-between gap-4 rounded-xl border border-base-300 p-4"
                                                                    >
                                                                        <div>
                                                                            <span
                                                                                className={
                                                                                    archivo.tipo_uso === 'DOCUMENTO_EMITIDO'
                                                                                        ? 'badge badge-success badge-outline'
                                                                                        : 'badge badge-info badge-outline'
                                                                                }
                                                                            >
                                                                                {archivo.tipo_uso === 'DOCUMENTO_EMITIDO'
                                                                                    ? 'Documento emitido'
                                                                                    : 'Archivo adjunto'}
                                                                            </span>

                                                                            <p className="mt-3 break-words font-semibold">
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
                                                                                void descargarArchivo(
                                                                                    archivo
                                                                                )
                                                                            }
                                                                        >
                                                                            Descargar
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Historial */}
                                                {solicitud.historial.length > 0 && (
                                                    <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/40 p-5">
                                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                            <div>
                                                                <h4 className="font-bold">
                                                                    Historial
                                                                </h4>

                                                                <p className="mt-1 text-sm text-base-content/60">
                                                                    Cambios registrados durante
                                                                    la gestión de tu solicitud.
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
                                                                        className="rounded-xl border border-base-300 bg-base-100 p-4"
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
                                                    <div className="mt-5 rounded-xl border border-base-300 bg-base-200/40 p-4">
                                                        <p className="text-sm text-base-content/60">
                                                            Fecha de resolución:{' '}
                                                            <strong className="font-semibold text-base-content/80">
                                                                {formatearFecha(
                                                                    solicitud.fecha_resolucion
                                                                )}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Pie */}
                                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-5">
                                                    <span className="text-xs text-base-content/40">
                                                        Solicitud #{solicitud.id}
                                                    </span>

                                                    <span
                                                        className={claseEstado(
                                                            solicitud.estado_actual
                                                        )}
                                                    >
                                                        {obtenerNombreEstado(
                                                            solicitud.estado_actual
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default SolicitudesDocumentoPage
