import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SyntheticEvent } from 'react'

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


const estilosMensajeria = String.raw`
/* APT · Mensajería del Vecino · estilos encapsulados en el componente */
.mensajeria-vecino-bosque {
  --mv-oro: #d7ac32;
  --mv-crema: #f6efd9;
  --mv-suave: #cad5c7;
  --mv-borde: rgba(215,172,50,.38);
  min-height:100vh;
  padding:32px 20px 48px;
  background-color:#092318;
  background-image:linear-gradient(115deg,rgba(4,23,16,.62),rgba(4,23,16,.66)),url('/casitas.webp');
  background-position:center;
  background-repeat:no-repeat;
  background-size:cover;
  background-attachment:fixed;
  color:var(--mv-crema);
  font-family:'Segoe UI',Arial,sans-serif;
}
.mensajeria-vecino-bosque, .mensajeria-vecino-bosque * {box-sizing:border-box;}
.mensajeria-vecino-bosque h1,.mensajeria-vecino-bosque h2,.mensajeria-vecino-bosque h3 {
  font-family:Georgia,'Times New Roman',serif;
  color:#fcf3dd;
  line-height:1.24;
}
.mensajeria-vecino-bosque .mv-hero,.mensajeria-vecino-bosque .mv-stat,
.mensajeria-vecino-bosque .mv-workspace,.mensajeria-vecino-bosque .mv-loading {
  border:1px solid var(--mv-borde);
  border-radius:22px;
  box-shadow:0 14px 36px rgba(0,0,0,.25);
  color:var(--mv-crema);
  background-color:#0b291c;
  background-position:center;
  background-size:cover;
  background-repeat:no-repeat;
}
.mensajeria-vecino-bosque .mv-hero {
  background-image:linear-gradient(115deg,rgba(6,30,22,.80),rgba(8,38,27,.86)),url('/directivas-inicio.webp');
  padding:29px;
}
.mensajeria-vecino-bosque .mv-hero h1 {font-size:clamp(29px,3vw,43px);}
.mensajeria-vecino-bosque .mv-stats {grid-template-columns:repeat(3,minmax(0,1fr));}
.mensajeria-vecino-bosque .mv-stat {padding:24px; min-height:128px;}
.mensajeria-vecino-bosque .mv-stat:nth-child(1) {
  background-image:linear-gradient(115deg,rgba(8,34,24,.79),rgba(8,34,24,.88)),url('/casas.webp');
}
.mensajeria-vecino-bosque .mv-stat:nth-child(2) {
  background-image:linear-gradient(115deg,rgba(8,34,24,.79),rgba(8,34,24,.88)),url('/mensajeria-directiva.webp');
}
.mensajeria-vecino-bosque .mv-stat:nth-child(3) {
  background-image:linear-gradient(115deg,rgba(8,34,24,.79),rgba(8,34,24,.88)),url('/sector.webp');
}
.mensajeria-vecino-bosque .mv-workspace {
  background-image:linear-gradient(115deg,rgba(5,28,19,.83),rgba(6,30,22,.89)),url('/casas.webp');
  border-radius:22px;
}
.mensajeria-vecino-bosque .mv-aside {
  min-width:0;
  display:flex;
  flex-direction:column;
  background-image:linear-gradient(115deg,rgba(7,31,22,.91),rgba(8,35,25,.94)),url('/sector.webp');
  background-size:cover;
  background-position:center;
  border-color:var(--mv-borde);
}
.mensajeria-vecino-bosque .mv-aside-heading {
  flex:none;
  background:rgba(4,23,16,.67);
  border-color:var(--mv-borde);
}
.mensajeria-vecino-bosque .mv-thread-list {flex:1; min-height:0; max-height:none; overflow-y:auto;}
.mensajeria-vecino-bosque .mv-thread {
  min-width:0;
  display:block;
  background:rgba(8,30,21,.58);
  border-color:rgba(215,172,50,.20);
  color:var(--mv-crema);
  transition:background .2s,border-color .2s;
}
.mensajeria-vecino-bosque .mv-thread:nth-child(even) {background:rgba(14,46,32,.55);}
.mensajeria-vecino-bosque .mv-thread:hover {background:rgba(215,172,50,.14);}
.mensajeria-vecino-bosque .mv-thread-selected {background:rgba(215,172,50,.17) !important; box-shadow:inset 4px 0 0 #d7ac32;}
.mensajeria-vecino-bosque .mv-chat {
  min-width:0;
  background-image:linear-gradient(115deg,rgba(8,33,23,.88),rgba(8,34,24,.91)),url('/casitas.webp');
  background-position:center;
  background-size:cover;
}
.mensajeria-vecino-bosque .mv-chat-heading {
  flex-shrink:0;
  background-image:linear-gradient(115deg,rgba(6,32,23,.84),rgba(8,38,27,.90)),url('/mensajeria-directiva.webp');
  background-size:cover;
  background-position:center;
  border-color:var(--mv-borde);
}
.mensajeria-vecino-bosque .mv-chat-empty {
  background-image:linear-gradient(115deg,rgba(7,30,22,.82),rgba(8,35,26,.88)),url('/registro-vecino.webp');
  background-position:center;
  background-size:cover;
}
.mensajeria-vecino-bosque .mv-messages {
  background-color:rgba(3,20,13,.22);
  background-image:linear-gradient(115deg,rgba(7,30,22,.87),rgba(8,35,26,.91)),url('/casas.webp');
  background-position:center;
  background-size:cover;
  overflow-x:hidden;
  overflow-wrap:anywhere;
}
.mensajeria-vecino-bosque .mv-bubble {max-width:100%; overflow-wrap:anywhere;}
.mensajeria-vecino-bosque .mv-bubble-vecino {
  background:linear-gradient(130deg,#b99643,#e1bd5f) !important;
  border-color:rgba(255,238,168,.78) !important;
  color:#10251b !important;
  border-bottom-right-radius:5px;
}
.mensajeria-vecino-bosque .mv-bubble-directiva {
  background:rgba(9,45,31,.96) !important;
  border-color:rgba(215,172,50,.50) !important;
  color:#f9f3df !important;
  border-bottom-left-radius:5px;
}
.mensajeria-vecino-bosque .mv-bubble-vecino :is(p,span) {color:#10251b !important;}
.mensajeria-vecino-bosque .mv-bubble-directiva :is(p,span) {color:#f9f3df !important;}
.mensajeria-vecino-bosque .mv-compose {
  flex:none;
  border-color:var(--mv-borde);
  background-image:linear-gradient(115deg,rgba(7,32,23,.93),rgba(8,38,27,.97)),url('/directivas-inicio.webp');
  background-position:center;
  background-size:cover;
}
.mensajeria-vecino-bosque .mv-loading {
  background-image:linear-gradient(115deg,rgba(7,30,22,.86),rgba(8,35,26,.92)),url('/registro-vecino.webp');
}
.mensajeria-vecino-bosque .btn-primary {
  background:linear-gradient(115deg,#efd279,#cca12e) !important;
  border-color:#d7ac32 !important;
  color:#11271a !important;
  font-weight:800;
  border-radius:12px;
}
.mensajeria-vecino-bosque .btn-outline {
  background:rgba(215,172,50,.12) !important;
  border-color:rgba(215,172,50,.77) !important;
  color:#f9e7b2 !important;
  font-weight:700;
  border-radius:12px;
}
.mensajeria-vecino-bosque :is(.input,.textarea) {
  border:1px solid rgba(215,172,50,.55);
  background:#f0f4f1;
  color:#123124;
  border-radius:12px;
}
.mensajeria-vecino-bosque :is(.input,.textarea)::placeholder {color:#637a6d;}
.mensajeria-vecino-bosque .badge {
  background:rgba(215,172,50,.16);
  color:#f3d67c;
  border:1px solid rgba(215,172,50,.54);
}
.mensajeria-vecino-bosque .badge-success {
  background:rgba(21,103,57,.34);
  color:#b9f3cd;
  border-color:#5eb07c;
}
.mensajeria-vecino-bosque .badge-primary {background:rgba(215,172,50,.23);color:#f9dfa0;}
.mensajeria-vecino-bosque .badge-ghost {background:rgba(218,228,213,.13);color:#e5e9dd;}
.mensajeria-vecino-bosque .border-base-300 {border-color:rgba(215,172,50,.27);}
.mensajeria-vecino-bosque [class*='text-base-content'] {color:#d8e2d4 !important;}
.mensajeria-vecino-bosque .text-success {color:#b8efcf !important;}
.mensajeria-vecino-bosque .text-success-content {color:#10251b !important;}
.mensajeria-vecino-bosque .text-primary {color:#f6d57f !important;}
.mensajeria-vecino-bosque .mv-modal {
  display:grid !important;
  position:fixed !important;
  inset:0;
  width:100vw;
  height:100dvh;
  overflow-y:auto;
  padding:18px;
  place-items:center;
  z-index:9999 !important;
  isolation:isolate;
  background:rgba(2,14,9,.73);
  -webkit-backdrop-filter:blur(7px);
  backdrop-filter:blur(7px);
}
.mensajeria-vecino-bosque .mv-modal-box {
  position:relative;
  z-index:2;
  width:min(100%,560px);
  max-width:560px;
  max-height:calc(100dvh - 36px);
  overflow-y:auto;
  padding:27px;
  background-color:#0b2d20;
  background-image:linear-gradient(115deg,rgba(6,30,22,.91),rgba(8,40,29,.94)),url('/mensajeria-directiva.webp');
  background-size:cover;
  background-position:center;
  border:1px solid rgba(215,172,50,.65);
  border-radius:22px;
  box-shadow:0 28px 80px rgba(0,0,0,.55);
  color:#f6efd9;
}
.mensajeria-vecino-bosque .mv-modal-backdrop {
  position:fixed;
  inset:0;
  z-index:1;
  background:transparent;
  cursor:default;
}
.mensajeria-vecino-bosque .mv-modal .label-text,
.mensajeria-vecino-bosque .mv-modal .label-text-alt {color:#f3e8cf !important;}
.mensajeria-vecino-bosque .mv-mobile-back {display:none;}
.mensajeria-vecino-bosque :is(button,a,textarea,input):focus-visible {
  outline:2px solid #f0d375;
  outline-offset:3px;
}
@media(max-width:1023px) {
  .mensajeria-vecino-bosque .mv-workspace {
    height:auto !important;
    min-height:560px;
    display:block;
    overflow:hidden;
  }
  .mensajeria-vecino-bosque .mv-aside {
    min-height:560px;
    max-height:70vh;
  }
  .mensajeria-vecino-bosque .mv-chat {min-height:630px; height:70vh;}
  .mensajeria-vecino-bosque .mv-mobile-hide {display:none !important;}
  .mensajeria-vecino-bosque .mv-mobile-back {
    display:block;
    width:100%;
    padding:13px 18px;
    border:0;
    border-bottom:1px solid rgba(215,172,50,.4);
    text-align:left;
    color:#f7dda1;
    background:#0a281c;
    font-weight:750;
    cursor:pointer;
  }
}
@media(max-width:639px) {
  .mensajeria-vecino-bosque {padding:18px 12px 30px;background-attachment:scroll;}
  .mensajeria-vecino-bosque .mv-hero {padding:22px;}
  .mensajeria-vecino-bosque .mv-stats {grid-template-columns:1fr;}
  .mensajeria-vecino-bosque .mv-stat {min-height:108px;padding:19px;}
  .mensajeria-vecino-bosque .mv-aside {min-height:480px;}
  .mensajeria-vecino-bosque .mv-chat {min-height:540px;height:75dvh;}
  .mensajeria-vecino-bosque .mv-modal {padding:12px;}
  .mensajeria-vecino-bosque .mv-modal-box {padding:20px;max-height:calc(100dvh - 24px);}
}
@media(prefers-reduced-motion:reduce) {
  .mensajeria-vecino-bosque .mv-thread,
  .mensajeria-vecino-bosque .btn {transition:none;}
}

/* Identidad cromática y contraste por operación, sin modificar datos ni rutas */
.mensajeria-vecino-bosque {
  --mv-violeta:#c7b0ff;
  --mv-verde:#91e2bb;
  --mv-celeste:#92d4f5;
  --mv-gris:#b8c4cc;
}
.mensajeria-vecino-bosque .mv-stat {border-top:4px solid transparent;}
.mensajeria-vecino-bosque .mv-stat:nth-child(1) {border-top-color:var(--mv-violeta);}
.mensajeria-vecino-bosque .mv-stat:nth-child(2) {border-top-color:var(--mv-verde);}
.mensajeria-vecino-bosque .mv-stat:nth-child(3) {border-top-color:var(--mv-gris);}
.mensajeria-vecino-bosque .mv-stat:nth-child(1) .text-3xl {color:var(--mv-violeta);}
.mensajeria-vecino-bosque .mv-stat:nth-child(2) .text-3xl {color:var(--mv-verde);}
.mensajeria-vecino-bosque .mv-stat:nth-child(3) .text-3xl {color:var(--mv-gris);}
.mensajeria-vecino-bosque .mv-stat:nth-child(1) .badge {color:var(--mv-violeta);border-color:rgba(199,176,255,.58);background:rgba(111,83,166,.22);}
.mensajeria-vecino-bosque .mv-stat:nth-child(2) .badge {color:var(--mv-verde);border-color:rgba(145,226,187,.5);background:rgba(38,126,82,.25);}
.mensajeria-vecino-bosque .mv-stat:nth-child(3) .badge {color:var(--mv-gris);border-color:rgba(184,196,204,.5);background:rgba(126,142,156,.17);}
.mensajeria-vecino-bosque .mv-chat-heading {border-bottom:2px solid rgba(146,212,245,.33);}
.mensajeria-vecino-bosque .mv-aside-heading {border-bottom:2px solid rgba(199,176,255,.3);}
.mensajeria-vecino-bosque .mv-thread-selected {box-shadow:inset 4px 0 0 var(--mv-violeta);background:rgba(123,92,169,.22) !important;}
.mensajeria-vecino-bosque .mv-thread-selected h3 {color:#e2d4ff;}
.mensajeria-vecino-bosque .mv-bubble-vecino {
  background:linear-gradient(125deg,#d1b86b,#f0d98a) !important;
  color:#10251b !important;
}
.mensajeria-vecino-bosque .mv-bubble-directiva {
  background:rgba(20,65,75,.95) !important;
  border-color:rgba(146,212,245,.6) !important;
  color:#ecf9fd !important;
}
.mensajeria-vecino-bosque .mv-bubble-directiva :is(p,span) {color:#ecf9fd !important;}
.mensajeria-vecino-bosque .mv-bubble-vecino .badge {color:#193225 !important;border-color:rgba(35,62,44,.35);background:rgba(255,255,255,.28);}
.mensajeria-vecino-bosque .mv-bubble-directiva .badge {color:#d9f3ff !important;border-color:rgba(146,212,245,.6);background:rgba(146,212,245,.14);}
.mensajeria-vecino-bosque .mv-chat-heading .badge-success {color:var(--mv-verde);}
.mensajeria-vecino-bosque .mv-chat-heading .badge-ghost {color:var(--mv-gris);}
.mensajeria-vecino-bosque .mv-compose .btn-primary {background:linear-gradient(115deg,#9ce5c0,#69c89c) !important;border-color:#80d9ad !important;}
.mensajeria-vecino-bosque .mv-modal-box {border-top:4px solid var(--mv-celeste);}
.mensajeria-vecino-bosque .mv-modal-box .btn-primary {background:linear-gradient(115deg,#a5def7,#78bfe7) !important;border-color:#78bfe7 !important;}
.mensajeria-vecino-bosque .mv-modal-box .btn-ghost {color:#f8e8b4;}
.mensajeria-vecino-bosque .mv-modal-box .label-text-alt.text-error {color:#ffb8b8 !important;}
.mensajeria-vecino-bosque .mv-modal-box :is(.input,.textarea) {width:100%;}
`

function MensajeriaPage() {
    const [conversaciones, setConversaciones] =
        useState<Conversacion[]>([])

    const [conversacionSeleccionada, setConversacionSeleccionada] =
        useState<Conversacion | null>(null)

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [mostrarNuevaConversacion, setMostrarNuevaConversacion] =
        useState(false)

    const [asunto, setAsunto] = useState('')
    const [mensajeInicial, setMensajeInicial] = useState('')
    const [nuevoMensaje, setNuevoMensaje] = useState('')

    const [enviando, setEnviando] = useState(false)

    const mensajesContenedorRef =
        useRef<HTMLDivElement | null>(null)

    const cargarConversaciones = async (
        conversacionIdSeleccionada?: number,
    ) => {
        try {
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/comunicaciones/conversaciones/',
                {
                    method: 'GET',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                throw new Error(
                    'No fue posible cargar las conversaciones.',
                )
            }

            const data: Conversacion[] = await response.json()

            setConversaciones(data)

            const idAConservar =
                conversacionIdSeleccionada ??
                conversacionSeleccionada?.id

            if (idAConservar) {
                const actualizada = data.find(
                    (conversacion) =>
                        conversacion.id === idAConservar,
                )

                if (actualizada) {
                    setConversacionSeleccionada(actualizada)
                }
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => cargarConversaciones())
    }, [])

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

    const crearConversacion = async (
        event: SyntheticEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (!asunto.trim() || !mensajeInicial.trim()) {
            setError('Debes ingresar un asunto y un mensaje.')
            return
        }

        try {
            setEnviando(true)
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/comunicaciones/conversaciones/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        asunto: asunto.trim(),
                        mensaje_inicial: mensajeInicial.trim(),
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.directiva?.[0] ??
                    'No fue posible iniciar la conversación.',
                )
            }

            setAsunto('')
            setMensajeInicial('')
            setMostrarNuevaConversacion(false)

            const creada = data as Conversacion
            await cargarConversaciones(creada.id)

            // El GET posterior devuelve el historial completo y selecciona
            // la nueva conversación con sus mensajes incluidos.
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setEnviando(false)
        }
    }

    const enviarMensaje = async (
        event: SyntheticEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (!conversacionSeleccionada || !nuevoMensaje.trim()) {
            return
        }

        try {
            setEnviando(true)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/conversaciones/${conversacionSeleccionada.id}/mensajes/`,
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

            await cargarConversaciones(
                conversacionSeleccionada.id,
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setEnviando(false)
        }
    }

    const formatearFecha = (fecha: string) => {
        return new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(fecha))
    }

    const conversacionesActivas =
        conversaciones.filter(
            (conversacion) => conversacion.activa,
        ).length

    const conversacionesCerradas =
        conversaciones.length - conversacionesActivas

    const abrirConversacion = async (conversacionId: number) => {
        try {
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/conversaciones/${conversacionId}/`,
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
                data as Conversacion

            setConversacionSeleccionada(
                conversacionActualizada,
            )

            setConversaciones((actuales) =>
                actuales.map((conversacion) => {
                    if (conversacion.id !== conversacionId) {
                        return conversacion
                    }

                    return {
                        ...conversacion,
                        mensajes: conversacion.mensajes.map(
                            (mensaje) =>
                                mensaje.rol_remitente === 'DIRECTIVA'
                                    ? {
                                        ...mensaje,
                                        leido: true,
                                    }
                                    : mensaje,
                        ),
                    }
                }),
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
        <main className="mensajeria-vecino-bosque min-h-screen px-4 py-8">
            <style>{estilosMensajeria}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="mv-hero mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Mensajería
                                </h1>

                                <span className="badge badge-success badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Comunícate directamente con la Directiva de tu Junta de
                                Vecinos y revisa el historial de tus conversaciones.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to="/vecino"
                                className="btn btn-outline"
                            >
                                ← Volver al Panel
                            </Link>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setError('')
                                    setMostrarNuevaConversacion(true)
                                }}
                            >
                                + Nueva conversación
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                {!cargando && !error && (
                    <div className="mv-stats mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="mv-stat rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
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

                        <div className="mv-stat rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
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

                        <div className="mv-stat rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
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

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Contenido */}
                {cargando ? (
                    <div className="mv-loading rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando conversaciones...
                        </p>
                    </div>
                ) : (
                    <div className="mv-workspace grid h-[650px] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-[360px_1fr]">

                        {/* Lista de conversaciones */}
                        <aside className={`mv-aside border-b border-base-300 bg-base-100 lg:border-b-0 lg:border-r ${conversacionSeleccionada ? 'mv-mobile-hide' : ''}`}>
                            <div className="mv-aside-heading border-b border-base-300 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            Conversaciones
                                        </h2>

                                        <p className="mt-1 text-sm text-base-content/50">
                                            Selecciona una para continuar.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline">
                                        {conversaciones.length}
                                    </span>
                                </div>
                            </div>

                            <div className="mv-thread-list max-h-[590px] overflow-y-auto">
                                {conversaciones.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-lg font-bold text-success">
                                            M
                                        </div>

                                        <p className="font-bold">
                                            Aún no tienes conversaciones
                                        </p>

                                        <p className="mt-2 text-sm leading-relaxed text-base-content/50">
                                            Puedes iniciar una conversación con la Directiva de tu
                                            Junta de Vecinos.
                                        </p>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary mt-4"
                                            onClick={() => {
                                                setError('')
                                                setMostrarNuevaConversacion(true)
                                            }}
                                        >
                                            Iniciar conversación
                                        </button>
                                    </div>
                                ) : (
                                    conversaciones.map((conversacion) => {
                                        const ultimoMensaje =
                                            conversacion.mensajes[
                                            conversacion.mensajes.length - 1
                                            ]

                                        const seleccionada =
                                            conversacionSeleccionada?.id === conversacion.id

                                        const mensajesNoLeidos = conversacion.mensajes.filter(
                                            (mensaje) =>
                                                mensaje.rol_remitente === 'DIRECTIVA' &&
                                                !mensaje.leido,
                                        ).length

                                        return (
                                            <button
                                                key={conversacion.id}
                                                type="button"
                                                onClick={() =>
                                                    void abrirConversacion(conversacion.id)
                                                }
                                                className={`mv-thread w-full border-b border-base-300 p-5 text-left transition-all ${seleccionada
                                                     ? 'mv-thread-selected'
                                                     : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seleccionada
                                                            ? 'bg-success text-success-content'
                                                            : 'bg-success/10 text-success'
                                                            }`}
                                                    >
                                                        D
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-start justify-between gap-2">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <h3 className="truncate font-bold">
                                                                    {conversacion.asunto}
                                                                </h3>

                                                                {mensajesNoLeidos > 0 && (
                                                                    <span className="badge badge-primary badge-sm shrink-0">
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

                                                        <p className="truncate text-xs text-base-content/50">
                                                            {conversacion.junta_nombre}
                                                        </p>

                                                        {ultimoMensaje && (
                                                            <p className="mt-2 truncate text-sm text-base-content/70">
                                                                {ultimoMensaje.contenido}
                                                            </p>
                                                        )}

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

                        {/* Chat */}
                        <section className={`mv-chat flex min-h-0 min-w-0 flex-col overflow-hidden ${!conversacionSeleccionada ? 'mv-mobile-hide' : ''}`}>
                            {!conversacionSeleccionada ? (
                                <div className="mv-chat-empty flex flex-1 items-center justify-center bg-base-100 p-8 text-center">
                                    <div className="max-w-md">
                                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-2xl font-bold text-success">
                                            M
                                        </div>

                                        <h2 className="text-xl font-bold">
                                            Selecciona una conversación
                                        </h2>

                                        <p className="mt-2 text-base-content/50">
                                            Aquí podrás revisar el historial completo de mensajes con
                                            tu Directiva.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* En móvil, regresar a la lista sin superponer paneles. */}
                                    <button
                                        type="button"
                                        className="mv-mobile-back"
                                        onClick={() => setConversacionSeleccionada(null)}
                                    >
                                        ← Volver a conversaciones
                                    </button>
                                    {/* Cabecera conversación */}
                                    <header className="mv-chat-heading border-b border-base-300 bg-base-100 px-5 py-5 sm:px-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                    D
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="text-lg font-bold">
                                                        {conversacionSeleccionada.asunto}
                                                    </h2>

                                                    <p className="mt-1 text-sm text-base-content/70">
                                                        Directiva de tu Junta de Vecinos
                                                    </p>

                                                    <p className="mt-1 text-xs text-base-content/50">
                                                        {conversacionSeleccionada.junta_nombre}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={
                                                    conversacionSeleccionada.activa
                                                        ? 'badge badge-success badge-lg'
                                                        : 'badge badge-ghost badge-lg'
                                                }
                                            >
                                                {conversacionSeleccionada.activa
                                                    ? 'Activa'
                                                    : 'Cerrada'}
                                            </span>
                                        </div>
                                    </header>

                                    {/* Mensajes */}
                                    <div
                                        ref={mensajesContenedorRef}
                                        className="mv-messages min-h-0 flex-1 overflow-y-auto bg-base-200/50 p-4 sm:p-6"
                                    >
                                        {conversacionSeleccionada.mensajes.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-center">
                                                <p className="font-semibold text-base-content/60">
                                                    Esta conversación todavía no tiene mensajes.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {conversacionSeleccionada.mensajes.map(
                                                    (mensaje) => {
                                                        const esVecino =
                                                            mensaje.rol_remitente === 'VECINO'

                                                        return (
                                                            <div
                                                                key={mensaje.id}
                                                                className={`flex ${esVecino
                                                                    ? 'justify-end'
                                                                    : 'justify-start'
                                                                    }`}
                                                            >
                                                                <div className="max-w-[88%] sm:max-w-[75%]">
                                                                    <div
                                                                        className={`mv-bubble rounded-2xl border p-4 shadow-sm ${esVecino
                                                                             ? 'mv-bubble-vecino'
                                                                             : 'mv-bubble-directiva'
                                                                            }`}
                                                                    >
                                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                            <span
                                                                                className={`text-sm font-bold ${esVecino
                                                                                    ? 'text-success-content'
                                                                                    : 'text-base-content'
                                                                                    }`}
                                                                            >
                                                                                {mensaje.remitente_username}
                                                                            </span>

                                                                            {mensaje.rol_remitente && (
                                                                                <span
                                                                                    className={
                                                                                        esVecino
                                                                                            ? 'badge badge-sm border-success-content/30 bg-success-content/10 text-success-content'
                                                                                            : 'badge badge-primary badge-outline badge-sm'
                                                                                    }
                                                                                >
                                                                                    {esVecino
                                                                                        ? 'Vecino'
                                                                                        : 'Directiva'}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <p
                                                                            className={`whitespace-pre-wrap leading-relaxed ${esVecino
                                                                                ? 'text-success-content'
                                                                                : 'text-base-content/80'
                                                                                }`}
                                                                        >
                                                                            {mensaje.contenido}
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        className={`mt-1 flex items-center gap-2 px-1 text-xs text-base-content/45 ${esVecino
                                                                            ? 'justify-end'
                                                                            : 'justify-start'
                                                                            }`}
                                                                    >
                                                                        <span>
                                                                            {formatearFecha(
                                                                                mensaje.fecha_envio,
                                                                            )}
                                                                        </span>

                                                                        {esVecino && (
                                                                            <span
                                                                                className={
                                                                                    mensaje.leido
                                                                                        ? 'text-success'
                                                                                        : 'text-base-content/40'
                                                                                }
                                                                                title={
                                                                                    mensaje.leido
                                                                                        ? 'Mensaje leído por la Directiva'
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
                                                    },
                                                )}

                                                
                                            </div>
                                        )}
                                    </div>

                                    {/* Responder */}
                                    {conversacionSeleccionada.activa ? (
                                        <form
                                            onSubmit={enviarMensaje}
                                            className="mv-compose border-t border-base-300 bg-base-100 p-4 sm:p-5"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-sm font-semibold">
                                                    Escribir mensaje
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
                                                    placeholder="Escribe un mensaje..."
                                                    rows={2}
                                                    className="textarea textarea-bordered min-h-[70px] flex-1 resize-y"
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        enviando || !nuevoMensaje.trim()
                                                    }
                                                    className="btn btn-primary sm:min-w-28"
                                                >
                                                    {enviando && (
                                                        <span className="loading loading-spinner loading-sm" />
                                                    )}

                                                    {enviando
                                                        ? 'Enviando...'
                                                        : 'Enviar'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mv-compose border-t border-base-300 bg-base-100 p-5">
                                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-center">
                                                <span className="badge badge-ghost mb-2">
                                                    Conversación cerrada
                                                </span>

                                                <p className="text-sm text-base-content/60">
                                                    Ya no es posible enviar nuevos mensajes en esta
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

                {/* Modal nueva conversación */}
                {mostrarNuevaConversacion && (
                    <div className="modal modal-open mv-modal" role="dialog" aria-modal="true" aria-labelledby="mv-modal-title">
                        <div className="mv-modal-box modal-box max-w-lg rounded-2xl">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h2 id="mv-modal-title" className="text-xl font-bold">
                                             Nueva conversación
                                        </h2>

                                        <span className="badge badge-success badge-outline">
                                            Vecino
                                        </span>
                                    </div>

                                    <p className="text-sm text-base-content/60">
                                        El mensaje será enviado a la Directiva de tu Junta de
                                        Vecinos.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-circle btn-ghost btn-sm"
                                    disabled={enviando}
                                    onClick={() =>
                                        setMostrarNuevaConversacion(false)
                                    }
                                    aria-label="Cerrar"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={crearConversacion}>
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
                                        value={asunto}
                                        onChange={(event) =>
                                            setAsunto(event.target.value)
                                        }
                                        placeholder="Ej.: Consulta sobre actividad comunitaria"
                                        maxLength={200}
                                        className="input input-bordered w-full"
                                        required
                                    />

                                    <div className="mt-2 flex justify-end">
                                        <span className="text-xs text-base-content/40">
                                            {asunto.length}/200
                                        </span>
                                    </div>
                                </label>

                                <label className="form-control mt-4">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Mensaje
                                        </span>

                                        <span className="label-text-alt text-error">
                                            Obligatorio
                                        </span>
                                    </div>

                                    <textarea
                                        value={mensajeInicial}
                                        onChange={(event) =>
                                            setMensajeInicial(event.target.value)
                                        }
                                        placeholder="Escribe tu mensaje..."
                                        rows={6}
                                        className="textarea textarea-bordered w-full resize-y"
                                        required
                                    />

                                    <div className="mt-2 flex justify-end">
                                        <span className="text-xs text-base-content/40">
                                            {mensajeInicial.length} caracteres
                                        </span>
                                    </div>
                                </label>

                                <div className="modal-action">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        disabled={enviando}
                                        onClick={() =>
                                            setMostrarNuevaConversacion(false)
                                        }
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            enviando ||
                                            !asunto.trim() ||
                                            !mensajeInicial.trim()
                                        }
                                        className="btn btn-primary"
                                    >
                                        {enviando && (
                                            <span className="loading loading-spinner loading-sm" />
                                        )}

                                        {enviando
                                            ? 'Enviando...'
                                            : 'Iniciar conversación'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div
                            className="modal-backdrop mv-modal-backdrop"
                            onClick={() => {
                                if (!enviando) {
                                    setMostrarNuevaConversacion(false)
                                }
                            }}
                        />
                    </div>
                )}
            </section>
        </main>
    )
}

export default MensajeriaPage
