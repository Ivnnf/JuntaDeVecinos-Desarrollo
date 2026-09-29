import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

type Publicacion = {
    id: number
    directiva: number
    junta_nombre: string
    autor: number
    autor_username: string
    titulo: string
    contenido: string
    fecha_publicacion: string
    activa: boolean
    adjuntos: {
        id: number
        archivo: string
        nombre_original: string
        fecha_subida: string
    }[]
}

function PublicacionDetallePage() {
    const [publicacion, setPublicacion] =
        useState<Publicacion | null>(null)

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const { id } = useParams()

    const [searchParams] = useSearchParams()

    const notificacionId =
        searchParams.get('notificacion')

    useEffect(() => {
        if (!notificacionId) {
            return
        }

        const marcarNotificacionComoLeida = async () => {
            try {
                await fetch(
                    `http://localhost:8000/api/comunicaciones/notificaciones/${notificacionId}/`,
                    {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            leida: true,
                        }),
                    }
                )
            } catch (error) {
                console.error(
                    'No fue posible marcar la notificación como leída.',
                    error
                )
            }
        }

        void marcarNotificacionComoLeida()
    }, [notificacionId])

    useEffect(() => {
        const cargarPublicacion = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    `http://localhost:8000/api/comunicaciones/publicaciones/${id}/detalle/`,
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar el comunicado.'
                    )
                }

                const data =
                    (await response.json()) as Publicacion

                setPublicacion(data)
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

        if (id) {
            void cargarPublicacion()
        }
    }, [id])

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString(
            'es-CL',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            }
        )
    }

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-5xl">

                {/* Navegación */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/vecino"
                        className="btn btn-outline"
                    >
                        ← Volver al Panel
                    </Link>

                    {publicacion && (
                        <span
                            className={
                                publicacion.activa
                                    ? 'badge badge-success badge-outline badge-lg'
                                    : 'badge badge-ghost badge-lg'
                            }
                        >
                            {publicacion.activa
                                ? 'Comunicado activo'
                                : 'Comunicado inactivo'}
                        </span>
                    )}
                </div>

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando comunicado...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {!cargando && !error && publicacion && (
                    <article className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

                        {/* Cabecera */}
                        <div className="border-b border-base-300 p-6 sm:p-8">
                            <div className="flex flex-wrap items-start justify-between gap-5">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="badge badge-primary badge-outline">
                                            Comunicado
                                        </span>

                                        <span className="badge badge-ghost">
                                            #{publicacion.id}
                                        </span>
                                    </div>

                                    <p className="text-sm font-semibold uppercase tracking-wide text-base-content/45">
                                        {publicacion.junta_nombre}
                                    </p>

                                    <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                                        {publicacion.titulo}
                                    </h1>
                                </div>

                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
                                        Publicado
                                    </p>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        {formatearFecha(
                                            publicacion.fecha_publicacion
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                                <span>
                                    Publicado por
                                </span>

                                <span className="badge badge-outline">
                                    {publicacion.autor_username}
                                </span>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 sm:p-8">
                            <div className="mx-auto max-w-3xl">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                                    Comunicado
                                </p>

                                <div className="rounded-2xl bg-base-200/60 p-5 sm:p-6">
                                    <p className="whitespace-pre-wrap text-base leading-7 text-base-content/90">
                                        {publicacion.contenido}
                                    </p>
                                </div>
                            </div>

                            {/* Adjuntos */}
                            {publicacion.adjuntos.length > 0 && (
                                <div className="mx-auto mt-8 max-w-3xl border-t border-base-300 pt-8">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                Archivos adjuntos
                                            </h2>

                                            <p className="mt-1 text-sm text-base-content/60">
                                                Documentos asociados a este comunicado.
                                            </p>
                                        </div>

                                        <span className="badge badge-outline badge-lg">
                                            {publicacion.adjuntos.length}{' '}
                                            {publicacion.adjuntos.length === 1
                                                ? 'archivo'
                                                : 'archivos'}
                                        </span>
                                    </div>

                                    <div className="grid gap-3">
                                        {publicacion.adjuntos.map(
                                            (adjunto) => (
                                                <div
                                                    key={adjunto.id}
                                                    className="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <span className="badge badge-info badge-outline">
                                                                Adjunto
                                                            </span>

                                                            <span className="text-xs text-base-content/45">
                                                                {formatearFecha(
                                                                    adjunto.fecha_subida
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="break-words font-semibold">
                                                            {adjunto.nombre_original}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 flex-wrap gap-2">
                                                        <a
                                                            href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/`}
                                                            target="_blank"
                                                            rel="noopener"
                                                            className="btn btn-sm btn-outline"
                                                        >
                                                            Ver
                                                        </a>

                                                        <a
                                                            href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/?download=1`}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            Descargar
                                                        </a>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sin adjuntos */}
                            {publicacion.adjuntos.length === 0 && (
                                <div className="mx-auto mt-8 max-w-3xl border-t border-base-300 pt-6">
                                    <div className="rounded-xl bg-base-200/50 p-4 text-sm text-base-content/60">
                                        Este comunicado no contiene archivos adjuntos.
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                )}
            </section>
        </main>
    )
}

export default PublicacionDetallePage
