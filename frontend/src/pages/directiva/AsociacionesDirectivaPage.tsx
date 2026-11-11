import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type VerificacionResidencia = {
    id: number
    tipo_documento: string
    estado: string
    archivo_url: string | null
    nombre_extraido: string | null
    direccion_extraida: string | null
    comuna_extraida: string | null
    fecha_documento_extraida: string | null
    confianza_ocr: string | number | null
    documento_duplicado: boolean
    observacion_automatica: string | null
}

type AsociacionPendiente = {
    id: number
    username: string
    rut: string | null
    nombres: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    email: string
    sector_id: number
    sector_nombre: string
    junta_id: number
    junta_nombre: string
    estado_asociacion_sector: string
    verificacion_residencia: VerificacionResidencia | null
}
type FiltroEstado =
    | 'GENERAL'
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'RECHAZADA'
    | 'SIN_VERIFICACION'
    | 'REVISION_MANUAL'
function AsociacionesDirectivaPage() {
    const [asociaciones, setAsociaciones] =
        useState<AsociacionPendiente[]>([])

    const [cargando, setCargando] = useState(true)
    const [procesandoId, setProcesandoId] =
        useState<number | null>(null)
    const [
        asociacionSeleccionada,
        setAsociacionSeleccionada,
    ] = useState<AsociacionPendiente | null>(null)

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [
        procesandoVerificacion,
        setProcesandoVerificacion,
    ] = useState(false)

    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('GENERAL')

    const cargarAsociaciones = async () => {
        setCargando(true)
        setError('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/directiva/asociaciones/',
                {
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                setError(
                    'No fue posible cargar las asociaciones pendientes.',
                )
                return
            }

            const data =
                (await response.json()) as AsociacionPendiente[]

            setAsociaciones(data)
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        void cargarAsociaciones()
    }, [])
    const asociacionesFiltradas = asociaciones.filter(
        (asociacion) => {
            switch (filtroEstado) {
                case 'PENDIENTE':
                    return (
                        asociacion.estado_asociacion_sector ===
                        'PENDIENTE'
                    )

                case 'CONFIRMADA':
                    return (
                        asociacion.estado_asociacion_sector ===
                        'CONFIRMADA'
                    )

                case 'RECHAZADA':
                    return (
                        asociacion.estado_asociacion_sector ===
                        'RECHAZADA'
                    )

                case 'SIN_VERIFICACION':
                    return (
                        asociacion.verificacion_residencia === null
                    )

                case 'REVISION_MANUAL':
                    return (
                        asociacion.verificacion_residencia?.estado ===
                        'REVISION_MANUAL'
                    )

                case 'GENERAL':
                default:
                    return true
            }
        },
    )

    const configuracionFiltro = {
        GENERAL: {
            titulo: 'Todas las solicitudes',
            descripcion:
                'Consulta todas las solicitudes de asociación territorial de tu Junta de Vecinos.',
            resumen: 'Total de solicitudes',
        },
        PENDIENTE: {
            titulo: 'Solicitudes pendientes',
            descripcion:
                'Verifica los antecedentes antes de resolver la asociación.',
            resumen: 'Solicitudes pendientes',
        },
        CONFIRMADA: {
            titulo: 'Solicitudes aceptadas',
            descripcion:
                'Asociaciones territoriales que ya fueron confirmadas.',
            resumen: 'Solicitudes aceptadas',
        },
        RECHAZADA: {
            titulo: 'Solicitudes rechazadas',
            descripcion:
                'Asociaciones territoriales que fueron rechazadas.',
            resumen: 'Solicitudes rechazadas',
        },
        SIN_VERIFICACION: {
            titulo: 'Sin verificación',
            descripcion:
                'Vecinos que no poseen verificación de residencia registrada.',
            resumen: 'Sin verificación',
        },
        REVISION_MANUAL: {
            titulo: 'Revisión manual',
            descripcion:
                'Comprobantes de residencia que requieren revisión manual.',
            resumen: 'Revisión manual',
        },
    }[filtroEstado]
    const resolverAsociacion = async (
        usuarioId: number,
        accion: 'CONFIRMAR' | 'RECHAZAR',
    ) => {
        setError('')
        setMensaje('')
        setProcesandoId(usuarioId)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/directiva/resolver-asociacion-sector/${usuarioId}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        accion,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    'No fue posible resolver la asociación.',
                )
                return
            }

            setAsociaciones((actuales) =>
                actuales.map((asociacion) =>
                    asociacion.id === usuarioId
                        ? {
                            ...asociacion,
                            estado_asociacion_sector:
                                accion === 'CONFIRMAR'
                                    ? 'CONFIRMADA'
                                    : 'RECHAZADA',
                        }
                        : asociacion,
                ),
            )

            setMensaje(
                accion === 'CONFIRMAR'
                    ? 'Asociación confirmada correctamente.'
                    : 'Asociación rechazada correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setProcesandoId(null)
        }
    }

    const resolverVerificacion = async (
        accion: 'REVISION_MANUAL' | 'VALIDAR',
    ) => {
        const verificacion =
            asociacionSeleccionada?.verificacion_residencia

        if (!verificacion) {
            return
        }

        setError('')
        setMensaje('')
        setProcesandoVerificacion(true)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/directiva/verificaciones-residencia/${verificacion.id}/resolver/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        accion,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    'No fue posible actualizar la verificación.',
                )
                return
            }

            setAsociaciones((actuales) =>
                actuales.map((asociacion) => {
                    if (
                        asociacion.id !==
                        asociacionSeleccionada.id
                    ) {
                        return asociacion
                    }

                    if (!asociacion.verificacion_residencia) {
                        return asociacion
                    }

                    return {
                        ...asociacion,
                        verificacion_residencia: {
                            ...asociacion.verificacion_residencia,
                            estado: data.estado,
                        },
                    }
                }),
            )

            setAsociacionSeleccionada((actual) => {
                if (
                    !actual ||
                    !actual.verificacion_residencia
                ) {
                    return actual
                }

                return {
                    ...actual,
                    verificacion_residencia: {
                        ...actual.verificacion_residencia,
                        estado: data.estado,
                    },
                }
            })

            setMensaje(
                accion === 'VALIDAR'
                    ? 'Verificación validada correctamente.'
                    : 'Verificación enviada a revisión manual.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setProcesandoVerificacion(false)
        }
    }



    const obtenerNombreCompleto = (
        asociacion: AsociacionPendiente,
    ) => {
        return [
            asociacion.nombres,
            asociacion.apellido_paterno,
            asociacion.apellido_materno,
        ]
            .filter(Boolean)
            .join(' ') || asociacion.username
    }

    const obtenerIniciales = (
        asociacion: AsociacionPendiente,
    ) => {
        const nombre = obtenerNombreCompleto(asociacion)

        return nombre
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) =>
                parte.charAt(0).toUpperCase(),
            )
            .join('')
    }

    return (
        <main className="apt-asociaciones min-h-screen px-4 py-8">
            <style>{`
/* Asociación territorial · APT · estilo bosque y dorado · solo presentación */
.apt-asociaciones {
  --apt-crema: #f7f1dc;
  --apt-dorado: #e7bf69;
  --apt-borde: rgba(226,188,106,.57);
  color: var(--apt-crema);
  position: relative;
  isolation: isolate;
  background: #0a2118;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.apt-asociaciones::before {
  content: "";
  position: fixed;
  z-index: -2;
  inset: 0;
  background-image: linear-gradient(105deg,rgba(3,27,20,.80),rgba(9,34,27,.61) 52%,rgba(3,21,17,.82)),url('/images/photo-1600596542815-ffad4c1539a9.jpg');
  background-size: cover;
  background-position: center center;
}
.apt-asociaciones::after {
  content: "";
  pointer-events: none;
  position: fixed;
  z-index: -1;
  inset: 0;
  background: linear-gradient(180deg,rgba(4,22,15,.10),rgba(2,16,12,.31));
}
.apt-asociaciones :is(h1,h2,h3,h4) { font-family: Georgia, 'Times New Roman', serif; color: #fff5d7; letter-spacing: -.025em; }
.apt-asociaciones h1 { font-size: clamp(1.8rem,3.8vw,2.55rem); }
.apt-asociaciones .apt-asociaciones-hero,
.apt-asociaciones .apt-asociaciones-stat,
.apt-asociaciones .apt-asociaciones-tabla,
.apt-asociaciones .apt-asociaciones-vacio,
.apt-asociaciones .apt-asociaciones-modal {
  border: 1px solid var(--apt-borde);
  box-shadow: 0 20px 45px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,240,192,.10);
  color: var(--apt-crema);
}
.apt-asociaciones .apt-asociaciones-hero {
  background-image:linear-gradient(100deg,rgba(3,33,24,.95),rgba(4,39,29,.76) 60%,rgba(6,31,26,.71)),url('/images/photo-1477959858617-67f85cf4f1df.jpg');
  background-size:cover;
  background-position:center 47%;
}
.apt-asociaciones .apt-asociaciones-stat {
  min-height: 134px;
  background-position: center;
  background-size: cover;
  transition: transform .2s ease, border-color .2s ease;
}
.apt-asociaciones .apt-asociaciones-stat:hover { transform:translateY(-2px);border-color:#f5d99b; }
.apt-asociaciones .apt-asociaciones-stat-uno {
  background-image:linear-gradient(115deg,rgba(3,38,28,.94),rgba(4,41,29,.78)),url('/images/photo-1600607687920-4e2a09cf159d.jpg');
}
.apt-asociaciones .apt-asociaciones-stat-dos {
  background-image:linear-gradient(115deg,rgba(5,34,27,.94),rgba(6,39,31,.74)),url('/images/photo-1497366754035-f200968a6e72.jpg');
}
.apt-asociaciones .apt-asociaciones-stat-tres {
  background-image:linear-gradient(115deg,rgba(3,38,28,.95),rgba(4,42,31,.76)),url('/images/photo-1494526585095-c41746248156.jpg');
}
.apt-asociaciones .apt-asociaciones-stat .text-3xl,
.apt-asociaciones .apt-asociaciones-stat .text-xl { color: #f6d68c; font-family: Georgia, serif; }
.apt-asociaciones .apt-asociaciones-titulo {
  padding: 1.1rem 1.35rem;
  border: 1px solid var(--apt-borde);
  border-radius: 1rem;
  background-image:linear-gradient(105deg,rgba(5,39,29,.96),rgba(7,36,29,.82)),url('/images/photo-1497366811353-6870744d04b2.jpg');
  background-position:center;
  background-size:cover;
}
.apt-asociaciones .apt-asociaciones-tabla {
  background-image:linear-gradient(105deg,rgba(5,36,27,.97),rgba(6,36,28,.93)),url('/images/photo-1494526585095-c41746248156.jpg');
  background-size:cover;
  background-position:center;
}
.apt-asociaciones .apt-asociaciones-tabla .table { color: #f5edd6; }
.apt-asociaciones .apt-asociaciones-tabla .table thead {background:rgba(2,23,18,.83)!important;color:#f5d68e;}
.apt-asociaciones .apt-asociaciones-tabla .table th {font-weight:700; white-space:nowrap;}
.apt-asociaciones .apt-asociaciones-tabla .table td,
.apt-asociaciones .apt-asociaciones-tabla .table th {border-bottom:1px solid rgba(221,190,120,.24);padding-top:1rem;padding-bottom:1rem;}
.apt-asociaciones .apt-asociaciones-tabla .table tbody tr:hover {background:rgba(220,188,106,.09)!important;}
.apt-asociaciones .apt-asociaciones-vacio,
.apt-asociaciones .rounded-2xl.bg-base-100 {
  background-image:linear-gradient(115deg,rgba(3,37,28,.94),rgba(4,36,30,.86)),url('/images/photo-1494526585095-c41746248156.jpg');
  background-size:cover;
  background-position:center;
  border-color:var(--apt-borde);
  color:var(--apt-crema);
}
.apt-asociaciones .apt-asociaciones-filtros {
  padding:1rem;
  border:1px solid rgba(226,188,106,.42);
  border-radius:1rem;
  background:rgba(5,35,26,.88);
}
.apt-asociaciones .btn {border-radius:.8rem;font-weight:700;min-height:2.35rem;}
.apt-asociaciones .btn-primary,
.apt-asociaciones .btn-success {
  background:#d9ac59!important;border-color:#edcb81!important;color:#18362a!important;
}
.apt-asociaciones .btn-primary:hover,
.apt-asociaciones .btn-success:hover {background:#f1cd83!important;}
.apt-asociaciones .btn-outline,
.apt-asociaciones .btn-neutral {
  background:rgba(9,42,32,.74)!important;border:1px solid rgba(229,194,119,.76)!important;color:#f9e5b7!important;
}
.apt-asociaciones .btn-outline:hover,
.apt-asociaciones .btn-neutral:hover {background:rgba(209,170,88,.19)!important;}
.apt-asociaciones .btn-error {border-color:#ed9e98!important;}
.apt-asociaciones .btn-warning {border-color:#edca81!important;}
.apt-asociaciones .btn:disabled {opacity:.5;cursor:not-allowed;}
.apt-asociaciones .badge {max-width:100%;font-weight:650;}
.apt-asociaciones .badge-outline,.apt-asociaciones .badge-ghost {
  border-color:rgba(224,187,112,.66)!important;color:#ffedc3!important;background:rgba(14,50,37,.66)!important;
}
.apt-asociaciones .badge-warning {color:#30210c!important;}
.apt-asociaciones .badge-success {background:#247f61;color:white;}
.apt-asociaciones .badge-info {color:#e5f7ff;}
.apt-asociaciones .alert {border:1px solid var(--apt-borde);color:#fff0ce;}
.apt-asociaciones .alert-error {background:#5d2829;color:#fff3e9;}
.apt-asociaciones .alert-success {background:#174a39;color:#f1f8e8;}
.apt-asociaciones .apt-asociaciones-modal {
  background-image:linear-gradient(130deg,rgba(4,35,27,.99),rgba(9,44,34,.97)),url('/images/photo-1497366754035-f200968a6e72.jpg');
  background-position:center;
  background-size:cover;
  max-height:min(88vh,950px);
  overflow-y:auto;
}
.apt-asociaciones .apt-asociaciones-modal .rounded-xl {background-color:rgba(3,27,21,.53);border-color:rgba(225,190,121,.38);}
.apt-asociaciones .apt-asociaciones-modal .text-base-content,
.apt-asociaciones .apt-asociaciones-modal .font-medium,
.apt-asociaciones .apt-asociaciones-modal p {color:#f7edda;}
.apt-asociaciones .apt-asociaciones-overlay {z-index:100;}
.apt-asociaciones .apt-asociaciones-overlay::backdrop {background:rgba(0,0,0,.7);}
.apt-asociaciones [class~="text-base-content/40"],
.apt-asociaciones [class~="text-base-content/45"],
.apt-asociaciones [class~="text-base-content/50"],
.apt-asociaciones [class~="text-base-content/60"],
.apt-asociaciones [class~="text-base-content/70"] {color:#e4dcc9;}
.apt-asociaciones .text-base-content {color:#fff3d6;}
@media(max-width:640px){
  .apt-asociaciones {padding:1rem;}
  .apt-asociaciones .apt-asociaciones-hero {padding:1.1rem;}
  .apt-asociaciones .apt-asociaciones-tabla .table {min-width:950px;}
  .apt-asociaciones .apt-asociaciones-modal {width:calc(100vw - 1.6rem);max-height:87vh;}
}
`}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="apt-asociaciones-hero mb-6 rounded-2xl border p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Asociaciones Territoriales
                                </h1>

                                <span className="badge badge-secondary badge-lg">
                                    Directiva
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Revisa las solicitudes de vecinos que desean asociarse
                                a tu Junta de Vecinos y confirma o rechaza su solicitud.
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

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="apt-asociaciones-stat apt-asociaciones-stat-uno rounded-2xl border p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Solicitudes en la vista
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {asociacionesFiltradas.length}
                                </span>

                                <span className="badge badge-warning badge-outline">
                                    Por revisar
                                </span>
                            </div>
                        </div>

                        <div className="apt-asociaciones-stat apt-asociaciones-stat-dos rounded-2xl border p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Tipo de gestión
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-xl font-bold">
                                    Territorial
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Sectores
                                </span>
                            </div>
                        </div>

                        <div className="apt-asociaciones-stat apt-asociaciones-stat-tres rounded-2xl border p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                            <p className="text-sm font-medium text-base-content/60">
                                Estado
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-xl font-bold">
                                    Gestión activa
                                </span>

                                <span className="badge badge-success">
                                    Disponible
                                </span>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Cargando */}
                {cargando && (
                    <div className="apt-asociaciones-vacio rounded-2xl border p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando asociaciones pendientes...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        {/* Filtros por estado */}
                        <div className="apt-asociaciones-filtros mb-6 flex flex-wrap gap-2">
                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'GENERAL'
                                    ? 'btn-primary'
                                    : 'btn-outline'
                                    }`}
                                onClick={() => setFiltroEstado('GENERAL')}
                            >
                                General
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'PENDIENTE'
                                    ? 'btn-warning'
                                    : 'btn-outline'
                                    }`}
                                onClick={() => setFiltroEstado('PENDIENTE')}
                            >
                                Pendientes
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'CONFIRMADA'
                                    ? 'btn-success'
                                    : 'btn-outline'
                                    }`}
                                onClick={() => setFiltroEstado('CONFIRMADA')}
                            >
                                Aceptadas
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'RECHAZADA'
                                    ? 'btn-error'
                                    : 'btn-outline'
                                    }`}
                                onClick={() => setFiltroEstado('RECHAZADA')}
                            >
                                Rechazadas
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'SIN_VERIFICACION'
                                    ? 'btn-neutral'
                                    : 'btn-outline'
                                    }`}
                                onClick={() =>
                                    setFiltroEstado('SIN_VERIFICACION')
                                }
                            >
                                Sin verificación
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${filtroEstado === 'REVISION_MANUAL'
                                    ? 'btn-info'
                                    : 'btn-outline'
                                    }`}
                                onClick={() =>
                                    setFiltroEstado('REVISION_MANUAL')
                                }
                            >
                                Revisión manual
                            </button>
                        </div>
                        {/* Título sección */}
                        <div className="apt-asociaciones-titulo mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {configuracionFiltro.titulo}
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    {configuracionFiltro.descripcion}
                                </p>
                            </div>

                            {asociacionesFiltradas.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {asociacionesFiltradas.length}{' '}
                                    {asociacionesFiltradas.length === 1
                                        ? 'solicitud'
                                        : 'solicitudes'}
                                </span>
                            )}
                        </div>

                        {asociacionesFiltradas.length === 0 ? (
                            <div className="apt-asociaciones-vacio rounded-2xl border p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                                        ✓
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No hay solicitudes en esta vista
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Todas las solicitudes territoriales se encuentran
                                        resueltas por el momento.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="apt-asociaciones-tabla overflow-hidden rounded-2xl border shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Vecino</th>
                                                <th>RUT</th>
                                                <th>Correo</th>
                                                <th>Junta</th>
                                                <th>Sector</th>
                                                <th>Asociación</th>
                                                <th>Verificación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {asociacionesFiltradas.map((asociacion) => {

                                                const nombreCompleto =
                                                    obtenerNombreCompleto(asociacion)

                                                const procesando =
                                                    procesandoId === asociacion.id

                                                const puedeConfirmar =
                                                    asociacion.verificacion_residencia?.estado ===
                                                    'VALIDADA'

                                                return (
                                                    <tr
                                                        key={asociacion.id}
                                                        className="hover"
                                                    >
                                                        <td>
                                                            <div className="flex min-w-[190px] items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-700">
                                                                    {obtenerIniciales(asociacion)}
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold">
                                                                        {nombreCompleto}
                                                                    </p>

                                                                    <p className="text-xs text-base-content/50">
                                                                        @{asociacion.username}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="whitespace-nowrap">
                                                                {asociacion.rut ?? '-'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className="break-all text-sm">
                                                                {asociacion.email}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className="font-medium">
                                                                {asociacion.junta_nombre}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex min-w-[120px] items-center">
                                                                <span className="badge badge-info badge-outline whitespace-nowrap px-3">
                                                                    {asociacion.sector_nombre}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={
                                                                    asociacion.estado_asociacion_sector ===
                                                                        'CONFIRMADA'
                                                                        ? 'badge badge-success whitespace-nowrap'
                                                                        : asociacion.estado_asociacion_sector ===
                                                                            'RECHAZADA'
                                                                            ? 'badge badge-error badge-outline whitespace-nowrap'
                                                                            : 'badge badge-warning badge-outline whitespace-nowrap'
                                                                }
                                                            >
                                                                {asociacion.estado_asociacion_sector ===
                                                                    'CONFIRMADA'
                                                                    ? 'Aceptada'
                                                                    : asociacion.estado_asociacion_sector ===
                                                                        'RECHAZADA'
                                                                        ? 'Rechazada'
                                                                        : 'Pendiente'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {asociacion.verificacion_residencia ? (
                                                                <span
                                                                    className={`badge min-w-[130px] whitespace-nowrap px-3 ${asociacion.verificacion_residencia.estado ===
                                                                        'RECHAZADA'
                                                                        ? 'badge-error'
                                                                        : asociacion.verificacion_residencia.estado ===
                                                                            'VALIDADA'
                                                                            ? 'badge-success'
                                                                            : 'badge-warning'
                                                                        }`}
                                                                >
                                                                    {asociacion.verificacion_residencia.estado ===
                                                                        'REVISION_MANUAL'
                                                                        ? 'Revisión manual'
                                                                        : asociacion.verificacion_residencia.estado}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-ghost">
                                                                    Sin verificación
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="flex min-w-[190px] justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline"
                                                                    onClick={() =>
                                                                        setAsociacionSeleccionada(
                                                                            asociacion
                                                                        )
                                                                    }
                                                                >
                                                                    Ver verificación
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    disabled={
                                                                        procesando ||
                                                                        !puedeConfirmar
                                                                    }
                                                                    onClick={() =>
                                                                        void resolverAsociacion(
                                                                            asociacion.id,
                                                                            'CONFIRMAR',
                                                                        )
                                                                    }
                                                                >
                                                                    {procesando && (
                                                                        <span className="loading loading-spinner loading-xs" />
                                                                    )}

                                                                    Confirmar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-error btn-outline"
                                                                    disabled={procesando}
                                                                    onClick={() =>
                                                                        void resolverAsociacion(
                                                                            asociacion.id,
                                                                            'RECHAZAR',
                                                                        )
                                                                    }
                                                                >
                                                                    Rechazar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {asociacionSeleccionada && (
                    <dialog className="apt-asociaciones-overlay modal modal-open">
                        <div className="apt-asociaciones-modal modal-box max-w-3xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold">
                                        Verificación de residencia
                                    </h3>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        {obtenerNombreCompleto(
                                            asociacionSeleccionada
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-circle btn-ghost"
                                    onClick={() =>
                                        setAsociacionSeleccionada(null)
                                    }
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mt-6">
                                {asociacionSeleccionada.verificacion_residencia ? (
                                    (() => {
                                        const verificacion =
                                            asociacionSeleccionada.verificacion_residencia

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/50 p-4">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                                            Estado de verificación
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold">
                                                            Verificación de domicilio
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`badge badge-lg ${verificacion.estado === 'RECHAZADA'
                                                            ? 'badge-error'
                                                            : verificacion.estado === 'VALIDADA'
                                                                ? 'badge-success'
                                                                : 'badge-warning'
                                                            }`}
                                                    >
                                                        {verificacion.estado === 'REVISION_MANUAL'
                                                            ? 'REVISIÓN MANUAL'
                                                            : verificacion.estado}
                                                    </span>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-base-300 p-4">
                                                        <p className="text-xs font-semibold uppercase text-base-content/50">
                                                            Tipo de comprobante
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {verificacion.tipo_documento}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-base-300 p-4">
                                                        <p className="text-xs font-semibold uppercase text-base-content/50">
                                                            Fecha detectada
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {verificacion.fecha_documento_extraida
                                                                ? new Date(
                                                                    `${verificacion.fecha_documento_extraida}T00:00:00`,
                                                                ).toLocaleDateString('es-CL')
                                                                : 'No detectada'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-base-300 p-4">
                                                        <p className="text-xs font-semibold uppercase text-base-content/50">
                                                            Nombre detectado
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {verificacion.nombre_extraido ?? 'No detectado'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-base-300 p-4">
                                                        <p className="text-xs font-semibold uppercase text-base-content/50">
                                                            Confianza OCR
                                                        </p>

                                                        <p className="mt-1 font-medium">
                                                            {verificacion.confianza_ocr !== null
                                                                ? `${(
                                                                    Number(
                                                                        verificacion.confianza_ocr,
                                                                    ) * 100
                                                                ).toFixed(0)}%`
                                                                : 'No disponible'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-base-300 p-4">
                                                    <p className="text-xs font-semibold uppercase text-base-content/50">
                                                        Dirección detectada
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {verificacion.direccion_extraida ?? 'No detectada'}
                                                    </p>

                                                    <p className="mt-1 text-sm text-base-content/60">
                                                        {verificacion.comuna_extraida ?? 'Comuna no detectada'}
                                                    </p>
                                                </div>

                                                {verificacion.documento_duplicado && (
                                                    <div className="alert alert-warning">
                                                        <span>
                                                            Este mismo archivo ya fue utilizado
                                                            anteriormente en otra verificación.
                                                        </span>
                                                    </div>
                                                )}

                                                {verificacion.observacion_automatica && (
                                                    <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                                        <p className="text-xs font-semibold uppercase text-base-content/50">
                                                            Análisis automático
                                                        </p>

                                                        <p className="mt-2 text-sm leading-6">
                                                            {verificacion.observacion_automatica}
                                                        </p>
                                                    </div>
                                                )}

                                                {verificacion.archivo_url && (
                                                    <a
                                                        href={verificacion.archivo_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline btn-sm"
                                                    >
                                                        Ver comprobante adjunto
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    })()
                                ) : (
                                    <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                        <p className="text-base-content/60">
                                            Este vecino no tiene una verificación
                                            de residencia registrada.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="modal-action">
                                {asociacionSeleccionada.verificacion_residencia?.estado ===
                                    'REVISION_MANUAL' && (
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            disabled={procesandoVerificacion}
                                            onClick={() =>
                                                void resolverVerificacion(
                                                    'VALIDAR',
                                                )
                                            }
                                        >
                                            {procesandoVerificacion && (
                                                <span className="loading loading-spinner loading-xs" />
                                            )}

                                            Validar residencia
                                        </button>
                                    )}
                                {asociacionSeleccionada.verificacion_residencia &&
                                    (
                                        asociacionSeleccionada.verificacion_residencia.estado ===
                                        'PENDIENTE' ||
                                        asociacionSeleccionada.verificacion_residencia.estado ===
                                        'RECHAZADA'
                                    ) && (
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            disabled={procesandoVerificacion}
                                            onClick={() =>
                                                void resolverVerificacion(
                                                    'REVISION_MANUAL',
                                                )
                                            }
                                        >
                                            {procesandoVerificacion && (
                                                <span className="loading loading-spinner loading-xs" />
                                            )}

                                            Enviar a revisión manual
                                        </button>
                                    )}

                                <button
                                    type="button"
                                    className="btn"
                                    disabled={procesandoVerificacion}
                                    onClick={() =>
                                        setAsociacionSeleccionada(null)
                                    }
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="modal-backdrop"
                            onClick={() =>
                                setAsociacionSeleccionada(null)
                            }
                        >
                            cerrar
                        </button>
                    </dialog>
                )}
            </section>
        </main>
    )
}

export default AsociacionesDirectivaPage
