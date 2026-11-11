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
        <main className="pub-page min-h-screen px-4 py-8">
            <style>{`
.pub-page{--pgold:#e7c36d;--pcream:#f8f0dc;--pmuted:#d9e2d6;position:relative;isolation:isolate;min-height:100vh;background:#092217;color:var(--pcream);font-family:Arial,'Segoe UI',sans-serif;overflow:hidden}
.pub-page::before{content:"";position:fixed;inset:0;z-index:-2;background:linear-gradient(115deg,rgba(5,24,17,.78),rgba(4,29,22,.66)),url('/images/photo-1486406146926-c627a92ad1ab.jpg') center/cover no-repeat}
.pub-page::after{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at top right,rgba(227,188,99,.11),transparent 42%);pointer-events:none}
.pub-page .pub-container{position:relative}
.pub-page h1,.pub-page h2,.pub-page h3,.pub-page h4{font-family:Georgia,'Times New Roman',serif;color:var(--pcream);line-height:1.2}
.pub-page .pub-hero,.pub-page .pub-compose,.pub-page .pub-empty,.pub-page .pub-article{background-color:rgba(7,31,23,.89);border-color:rgba(231,195,109,.43);box-shadow:0 12px 34px rgba(0,0,0,.22)}
.pub-page .pub-hero{background:linear-gradient(100deg,rgba(5,31,21,.93),rgba(5,32,23,.76)),url('/images/photo-1497366811353-6870744d04b2.jpg') center/cover no-repeat;padding:2rem;min-height:185px}
.pub-page .pub-hero h1{font-size:clamp(2rem,3.4vw,3.2rem);font-weight:700}
.pub-page .pub-stat-grid>div{min-height:150px;border:1px solid rgba(231,195,109,.46);box-shadow:0 10px 25px rgba(0,0,0,.2);background-color:#0a291d;background-size:cover;background-position:center;border-radius:20px;overflow:hidden;color:var(--pcream)}
.pub-page .pub-stat-grid>div:nth-child(1){background-image:linear-gradient(120deg,rgba(5,29,21,.90),rgba(8,36,25,.69)),url('/images/photo-1497366754035-f200968a6e72.jpg')}
.pub-page .pub-stat-grid>div:nth-child(2){background-image:linear-gradient(120deg,rgba(5,29,21,.89),rgba(8,36,25,.67)),url('/images/photo-1497366858526-0766cadbe8fa.jpg')}
.pub-page .pub-stat-grid>div:nth-child(3){background-image:linear-gradient(120deg,rgba(5,29,21,.89),rgba(8,36,25,.72)),url('/images/photo-1486406146926-c627a92ad1ab.jpg')}
.pub-page .pub-stat-grid .text-3xl{color:var(--pcream);font-weight:800}
.pub-page .pub-compose{background:linear-gradient(115deg,rgba(5,32,23,.94),rgba(6,37,27,.90)),url('/images/photo-1497366754035-f200968a6e72.jpg') center/cover no-repeat}
.pub-page .pub-article{background:linear-gradient(140deg,rgba(5,31,22,.94),rgba(7,39,28,.90)),url('/images/photo-1497366811353-6870744d04b2.jpg') center/cover no-repeat}
.pub-page .pub-empty{background:linear-gradient(110deg,rgba(5,29,22,.9),rgba(7,36,27,.81)),url('/images/photo-1497366811353-6870744d04b2.jpg') center/cover no-repeat}
.pub-page p,.pub-page label,.pub-page .text-base-content\\/60,.pub-page .text-base-content\\/70,.pub-page .text-base-content\\/80,.pub-page .text-base-content\\/55,.pub-page .text-base-content\\/50,.pub-page .text-base-content\\/45,.pub-page .text-base-content\\/75,.pub-page .text-base-content\\/40{color:var(--pmuted)}
.pub-page .border-base-300{border-color:rgba(231,195,109,.25)}
.pub-page .bg-base-100{background:rgba(9,42,30,.85);color:var(--pcream)}
.pub-page .bg-base-200\\/40{background:rgba(7,25,19,.55)}
.pub-page .input,.pub-page .textarea,.pub-page .file-input{background:rgba(4,23,17,.88);color:#f9f2df;border:1px solid rgba(231,195,109,.48);border-radius:12px;outline-offset:2px;max-width:100%}
.pub-page .input::placeholder,.pub-page .textarea::placeholder{color:#aebeb2}
.pub-page .input:focus,.pub-page .textarea:focus,.pub-page .file-input:focus{border-color:var(--pgold);outline:1px solid rgba(231,195,109,.55)}
.pub-page .file-input::file-selector-button{background:#dec17c;color:#0d2e21;border:none}
.pub-page .btn-primary,.pub-page .pub-btn-outline,.pub-page button[type="submit"]{background:linear-gradient(110deg,#f2dfa4,#cfaa5d);color:#0b281e;border:1px solid #cba752;font-weight:800;text-transform:none;border-radius:13px;box-shadow:0 5px 18px rgba(0,0,0,.18)}
.pub-page .btn-primary:hover,.pub-page .pub-btn-outline:hover,.pub-page button[type="submit"]:hover{background:#f7e6b8;color:#092217;border-color:#f7e6b8}
.pub-page .btn-outline:not(.pub-btn-outline){border-color:rgba(231,195,109,.65);color:var(--pcream);background:rgba(10,41,29,.9)}
.pub-page .btn-outline:not(.pub-btn-outline):hover{background:#d9b96b;color:#092217}
.pub-page .btn:disabled{opacity:.56;cursor:not-allowed}
.pub-page .badge{border-color:rgba(231,195,109,.42);background:rgba(219,189,101,.15);color:#f4d995}
.pub-page .badge-success{background:rgba(22,107,65,.7);color:#ecfff1;border-color:rgba(111,202,150,.62)}
.pub-page .alert{border-radius:14px}
.pub-page .alert-error{background:rgba(116,31,33,.86);color:#fff1ee;border:1px solid #db7774}
.pub-page .alert-success{background:rgba(13,82,51,.87);color:#eafbef;border:1px solid #6da784}
.pub-page .pub-list-heading{background:rgba(9,40,28,.74);padding:1rem 1.25rem;border:1px solid rgba(231,195,109,.26);border-radius:17px}
.pub-page a{transition:filter .15s ease}
.pub-page .break-all,.pub-page .whitespace-pre-wrap{overflow-wrap:anywhere}
@media(max-width:640px){.pub-page{padding:16px 12px 40px}.pub-page .pub-hero{padding:1.2rem;min-height:unset}.pub-page .pub-hero h1{font-size:2rem}.pub-page .pub-stat-grid>div{min-height:120px}}

/* Identidad cromática de cada métrica */
.pub-page .pub-stat-grid > div { position:relative; isolation:isolate; transition:transform .2s ease, border-color .2s ease; }
.pub-page .pub-stat-grid > div:hover { transform:translateY(-3px); }
.pub-page .pub-stat-grid > div::after { content:""; position:absolute; inset:0 auto 0 0; width:5px; border-radius:20px 0 0 20px; background:var(--stat-accent); }
.pub-page .pub-stat-grid > div:nth-child(1) { --stat-accent:#9ac7ff; border-color:rgba(154,199,255,.7); }
.pub-page .pub-stat-grid > div:nth-child(2) { --stat-accent:#86e2b2; border-color:rgba(134,226,178,.7); }
.pub-page .pub-stat-grid > div:nth-child(3) { --stat-accent:#ddbaee; border-color:rgba(221,186,238,.7); }
.pub-page .pub-stat-grid > div .text-3xl { color:var(--stat-accent); font-size:2.3rem; line-height:1.15; }
.pub-page .pub-stat-grid > div .badge { color:var(--stat-accent); background:color-mix(in srgb,var(--stat-accent) 13%,transparent); border-color:color-mix(in srgb,var(--stat-accent) 58%,transparent); }
/* Edición y contenido: separar visualmente publicación, archivos y descargas */
.pub-page .pub-compose { border:1px solid rgba(144,198,246,.65); }
.pub-page .pub-compose > div:first-child { border-bottom:1px solid rgba(144,198,246,.35); }
.pub-page .pub-compose h2 { color:#a9d2ff; }
.pub-page .pub-compose button[type="submit"] { background:linear-gradient(110deg,#a5d7fa,#68b5e7); border-color:#9bd0f1; color:#092836; }
.pub-page .pub-compose button[type="submit"]:hover:not(:disabled) { background:#c0e5ff; color:#092836; }
.pub-page .pub-article { border-left:5px solid #79bbf1; transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease; }
.pub-page .pub-article:hover { transform:translateY(-2px); border-color:rgba(138,202,245,.8); box-shadow:0 16px 37px rgba(0,0,0,.27); }
.pub-page .pub-article.pub-article-inactivo { border-left-color:#9faeb3; opacity:.88; }
.pub-page .pub-article .pub-archivo { border:1px solid rgba(163,140,228,.5); border-left:3px solid #bdabf8; background:rgba(17,34,40,.76); }
.pub-page .pub-article .pub-adjuntos { border-top:1px solid rgba(188,169,244,.33); background:rgba(17,34,40,.35); }
.pub-page .pub-article .pub-adjuntos h4 { color:#d9caff; }
.pub-page .pub-article .pub-adjuntar { border-top:1px solid rgba(112,217,177,.35); }
.pub-page .pub-article .pub-adjuntar h4 { color:#98e8c3; }
.pub-page .pub-article .pub-ver { border-color:rgba(160,210,250,.7)!important; color:#c6eaff!important; background:rgba(31,80,110,.35)!important; }
.pub-page .pub-article .pub-ver:hover { background:rgba(55,112,151,.6)!important; color:white!important; }
.pub-page .pub-article .pub-descargar { border-color:#9cdbb8!important; background:linear-gradient(110deg,#a9ebca,#76cba2)!important; color:#0c3124!important; }
.pub-page .pub-article .pub-descargar:hover { background:#c4f8d9!important; }
.pub-page .pub-article .pub-subir { border-color:#99dec3!important; background:rgba(32,101,77,.65)!important; color:#ddffec!important; }
.pub-page .pub-article .pub-subir:hover:not(:disabled) { background:rgba(45,143,103,.85)!important; }
.pub-page .badge.pub-estado-activo { background:rgba(27,115,74,.78); border-color:#7ee0ab; color:#e1ffef; }
.pub-page .badge.pub-estado-inactivo { background:rgba(92,106,111,.32); border-color:#a2b2ba; color:#d8e1e5; }
.pub-page .pub-page-title-note { color:#b7e2ff; }
@media (prefers-reduced-motion: reduce) { .pub-page .pub-stat-grid > div,.pub-page .pub-article { transition:none; } }
`}</style>
            <section className="pub-container mx-auto w-full max-w-6xl">
                {/* Encabezado */}
                <div className="pub-hero mb-6 rounded-2xl border p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Comunicados
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Directiva
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Publica avisos, información y documentos para los vecinos de la junta.
                            </p>
                        </div>

                        <Link
                            to="/directiva"
                            className="btn pub-btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Resumen */}
                {!cargando && !error && (
                    <div className="pub-stat-grid mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Comunicados
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {publicaciones.length}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Publicados
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {publicaciones.filter((publicacion) => publicacion.activa).length}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Visibles
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                            <p className="text-sm font-medium text-base-content/60">
                                Archivos adjuntos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {publicaciones.reduce(
                                        (total, publicacion) => total + publicacion.adjuntos.length,
                                        0
                                    )}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Documentos
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nuevo comunicado */}
                <form
                    onSubmit={crearPublicacion}
                    className="pub-compose mb-6 overflow-hidden rounded-2xl border shadow-sm"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Nuevo comunicado
                                    </h2>

                                    <span className="badge badge-primary badge-outline">
                                        Nueva publicación
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Redacta un aviso para informar a los vecinos de la junta.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-5">
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Título
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={titulo}
                                    onChange={(event) =>
                                        setTitulo(event.target.value)
                                    }
                                    maxLength={200}
                                    placeholder="Ej: Reunión extraordinaria de vecinos"
                                    required
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/45">
                                        {titulo.length}/200
                                    </span>
                                </div>
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Contenido
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-40 w-full resize-y"
                                    value={contenido}
                                    onChange={(event) =>
                                        setContenido(event.target.value)
                                    }
                                    placeholder="Escribe aquí la información que deseas comunicar a los vecinos..."
                                    required
                                />
                            </label>
                        </div>

                        {mensaje && (
                            <div className="alert alert-success mt-6 shadow-sm">
                                <span>{mensaje}</span>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
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
                                {publicando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {publicando
                                    ? 'Publicando...'
                                    : 'Publicar comunicado'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />
                        <span>Cargando comunicados...</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Listado */}
                {!cargando && !error && (
                    <div>
                        <div className="pub-list-heading mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Comunicados publicados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Historial de información publicada para la comunidad.
                                </p>
                            </div>

                            {publicaciones.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {publicaciones.length}{' '}
                                    {publicaciones.length === 1
                                        ? 'comunicado'
                                        : 'comunicados'}
                                </span>
                            )}
                        </div>

                        {publicaciones.length === 0 ? (
                            <div className="pub-empty rounded-2xl border p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                                        +
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No hay comunicados publicados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Utiliza el formulario superior para crear el primer comunicado para los vecinos.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {publicaciones.map((publicacion) => (
                                    <article
                                        key={publicacion.id}
                                        className={`pub-article overflow-hidden rounded-2xl border shadow-sm ${publicacion.activa ? '' : 'pub-article-inactivo'}`}
                                    >
                                        <div className="p-6">
                                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold uppercase tracking-wide text-base-content/45">
                                                            {publicacion.junta_nombre}
                                                        </span>

                                                        {publicacion.activa ? (
                                                            <span className="badge pub-estado-activo badge-sm">
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <span className="badge pub-estado-inactivo badge-sm">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-bold leading-snug">
                                                        {publicacion.titulo}
                                                    </h3>
                                                </div>

                                                <span className="badge badge-outline">
                                                    #{publicacion.id}
                                                </span>
                                            </div>

                                            <div className="whitespace-pre-wrap leading-relaxed text-base-content/80">
                                                {publicacion.contenido}
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-base-300 pt-4 text-sm text-base-content/55">
                                                <span>
                                                    Publicado por{' '}
                                                    <strong className="font-semibold text-base-content/75">
                                                        {publicacion.autor_username}
                                                    </strong>
                                                </span>

                                                <span>
                                                    {new Date(
                                                        publicacion.fecha_publicacion
                                                    ).toLocaleString('es-CL')}
                                                </span>

                                                <span>
                                                    {publicacion.adjuntos.length}{' '}
                                                    {publicacion.adjuntos.length === 1
                                                        ? 'archivo adjunto'
                                                        : 'archivos adjuntos'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Adjuntos existentes */}
                                        {publicacion.adjuntos.length > 0 && (
                                            <div className="pub-adjuntos border-t border-base-300 bg-base-200/40 px-6 py-5">
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                    <h4 className="font-bold">
                                                        Archivos adjuntos
                                                    </h4>

                                                    <span className="badge badge-outline">
                                                        {publicacion.adjuntos.length}
                                                    </span>
                                                </div>

                                                <div className="grid gap-3">
                                                    {publicacion.adjuntos.map((adjunto) => (
                                                        <div
                                                            key={adjunto.id}
                                                            className="pub-archivo flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="break-all font-medium">
                                                                    {adjunto.nombre_original}
                                                                </p>

                                                                <p className="mt-1 text-xs text-base-content/50">
                                                                    Subido el{' '}
                                                                    {new Date(
                                                                        adjunto.fecha_subida
                                                                    ).toLocaleString('es-CL')}
                                                                </p>
                                                            </div>

                                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                                <a
                                                                    href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/`}
                                                                    target="_blank"
                                                                    rel="noopener"
                                                                    className="btn btn-sm btn-outline pub-ver"
                                                                >
                                                                    Ver
                                                                </a>

                                                                <a
                                                                    href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/?download=1`}
                                                                    className="btn btn-sm btn-primary pub-descargar"
                                                                >
                                                                    Descargar
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nuevo adjunto */}
                                        <div className="pub-adjuntar border-t border-base-300 p-6">
                                            <div className="mb-3">
                                                <h4 className="font-bold">
                                                    Adjuntar archivo
                                                </h4>

                                                <p className="mt-1 text-sm text-base-content/55">
                                                    Selecciona un documento para agregarlo a este comunicado.
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row">
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
                                                    className="btn btn-outline pub-subir sm:min-w-36"
                                                    disabled={
                                                        subiendoArchivo ||
                                                        !archivoSeleccionado ||
                                                        publicacionParaAdjunto !== publicacion.id
                                                    }
                                                    onClick={subirAdjunto}
                                                >
                                                    {subiendoArchivo &&
                                                    publicacionParaAdjunto === publicacion.id ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-sm" />
                                                            Subiendo...
                                                        </>
                                                    ) : (
                                                        'Subir archivo'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default PublicacionesPage
