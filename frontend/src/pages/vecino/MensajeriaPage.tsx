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
        void cargarConversaciones()
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

            await cargarConversaciones()

            const conversacionActualizada =
                data as Conversacion

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
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
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
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
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

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Contenido */}
                {cargando ? (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando conversaciones...
                        </p>
                    </div>
                ) : (
                    <div className="grid h-[650px] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-[360px_1fr]">

                        {/* Lista de conversaciones */}
                        <aside className="border-b border-base-300 bg-base-100 lg:border-b-0 lg:border-r">
                            <div className="border-b border-base-300 p-5">
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

                            <div className="max-h-[590px] overflow-y-auto">
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
                                                className={`w-full border-b border-base-300 p-5 text-left transition-all ${seleccionada
                                                    ? 'bg-success/[0.08] shadow-[inset_4px_0_0_0] shadow-success'
                                                    : 'hover:bg-base-200/60'
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
                        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                            {!conversacionSeleccionada ? (
                                <div className="flex flex-1 items-center justify-center bg-base-100 p-8 text-center">
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
                                    {/* Cabecera conversación */}
                                    <header className="border-b border-base-300 bg-base-100 px-5 py-5 sm:px-6">
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
                                        className="min-h-0 flex-1 overflow-y-auto bg-base-200/50 p-4 sm:p-6"
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
                                                                        className={`rounded-2xl border p-4 shadow-sm ${esVecino
                                                                            ? 'border-success/20 bg-success text-success-content'
                                                                            : 'border-base-300 bg-base-100'
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
                                            className="border-t border-base-300 bg-base-100 p-4 sm:p-5"
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
                                        <div className="border-t border-base-300 bg-base-100 p-5">
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
                    <div className="modal modal-open">
                        <div className="modal-box max-w-lg rounded-2xl">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-bold">
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
                            className="modal-backdrop"
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
