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
            <section className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold">
                    Gestión de Directiva
                </h1>

                <p className="text-base-content/70 mt-2">
                    Administración de integrantes y cargos de la directiva vigente.
                </p>
                {cargando && (
                    <div className="alert mt-4">
                        Cargando información de la directiva...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-4">
                        {error}
                    </div>
                )}
                {!cargando && !error && (
                    <p className="mt-4 text-base-content/70">
                        Cargos disponibles: {cargos.length}
                    </p>
                )}
                {!cargando && !error && (
                    <div className="mt-6">
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-3">
                                Integrantes actuales
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Usuario</th>
                                            <th>Cargo</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {integrantesActuales.map((integrante) => (
                                            <tr key={integrante.id}>
                                                <td>
                                                    {[
                                                        integrante.usuario_nombres,
                                                        integrante.usuario_apellido_paterno,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ') || '-'}
                                                </td>

                                                <td>
                                                    {integrante.usuario_username}
                                                </td>

                                                <td>
                                                    {integrante.cargo_nombre}
                                                </td>

                                                <td>
                                                    {integrante.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </td>
                                                <td>
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
                                                </td>
                                            </tr>
                                        ))}

                                        {integrantesActuales.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center text-base-content/60"
                                                >
                                                    No existen integrantes registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow mb-6">
                            <div className="card-body">
                                <h3 className="card-title">
                                    Asignar integrante
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text">
                                                Usuario
                                            </span>
                                        </label>

                                        <select
                                            className="select select-bordered w-full"
                                            value={usuarioSeleccionado}
                                            onChange={(event) =>
                                                setUsuarioSeleccionado(event.target.value)
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
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text">
                                                Cargo
                                            </span>
                                        </label>

                                        <select
                                            className="select select-bordered w-full"
                                            value={cargoSeleccionado}
                                            onChange={(event) =>
                                                setCargoSeleccionado(event.target.value)
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
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-4">
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
                                        {guardandoAsignacion
                                            ? 'Asignando...'
                                            : 'Asignar integrante'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {integranteReasignando && (
                            <div className="card bg-base-100 shadow mb-6">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        Reasignar cargo
                                    </h3>

                                    <p className="text-base-content/70">
                                        Usuario: {integranteReasignando.usuario_username}
                                    </p>

                                    <p className="text-base-content/70">
                                        Cargo actual: {integranteReasignando.cargo_nombre}
                                    </p>

                                    <div className="mt-4">
                                        <label className="label">
                                            <span className="label-text">
                                                Nuevo cargo
                                            </span>
                                        </label>

                                        <select
                                            className="select select-bordered w-full"
                                            value={nuevoCargoSeleccionado}
                                            onChange={(event) =>
                                                setNuevoCargoSeleccionado(
                                                    event.target.value
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
                                                                integranteReasignando.id
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
                                                <p className="text-sm text-warning mt-2">
                                                    No existen otros cargos disponibles para reasignar.
                                                </p>
                                            )}
                                    </div>

                                    <div className="card-actions justify-end mt-4">
                                        <button
                                            type="button"
                                            className="btn"
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
                                            {reasignandoCargo
                                                ? 'Reasignando...'
                                                : 'Confirmar reasignación'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-3">
                            Usuarios elegibles
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Usuario</th>
                                        <th>RUT</th>
                                        <th>Sector</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuariosElegibles.map((usuario) => (
                                        <tr key={usuario.id}>
                                            <td>
                                                {[
                                                    usuario.nombres,
                                                    usuario.apellido_paterno,
                                                    usuario.apellido_materno,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ') || '-'}
                                            </td>

                                            <td>{usuario.username}</td>

                                            <td>{usuario.rut ?? '-'}</td>

                                            <td>{usuario.sector_nombre}</td>
                                        </tr>
                                    ))}
                                    {usuariosElegibles.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center text-base-content/60"
                                            >
                                                No existen usuarios elegibles para asignar a la Directiva.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <Link
                    to={
                        directivaIdDesdeUrl
                            ? '/admin/directivas'
                            : '/directiva'
                    }
                    className="btn btn-outline mt-4"
                >
                    {directivaIdDesdeUrl
                        ? 'Volver a Gestión de Directivas'
                        : 'Volver al Panel de Directiva'}
                </Link>
            </section>
        </main>
    )
}

export default GestionDirectivaPage