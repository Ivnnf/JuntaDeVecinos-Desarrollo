import { useEffect, useState } from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router-dom'


type UsuarioElegible = {
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

type IntegranteDirectivaActual = {
    id: number
    directiva: number
    usuario: number
    usuario_username: string
    usuario_nombres: string
    usuario_apellido_paterno: string
    cargo: number
    cargo_nombre: string
    junta_id: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    activo: boolean
}

type Cargo = {
    id: number
    nombre: string
    descripcion: string | null
    permite_multiples: boolean
    activo: boolean
}

function GestionDirectivaPage() {
    const [searchParams] = useSearchParams()

    const directivaIdDesdeUrl =
        searchParams.get('directivaId')

    const [usuariosElegibles, setUsuariosElegibles] =
        useState<UsuarioElegible[]>([])

    const [integrantesActuales, setIntegrantesActuales] =
        useState<IntegranteDirectivaActual[]>([])

    const [cargos, setCargos] =
        useState<Cargo[]>([])

    const [usuarioSeleccionado, setUsuarioSeleccionado] =
        useState('')

    const [cargoSeleccionado, setCargoSeleccionado] =
        useState('')

    const [guardandoAsignacion, setGuardandoAsignacion] =
        useState(false)

    const [directivaId, setDirectivaId] =
        useState<number | null>(null)

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [integranteReasignando, setIntegranteReasignando] =
        useState<IntegranteDirectivaActual | null>(null)

    const [nuevoCargoSeleccionado, setNuevoCargoSeleccionado] =
        useState('')

    const [reasignandoCargo, setReasignandoCargo] =
        useState(false)

    useEffect(() => {
        const cargarDirectivaActual = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/organizacion/integrantes-directiva/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible obtener la directiva actual.',
                    )
                }

                const data =
                    (await response.json()) as IntegranteDirectivaActual[]

                // Si viene una Directiva en la URL, estamos entrando
                // desde el Panel de Administración.
                if (directivaIdDesdeUrl) {
                    const idDirectiva = Number(directivaIdDesdeUrl)

                    if (Number.isNaN(idDirectiva)) {
                        throw new Error(
                            'El identificador de la directiva no es válido.',
                        )
                    }

                    setDirectivaId(idDirectiva)

                    setIntegrantesActuales(
                        data.filter(
                            (integrante) =>
                                integrante.directiva === idDirectiva &&
                                integrante.activo,
                        ),
                    )

                    return
                }

                // Si no viene ID en la URL, corresponde al acceso
                // normal de un integrante de Directiva.
                if (data.length === 0) {
                    throw new Error(
                        'No se encontró una directiva vigente asociada al usuario.',
                    )
                }

                setIntegrantesActuales(
                    data.filter(
                        (integrante) =>
                            integrante.directiva === data[0].directiva &&
                            integrante.activo,
                    ),
                )

                setDirectivaId(data[0].directiva)
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

        void cargarDirectivaActual()
    }, [directivaIdDesdeUrl])

    useEffect(() => {
        if (directivaId === null) {
            return
        }

        const cargarUsuariosElegibles = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    `http://localhost:8000/api/organizacion/directivas/${directivaId}/usuarios-elegibles/`,
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los usuarios elegibles.',
                    )
                }

                const data =
                    (await response.json()) as UsuarioElegible[]

                setUsuariosElegibles(data)
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

        void cargarUsuariosElegibles()
    }, [directivaId])

    useEffect(() => {
        const cargarCargos = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/cargos/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los cargos.',
                    )
                }

                const data =
                    (await response.json()) as Cargo[]

                setCargos(
                    data.filter((cargo) => cargo.activo),
                )
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.',
                )
            }
        }

        void cargarCargos()
    }, [])

    const asignarIntegrante = async () => {
        if (
            directivaId === null ||
            !usuarioSeleccionado ||
            !cargoSeleccionado
        ) {
            setError(
                'Debe seleccionar un usuario y un cargo.',
            )
            return
        }

        try {
            setGuardandoAsignacion(true)
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/organizacion/integrantes-directiva/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        directiva: directivaId,
                        usuario: Number(usuarioSeleccionado),
                        cargo: Number(cargoSeleccionado),
                        fecha_inicio: new Date()
                            .toISOString()
                            .slice(0, 10),
                        activo: true,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.usuario?.[0] ??
                    data.cargo?.[0] ??
                    'No fue posible asignar el integrante.',
                )
            }

            setIntegrantesActuales((actuales) => [
                ...actuales,
                data as IntegranteDirectivaActual,
            ])

            setUsuariosElegibles((actuales) =>
                actuales.filter(
                    (usuario) =>
                        usuario.id !== Number(usuarioSeleccionado),
                ),
            )

            setUsuarioSeleccionado('')
            setCargoSeleccionado('')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setGuardandoAsignacion(false)
        }
    }

    const reasignarCargoIntegrante = async () => {
        if (
            integranteReasignando === null ||
            !nuevoCargoSeleccionado
        ) {
            setError(
                'Debe seleccionar un nuevo cargo.',
            )
            return
        }

        try {
            setReasignandoCargo(true)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/organizacion/integrantes-directiva/${integranteReasignando.id}/reasignar/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cargo: Number(nuevoCargoSeleccionado),
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.cargo?.[0] ??
                    'No fue posible reasignar el cargo.',
                )
            }

            setIntegrantesActuales((actuales) =>
                actuales.map((integrante) =>
                    integrante.id === integranteReasignando.id
                        ? (data as IntegranteDirectivaActual)
                        : integrante,
                ),
            )

            setIntegranteReasignando(null)
            setNuevoCargoSeleccionado('')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setReasignandoCargo(false)
        }
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
                                    Gestión de Directiva
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Directiva
                                </span>

                                {directivaIdDesdeUrl && (
                                    <span className="badge badge-secondary badge-outline badge-lg">
                                        Administración
                                    </span>
                                )}
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administración de integrantes y cargos de la directiva vigente.
                            </p>
                        </div>

                        <Link
                            to={
                                directivaIdDesdeUrl
                                    ? '/admin/directivas'
                                    : '/directiva'
                            }
                            className="btn btn-outline"
                        >
                            ←{' '}
                            {directivaIdDesdeUrl
                                ? 'Volver a Gestión de Directivas'
                                : 'Volver al Panel'}
                        </Link>
                    </div>
                </div>

                {/* Estado de carga */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />
                        <span>
                            Cargando información de la directiva...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {!cargando && !error && (
                    <>
                        {/* Resumen */}
                        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Integrantes actuales
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {integrantesActuales.length}
                                    </span>

                                    <span className="badge badge-primary badge-outline">
                                        Activos
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Usuarios elegibles
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {usuariosElegibles.length}
                                    </span>

                                    <span className="badge badge-success badge-outline">
                                        Disponibles
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                                <p className="text-sm font-medium text-base-content/60">
                                    Cargos disponibles
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {cargos.length}
                                    </span>

                                    <span className="badge badge-info badge-outline">
                                        Activos
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Integrantes actuales */}
                        <div className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Integrantes actuales
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Miembros activos y cargos asignados dentro de la directiva.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline badge-lg">
                                        {integrantesActuales.length}{' '}
                                        {integrantesActuales.length === 1
                                            ? 'integrante'
                                            : 'integrantes'}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[820px]">
                                    <thead className="bg-base-200/60">
                                        <tr>
                                            <th className="pl-6">Nombre</th>
                                            <th>Usuario</th>
                                            <th>Cargo</th>
                                            <th>Estado</th>
                                            <th className="pr-6 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {integrantesActuales.map((integrante) => (
                                            <tr
                                                key={integrante.id}
                                                className="transition-colors hover:bg-base-200/50"
                                            >
                                                <td className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                            {(
                                                                integrante.usuario_nombres ||
                                                                integrante.usuario_username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {[
                                                                    integrante.usuario_nombres,
                                                                    integrante.usuario_apellido_paterno,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' ') || '-'}
                                                            </p>

                                                            <p className="text-xs text-base-content/50">
                                                                Integrante de directiva
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="font-medium">
                                                    {integrante.usuario_username}
                                                </td>

                                                <td>
                                                    <span className="badge badge-outline">
                                                        {integrante.cargo_nombre}
                                                    </span>
                                                </td>

                                                <td>
                                                    {integrante.activo ? (
                                                        <span className="badge badge-success">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-ghost">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="pr-6">
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => {
                                                                setIntegranteReasignando(integrante)
                                                                setNuevoCargoSeleccionado('')
                                                            }}
                                                        >
                                                            Reasignar cargo
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {integrantesActuales.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-10 text-center text-base-content/60"
                                                >
                                                    No existen integrantes registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Asignar integrante */}
                        <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-500/30 bg-base-100 shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl font-bold">
                                                Asignar integrante
                                            </h2>

                                            <span className="badge badge-primary badge-outline">
                                                Nueva incorporación
                                            </span>
                                        </div>

                                        <p className="text-base-content/60">
                                            Selecciona un usuario elegible y el cargo que ocupará en la directiva.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {usuariosElegibles.length === 0 ? (
                                    <div className="alert">
                                        <span>
                                            No existen usuarios elegibles para asignar a la Directiva.
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Usuario
                                                    </span>
                                                </div>

                                                <select
                                                    className="select select-bordered w-full"
                                                    value={usuarioSeleccionado}
                                                    onChange={(event) =>
                                                        setUsuarioSeleccionado(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione un usuario
                                                    </option>

                                                    {usuariosElegibles.map((usuario) => (
                                                        <option
                                                            key={usuario.id}
                                                            value={usuario.id}
                                                        >
                                                            {[
                                                                usuario.nombres,
                                                                usuario.apellido_paterno,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' ') || usuario.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Cargo
                                                    </span>
                                                </div>

                                                <select
                                                    className="select select-bordered w-full"
                                                    value={cargoSeleccionado}
                                                    onChange={(event) =>
                                                        setCargoSeleccionado(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione un cargo
                                                    </option>

                                                    {cargos.map((cargo) => (
                                                        <option
                                                            key={cargo.id}
                                                            value={cargo.id}
                                                        >
                                                            {cargo.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={
                                                    guardandoAsignacion ||
                                                    !usuarioSeleccionado ||
                                                    !cargoSeleccionado
                                                }
                                                onClick={() =>
                                                    void asignarIntegrante()
                                                }
                                            >
                                                {guardandoAsignacion && (
                                                    <span className="loading loading-spinner loading-sm" />
                                                )}

                                                {guardandoAsignacion
                                                    ? 'Asignando...'
                                                    : 'Asignar integrante'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Reasignación de cargo */}
                        {integranteReasignando && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-base-100 shadow-sm">
                                <div className="border-b border-base-300 p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-bold">
                                                    Reasignar cargo
                                                </h2>

                                                <span className="badge badge-warning badge-outline">
                                                    Cambio de cargo
                                                </span>
                                            </div>

                                            <p className="text-base-content/60">
                                                Selecciona el nuevo cargo para el integrante indicado.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-5 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl bg-base-200/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                Usuario
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {integranteReasignando.usuario_username}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-base-200/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                Cargo actual
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {integranteReasignando.cargo_nombre}
                                            </p>
                                        </div>
                                    </div>

                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Nuevo cargo
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={nuevoCargoSeleccionado}
                                            onChange={(event) =>
                                                setNuevoCargoSeleccionado(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Seleccione un cargo
                                            </option>

                                            {cargos
                                                .filter((cargo) => {
                                                    if (
                                                        cargo.id === integranteReasignando.cargo
                                                    ) {
                                                        return false
                                                    }

                                                    if (cargo.permite_multiples) {
                                                        return true
                                                    }

                                                    const cargoOcupado =
                                                        integrantesActuales.some(
                                                            (integrante) =>
                                                                integrante.activo &&
                                                                integrante.cargo === cargo.id &&
                                                                integrante.id !==
                                                                integranteReasignando.id,
                                                        )

                                                    return !cargoOcupado
                                                })
                                                .map((cargo) => (
                                                    <option
                                                        key={cargo.id}
                                                        value={cargo.id}
                                                    >
                                                        {cargo.nombre}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>

                                    {cargos.filter((cargo) => {
                                        if (
                                            cargo.id === integranteReasignando.cargo
                                        ) {
                                            return false
                                        }

                                        if (cargo.permite_multiples) {
                                            return true
                                        }

                                        return !integrantesActuales.some(
                                            (integrante) =>
                                                integrante.activo &&
                                                integrante.cargo === cargo.id &&
                                                integrante.id !==
                                                integranteReasignando.id,
                                        )
                                    }).length === 0 && (
                                        <div className="alert alert-warning mt-4">
                                            <span>
                                                No existen otros cargos disponibles para reasignar.
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            disabled={reasignandoCargo}
                                            onClick={() => {
                                                setIntegranteReasignando(null)
                                                setNuevoCargoSeleccionado('')
                                            }}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={
                                                reasignandoCargo ||
                                                !nuevoCargoSeleccionado
                                            }
                                            onClick={() =>
                                                void reasignarCargoIntegrante()
                                            }
                                        >
                                            {reasignandoCargo && (
                                                <span className="loading loading-spinner loading-sm" />
                                            )}

                                            {reasignandoCargo
                                                ? 'Reasignando...'
                                                : 'Confirmar reasignación'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Usuarios elegibles */}
                        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Usuarios elegibles
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Vecinos que actualmente pueden ser asignados a la directiva.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline badge-lg">
                                        {usuariosElegibles.length}{' '}
                                        {usuariosElegibles.length === 1
                                            ? 'disponible'
                                            : 'disponibles'}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[760px]">
                                    <thead className="bg-base-200/60">
                                        <tr>
                                            <th className="pl-6">Nombre</th>
                                            <th>Usuario</th>
                                            <th>RUT</th>
                                            <th className="pr-6">Sector</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {usuariosElegibles.map((usuario) => (
                                            <tr
                                                key={usuario.id}
                                                className="transition-colors hover:bg-base-200/50"
                                            >
                                                <td className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-700">
                                                            {(
                                                                usuario.nombres ||
                                                                usuario.username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {[
                                                                    usuario.nombres,
                                                                    usuario.apellido_paterno,
                                                                    usuario.apellido_materno,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' ') || '-'}
                                                            </p>

                                                            <p className="text-xs text-base-content/50">
                                                                {usuario.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="font-medium">
                                                    {usuario.username}
                                                </td>

                                                <td>
                                                    {usuario.rut ?? '-'}
                                                </td>

                                                <td className="pr-6">
                                                    <span className="badge badge-ghost">
                                                        {usuario.sector_nombre}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {usuariosElegibles.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-10 text-center text-base-content/60"
                                                >
                                                    No existen usuarios elegibles para asignar a la Directiva.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}

export default GestionDirectivaPage
