import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
type IntegranteDirectiva = {
    id: number
    directiva: number
    activo: boolean
}

function PublicacionesPage() {
    const [publicaciones, setPublicaciones] =
        useState<Publicacion[]>([])

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [directivaId, setDirectivaId] =
        useState<number | null>(null)

    const [titulo, setTitulo] = useState('')
    const [contenido, setContenido] = useState('')
    const [publicando, setPublicando] = useState(false)
    const [mensaje, setMensaje] = useState('')

    const [archivoSeleccionado, setArchivoSeleccionado] =
        useState<File | null>(null)

    const [publicacionParaAdjunto, setPublicacionParaAdjunto] =
        useState<number | null>(null)

    const [subiendoArchivo, setSubiendoArchivo] =
        useState(false)

    useEffect(() => {
        const cargarPublicaciones = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/comunicaciones/publicaciones/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los comunicados.'
                    )
                }

                const data =
                    (await response.json()) as Publicacion[]

                setPublicaciones(data)
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

        void cargarPublicaciones()
    }, [])

    useEffect(() => {
        const cargarDirectivaActual = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/integrantes-directiva/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible obtener la directiva actual.'
                    )
                }

                const data =
                    (await response.json()) as IntegranteDirectiva[]

                const integranteActivo = data.find(
                    (integrante) => integrante.activo
                )

                if (!integranteActivo) {
                    throw new Error(
                        'No se encontró una directiva vigente asociada al usuario.'
                    )
                }

                setDirectivaId(
                    integranteActivo.directiva
                )
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.'
                )
            }
        }

        void cargarDirectivaActual()
    }, [])

    async function crearPublicacion(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        if (!directivaId) {
            setError(
                'No se encontró una directiva vigente asociada al usuario.'
            )
            return
        }

        setPublicando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/comunicaciones/publicaciones/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        directiva: directivaId,
                        titulo,
                        contenido,
                        activa: true,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible publicar el comunicado.'
                )
            }

            setPublicaciones((actuales) => [
                data,
                ...actuales,
            ])

            setTitulo('')
            setContenido('')

            setMensaje(
                'Comunicado publicado correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error al publicar el comunicado.'
            )
        } finally {
            setPublicando(false)
        }
    }
    async function subirAdjunto() {
        if (
            !archivoSeleccionado ||
            !publicacionParaAdjunto
        ) {
            return
        }

        setSubiendoArchivo(true)
        setError('')
        setMensaje('')

        try {
            const formData = new FormData()

            formData.append(
                'archivo',
                archivoSeleccionado
            )

            const response = await fetch(
                `http://localhost:8000/api/comunicaciones/publicaciones/${publicacionParaAdjunto}/adjuntos/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible subir el archivo.'
                )
            }

            setPublicaciones((actuales) =>
                actuales.map((publicacion) =>
                    publicacion.id === publicacionParaAdjunto
                        ? {
                            ...publicacion,
                            adjuntos: [
                                ...publicacion.adjuntos,
                                data,
                            ],
                        }
                        : publicacion
                )
            )

            setArchivoSeleccionado(null)
            setPublicacionParaAdjunto(null)

            setMensaje(
                'Archivo adjunto correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error al subir el archivo.'
            )
        } finally {
            setSubiendoArchivo(false)
        }
    }
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold">
                    Comunicados
                </h1>

                <p className="text-base-content/70 mt-2">
                    Publicación de comunicados para los vecinos de la junta.
                </p>

                <Link
                    to="/directiva"
                    className="btn btn-outline mt-4"
                >
                    Volver al Panel de Directiva
                </Link>
                <form
                    onSubmit={crearPublicacion}
                    className="card bg-base-100 shadow mt-6"
                >
                    <div className="card-body">
                        <h2 className="card-title">
                            Nuevo comunicado
                        </h2>

                        <label className="form-control">
                            <span className="label-text mb-1">
                                Título
                            </span>

                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={titulo}
                                onChange={(event) =>
                                    setTitulo(event.target.value)
                                }
                                maxLength={200}
                                required
                            />
                        </label>

                        <label className="form-control mt-4">
                            <span className="label-text mb-1">
                                Contenido
                            </span>

                            <textarea
                                className="textarea textarea-bordered w-full min-h-36"
                                value={contenido}
                                onChange={(event) =>
                                    setContenido(event.target.value)
                                }
                                required
                            />
                        </label>

                        {mensaje && (
                            <div className="alert alert-success mt-4">
                                {mensaje}
                            </div>
                        )}

                        <div className="card-actions justify-end mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    publicando ||
                                    !directivaId ||
                                    !titulo.trim() ||
                                    !contenido.trim()
                                }
                            >
                                {publicando
                                    ? 'Publicando...'
                                    : 'Publicar comunicado'}
                            </button>
                        </div>
                    </div>
                </form>
                {cargando && (
                    <div className="alert mt-6">
                        Cargando comunicados...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-6">
                        {error}
                    </div>
                )}

                {!cargando && !error && (
                    <div className="mt-6 space-y-4">
                        {publicaciones.map((publicacion) => (
                            <article
                                key={publicacion.id}
                                className="card bg-base-100 shadow"
                            >
                                <div className="card-body">
                                    <h2 className="card-title">
                                        {publicacion.titulo}
                                    </h2>

                                    <p>
                                        {publicacion.contenido}
                                    </p>

                                    <div className="text-sm text-base-content/60">
                                        Publicado por {publicacion.autor_username}
                                    </div>
                                    {publicacion.adjuntos.length > 0 && (
                                        <div className="mt-4">
                                            <p className="font-semibold mb-2">
                                                Archivos adjuntos
                                            </p>

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
                                    )}
                                    <div className="mt-4 border-t border-base-300 pt-4">
                                        <p className="font-semibold mb-2">
                                            Adjuntar archivo
                                        </p>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="file"
                                                className="file-input file-input-bordered w-full"
                                                onChange={(event) => {
                                                    const archivo =
                                                        event.target.files?.[0] ?? null

                                                    setArchivoSeleccionado(archivo)

                                                    setPublicacionParaAdjunto(
                                                        archivo ? publicacion.id : null
                                                    )
                                                }}
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                disabled={
                                                    subiendoArchivo ||
                                                    !archivoSeleccionado ||
                                                    publicacionParaAdjunto !== publicacion.id
                                                }
                                                onClick={subirAdjunto}
                                            >
                                                {subiendoArchivo &&
                                                    publicacionParaAdjunto === publicacion.id
                                                    ? 'Subiendo...'
                                                    : 'Subir archivo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {publicaciones.length === 0 && (
                            <div className="alert">
                                No existen comunicados publicados todavía.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default PublicacionesPage