import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
    id: number
    nombre: string
    comuna: string
    activa: boolean
}

type Sector = {
    id: number
    junta_vecinos: number
    junta_nombre: string
    nombre: string
    descripcion: string | null
    activo: boolean
    fecha_creacion: string
}

const estilosSectores = String.raw`
/* APT | Gestión de Sectores
   Estilo aislado de esta página: no afecta a otras rutas ni al backend.
   Los fondos se reutilizan desde frontend/public. */

.apt-sectores {
  --color-base-100: #152e24;
  --color-base-200: #203d30;
  --color-base-300: #697765;
  --color-base-content: #f5efdd;
  --color-primary: #dabb65;
  --color-primary-content: #112a20;
  --color-success: #53c9a0;
  --color-success-content: #0b251a;
  --color-info: #89c3cd;
  --color-info-content: #0e2933;
  --color-warning: #e7c66b;
  --color-warning-content: #302309;
  --color-error: #e8898a;
  --color-error-content: #300b0e;

  min-height: 100vh;
  color: #f5efdd;
  background-color: #10291f;
  background-image:
    linear-gradient(115deg, rgba(5, 28, 20, .75), rgba(5, 28, 20, .54)),
    url('/casitas.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.apt-sectores > section { position: relative; }

.apt-sectores h1,
.apt-sectores h2,
.apt-sectores h3 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.apt-sectores h1 {
  font-size: clamp(2.05rem, 3vw, 3.2rem);
}

.apt-sectores h2 {
  font-size: clamp(1.55rem, 2.5vw, 2.15rem);
}

.apt-sectores .apt-sectores-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .84), rgba(8, 42, 30, .78)),
    url('/directivas-inicio.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(210, 179, 92, .43);
  box-shadow: 0 18px 45px rgba(4, 20, 13, .27);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

/* Tarjetas y contenedores de datos existentes */
.apt-sectores .bg-base-100 {
  background-color: rgba(15, 43, 31, .89);
  border-color: rgba(215, 183, 96, .38);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
}

.apt-sectores .apt-sectores-estadisticas > div {
  border-radius: 1.2rem;
  padding: 1.4rem;
  background-color: rgba(16, 43, 32, .91);
  border: 1px solid rgba(215, 183, 96, .4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Fotografía sutil dentro de cada indicador: misma estética de las
   tarjetas del Panel de Administración, conservando el contraste. */
.apt-sectores .apt-sectores-estadisticas > div {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .2s ease, transform .2s ease;
}

.apt-sectores .apt-sectores-estadisticas > div:hover {
  border-color: rgba(235, 205, 123, .75);
  transform: translateY(-2px);
}

.apt-sectores .apt-sectores-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/sector.webp');
}

.apt-sectores .apt-sectores-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casas.webp');
}

.apt-sectores .apt-sectores-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casitas.webp');
}

.apt-sectores .apt-sectores-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/junta-v.jpg');
}

.apt-sectores .apt-sectores-estadisticas .text-3xl {
  color: #f1cf72;
  font-size: 2.2rem;
  font-weight: 800;
}

.apt-sectores .apt-sectores-filtros {
  border-top: 1px solid rgba(224, 196, 117, .38);
  padding-top: 1.4rem;
}

/* Tablas con encabezados oscuros y filas legibles */
.apt-sectores .apt-sectores-tabla {
  border-color: rgba(215, 183, 96, .43);
  background-color: rgba(13, 38, 27, .94);
}

.apt-sectores .table {
  color: #f4f0e3;
  font-size: .87rem;
}

.apt-sectores .table thead {
  background: rgba(6, 28, 18, .97);
  color: #f0d78b;
}

.apt-sectores .table thead th {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .025em;
  padding-block: 1.05rem;
  white-space: nowrap;
}

.apt-sectores .table tbody tr {
  border-bottom-color: rgba(225, 208, 158, .14);
}

.apt-sectores .table tbody tr:hover {
  background-color: rgba(221, 181, 80, .09);
}

.apt-sectores .table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

/* Entradas de formulario: fondo claro para identificar áreas editables */
.apt-sectores :is(.input, .select, .textarea) {
  color: #142e24;
  background-color: #edf2fa;
  border: 1px solid #c0cdc9;
  border-radius: .7rem;
}

.apt-sectores :is(.input, .select, .textarea)::placeholder {
  color: #5c6d6a;
}

.apt-sectores :is(.input, .select, .textarea):focus-visible {
  border-color: #bd9946;
  outline: 2px solid #e3c36b;
  outline-offset: 2px;
}

.apt-sectores select option {
  color: #17352a;
  background: #f1f4f8;
}

.apt-sectores :is(.input, .select, .textarea):disabled {
  opacity: .72;
  cursor: not-allowed;
}

.apt-sectores .label-text,
.apt-sectores .label-text-alt {
  color: #f1e8d1;
}

/* Marca visual APT: acciones positivas doradas, peligros en rojo. */
.apt-sectores .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline) {
  background: linear-gradient(110deg, #eddba3, #cba747);
  border: 1px solid #debf72;
  color: #102b20;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(6, 21, 13, .17);
}

.apt-sectores .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline):hover {
  background: linear-gradient(110deg, #f6e3ae, #ddbc5d);
  color: #0e2a1c;
  filter: brightness(1.03);
}

.apt-sectores .btn.btn-outline {
  background-color: rgba(225, 196, 114, .07);
  border-color: rgba(225, 196, 114, .65);
  color: #f7ebc7;
}

.apt-sectores .btn.btn-outline:hover {
  background-color: rgba(220, 187, 95, .18);
  border-color: #ebd186;
  color: #fff8e4;
}

/* Acciones peligrosas deben conservar su semántica. */
.apt-sectores .btn.btn-error:not(.btn-outline) {
  background: #ab444b;
  border-color: #db8385;
  color: #fff5f3;
}

.apt-sectores .btn.btn-error.btn-outline {
  color: #ffb0aa;
  border-color: rgba(243, 146, 146, .75);
}

.apt-sectores .btn:focus-visible,
.apt-sectores a:focus-visible {
  outline: 2px solid #efd58c;
  outline-offset: 3px;
}

/* Mantener diferencias útiles de estados y alertas. */
.apt-sectores .badge {
  font-weight: 700;
  border-radius: 999px;
}

.apt-sectores .badge-outline,
.apt-sectores .badge-ghost {
  border-color: rgba(223, 195, 110, .55);
  color: #f3dfac;
}

.apt-sectores .alert-error {
  background-color: rgba(113, 37, 43, .93);
  border: 1px solid rgba(247, 150, 151, .72);
  color: #fff0ee;
}

.apt-sectores .alert-success {
  background-color: rgba(21, 83, 58, .93);
  border: 1px solid rgba(128, 215, 174, .55);
  color: #edfff4;
}

.apt-sectores .alert-info,
.apt-sectores .alert-warning {
  background-color: rgba(88, 70, 35, .9);
  border: 1px solid rgba(235, 202, 119, .59);
  color: #fff5d7;
}

/* Diálogos: misma estética, sin perder formularios ni confirmaciones. */
.apt-sectores .modal-box {
  background: linear-gradient(135deg, #18382a, #11291e);
  border: 1px solid rgba(223, 189, 100, .65);
  color: #f5efdd;
  border-radius: 1.3rem;
  box-shadow: 0 28px 80px rgba(0, 10, 5, .55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.apt-sectores .modal-box .bg-base-200\/60 {
  background-color: rgba(7, 30, 19, .65);
  border: 1px solid rgba(225, 199, 124, .22);
}

.apt-sectores .modal-backdrop {
  background-color: rgba(2, 13, 9, .58);
}

@media (max-width: 640px) {
  .apt-sectores {
    background-attachment: scroll;
  }

  .apt-sectores .apt-sectores-encabezado {
    padding: 1.3rem;
  }

  .apt-sectores .table { font-size: .82rem; }
  .apt-sectores .table thead th { padding-inline: .65rem; }
  .apt-sectores .table tbody td { padding-inline: .65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apt-sectores .btn,
  .apt-sectores .table tbody tr { transition: none; }
}


/* Barra del formulario: fotografía del territorio detrás de una capa verde. */
.apt-sectores .apt-sectores-formulario > div:first-child {
  background-image:
    linear-gradient(115deg, rgba(9, 36, 26, .78), rgba(9, 36, 26, .85)),
    url('/sector.webp');
  background-position: center;
  background-size: cover;
}
.apt-sectores .apt-sectores-formulario {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .92), rgba(8, 34, 24, .87)),
    url('/casitas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-color: rgba(215, 183, 96, .45);
}
.apt-sectores .apt-sectores-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .32);
}
.apt-sectores .apt-sectores-formulario :is(.bg-base-200\/50, .bg-base-200\/70) {
  background: rgba(8, 30, 20, .60);
  border-color: rgba(215, 183, 96, .35);
}
.apt-sectores .apt-sectores-formulario .checkbox {
  border-color: #e1c577;
}
.apt-sectores .apt-sectores-formulario .checkbox:checked {
  background: #d7b758;
  border-color: #e1c577;
  color: #113124;
}
.apt-sectores .apt-sectores-encabezado .badge-warning {
  color: #182d20;
  background-color: #e5c775;
  border-color: #e5c775;
}
.apt-sectores .apt-sectores-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .60);
  padding-inline: .6rem;
}
.apt-sectores .apt-sectores-tabla .btn.btn-warning:not(.btn-outline) {
  color: #102b20;
}
.apt-sectores .apt-sectores-filtros {
  border-top: 1px solid rgba(224, 196, 117, .40);
  padding-top: 1.4rem;
}
.apt-sectores .apt-sectores-filtros h2 {
  margin-bottom: .3rem;
}
.apt-sectores .apt-sectores-tabla .table tbody tr.bg-warning\/5 {
  background-color: rgba(217, 178, 66, .13);
}
.apt-sectores .apt-sectores-tabla .table thead th:last-child,
.apt-sectores .apt-sectores-tabla .table tbody td:last-child {
  text-align: right;
}
/* Bloque de registros con fotografía tenue en toda su superficie. */
.apt-sectores .apt-sectores-listado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .86), rgba(8, 34, 24, .89)),
    url('/sector.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border: 1px solid rgba(215, 183, 96, .44);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 16px 34px rgba(4, 20, 13, .27);
  overflow: hidden;
}

.apt-sectores .apt-sectores-listado .apt-sectores-filtros {
  border-top: 0;
  border-bottom: 1px solid rgba(224, 196, 117, .35);
  padding-top: 0;
  padding-bottom: 1.2rem;
}

.apt-sectores .apt-sectores-listado .apt-sectores-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .94), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}

@media (max-width: 640px) {
  .apt-sectores .apt-sectores-formulario > div:first-child {
    background-position: 60% center;
  }
  .apt-sectores .apt-sectores-listado {
    padding: 1rem;
  }
}
`

function SectoresPage() {
    const [sectores, setSectores] = useState<Sector[]>([])
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [filtroJunta, setFiltroJunta] =
        useState('TODAS')

    const [filtroSector, setFiltroSector] =
        useState('TODOS')
    const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [activo, setActivo] = useState(true)

    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [sectorEditando, setSectorEditando] =
        useState<Sector | null>(null)

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true)
            setError('')

            try {
                const [sectoresResponse, juntasResponse] =
                    await Promise.all([
                        fetch(
                            'http://localhost:8000/api/organizacion/sectores/',
                            {
                                credentials: 'include',
                            },
                        ),
                        fetch(
                            'http://localhost:8000/api/organizacion/juntas/',
                            {
                                credentials: 'include',
                            },
                        ),
                    ])

                if (
                    !sectoresResponse.ok ||
                    !juntasResponse.ok
                ) {
                    setError(
                        'No fue posible cargar la información territorial.',
                    )
                    return
                }

                const sectoresData =
                    (await sectoresResponse.json()) as Sector[]

                const juntasData =
                    (await juntasResponse.json()) as JuntaVecinos[]

                setSectores(sectoresData)
                setJuntas(juntasData)
            } catch {
                setError(
                    'No fue posible comunicarse con el servidor.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarDatos()
    }, [])

    const crearSector: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault()

        setError('')
        setMensaje('')

        if (!juntaSeleccionada) {
            setError('Debe seleccionar una junta de vecinos.')
            return
        }

        setGuardando(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/sectores/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        nombre,
                        descripcion,
                        activo,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    data.nombre?.[0] ??
                    data.junta_vecinos?.[0] ??
                    'No fue posible crear el sector.',
                )
                return
            }

            setSectores((actuales) => [
                ...actuales,
                data as Sector,
            ])

            setJuntaSeleccionada('')
            setNombre('')
            setDescripcion('')
            setActivo(true)

            setMensaje('Sector creado correctamente.')
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }

    const comenzarEdicion = (sector: Sector) => {
        setSectorEditando(sector)

        setJuntaSeleccionada(
            String(sector.junta_vecinos)
        )

        setNombre(sector.nombre)
        setDescripcion(sector.descripcion ?? '')
        setActivo(sector.activo)

        setError('')
        setMensaje('')
    }

    const cancelarEdicion = () => {
        setSectorEditando(null)
        setJuntaSeleccionada('')
        setNombre('')
        setDescripcion('')
        setActivo(true)
        setError('')
        setMensaje('')
    }

    const actualizarSector = async () => {
        if (!sectorEditando) {
            return
        }

        setError('')
        setMensaje('')
        setGuardando(true)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/sectores/${sectorEditando.id}/`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        nombre,
                        descripcion,
                        activo,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    data.nombre?.[0] ??
                    data.junta_vecinos?.[0] ??
                    'No fue posible actualizar el sector.',
                )
                return
            }

            setSectores((actuales) =>
                actuales.map((sector) =>
                    sector.id === data.id
                        ? (data as Sector)
                        : sector,
                ),
            )

            setSectorEditando(null)
            setJuntaSeleccionada('')
            setNombre('')
            setDescripcion('')
            setActivo(true)

            setMensaje(
                'Sector actualizado correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }

    const sectoresActivos =
        sectores.filter((sector) => sector.activo).length

    const sectoresInactivos =
        sectores.length - sectoresActivos

    const juntasActivas =
        juntas.filter((junta) => junta.activa).length


    const sectoresFiltroDisponibles = sectores.filter(
        (sector) =>
            filtroJunta === 'TODAS' ||
            sector.junta_vecinos === Number(filtroJunta),
    )

    const nombresSectoresDisponibles = Array.from(
        new Set(
            sectoresFiltroDisponibles.map(
                (sector) => sector.nombre,
            ),
        ),
    ).sort((a, b) => a.localeCompare(b, 'es'))

    const sectoresFiltrados = sectores.filter((sector) => {
        const coincideJunta =
            filtroJunta === 'TODAS' ||
            sector.junta_vecinos === Number(filtroJunta)

        const coincideSector =
            filtroSector === 'TODOS' ||
            sector.nombre === filtroSector

        return coincideJunta && coincideSector
    })

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString(
            'es-CL',
            {
                dateStyle: 'medium',
            }
        )
    }

    return (
        <main className="apt-sectores min-h-screen px-4 py-8 sm:px-6">
            <style>{estilosSectores}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="apt-sectores-encabezado mb-6 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Sectores
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra los sectores territoriales asociados
                                a cada Junta de Vecinos.
                            </p>
                        </div>

                        <Link
                            to="/admin"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {/* Resumen */}
                {!cargando && (
                    <div className="apt-sectores-estadisticas mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total sectores
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectores.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registrados
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectoresActivos}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {sectoresInactivos}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Juntas disponibles
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Activas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <div
                    className={`apt-sectores-formulario mb-7 overflow-hidden rounded-3xl border bg-base-100 shadow-lg ${sectorEditando
                        ? 'border-amber-500/40'
                        : 'border-cyan-500/30'
                        }`}
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        {sectorEditando
                                            ? 'Editar sector'
                                            : 'Nuevo sector'}
                                    </h2>

                                    <span
                                        className={
                                            sectorEditando
                                                ? 'badge badge-warning badge-outline'
                                                : 'badge badge-info badge-outline'
                                        }
                                    >
                                        {sectorEditando
                                            ? `Editando #${sectorEditando.id}`
                                            : 'Nuevo registro'}
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    {sectorEditando
                                        ? 'Actualiza los datos del sector seleccionado.'
                                        : 'Registra un nuevo sector asociado a una Junta de Vecinos.'}
                                </p>
                            </div>

                            {sectorEditando && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </div>

                    <form
                        className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
                        onSubmit={(event) => {
                            if (sectorEditando) {
                                event.preventDefault()
                                void actualizarSector()
                            } else {
                                void crearSector(event)
                            }
                        }}
                    >
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Junta de Vecinos
                                </span>

                                <span className="label-text-alt text-error">
                                    Obligatorio
                                </span>
                            </div>

                            <select
                                id="junta-vecinos"
                                className="select select-bordered w-full"
                                value={juntaSeleccionada}
                                onChange={(event) =>
                                    setJuntaSeleccionada(event.target.value)
                                }
                                required
                            >
                                <option value="">
                                    Seleccione una junta
                                </option>

                                {juntas.map((junta) => (
                                    <option
                                        key={junta.id}
                                        value={junta.id}
                                    >
                                        {junta.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Nombre del sector
                                </span>

                                <span className="label-text-alt text-error">
                                    Obligatorio
                                </span>
                            </div>

                            <input
                                id="nombre-sector"
                                type="text"
                                className="input input-bordered w-full"
                                value={nombre}
                                onChange={(event) =>
                                    setNombre(event.target.value)
                                }
                                placeholder="Ej: Sector Norte"
                                required
                            />
                        </label>

                        <label className="form-control md:col-span-2">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Descripción
                                </span>

                                <span className="label-text-alt">
                                    Opcional
                                </span>
                            </div>

                            <textarea
                                id="descripcion-sector"
                                className="textarea textarea-bordered min-h-28 w-full resize-y"
                                value={descripcion}
                                onChange={(event) =>
                                    setDescripcion(event.target.value)
                                }
                                placeholder="Describe brevemente el sector..."
                            />

                            <div className="mt-2 flex justify-end">
                                <span className="text-xs text-base-content/40">
                                    {descripcion.length} caracteres
                                </span>
                            </div>
                        </label>

                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary mt-0.5"
                                        checked={activo}
                                        onChange={(event) =>
                                            setActivo(event.target.checked)
                                        }
                                    />

                                    <div>
                                        <p className="font-semibold">
                                            Sector activo
                                        </p>

                                        <p className="mt-1 text-sm text-base-content/60">
                                            Los sectores activos pueden ser
                                            utilizados en las asociaciones
                                            territoriales de los vecinos.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-base-300 pt-5 md:col-span-2">
                            {sectorEditando && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={guardando}
                            >
                                {guardando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {guardando
                                    ? 'Guardando...'
                                    : sectorEditando
                                        ? 'Actualizar sector'
                                        : 'Crear sector'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando sectores...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                      <div className="apt-sectores-listado mb-7">
                        <div className="apt-sectores-filtros mb-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Sectores registrados</h2>
                                <p className="text-sm text-base-content/70">
                                    Revisa y edita los sectores asociados a las juntas.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <label className="form-control w-56">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Junta de Vecinos
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={filtroJunta}
                                        onChange={(event) => {
                                            setFiltroJunta(event.target.value)
                                            setFiltroSector('TODOS')
                                        }}
                                    >
                                        <option value="TODAS">
                                            Todas las juntas
                                        </option>

                                        {juntas.map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={String(junta.id)}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-control w-52">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Sector
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={filtroSector}
                                        onChange={(event) =>
                                            setFiltroSector(event.target.value)
                                        }
                                    >
                                        <option value="TODOS">
                                            Todos los sectores
                                        </option>

                                        {nombresSectoresDisponibles.map(
                                            (nombreSector) => (
                                                <option
                                                    key={nombreSector}
                                                    value={nombreSector}
                                                >
                                                    {nombreSector}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                {sectores.length > 0 && (
                                    <span className="badge badge-outline">
                                        {sectoresFiltrados.length}{' '}
                                        {sectoresFiltrados.length === 1
                                            ? 'sector'
                                            : 'sectores'}
                                    </span>
                                )}
                            </div>
                        </div>

                {sectoresFiltrados.length === 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <div className="mx-auto max-w-md">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-bold text-cyan-700">
                                S
                            </div>

                            <h3 className="text-xl font-bold">
                                No existen sectores registrados
                            </h3>

                            <p className="mt-2 text-base-content/60">
                                Crea el primer sector utilizando el
                                formulario superior.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="apt-sectores-tabla overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="bg-base-200/70">
                                    <tr>
                                        <th>Sector</th>
                                        <th>Junta de Vecinos</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Creación</th>
                                        <th className="text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sectoresFiltrados.map((sector) => (
                                        <tr
                                            key={sector.id}
                                            className={
                                                sectorEditando?.id === sector.id
                                                    ? 'bg-warning/5'
                                                    : 'hover'
                                            }
                                        >
                                            <td>
                                                <div className="flex min-w-[180px] items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-700">
                                                        {sector.nombre
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">
                                                            {sector.nombre}
                                                        </p>

                                                        <p className="mt-1 text-xs text-base-content/45">
                                                            Sector #{sector.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="font-medium">
                                                    {sector.junta_nombre}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="block max-w-xs text-sm text-base-content/70">
                                                    {sector.descripcion ||
                                                        'Sin descripción'}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        sector.activo
                                                            ? 'badge badge-success badge-outline'
                                                            : 'badge badge-ghost'
                                                    }
                                                >
                                                    {sector.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap text-sm text-base-content/60">
                                                {formatearFecha(
                                                    sector.fecha_creacion
                                                )}
                                            </td>

                                            <td>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        className={
                                                            sectorEditando?.id === sector.id
                                                                ? 'btn btn-sm btn-warning'
                                                                : 'btn btn-sm btn-outline'
                                                        }
                                                        disabled={guardando}
                                                        onClick={() =>
                                                            comenzarEdicion(sector)
                                                        }
                                                    >
                                                        {sectorEditando?.id === sector.id
                                                            ? 'Editando'
                                                            : 'Editar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                      </div>
                    </>
                )}
        </section>
        </main >
    )
}

export default SectoresPage
