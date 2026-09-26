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
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-4xl mx-auto">
                <Link
                    to="/vecino"
                    className="btn btn-outline mb-6"
                >
                    Volver al Panel del Vecino
                </Link>

                {cargando && (
                    <div className="alert">
                        Cargando comunicado...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!cargando && !error && publicacion && (
                    <article className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div>
                                <p className="text-sm text-base-content/60">
                                    {publicacion.junta_nombre}
                                </p>

                                <h1 className="text-3xl font-bold mt-1">
                                    {publicacion.titulo}
                                </h1>
                            </div>

                            <div className="text-sm text-base-content/60">
                                Publicado por {publicacion.autor_username}
                            </div>

                            <div className="divider" />

                            <p className="whitespace-pre-wrap">
                                {publicacion.contenido}
                            </p>

                            {publicacion.adjuntos.length > 0 && (
                                <>
                                    <div className="divider" />

                                    <div>
                                        <h2 className="text-lg font-bold mb-3">
                                            Archivos adjuntos
                                        </h2>

                                        <div className="space-y-2">
                                            {publicacion.adjuntos.map((adjunto) => (
                                                <div
                                                    key={adjunto.id}
                                                    className="flex flex-wrap items-center gap-2"
                                                >
                                                    <span className="font-medium">
                                                        {adjunto.nombre_original}
                                                    </span>

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
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </article>
                )}
            </section>
        </main>
    )
}

export default PublicacionDetallePage