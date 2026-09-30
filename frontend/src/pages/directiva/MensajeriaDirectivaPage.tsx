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
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-7xl">
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
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
                    <div className="grid h-[650px] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-[360px_1fr]">
                        <aside className="border-b border-base-300 bg-base-100 lg:border-b-0 lg:border-r">
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

                            <div className="max-h-[590px] overflow-y-auto">
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

                        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
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
                                <div className="flex flex-1 items-center justify-center bg-base-100 p-8 text-center">
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
                                    <header className="border-b border-base-300 bg-base-100 px-5 py-5 sm:px-6">
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
                                        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-base-200/50 p-6"
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
                                                                        ? 'border-primary/20 bg-primary text-primary-content'
                                                                        : 'border-base-300 bg-base-100'
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
                                            className="border-t border-base-300 bg-base-100 p-4 sm:p-5"
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
                                        <div className="border-t border-base-300 bg-base-100 p-5">
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
                <div className="modal modal-open">
                    <div className="modal-box max-w-md rounded-2xl">
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
