import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type RolUsuario = {
    id: number
    nombre: string
    activo: boolean
}

type UsuarioAdministracion = {
    id: number
    username: string
    rut: string | null
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    is_active: boolean
    roles: RolUsuario[]

    sector_id: number | null
    sector_nombre: string | null

    junta_id: number | null
    junta_nombre: string | null

    estado_asociacion_sector:
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'RECHAZADA'
    | null
}

type RolDisponible = {
    id: number
    nombre: string
}

function UsuariosPage() {
    const [mostrarCrearMunicipal, setMostrarCrearMunicipal] =
        useState(false)

    const [creandoMunicipal, setCreandoMunicipal] =
        useState(false)

    const [mensaje, setMensaje] =
        useState('')

    const [formMunicipal, setFormMunicipal] = useState({
        username: '',
        rut: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: '',
        confirmar_password: '',
    })
    const [usuarios, setUsuarios] =
        useState<UsuarioAdministracion[]>([])

    const [roles, setRoles] =
        useState<RolDisponible[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [juntaSeleccionada, setJuntaSeleccionada] =
        useState('TODAS')

    const [sectorSeleccionado, setSectorSeleccionado] =
        useState('TODOS')

    const [rolSeleccionado, setRolSeleccionado] =
        useState('TODOS')

    const [usuarioActualizando, setUsuarioActualizando] =
        useState<number | null>(null)

    const [usuarioSesionId, setUsuarioSesionId] =
        useState<number | null>(null)

    const [rolActualizando, setRolActualizando] =
        useState<number | null>(null)

    const [confirmacionRol, setConfirmacionRol] =
        useState<{
            usuarioId: number
            rolId: number
            nombreRol: string
            activo: boolean
        } | null>(null)

    const [confirmacionEstado, setConfirmacionEstado] =
        useState<UsuarioAdministracion | null>(null)

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true)
                setError('')

                const [
                    responseUsuarios,
                    responseRoles,
                    responseSesion,
                ] = await Promise.all([
                    fetch(
                        'http://localhost:8000/api/auth/admin/usuarios/',
                        {
                            credentials: 'include',
                        }
                    ),
                    fetch(
                        'http://localhost:8000/api/auth/admin/roles/',
                        {
                            credentials: 'include',
                        }
                    ),
                    fetch(
                        'http://localhost:8000/api/auth/sesion/',
                        {
                            credentials: 'include',
                        }
                    ),
                ])

                if (!responseUsuarios.ok) {
                    throw new Error(
                        'No fue posible cargar los usuarios.'
                    )
                }

                if (!responseRoles.ok) {
                    throw new Error(
                        'No fue posible cargar los roles.'
                    )
                }

                if (!responseSesion.ok) {
                    throw new Error(
                        'No fue posible obtener la sesión actual.'
                    )
                }

                const usuariosData =
                    await responseUsuarios.json()

                const rolesData =
                    await responseRoles.json()

                const sesionData =
                    await responseSesion.json()

                setUsuarios(usuariosData)
                setRoles(rolesData)
                setUsuarioSesionId(sesionData.id)
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

        cargarDatos()
    }, [])

    const cambiarEstadoUsuario = async (
        usuario: UsuarioAdministracion
    ) => {
        try {
            setUsuarioActualizando(usuario.id)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/auth/admin/usuarios/${usuario.id}/estado/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_active: !usuario.is_active,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible actualizar el usuario.'
                )
            }

            setUsuarios((usuariosActuales) =>
                usuariosActuales.map((usuarioActual) =>
                    usuarioActual.id === usuario.id
                        ? data.usuario
                        : usuarioActual
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setUsuarioActualizando(null)
        }
    }

    const cambiarRolUsuario = async (
        usuarioId: number,
        rolId: number,
        activo: boolean
    ) => {
        try {
            setRolActualizando(usuarioId)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/auth/admin/usuarios/${usuarioId}/rol/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rol_id: rolId,
                        activo: activo,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible actualizar el rol.'
                )
            }

            setUsuarios((usuariosActuales) =>
                usuariosActuales.map((usuarioActual) =>
                    usuarioActual.id === usuarioId
                        ? data.usuario
                        : usuarioActual
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setRolActualizando(null)
        }
    }
    const crearUsuarioMunicipal = async () => {
        try {
            setCreandoMunicipal(true)
            setError('')
            setMensaje('')

            const response = await fetch(
                'http://localhost:8000/api/auth/admin/usuarios/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formMunicipal),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                const primerError = Object.values(data)
                    .flat()
                    .find(
                        (valor) =>
                            typeof valor === 'string',
                    )

                throw new Error(
                    typeof primerError === 'string'
                        ? primerError
                        : 'No fue posible crear el usuario Municipal.',
                )
            }

            setUsuarios((actuales) => [
                ...actuales,
                data.usuario,
            ])

            setFormMunicipal({
                username: '',
                rut: '',
                nombres: '',
                apellido_paterno: '',
                apellido_materno: '',
                email: '',
                password: '',
                confirmar_password: '',
            })

            setMostrarCrearMunicipal(false)

            setMensaje(
                data.message ??
                'Usuario Municipal creado correctamente.',
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setCreandoMunicipal(false)
        }
    }
    const obtenerNombreCompleto = (
        usuario: UsuarioAdministracion
    ) => {
        return [
            usuario.nombres,
            usuario.apellido_paterno,
            usuario.apellido_materno,
        ]
            .filter(Boolean)
            .join(' ') || usuario.username
    }

    const obtenerIniciales = (
        usuario: UsuarioAdministracion
    ) => {
        return obtenerNombreCompleto(usuario)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) =>
                parte.charAt(0).toUpperCase()
            )
            .join('')
    }

    const claseRol = (nombreRol: string) => {
        switch (nombreRol) {
            case 'Administrador':
                return 'badge badge-warning badge-outline'
            case 'Directiva':
                return 'badge badge-primary badge-outline'
            case 'Vecino':
                return 'badge badge-success badge-outline'
            case 'Municipal':
                return 'badge badge-info badge-outline'
            default:
                return 'badge badge-outline'
        }
    }

    const claseBotonRol = (
        nombreRol: string,
        activo: boolean
    ) => {
        if (!activo) {
            return 'btn btn-xs btn-outline'
        }

        switch (nombreRol) {
            case 'Administrador':
                return 'btn btn-xs btn-warning'
            case 'Directiva':
                return 'btn btn-xs btn-primary'
            case 'Vecino':
                return 'btn btn-xs btn-success'
            case 'Municipal':
                return 'btn btn-xs btn-info'
            default:
                return 'btn btn-xs btn-success'
        }
    }


    const juntasDisponibles = usuarios
        .reduce<{ id: number; nombre: string }[]>(
            (acumulador, usuario) => {
                if (
                    usuario.junta_id === null ||
                    !usuario.junta_nombre
                ) {
                    return acumulador
                }

                const yaExiste = acumulador.some(
                    (junta) =>
                        junta.id === usuario.junta_id,
                )

                if (!yaExiste) {
                    acumulador.push({
                        id: usuario.junta_id,
                        nombre: usuario.junta_nombre,
                    })
                }

                return acumulador
            },
            [],
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es'),
        )

    const sectoresDisponibles = usuarios
        .filter((usuario) => {
            if (juntaSeleccionada === 'TODAS') {
                return usuario.sector_id !== null
            }

            if (juntaSeleccionada === 'SIN_ASOCIACION') {
                return false
            }

            return (
                usuario.junta_id === Number(juntaSeleccionada) &&
                usuario.sector_id !== null
            )
        })
        .reduce<{ id: number; nombre: string }[]>(
            (acumulador, usuario) => {
                if (
                    usuario.sector_id === null ||
                    !usuario.sector_nombre
                ) {
                    return acumulador
                }

                const yaExiste = acumulador.some(
                    (sector) =>
                        sector.id === usuario.sector_id,
                )

                if (!yaExiste) {
                    acumulador.push({
                        id: usuario.sector_id,
                        nombre: usuario.sector_nombre,
                    })
                }

                return acumulador
            },
            [],
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es'),
        )

    const usuariosFiltrados = usuarios.filter((usuario) => {
        let coincideJunta = true

        if (juntaSeleccionada === 'SIN_ASOCIACION') {
            const esAdministrador = usuario.roles.some(
                (rol) =>
                    rol.nombre === 'Administrador' &&
                    rol.activo,
            )

            coincideJunta =
                usuario.junta_id === null &&
                !esAdministrador
        } else if (juntaSeleccionada !== 'TODAS') {
            coincideJunta =
                usuario.junta_id === Number(juntaSeleccionada)
        }

        const coincideSector =
            sectorSeleccionado === 'TODOS' ||
            usuario.sector_id === Number(sectorSeleccionado)

        const coincideRol =
            rolSeleccionado === 'TODOS' ||
            usuario.roles.some(
                (rol) =>
                    rol.nombre === rolSeleccionado &&
                    rol.activo,
            )

        return (
            coincideJunta &&
            coincideSector &&
            coincideRol
        )
    })

    const usuariosActivosFiltrados =
        usuariosFiltrados.filter(
            (usuario) => usuario.is_active,
        ).length

    const usuariosInactivosFiltrados =
        usuariosFiltrados.length -
        usuariosActivosFiltrados

    const usuariosConRolesFiltrados =
        usuariosFiltrados.filter(
            (usuario) =>
                usuario.roles.some(
                    (rol) => rol.activo,
                ),
        ).length
    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Gestión de Usuarios
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra el estado de las cuentas y los roles
                                habilitados para cada usuario de la plataforma.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setError('')
                                    setMensaje('')
                                    setMostrarCrearMunicipal(true)
                                }}
                            >
                                + Crear usuario Municipal
                            </button>

                            <Link
                                to="/admin"
                                className="btn btn-outline"
                            >
                                ← Volver al Panel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                {!cargando && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total usuarios
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosFiltrados.length}
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
                                    {usuariosActivosFiltrados}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-red-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosInactivosFiltrados}
                                </span>

                                <span className="badge badge-error badge-outline">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Con roles activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosConRolesFiltrados}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Con acceso
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
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
                            Cargando usuarios...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Usuarios registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa la información de cada usuario y
                                    administra sus roles y estado.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <label className="form-control w-full sm:w-72">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Junta Vecinal
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={juntaSeleccionada}
                                        onChange={(event) => {
                                            setJuntaSeleccionada(event.target.value)
                                            setSectorSeleccionado('TODOS')
                                        }}
                                    >
                                        <option value="TODAS">
                                            Todas las juntas
                                        </option>

                                        <option value="SIN_ASOCIACION">
                                            Sin asociación
                                        </option>

                                        {juntasDisponibles.map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={String(junta.id)}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control w-full sm:w-64">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Sector
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={sectorSeleccionado}
                                        onChange={(event) =>
                                            setSectorSeleccionado(event.target.value)
                                        }
                                        disabled={
                                            juntaSeleccionada === 'SIN_ASOCIACION'
                                        }
                                    >
                                        <option value="TODOS">
                                            Todos los sectores
                                        </option>

                                        {sectoresDisponibles.map((sector) => (
                                            <option
                                                key={sector.id}
                                                value={String(sector.id)}
                                            >
                                                {sector.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control w-full sm:w-56">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Rol
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={rolSeleccionado}
                                        onChange={(event) =>
                                            setRolSeleccionado(event.target.value)
                                        }
                                    >
                                        <option value="TODOS">
                                            Todos los roles
                                        </option>

                                        {roles.map((rol) => (
                                            <option
                                                key={rol.id}
                                                value={rol.nombre}
                                            >
                                                {rol.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {usuariosFiltrados.length > 0 && (
                                    <span className="badge badge-outline badge-lg">
                                        {usuariosFiltrados.length}{' '}
                                        {usuariosFiltrados.length === 1
                                            ? 'usuario'
                                            : 'usuarios'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {usuarios.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-700">
                                        U
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen usuarios registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Los usuarios aparecerán aquí cuando
                                        existan cuentas disponibles para administrar.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Usuario</th>
                                                <th>RUT</th>
                                                <th>Junta / Sector</th>
                                                <th>Roles activos</th>
                                                <th>Gestionar roles</th>
                                                <th>Estado</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {usuariosFiltrados.map((usuario) => {
                                                const rolesActivos =
                                                    usuario.roles.filter(
                                                        (rol) => rol.activo
                                                    )

                                                const esUsuarioSesion =
                                                    usuario.id === usuarioSesionId

                                                return (
                                                    <tr
                                                        key={usuario.id}
                                                        className={
                                                            esUsuarioSesion
                                                                ? 'bg-warning/5'
                                                                : 'hover'
                                                        }
                                                    >
                                                        <td>
                                                            <div className="flex min-w-[210px] items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-700">
                                                                    {obtenerIniciales(usuario)}
                                                                </div>

                                                                <div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-semibold">
                                                                            {obtenerNombreCompleto(usuario)}
                                                                        </p>

                                                                        {esUsuarioSesion && (
                                                                            <span className="badge badge-warning badge-xs">
                                                                                Tú
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="mt-1 text-xs text-base-content/50">
                                                                        @{usuario.username}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-base-content/40">
                                                                        {usuario.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap">
                                                            {usuario.rut ?? '-'}
                                                        </td>


                                                        <td>
                                                            <div className="min-w-[180px]">
                                                                {usuario.junta_nombre ? (
                                                                    <>
                                                                        <p className="font-medium leading-tight">
                                                                            {usuario.junta_nombre}
                                                                        </p>

                                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                            <span className="text-xs text-base-content/50">
                                                                                {usuario.sector_nombre ?? 'Sin sector'}
                                                                            </span>

                                                                            {usuario.estado_asociacion_sector === 'PENDIENTE' && (
                                                                                <span className="badge badge-warning badge-xs">
                                                                                    Pendiente
                                                                                </span>
                                                                            )}

                                                                            {usuario.estado_asociacion_sector === 'RECHAZADA' && (
                                                                                <span className="badge badge-error badge-outline badge-xs">
                                                                                    Rechazada
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : rolesActivos.some(
                                                                    (rol) => rol.nombre === 'Administrador',
                                                                ) ? (
                                                                    <span className="badge badge-ghost">
                                                                        No aplica
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <span className="badge badge-warning badge-outline">
                                                                            Sin asociación
                                                                        </span>

                                                                        <p className="mt-1 text-xs text-base-content/40">
                                                                            Sin sector
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {rolesActivos.length > 0 ? (
                                                                <div className="flex min-w-[150px] flex-wrap gap-1.5">
                                                                    {rolesActivos.map((rol) => (
                                                                        <span
                                                                            key={rol.id}
                                                                            className={claseRol(
                                                                                rol.nombre
                                                                            )}
                                                                        >
                                                                            {rol.nombre}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="badge badge-ghost">
                                                                    Sin rol
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td>
                                                            <div className="flex min-w-[210px] flex-wrap gap-2">
                                                                {roles.map((rolDisponible) => {
                                                                    const rolUsuario =
                                                                        usuario.roles.find(
                                                                            (rol) =>
                                                                                rol.id ===
                                                                                rolDisponible.id
                                                                        )

                                                                    const rolActivo =
                                                                        rolUsuario?.activo ?? false

                                                                    const protegido =
                                                                        usuario.id === usuarioSesionId &&
                                                                        rolDisponible.nombre === 'Administrador' &&
                                                                        rolActivo

                                                                    return (
                                                                        <button
                                                                            key={rolDisponible.id}
                                                                            type="button"
                                                                            className={claseBotonRol(
                                                                                rolDisponible.nombre,
                                                                                rolActivo
                                                                            )}
                                                                            disabled={
                                                                                rolActualizando === usuario.id ||
                                                                                protegido
                                                                            }
                                                                            title={
                                                                                protegido
                                                                                    ? 'No puedes desactivar tu propio rol Administrador.'
                                                                                    : rolActivo
                                                                                        ? `Desactivar rol ${rolDisponible.nombre}`
                                                                                        : `Activar rol ${rolDisponible.nombre}`
                                                                            }
                                                                            onClick={() =>
                                                                                setConfirmacionRol({
                                                                                    usuarioId: usuario.id,
                                                                                    rolId: rolDisponible.id,
                                                                                    nombreRol: rolDisponible.nombre,
                                                                                    activo: !rolActivo,
                                                                                })
                                                                            }
                                                                        >
                                                                            {rolActualizando === usuario.id && (
                                                                                <span className="loading loading-spinner loading-xs" />
                                                                            )}

                                                                            {rolDisponible.nombre}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    usuario.is_active
                                                                        ? 'badge badge-success'
                                                                        : 'badge badge-error badge-outline'
                                                                }
                                                            >
                                                                {usuario.is_active
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        usuario.is_active
                                                                            ? 'btn btn-sm btn-error btn-outline'
                                                                            : 'btn btn-sm btn-success btn-outline'
                                                                    }
                                                                    disabled={
                                                                        usuarioActualizando === usuario.id ||
                                                                        usuario.id === usuarioSesionId
                                                                    }
                                                                    title={
                                                                        usuario.id === usuarioSesionId
                                                                            ? 'No puedes deshabilitar tu propia cuenta.'
                                                                            : undefined
                                                                    }
                                                                    onClick={() =>
                                                                        setConfirmacionEstado(usuario)
                                                                    }
                                                                >
                                                                    {usuarioActualizando === usuario.id && (
                                                                        <span className="loading loading-spinner loading-xs" />
                                                                    )}

                                                                    {usuarioActualizando === usuario.id
                                                                        ? 'Actualizando...'
                                                                        : usuario.is_active
                                                                            ? 'Deshabilitar'
                                                                            : 'Habilitar'}
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
            {/* Modal crear usuario Municipal */}
            {mostrarCrearMunicipal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl rounded-2xl">
                        <div className="mb-5">
                            <h3 className="text-2xl font-bold">
                                Crear usuario Municipal
                            </h3>

                            <p className="mt-1 text-sm text-base-content/60">
                                Crea una cuenta institucional con acceso al
                                módulo Municipal. Esta cuenta no quedará
                                asociada a una Junta de Vecinos ni a un sector.
                            </p>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                void crearUsuarioMunicipal()
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombre de usuario
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.username}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                username: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            RUT
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="12.345.678-5"
                                        value={formMunicipal.rut}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                rut: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombres
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.nombres}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                nombres: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido paterno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.apellido_paterno}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                apellido_paterno:
                                                    event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido materno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.apellido_materno}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                apellido_materno:
                                                    event.target.value,
                                            }))
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
                                        type="email"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.email}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                email: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Contraseña inicial
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.password}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                password: event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Confirmar contraseña
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.confirmar_password}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                confirmar_password:
                                                    event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>
                            </div>


                            <div className="alert alert-info mt-5">
                                <span>
                                    El rol Municipal será asignado
                                    automáticamente al crear la cuenta.
                                </span>
                            </div>


                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={creandoMunicipal}
                                    onClick={() =>
                                        setMostrarCrearMunicipal(false)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creandoMunicipal}
                                >
                                    {creandoMunicipal && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {creandoMunicipal
                                        ? 'Creando...'
                                        : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (!creandoMunicipal) {
                                setMostrarCrearMunicipal(false)
                            }
                        }}
                    />
                </div>
            )}
            {/* Modal cambio de rol */}
            {confirmacionRol && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-2xl">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                                R
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Confirmar cambio de rol
                                </h3>

                                <p className="mt-1 text-sm text-base-content/60">
                                    Verifica la acción antes de continuar.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-base-200/60 p-4">
                            <p>
                                ¿Seguro que deseas{' '}
                                <strong>
                                    {confirmacionRol.activo
                                        ? 'activar'
                                        : 'desactivar'}
                                </strong>{' '}
                                el rol{' '}
                                <strong>
                                    {confirmacionRol.nombreRol}
                                </strong>
                                ?
                            </p>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={rolActualizando !== null}
                                onClick={() =>
                                    setConfirmacionRol(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={rolActualizando !== null}
                                onClick={() => {
                                    const confirmacion =
                                        confirmacionRol

                                    void cambiarRolUsuario(
                                        confirmacion.usuarioId,
                                        confirmacion.rolId,
                                        confirmacion.activo
                                    )

                                    setConfirmacionRol(null)
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (rolActualizando === null) {
                                setConfirmacionRol(null)
                            }
                        }}
                    />
                </div>
            )}

            {/* Modal cambio de estado */}
            {confirmacionEstado && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-2xl">
                        <div className="mb-4 flex items-start gap-3">
                            <div
                                className={
                                    confirmacionEstado.is_active
                                        ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 font-bold text-error'
                                        : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 font-bold text-success'
                                }
                            >
                                !
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Confirmar cambio de estado
                                </h3>

                                <p className="mt-1 text-sm text-base-content/60">
                                    Esta acción modificará el acceso de la cuenta.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-base-200/60 p-4">
                            <p>
                                ¿Seguro que deseas{' '}
                                <strong>
                                    {confirmacionEstado.is_active
                                        ? 'deshabilitar'
                                        : 'habilitar'}
                                </strong>{' '}
                                la cuenta de{' '}
                                <strong>
                                    {confirmacionEstado.username}
                                </strong>
                                ?
                            </p>
                        </div>

                        {confirmacionEstado.is_active && (
                            <div className="alert alert-warning mt-4">
                                <span>
                                    El usuario no podrá ingresar mientras su
                                    cuenta permanezca deshabilitada.
                                </span>
                            </div>
                        )}

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={usuarioActualizando !== null}
                                onClick={() =>
                                    setConfirmacionEstado(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={
                                    confirmacionEstado.is_active
                                        ? 'btn btn-error'
                                        : 'btn btn-success'
                                }
                                disabled={usuarioActualizando !== null}
                                onClick={() => {
                                    const usuario =
                                        confirmacionEstado

                                    void cambiarEstadoUsuario(
                                        usuario
                                    )

                                    setConfirmacionEstado(null)
                                }}
                            >
                                {confirmacionEstado.is_active
                                    ? 'Deshabilitar'
                                    : 'Habilitar'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (usuarioActualizando === null) {
                                setConfirmacionEstado(null)
                            }
                        }}
                    />
                </div>
            )}
        </main>
    )
}

export default UsuariosPage
