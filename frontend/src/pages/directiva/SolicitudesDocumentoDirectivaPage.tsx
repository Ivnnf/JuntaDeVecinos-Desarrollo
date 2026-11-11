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
        <main className="sd-page min-h-screen px-4 py-8">
            <style>{`
                .sd-page { --sd-gold:#dfbd60; --sd-cream:#f9f1dc; --sd-muted:#cbd6c7; position:relative; isolation:isolate; min-height:100vh; color:var(--sd-cream); font-family:'Segoe UI',Arial,sans-serif; background:#082519; overflow-x:hidden; }
                .sd-page::before { content:''; position:fixed; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(120deg,rgba(4,22,14,.79),rgba(5,25,17,.76)),url('/images/photo-1441974231531-c6227db76b6e.jpg') center/cover no-repeat; }
                .sd-page, .sd-page * { box-sizing:border-box; }
                .sd-page .sd-container { max-width:1400px; }
                .sd-page h1,.sd-page h2,.sd-page h3,.sd-page h4 { font-family:Georgia,'Times New Roman',serif; color:var(--sd-cream); }
                .sd-page h1 { font-size:clamp(30px,3.1vw,42px); }
                .sd-page h2 { font-size:clamp(23px,2.4vw,30px); }
                .sd-page h3 { font-size:clamp(20px,2vw,25px); }
                .sd-page .sd-photo { position:relative; isolation:isolate; overflow:hidden; }
                .sd-page .sd-photo::before { content:''; position:absolute; inset:0; z-index:-1; pointer-events:none; border-radius:inherit; background:linear-gradient(115deg,rgba(5,27,17,.87),rgba(8,43,27,.80)),var(--sd-image) center/cover no-repeat; }
                .sd-page .sd-hero { --sd-image:url('/images/photo-1473448912268-2022ce9509d8.jpg'); background:#092518; border-color:rgba(223,189,96,.48); padding:32px; box-shadow:0 15px 38px rgba(0,0,0,.25); }
                .sd-page .sd-hero::before { border-radius:inherit; }
                .sd-page .sd-pill { background:rgba(223,189,96,.17); color:#f5d67f; border:1px solid rgba(223,189,96,.65); }
                .sd-page .sd-btn,.sd-page .btn { min-height:42px; background:rgba(223,189,96,.16); color:#f8e8b5; border:1px solid rgba(223,189,96,.65); border-radius:12px; box-shadow:none; font-weight:700; }
                .sd-page .btn:hover { background:rgba(223,189,96,.31); color:#fff4d6; border-color:#e5c674; }
                .sd-page .btn-primary,.sd-page .btn-secondary { background:linear-gradient(115deg,#ebd180,#c9a044); color:#112719; border-color:#e1bf63; }
                .sd-page .btn-primary:hover,.sd-page .btn-secondary:hover { background:linear-gradient(115deg,#ffe69c,#e2b951); color:#112719; }
                .sd-page .btn:disabled { opacity:.5; }
                .sd-page .sd-stat { position:relative; isolation:isolate; overflow:hidden; border:1px solid rgba(223,189,96,.43); border-radius:19px; background:#0b2b1b; box-shadow:0 12px 30px rgba(0,0,0,.2); }
                .sd-page .sd-stat::before { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(115deg,rgba(5,27,17,.88),rgba(9,40,25,.76)),var(--sd-stat-image) center/cover no-repeat; }
                .sd-page .sd-stat-pending { --sd-stat-image:url('/images/photo-1449158743715-0a90ebb6d2d8.jpg'); }
                .sd-page .sd-stat-review { --sd-stat-image:url('/images/photo-1473448912268-2022ce9509d8.jpg'); }
                .sd-page .sd-stat-approved { --sd-stat-image:url('/images/photo-1500534623283-312aade485b7.jpg'); }
                .sd-page .sd-stat-rejected { --sd-stat-image:url('/images/photo-1441974231531-c6227db76b6e.jpg'); }
                .sd-page .sd-stat span.text-3xl { color:#f0d27b; }
                .sd-page .sd-empty { --sd-image:url('/images/photo-1500534623283-312aade485b7.jpg'); background:#092519; border-color:rgba(223,189,96,.45); overflow:hidden; }
                .sd-page .sd-empty::before { border-radius:inherit; }
                .sd-page .sd-request { --sd-image:url('/images/photo-1449158743715-0a90ebb6d2d8.jpg'); background:#092519; border-color:rgba(223,189,96,.45); box-shadow:0 12px 30px rgba(0,0,0,.22); }
                .sd-page .sd-request::before { border-radius:inherit; }
                .sd-page .sd-request:nth-child(even) { --sd-image:url('/images/photo-1473448912268-2022ce9509d8.jpg'); }
                .sd-page .sd-inset { background:rgba(4,22,14,.76); border-color:rgba(223,189,96,.28); border-radius:15px; }
                .sd-page .sd-request .border-base-300 { border-color:rgba(223,189,96,.28); }
                .sd-page .text-base-content\/40,.sd-page .text-base-content\/50,.sd-page .text-base-content\/60,.sd-page .text-base-content\/70,.sd-page .text-base-content\/80 { color:var(--sd-muted); }
                .sd-page .text-base-content\/80 { color:var(--sd-cream); }
                .sd-page .sd-request .flex, .sd-page .sd-request .grid { min-width:0; }
                .sd-page .badge { max-width:100%; white-space:normal; height:auto; min-height:25px; overflow-wrap:anywhere; }
                .sd-page .badge-ghost,.sd-page .badge-outline { border-color:rgba(223,189,96,.40); color:#f3e2b4; background:rgba(10,37,23,.55); }
                .sd-page .badge-warning { color:#ffe19b; border-color:#dbaa53; }
                .sd-page .badge-info { color:#b9e0fb; border-color:#86b9d8; }
                .sd-page .badge-success { color:#b1efd0; border-color:#82cda9; }
                .sd-page .badge-error { color:#ffbeba; border-color:#de8b89; }
                .sd-page .select,.sd-page .textarea,.sd-page .file-input { width:100%; min-width:0; background:rgba(3,19,12,.91); color:var(--sd-cream); border:1px solid rgba(223,189,96,.45); border-radius:11px; color-scheme:dark; }
                .sd-page .select:focus,.sd-page .textarea:focus,.sd-page .file-input:focus { outline:2px solid rgba(223,189,96,.75); outline-offset:1px; }
                .sd-page .select option { color:#f9f1dc; background:#0c291b; }
                .sd-page .textarea::placeholder { color:#aebdab; }
                .sd-page .label-text { color:var(--sd-cream); }
                .sd-page .alert-success { background:rgba(14,83,50,.9); border:1px solid rgba(122,206,157,.5); color:#e5ffed; }
                .sd-page .alert-error { background:rgba(118,35,38,.92); border:1px solid rgba(230,119,119,.52); color:#ffeded; }
                .sd-page .alert:not(.alert-success):not(.alert-error) { background:rgba(8,35,22,.9); color:var(--sd-cream); border:1px solid rgba(223,189,96,.43); }
                .sd-page button:focus-visible,.sd-page a:focus-visible { outline:2px solid #f0d57e; outline-offset:3px; }
                .sd-page .sd-request p,.sd-page .sd-request span,.sd-page .sd-request strong { overflow-wrap:anywhere; }
                @media(max-width:640px) { .sd-page { padding:18px 12px 48px;  } .sd-page .sd-hero { padding:22px; } .sd-page .sd-hero .sd-btn { width:100%; } .sd-page .sd-request .p-6 { padding:19px; } .sd-page .sd-empty { padding:28px 18px; } }

                /* Distinción cromática semántica: estados y operaciones */
                .sd-page .sd-stat { --sd-accent:#e6c17a; border-color:color-mix(in srgb,var(--sd-accent) 60%,transparent); border-top:4px solid var(--sd-accent); }
                .sd-page .sd-stat-pending { --sd-accent:#f0c16c; }
                .sd-page .sd-stat-review { --sd-accent:#87cafa; }
                .sd-page .sd-stat-approved { --sd-accent:#83d9aa; }
                .sd-page .sd-stat-rejected { --sd-accent:#f2a0a4; }
                .sd-page .sd-stat .text-3xl { color:var(--sd-accent); font-size:2.35rem; font-variant-numeric:tabular-nums; text-shadow:0 2px 15px rgba(0,0,0,.24); }
                .sd-page .sd-stat > p { color:#f7f1dc; font-weight:700; }
                .sd-page .sd-stat .badge { color:var(--sd-accent); border-color:var(--sd-accent); background:color-mix(in srgb,var(--sd-accent) 14%,transparent); }
                .sd-page .sd-request { --sd-state:#e6c17a; border-left:5px solid var(--sd-state) !important; }
                .sd-page .sd-request[data-estado='PENDIENTE'] { --sd-state:#f0c16c; }
                .sd-page .sd-request[data-estado='EN_REVISION'] { --sd-state:#87cafa; }
                .sd-page .sd-request[data-estado='APROBADA'] { --sd-state:#83d9aa; }
                .sd-page .sd-request[data-estado='RECHAZADA'] { --sd-state:#f2a0a4; }
                .sd-page .sd-request > div:first-child { border-bottom-color:color-mix(in srgb,var(--sd-state) 38%,transparent); }
                .sd-page .sd-request > div:first-child h3 { color:#fff4de; }
                .sd-page .sd-request .badge-warning { color:#ffe4a6; border-color:#e9bd6c; background:rgba(124,82,22,.30); }
                .sd-page .sd-request .badge-info { color:#c5ebff; border-color:#8acbf0; background:rgba(24,90,126,.32); }
                .sd-page .sd-request .badge-success { color:#d0fce1; border-color:#85d8a9; background:rgba(17,100,65,.34); }
                .sd-page .sd-request .badge-error { color:#ffd6d5; border-color:#f0a0a4; background:rgba(123,39,52,.34); }
                .sd-page .sd-request .badge-ghost { color:#ebdfc5; border-color:rgba(196,210,204,.35); background:rgba(100,117,105,.19); }
                .sd-page .sd-request .sd-inset { border-left:3px solid rgba(141,194,219,.65); background:rgba(5,28,24,.80); }
                .sd-page .sd-request .sd-file { background:rgba(5,28,21,.85); border:1px solid rgba(210,190,143,.32); }
                .sd-page .sd-request .sd-file-issued { border-left:4px solid #83d9aa; }
                .sd-page .sd-request .sd-file-attachment { border-left:4px solid #8bcaf0; }
                .sd-page .sd-request .sd-download { background:rgba(40,91,131,.35); border-color:#83bce7; color:#daf0ff; }
                .sd-page .sd-request .sd-download:hover { background:rgba(48,115,166,.58); border-color:#b8dcf8; color:#fff; }
                .sd-page .sd-request .sd-upload { background:linear-gradient(115deg,#b7a4ef,#9076d6); color:#20182c; border-color:#d4c3ff; }
                .sd-page .sd-request .sd-upload:hover { background:linear-gradient(115deg,#d0c2ff,#ac96ed); color:#20182c; }
                .sd-page .sd-request .sd-save { background:linear-gradient(115deg,#a8d7ee,#74b8dc); color:#102b36; border-color:#b7e2fa; }
                .sd-page .sd-request .sd-save:hover { background:linear-gradient(115deg,#d0eaf8,#95ccec); color:#102b36; }
                .sd-page .sd-request .select:focus,.sd-page .sd-request .textarea:focus { outline-color:var(--sd-state); }
                .sd-page .sd-request .sd-file .badge-info { background:rgba(29,83,118,.42); }
                .sd-page .sd-request .sd-file .badge-success { background:rgba(18,92,55,.43); }
                .sd-page :is(.btn,.select,.textarea,.file-input):focus-visible { outline:3px solid #ebd195; outline-offset:2px; }
                @media (prefers-reduced-motion:reduce) { .sd-page .sd-request { transition:none; } }
            `}</style>

            <section className="sd-container mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="sd-hero sd-photo mb-6 rounded-2xl border p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Solicitudes de Documentos
                                </h1>

                                <span className="sd-pill badge badge-lg">
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
                            className="sd-btn btn btn-outline"
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
                        <div className="sd-stats mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-2xl border sd-stat sd-stat-pending p-5 shadow-sm">
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

                            <div className="rounded-2xl border sd-stat sd-stat-review p-5 shadow-sm">
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

                            <div className="rounded-2xl border sd-stat sd-stat-approved p-5 shadow-sm">
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

                            <div className="rounded-2xl border sd-stat sd-stat-rejected p-5 shadow-sm">
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
                            <div className="sd-empty sd-photo rounded-2xl border p-10 text-center shadow-sm">
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
                                        data-estado={solicitud.estado_actual}
                                        className={`sd-request sd-photo overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${bordeEstado(
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

                                                <div className="sd-inset rounded-xl p-5">
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
                                                                className="sd-inset flex h-full flex-col justify-between gap-4 rounded-xl border p-4"
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
                                                                    className="btn btn-sm btn-outline sd-download w-full"
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
                                                <div className="sd-inset mt-6 rounded-2xl border p-5">
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
                                                            className="btn btn-secondary sd-upload"
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
                                                <div className="sd-inset mt-6 rounded-2xl border p-5">
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
                                                                    className="sd-inset relative rounded-xl border p-4"
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
                                                    className="btn btn-primary sd-save"
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
