import { useEffect, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'

type Conversacion = {
    id: number
    vecino: number
    vecino_username: string
    directiva: number
    junta_nombre: string
    asunto: string
    fecha_creacion: string
    fecha_actualizacion: string
    activa: boolean
    mensajes: Mensaje[]
}

type Mensaje = {
    id: number
    remitente: number
    remitente_username: string
    rol_remitente: 'VECINO' | 'DIRECTIVA' | null
    contenido: string
    fecha_envio: string
    leido: boolean
    fecha_lectura: string | null
}

type ConversacionDetalle = Conversacion & {
    mensajes: Mensaje[]
}

function MensajeriaDirectivaPage() {
    const [mostrarConfirmacionCierre, setMostrarConfirmacionCierre] =
        useState(false)
    const mensajesContenedorRef =
        useRef<HTMLDivElement | null>(null)
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
    const [cargando, setCargando] = useState(true)
    const [cargandoConversacion, setCargandoConversacion] = useState(false)
    const [error, setError] = useState('')
    const [conversacionSeleccionada, setConversacionSeleccionada] =
        useState<ConversacionDetalle | null>(null)
    const [nuevoMensaje, setNuevoMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)

    const mensajesFinRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const cargarConversaciones = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/comunicaciones/directiva/conversaciones/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar las conversaciones.',
                    )
                }

                const data =
                    (await response.json()) as Conversacion[]

                setConversaciones(data)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarConversaciones()
    }, [])

    useEffect(() => {
        if (conversacionSeleccionada) {
            mensajesFinRef.current?.scrollIntoView({
                behavior: 'smooth',
            })
        }
    }, [conversacionSeleccionada])

    const abrirConversacion = async (conversacionId: number) => {
        try {
            setError('')
            setCargandoConversacion(true)

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/directiva/conversaciones/${conversacionId}/`,
                {
                    credentials: 'include',
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible cargar la conversación.',
                )
            }

            const conversacionActualizada =
                data as ConversacionDetalle

            setConversacionSeleccionada(
                conversacionActualizada,
            )

            setConversaciones((actuales) =>
                actuales.map((conversacion) =>
                    conversacion.id === conversacionActualizada.id
                        ? conversacionActualizada
                        : conversacion,
                ),
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setCargandoConversacion(false)
        }
    }

    const enviarMensaje = async (
        event: SyntheticEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (
            !conversacionSeleccionada ||
            !nuevoMensaje.trim()
        ) {
            return
        }

        try {
            setEnviando(true)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/directiva/conversaciones/${conversacionSeleccionada.id}/mensajes/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contenido: nuevoMensaje.trim(),
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible enviar el mensaje.',
                )
            }

            setNuevoMensaje('')

            await abrirConversacion(
                conversacionSeleccionada.id,
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setEnviando(false)
        }
    }

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-CL', {
            dateStyle: 'short',
            timeStyle: 'short',
        })
    }

    const conversacionesActivas =
        conversaciones.filter(
            (conversacion) => conversacion.activa,
        ).length

    const conversacionesCerradas =
        conversaciones.length - conversacionesActivas

    useEffect(() => {
        const contenedor = mensajesContenedorRef.current

        if (!contenedor || !conversacionSeleccionada) {
            return
        }

        contenedor.scrollTo({
            top: contenedor.scrollHeight,
            behavior: 'smooth',
        })
    }, [conversacionSeleccionada])
    const cambiarEstadoConversacion = async (
        activa: boolean,
    ) => {
        if (!conversacionSeleccionada) {
            return
        }

        try {
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/directiva/conversaciones/${conversacionSeleccionada.id}/estado/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        activa,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.activa?.[0] ??
                    'No fue posible actualizar la conversación.',
                )
            }

            const conversacionActualizada =
                data as ConversacionDetalle

            setConversacionSeleccionada(
                conversacionActualizada,
            )

            setConversaciones((actuales) =>
                actuales.map((conversacion) =>
                    conversacion.id === conversacionActualizada.id
                        ? conversacionActualizada
                        : conversacion,
                ),
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        }
    }
    return (
        <main className="mensajeria-bosque min-h-screen px-4 py-8 sm:px-6">

            <style>{`
                .mensajeria-bosque {
                    --mb-oro: #d9ba76;
                    --mb-crema: #fff6df;
                    position: relative;
                    isolation: isolate;
                    color: var(--mb-crema);
                    background: #091c17;
                    min-height: 100vh;
                }
                .mensajeria-bosque::before {
                    content: "";
                    position: fixed;
                    inset: 0;
                    z-index: -2;
                    background-image:
                        linear-gradient(120deg, rgba(4,22,18,.88), rgba(7,39,30,.75) 53%, rgba(9,25,22,.86)),
                        url('/images/photo-1480714378408-67cf0d13bc1b.jpg');
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                }
                .mensajeria-bosque::after {
                    content: "";
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    pointer-events: none;
                    background: radial-gradient(circle at 15% 20%, rgba(201,168,100,.10), transparent 34%);
                }
                .mensajeria-contenido { position: relative; z-index: 1; }
                .mensajeria-portada,
                .mensajeria-resumen > div,
                .mensajeria-chat,
                .mensajeria-bosque .alert,
                .mensajeria-bosque > .mensajeria-contenido > .rounded-2xl {
                    border: 1px solid rgba(219,186,117,.52) !important;
                    box-shadow: 0 16px 38px rgba(0,0,0,.24);
                    color: var(--mb-crema);
                }
                .mensajeria-portada {
                    background-image:
                      linear-gradient(100deg, rgba(8,40,30,.96), rgba(10,49,39,.82) 65%, rgba(10,39,31,.68)),
                      url('/images/photo-1497366811353-6870744d04b2.jpg');
                    background-size: cover;
                    background-position: center;
                }
                .mensajeria-portada h1,
                .mensajeria-bosque h2,
                .mensajeria-modal h3 { font-family: Georgia, 'Times New Roman', serif; letter-spacing: .01em; }
                .mensajeria-portada h1 { color: #ffe9b8; font-size: clamp(2rem,4vw,2.8rem); }
                .mensajeria-bosque p, .mensajeria-bosque span,
                .mensajeria-bosque h2, .mensajeria-bosque h3 { color: inherit; }
                .mensajeria-portada p { color: #e8e5d7 !important; }
                .mensajeria-resumen > div { min-height: 123px; background-size: cover; background-position: center; }
                .mensajeria-resumen > div:nth-child(1) {
                  background-image: linear-gradient(120deg,rgba(8,44,33,.93),rgba(8,42,33,.70)),url('/images/photo-1497366754035-f200968a6e72.jpg');
                }
                .mensajeria-resumen > div:nth-child(2) {
                  background-image: linear-gradient(120deg,rgba(8,44,33,.93),rgba(8,42,33,.70)),url('/images/photo-1524758631624-e2822e304c36.jpg');
                }
                .mensajeria-resumen > div:nth-child(3) {
                  background-image: linear-gradient(120deg,rgba(8,44,33,.93),rgba(8,42,33,.70)),url('/images/photo-1486406146926-c627a92ad1ab.jpg');
                }
                .mensajeria-resumen .text-3xl { color:#ffdf9d; font-family:Georgia,serif; }
                .mensajeria-bosque .badge {
                    border:1px solid rgba(221,187,113,.65);
                    background:rgba(15,55,42,.8);
                    color:#ffebc1 !important;
                    font-weight:600;
                }
                .mensajeria-bosque .btn {
                    border:1px solid #d8b979;
                    border-radius: 11px;
                    background: linear-gradient(120deg,#ead09a,#b99754);
                    color:#17382c;
                    font-weight:700;
                    box-shadow:0 5px 15px rgba(0,0,0,.14);
                }
                .mensajeria-bosque .btn:hover:not(:disabled) {
                    background:linear-gradient(120deg,#ffdfaa,#d9b976);
                    border-color:#ffdda0;
                }
                .mensajeria-bosque .btn:disabled { opacity:.52; }
                .mensajeria-bosque .btn-error {
                    border-color:#d99a8d;
                    background:#60332f;
                    color:#fff0e8;
                }
                .mensajeria-bosque .btn-error:hover:not(:disabled) { background:#7c3b36; }
                .mensajeria-chat { background:rgba(9,36,29,.91); }
                .mensajeria-listado {
                    border-color:rgba(218,186,117,.35);
                    background-image:linear-gradient(rgba(8,38,31,.93),rgba(8,38,31,.95)),url('/images/photo-1497366858526-0766cadbe8fa.jpg');
                    background-size:cover;
                    background-position:center;
                }
                .mensajeria-listado > div:first-child,
                .mensajeria-cabecera,
                .mensajeria-redaccion { border-color:rgba(218,186,117,.32); }
                .mensajeria-conversaciones > button { border-color:rgba(218,186,117,.2); color:#f7eed7; }
                .mensajeria-conversaciones > button:hover { background:rgba(205,177,109,.13) !important; }
                .mensajeria-conversaciones > button[class*="shadow-primary"] {
                    background:rgba(218,186,117,.20) !important;
                    box-shadow:inset 4px 0 0 #e1c382;
                }
                .mensajeria-detalle { background:rgba(12,42,34,.84); }
                .mensajeria-sin-seleccion {
                    background-image:linear-gradient(100deg,rgba(9,37,30,.88),rgba(11,42,34,.83)),url('/images/photo-1497366412874-3415097a27e7.jpg');
                    background-size:cover;
                    background-position:center;
                }
                .mensajeria-cabecera, .mensajeria-redaccion { background:rgba(10,43,34,.96); }
                .mensajeria-mensajes {
                    background-image:linear-gradient(rgba(9,34,29,.85),rgba(8,34,29,.88)),url('/images/photo-1497366811353-6870744d04b2.jpg');
                    background-size:cover;
                    background-position:center;
                }
                .mensajeria-burbuja-directiva {
                    background:#215441 !important;
                    border-color:rgba(221,184,111,.65) !important;
                    color:#fff4dd !important;
                }
                .mensajeria-burbuja-vecino {
                    background:#f4e8ce !important;
                    border-color:#cfb377 !important;
                    color:#203b30 !important;
                }
                .mensajeria-burbuja-vecino * { color:#203b30 !important; }
                .mensajeria-bosque textarea {
                    background:rgba(246,239,220,.97);
                    border:1px solid #cfb77d;
                    color:#18382c;
                    border-radius:10px;
                }
                .mensajeria-bosque textarea::placeholder { color:#63746a; }
                .mensajeria-bosque [class~="text-base-content/50"],
                .mensajeria-bosque [class~="text-base-content/60"],
                .mensajeria-bosque [class~="text-base-content/70"],
                .mensajeria-bosque [class~="text-base-content/40"],
                .mensajeria-bosque [class~="text-base-content/45"] {
                 color: #dbd8cb;
                }
                .mensajeria-bosque .alert-error { background:rgba(102,37,37,.95); color:#fff3ea; }
                .mensajeria-modal { z-index:100; }
                .mensajeria-modal-caja {
                    background:linear-gradient(145deg,#163e31,#092a22);
                    border:1px solid #d8b979;
                    color:#fff4d9;
                    box-shadow:0 24px 65px rgba(0,0,0,.5);
                }
                .mensajeria-modal-caja .rounded-xl { border-color:rgba(218,186,117,.40); background:rgba(0,0,0,.17); }
                .mensajeria-modal .modal-backdrop { background:rgba(0,0,0,.64); }
                @media (max-width:1023px) {
                    .mensajeria-chat { display:flex; flex-direction:column; height:auto; }
                    .mensajeria-listado { max-height:350px; flex-shrink:0; }
                    .mensajeria-detalle { min-height:520px; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .mensajeria-bosque * { scroll-behavior:auto !important; }
                }

                /* Paleta semántica: distingue estado, volumen y autor de cada mensaje. */
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(1) { border-top: 4px solid #b4a3f0 !important; }
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(2) { border-top: 4px solid #78d6a7 !important; }
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(3) { border-top: 4px solid #aeb9c6 !important; }
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(1) .text-3xl { color:#d7c8ff; }
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(2) .text-3xl { color:#9ff0bc; }
                .mensajeria-bosque .mensajeria-resumen > div:nth-child(3) .text-3xl { color:#d4dce4; }
                .mensajeria-bosque .badge-primary {background:rgba(96,78,154,.8);border-color:#b5a5f2;color:#f5ecff !important;}
                .mensajeria-bosque .badge-success {background:rgba(24,103,68,.85);border-color:#78d6a7;color:#e5fff0 !important;}
                .mensajeria-bosque .badge-ghost {background:rgba(83,99,110,.40);border-color:#9eafbd;color:#e8edf1 !important;}
                .mensajeria-bosque .mensajeria-conversaciones > button:focus-visible {outline:2px solid #efc979;outline-offset:-2px;}
                .mensajeria-bosque .mensajeria-conversaciones > button[class*="shadow-primary"] {border-left:4px solid #d1b4ff;background:rgba(107,85,164,.20) !important;}
                .mensajeria-bosque .mensajeria-burbuja-directiva {background:#205748 !important;border-left:4px solid #81dab0 !important;}
                .mensajeria-bosque .mensajeria-burbuja-vecino {background:#f4e8ce !important;border-left:4px solid #d8b36a !important;}
                .mensajeria-bosque .mensajeria-burbuja-directiva :is(p,span) {color:#fff4dd !important;}
                .mensajeria-bosque .mensajeria-burbuja-vecino :is(p,span) {color:#203b30 !important;}
                .mensajeria-bosque .mensajeria-cabecera .badge-success {background:#176848;}
                .mensajeria-bosque .mensajeria-modal .btn-error {background:#a3403e;color:#fff4ed;border-color:#e4a6a0;}
                .mensajeria-bosque .mensajeria-modal .btn-error:hover {background:#b84c49;}
            `}</style>
            <section className="mensajeria-contenido mx-auto w-full max-w-7xl">
                <div className="mensajeria-portada mb-6 rounded-2xl border p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Mensajería
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Directiva
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Revisa y responde las conversaciones enviadas por los vecinos
                                de tu Junta de Vecinos.
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

                {!cargando && !error && (
                    <div className="mensajeria-resumen mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Conversaciones
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {conversaciones.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Total
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {conversacionesActivas}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Abiertas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Cerradas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {conversacionesCerradas}
                                </span>

                                <span className="badge badge-ghost">
                                    Históricas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {cargando ? (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando conversaciones...
                        </p>
                    </div>
                ) : (
                    <div className="mensajeria-chat grid min-h-[620px] overflow-hidden rounded-2xl border shadow-sm lg:h-[680px] lg:grid-cols-[350px_minmax(0,1fr)]">
                        <aside className="mensajeria-listado min-h-0 border-b lg:border-b-0 lg:border-r">
                            <div className="border-b border-base-300 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            Conversaciones
                                        </h2>

                                        <p className="mt-1 text-sm text-base-content/50">
                                            Selecciona una para responder.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline">
                                        {conversaciones.length}
                                    </span>
                                </div>
                            </div>

                            <div className="mensajeria-conversaciones max-h-[260px] overflow-y-auto lg:max-h-[610px]">
                                {conversaciones.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                                            M
                                        </div>

                                        <p className="font-bold">
                                            No hay conversaciones
                                        </p>

                                        <p className="mt-2 text-sm text-base-content/50">
                                            Cuando un vecino inicie una conversación aparecerá aquí.
                                        </p>
                                    </div>
                                ) : (
                                    conversaciones.map((conversacion) => {
                                        const mensajesNoLeidos = conversacion.mensajes.filter(
                                            (mensaje) =>
                                                mensaje.rol_remitente === 'VECINO' &&
                                                !mensaje.leido,
                                        ).length
                                        const seleccionada =
                                            conversacionSeleccionada?.id === conversacion.id

                                        return (
                                            <button
                                                key={conversacion.id}
                                                type="button"
                                                onClick={() =>
                                                    void abrirConversacion(conversacion.id)
                                                }
                                                className={`w-full border-b border-base-300 p-5 text-left transition-all ${seleccionada
                                                    ? 'bg-primary/[0.08] shadow-[inset_4px_0_0_0] shadow-primary'
                                                    : 'hover:bg-base-200/60'
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seleccionada
                                                            ? 'bg-primary text-primary-content'
                                                            : 'bg-primary/10 text-primary'
                                                            }`}
                                                    >
                                                        {conversacion.vecino_username
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-start justify-between gap-2">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <h3 className="truncate font-bold">
                                                                    {conversacion.asunto}
                                                                </h3>

                                                                {mensajesNoLeidos > 0 && (
                                                                    <span className="badge badge-primary badge-sm">
                                                                        {mensajesNoLeidos === 1
                                                                            ? 'Nuevo'
                                                                            : `${mensajesNoLeidos} nuevos`}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <span
                                                                className={
                                                                    conversacion.activa
                                                                        ? 'badge badge-success badge-xs'
                                                                        : 'badge badge-ghost badge-xs'
                                                                }
                                                            >
                                                                {conversacion.activa
                                                                    ? 'Activa'
                                                                    : 'Cerrada'}
                                                            </span>
                                                        </div>

                                                        <p className="truncate text-sm font-medium text-base-content/70">
                                                            {conversacion.vecino_username}
                                                        </p>

                                                        <p className="mt-1 truncate text-xs text-base-content/50">
                                                            {conversacion.junta_nombre}
                                                        </p>

                                                        <p className="mt-3 text-xs text-base-content/40">
                                                            Actualizada{' '}
                                                            {formatearFecha(
                                                                conversacion.fecha_actualizacion,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </aside>

                        <section className="mensajeria-detalle flex min-h-0 min-w-0 flex-col overflow-hidden">
                            {cargandoConversacion ? (
                                <div className="flex flex-1 items-center justify-center p-8 text-center">
                                    <div>
                                        <span className="loading loading-spinner loading-lg" />

                                        <p className="mt-4 text-base-content/60">
                                            Cargando conversación...
                                        </p>
                                    </div>
                                </div>
                            ) : !conversacionSeleccionada ? (
                                <div className="mensajeria-sin-seleccion flex flex-1 items-center justify-center p-8 text-center">
                                    <div className="max-w-md">
                                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                                            M
                                        </div>

                                        <h2 className="text-xl font-bold">
                                            Selecciona una conversación
                                        </h2>

                                        <p className="mt-2 text-base-content/50">
                                            Aquí podrás revisar el historial completo y responder al
                                            vecino.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <header className="mensajeria-cabecera border-b px-5 py-5 sm:px-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-700">
                                                    {conversacionSeleccionada.vecino_username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="text-lg font-bold">
                                                        {conversacionSeleccionada.asunto}
                                                    </h2>

                                                    <p className="mt-1 text-sm text-base-content/70">
                                                        Vecino:{' '}
                                                        <span className="font-medium">
                                                            {conversacionSeleccionada.vecino_username}
                                                        </span>
                                                    </p>

                                                    <p className="mt-1 text-xs text-base-content/50">
                                                        {conversacionSeleccionada.junta_nombre}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={
                                                        conversacionSeleccionada.activa
                                                            ? 'badge badge-success'
                                                            : 'badge badge-ghost'
                                                    }
                                                >
                                                    {conversacionSeleccionada.activa
                                                        ? 'Activa'
                                                        : 'Cerrada'}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (conversacionSeleccionada.activa) {
                                                            setMostrarConfirmacionCierre(true)
                                                            return
                                                        }

                                                        void cambiarEstadoConversacion(true)
                                                    }}
                                                    className={
                                                        conversacionSeleccionada.activa
                                                            ? 'btn btn-sm btn-outline btn-error'
                                                            : 'btn btn-sm btn-outline btn-success'
                                                    }
                                                >
                                                    {conversacionSeleccionada.activa
                                                        ? 'Cerrar conversación'
                                                        : 'Reabrir conversación'}
                                                </button>
                                            </div>
                                        </div>
                                    </header>

                                    <div
                                        ref={mensajesContenedorRef}
                                        className="mensajeria-mensajes min-h-[290px] flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
                                    >
                                        {conversacionSeleccionada.mensajes.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-center">
                                                <div>
                                                    <p className="font-semibold text-base-content/60">
                                                        Esta conversación todavía no tiene mensajes.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {conversacionSeleccionada.mensajes.map((mensaje) => {
                                                    const esDirectiva =
                                                        mensaje.rol_remitente === 'DIRECTIVA'

                                                    return (
                                                        <div
                                                            key={mensaje.id}
                                                            className={`flex ${esDirectiva
                                                                ? 'justify-end'
                                                                : 'justify-start'
                                                                }`}
                                                        >
                                                            <div
                                                                className={`max-w-[88%] sm:max-w-[75%] ${esDirectiva
                                                                    ? 'items-end'
                                                                    : 'items-start'
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`rounded-2xl border p-4 shadow-sm ${esDirectiva
                                                                        ? 'mensajeria-burbuja-directiva border-primary/20 bg-primary text-primary-content'
                                                                        : 'mensajeria-burbuja-vecino border-base-300 bg-base-100'
                                                                        }`}
                                                                >
                                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                        <span
                                                                            className={`text-sm font-bold ${esDirectiva
                                                                                ? 'text-primary-content'
                                                                                : 'text-base-content'
                                                                                }`}
                                                                        >
                                                                            {mensaje.remitente_username}
                                                                        </span>

                                                                        {mensaje.rol_remitente && (
                                                                            <span
                                                                                className={
                                                                                    esDirectiva
                                                                                        ? 'badge badge-sm border-primary-content/30 bg-primary-content/10 text-primary-content'
                                                                                        : 'badge badge-success badge-outline badge-sm'
                                                                                }
                                                                            >
                                                                                {esDirectiva
                                                                                    ? 'Directiva'
                                                                                    : 'Vecino'}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p
                                                                        className={`whitespace-pre-wrap leading-relaxed ${esDirectiva
                                                                            ? 'text-primary-content'
                                                                            : 'text-base-content/80'
                                                                            }`}
                                                                    >
                                                                        {mensaje.contenido}
                                                                    </p>
                                                                </div>

                                                                <div
                                                                    className={`mt-1 flex items-center gap-2 px-1 text-xs ${esDirectiva
                                                                        ? 'justify-end text-base-content/45'
                                                                        : 'justify-start text-base-content/45'
                                                                        }`}
                                                                >
                                                                    <span>
                                                                        {formatearFecha(
                                                                            mensaje.fecha_envio,
                                                                        )}
                                                                    </span>

                                                                    {esDirectiva && (
                                                                        <span
                                                                            className={
                                                                                mensaje.leido
                                                                                    ? 'text-success'
                                                                                    : 'text-base-content/40'
                                                                            }
                                                                            title={
                                                                                mensaje.leido
                                                                                    ? 'Mensaje leído por el vecino'
                                                                                    : 'Mensaje enviado'
                                                                            }
                                                                        >
                                                                            {mensaje.leido
                                                                                ? '✓ Leído'
                                                                                : 'Enviado'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                <div ref={mensajesFinRef} />
                                            </div>
                                        )}
                                    </div>

                                    {conversacionSeleccionada.activa ? (
                                        <form
                                            onSubmit={enviarMensaje}
                                            className="mensajeria-redaccion border-t p-4 sm:p-5"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-sm font-semibold">
                                                    Responder al vecino
                                                </span>

                                                <span className="text-xs text-base-content/40">
                                                    {nuevoMensaje.length} caracteres
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                                <textarea
                                                    value={nuevoMensaje}
                                                    onChange={(event) =>
                                                        setNuevoMensaje(event.target.value)
                                                    }
                                                    placeholder="Escribe una respuesta..."
                                                    rows={2}
                                                    className="textarea textarea-bordered min-h-[70px] flex-1 resize-y"
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        enviando || !nuevoMensaje.trim()
                                                    }
                                                    className="btn btn-primary sm:min-w-32"
                                                >
                                                    {enviando && (
                                                        <span className="loading loading-spinner loading-sm" />
                                                    )}

                                                    {enviando
                                                        ? 'Enviando...'
                                                        : 'Responder'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mensajeria-redaccion border-t p-5">
                                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-center">
                                                <span className="badge badge-ghost mb-2">
                                                    Conversación cerrada
                                                </span>

                                                <p className="text-sm text-base-content/60">
                                                    Ya no es posible enviar nuevas respuestas en esta
                                                    conversación.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                )}
            </section>
            {mostrarConfirmacionCierre && conversacionSeleccionada && (
                <div className="modal modal-open mensajeria-modal" role="dialog" aria-modal="true" aria-label="Confirmar cierre de conversación">
                    <div className="modal-box mensajeria-modal-caja max-w-md rounded-2xl">
                        <h3 className="text-xl font-bold">
                            ¿Cerrar conversación?
                        </h3>

                        <p className="mt-3 text-base-content/70">
                            La conversación quedará disponible como historial,
                            pero el vecino y la Directiva ya no podrán enviar
                            nuevos mensajes.
                        </p>

                        <div className="mt-4 rounded-xl border border-base-300 bg-base-200/50 p-4">
                            <p className="text-sm text-base-content/60">
                                Conversación
                            </p>

                            <p className="mt-1 font-bold">
                                {conversacionSeleccionada.asunto}
                            </p>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() =>
                                    setMostrarConfirmacionCierre(false)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={async () => {
                                    await cambiarEstadoConversacion(false)
                                    setMostrarConfirmacionCierre(false)
                                }}
                            >
                                Cerrar conversación
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() =>
                            setMostrarConfirmacionCierre(false)
                        }
                    />
                </div>
            )}
        </main>
    )
}

export default MensajeriaDirectivaPage
