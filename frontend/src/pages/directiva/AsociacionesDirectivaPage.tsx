import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
}

function AsociacionesDirectivaPage() {
    const [asociaciones, setAsociaciones] =
        useState<AsociacionPendiente[]>([])

    const [cargando, setCargando] = useState(true)
    const [procesandoId, setProcesandoId] =
        useState<number | null>(null)

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const cargarAsociaciones = async () => {
        setCargando(true)
        setError('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/directiva/asociaciones-pendientes/',
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
                actuales.filter(
                    (asociacion) =>
                        asociacion.id !== usuarioId,
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
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
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
                        <div className="rounded-2xl border border-violet-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Solicitudes pendientes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {asociaciones.length}
                                </span>

                                <span className="badge badge-warning badge-outline">
                                    Por revisar
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
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

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
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
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando asociaciones pendientes...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        {/* Título sección */}
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Solicitudes pendientes
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Verifica los datos del vecino antes de resolver la solicitud.
                                </p>
                            </div>

                            {asociaciones.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {asociaciones.length}{' '}
                                    {asociaciones.length === 1
                                        ? 'solicitud'
                                        : 'solicitudes'}
                                </span>
                            )}
                        </div>

                        {asociaciones.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                                        ✓
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen asociaciones pendientes
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Todas las solicitudes territoriales se encuentran
                                        resueltas por el momento.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Vecino</th>
                                                <th>RUT</th>
                                                <th>Correo</th>
                                                <th>Junta</th>
                                                <th>Sector</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {asociaciones.map((asociacion) => {
                                                const nombreCompleto =
                                                    obtenerNombreCompleto(asociacion)

                                                const procesando =
                                                    procesandoId === asociacion.id

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
                                                            <span className="badge badge-info badge-outline">
                                                                {asociacion.sector_nombre}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex min-w-[190px] justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    disabled={procesando}
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
            </section>
        </main>
    )
}

export default AsociacionesDirectivaPage
