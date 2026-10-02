import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type PerfilVecino = {
    username: string
    rut: string | null
    nombres: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    email: string
    fecha_nacimiento: string | null

    sector_id: number | null
    sector_nombre: string | null
    junta_id: number | null
    junta_nombre: string | null
    estado_asociacion_sector:
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'RECHAZADA'
    | null
    fecha_confirmacion_sector: string | null
}

type SectorDisponible = {
    id: number
    junta_vecinos: number
    junta_nombre: string
    nombre: string
    descripcion: string | null
    activo: boolean
}

function MiPerfilPage() {
    const [perfil, setPerfil] = useState<PerfilVecino | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [editando, setEditando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [sectores, setSectores] = useState<SectorDisponible[]>([])
    const [sectorSeleccionado, setSectorSeleccionado] = useState('')
    const [cargandoSectores, setCargandoSectores] = useState(true)
    const [solicitandoSector, setSolicitandoSector] = useState(false)
    const [nombres, setNombres] = useState('')
    const [apellidoPaterno, setApellidoPaterno] = useState('')
    const [apellidoMaterno, setApellidoMaterno] = useState('')
    const [email, setEmail] = useState('')
    const [fechaNacimiento, setFechaNacimiento] = useState('')

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/auth/perfil/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    setError(
                        'No fue posible obtener la información del perfil.',
                    )
                    return
                }

                const data = (await response.json()) as PerfilVecino

                setPerfil(data)

                setNombres(data.nombres ?? '')
                setApellidoPaterno(data.apellido_paterno ?? '')
                setApellidoMaterno(data.apellido_materno ?? '')
                setEmail(data.email ?? '')
                setFechaNacimiento(data.fecha_nacimiento ?? '')
            } catch {
                setError(
                    'No fue posible comunicarse con el servidor.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarPerfil()
    }, [])

    useEffect(() => {
        const cargarSectores = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/sectores-disponibles/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    setError(
                        'No fue posible obtener los sectores disponibles.',
                    )
                    return
                }

                const data =
                    (await response.json()) as SectorDisponible[]

                setSectores(data)
            } catch {
                setError(
                    'No fue posible comunicarse con el servidor.',
                )
            } finally {
                setCargandoSectores(false)
            }
        }

        void cargarSectores()
    }, [])

    const solicitarAsociacionSector = async () => {
        if (!sectorSeleccionado) {
            setError(
                'Debe seleccionar un sector.',
            )
            return
        }

        setError('')
        setMensaje('')
        setSolicitandoSector(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/solicitar-asociacion-sector/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        sector_id: Number(sectorSeleccionado),
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.detail ??
                    'No fue posible solicitar la asociación territorial.',
                )
                return
            }

            const perfilResponse = await fetch(
                'http://localhost:8000/api/auth/perfil/',
                {
                    credentials: 'include',
                },
            )

            if (perfilResponse.ok) {
                const perfilActualizado =
                    (await perfilResponse.json()) as PerfilVecino

                setPerfil(perfilActualizado)
            }

            setSectorSeleccionado('')

            setMensaje(
                'Solicitud de asociación territorial enviada correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setSolicitandoSector(false)
        }
    }

    const guardarPerfil = async () => {
        setError('')
        setMensaje('')
        setGuardando(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/auth/perfil/',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nombres,
                        apellido_paterno: apellidoPaterno,
                        apellido_materno: apellidoMaterno,
                        email,
                        fecha_nacimiento: fechaNacimiento || null,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                const primerError = Object.values(data)
                    .flat()
                    .find((valor) => typeof valor === 'string')

                setError(
                    typeof primerError === 'string'
                        ? primerError
                        : 'No fue posible actualizar el perfil.',
                )

                return
            }

            setPerfil(data.perfil)
            setMensaje(
                data.message ?? 'Perfil actualizado correctamente.',
            )
            setEditando(false)
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }

    const nombreCompleto = perfil
        ? [
            perfil.nombres,
            perfil.apellido_paterno,
            perfil.apellido_materno,
        ]
            .filter(Boolean)
            .join(' ') || perfil.username
        : ''

    const iniciales = nombreCompleto
        ? nombreCompleto
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join('')
        : '?'

    const nombreEstadoAsociacion = (
        estado: PerfilVecino['estado_asociacion_sector']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'Pendiente'
            case 'CONFIRMADA':
                return 'Confirmada'
            case 'RECHAZADA':
                return 'Rechazada'
            default:
                return 'Sin asociación'
        }
    }

    const claseEstadoAsociacion = (
        estado: PerfilVecino['estado_asociacion_sector']
    ) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'badge badge-warning badge-outline'
            case 'CONFIRMADA':
                return 'badge badge-success'
            case 'RECHAZADA':
                return 'badge badge-error badge-outline'
            default:
                return 'badge badge-ghost'
        }
    }

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) {
            return 'Sin información'
        }

        const fechaNormalizada = fecha.includes('T')
            ? new Date(fecha)
            : new Date(`${fecha}T00:00:00`)

        return fechaNormalizada.toLocaleDateString(
            'es-CL',
            {
                dateStyle: 'medium',
            },
        )
    }

    const cancelarEdicion = () => {
        if (!perfil) {
            return
        }

        setNombres(perfil.nombres ?? '')
        setApellidoPaterno(perfil.apellido_paterno ?? '')
        setApellidoMaterno(perfil.apellido_materno ?? '')
        setEmail(perfil.email)
        setFechaNacimiento(perfil.fecha_nacimiento ?? '')
        setError('')
        setEditando(false)
    }

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Mi Perfil
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Revisa y actualiza tus datos personales y
                                administra tu asociación territorial.
                            </p>
                        </div>

                        <Link
                            to="/vecino"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando información del perfil...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Mensaje */}
                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {!cargando && perfil && (
                    <>
                        {/* Resumen del perfil */}
                        <div className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                            <div className="p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                                            {iniciales}
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {nombreCompleto}
                                            </h2>

                                            <p className="mt-1 text-base-content/60">
                                                @{perfil.username}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span
                                                    className={claseEstadoAsociacion(
                                                        perfil.estado_asociacion_sector
                                                    )}
                                                >
                                                    {nombreEstadoAsociacion(
                                                        perfil.estado_asociacion_sector
                                                    )}
                                                </span>

                                                {perfil.junta_nombre && (
                                                    <span className="badge badge-outline">
                                                        {perfil.junta_nombre}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!editando && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setMensaje('')
                                                setEditando(true)
                                            }}
                                        >
                                            Editar perfil
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">

                            {/* Información personal */}
                            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="border-b border-base-300 p-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Información personal
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Datos asociados a tu cuenta de vecino.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {!editando ? (
                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Nombre de usuario
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.username}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    RUT
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.rut ?? 'Sin información'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Nombres
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.nombres ?? 'Sin información'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Apellido paterno
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.apellido_paterno ?? 'Sin información'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Apellido materno
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.apellido_materno || 'Sin información'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Correo electrónico
                                                </p>

                                                <p className="mt-1 break-words font-semibold">
                                                    {perfil.email}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4 sm:col-span-2">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Fecha de nacimiento
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatearFecha(
                                                        perfil.fecha_nacimiento
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-5 sm:grid-cols-2">

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Nombre de usuario
                                                    </span>

                                                    <span className="label-text-alt">
                                                        No editable
                                                    </span>
                                                </div>

                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full bg-base-200"
                                                    value={perfil.username}
                                                    disabled
                                                />
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        RUT
                                                    </span>

                                                    <span className="label-text-alt">
                                                        No editable
                                                    </span>
                                                </div>

                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full bg-base-200"
                                                    value={perfil.rut ?? ''}
                                                    disabled
                                                />
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Nombres
                                                    </span>
                                                </div>

                                                <input
                                                    id="perfil-nombres"
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={nombres}
                                                    onChange={(event) =>
                                                        setNombres(event.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Apellido paterno
                                                    </span>
                                                </div>

                                                <input
                                                    id="perfil-apellido-paterno"
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={apellidoPaterno}
                                                    onChange={(event) =>
                                                        setApellidoPaterno(event.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Apellido materno
                                                    </span>
                                                </div>

                                                <input
                                                    id="perfil-apellido-materno"
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={apellidoMaterno}
                                                    onChange={(event) =>
                                                        setApellidoMaterno(event.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Correo electrónico
                                                    </span>
                                                </div>

                                                <input
                                                    id="perfil-email"
                                                    type="email"
                                                    className="input input-bordered w-full"
                                                    value={email}
                                                    onChange={(event) =>
                                                        setEmail(event.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="form-control sm:col-span-2">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Fecha de nacimiento
                                                    </span>
                                                </div>

                                                <input
                                                    id="perfil-fecha-nacimiento"
                                                    type="date"
                                                    className="input input-bordered w-full"
                                                    value={fechaNacimiento}
                                                    onChange={(event) =>
                                                        setFechaNacimiento(event.target.value)
                                                    }
                                                />
                                            </label>

                                            <div className="flex flex-wrap justify-end gap-3 border-t border-base-300 pt-5 sm:col-span-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    disabled={guardando}
                                                    onClick={cancelarEdicion}
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    disabled={guardando}
                                                    onClick={() =>
                                                        void guardarPerfil()
                                                    }
                                                >
                                                    {guardando && (
                                                        <span className="loading loading-spinner loading-sm" />
                                                    )}

                                                    {guardando
                                                        ? 'Guardando...'
                                                        : 'Guardar cambios'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Asociación territorial */}
                            <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-base-100 shadow-sm">
                                <div className="border-b border-base-300 p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                Asociación territorial
                                            </h2>

                                            <p className="mt-1 text-base-content/60">
                                                Sector y Junta de Vecinos vinculados
                                                a tu cuenta.
                                            </p>
                                        </div>

                                        <span
                                            className={claseEstadoAsociacion(
                                                perfil.estado_asociacion_sector
                                            )}
                                        >
                                            {nombreEstadoAsociacion(
                                                perfil.estado_asociacion_sector
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {perfil.sector_id ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Junta de Vecinos
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.junta_nombre ?? '-'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-base-200/60 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                    Sector
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {perfil.sector_nombre ?? '-'}
                                                </p>
                                            </div>

                                            {perfil.fecha_confirmacion_sector && (
                                                <div className="rounded-xl bg-base-200/60 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                        Fecha de confirmación
                                                    </p>

                                                    <p className="mt-1 font-semibold">
                                                        {formatearFecha(
                                                            perfil.fecha_confirmacion_sector
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-base-200/60 p-4">
                                            <p className="font-semibold">
                                                Aún no tienes un sector asociado
                                            </p>

                                            <p className="mt-1 text-sm text-base-content/60">
                                                Selecciona tu sector para enviar
                                                una solicitud de asociación.
                                            </p>
                                        </div>
                                    )}

                                    {(
                                        perfil.estado_asociacion_sector === null ||
                                        perfil.estado_asociacion_sector === 'RECHAZADA'
                                    ) && (
                                            <div className="mt-5 border-t border-base-300 pt-5">
                                                <label className="form-control">
                                                    <div className="label">
                                                        <span className="label-text font-semibold">
                                                            Sector
                                                        </span>
                                                    </div>

                                                    <select
                                                        className="select select-bordered w-full"
                                                        value={sectorSeleccionado}
                                                        onChange={(event) =>
                                                            setSectorSeleccionado(
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            cargandoSectores ||
                                                            solicitandoSector
                                                        }
                                                    >
                                                        <option value="">
                                                            Seleccione un sector
                                                        </option>

                                                        {sectores.map((sector) => (
                                                            <option
                                                                key={sector.id}
                                                                value={sector.id}
                                                            >
                                                                {sector.junta_nombre}
                                                                {' - '}
                                                                {sector.nombre}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {cargandoSectores && (
                                                        <span className="mt-2 text-xs text-base-content/50">
                                                            Cargando sectores disponibles...
                                                        </span>
                                                    )}
                                                </label>

                                                {sectorSeleccionado && (
                                                    <div className="mt-3 rounded-xl bg-base-200/60 p-4">
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                sectores.find(
                                                                    (sector) =>
                                                                        String(sector.id) ===
                                                                        sectorSeleccionado
                                                                )?.nombre
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-base-content/60">
                                                            {
                                                                sectores.find(
                                                                    (sector) =>
                                                                        String(sector.id) ===
                                                                        sectorSeleccionado
                                                                )?.descripcion ||
                                                                'Sin descripción adicional.'
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn btn-primary mt-4 w-full"
                                                    disabled={
                                                        cargandoSectores ||
                                                        solicitandoSector ||
                                                        !sectorSeleccionado
                                                    }
                                                    onClick={() =>
                                                        void solicitarAsociacionSector()
                                                    }
                                                >
                                                    {solicitandoSector && (
                                                        <span className="loading loading-spinner loading-sm" />
                                                    )}

                                                    {solicitandoSector
                                                        ? 'Enviando solicitud...'
                                                        : 'Solicitar asociación'}
                                                </button>
                                            </div>
                                        )}

                                    {perfil.estado_asociacion_sector === 'CONFIRMADA' && (
                                        <div className="alert alert-success mt-5">
                                            <span>
                                                Tu asociación territorial se
                                                encuentra confirmada.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}

export default MiPerfilPage
