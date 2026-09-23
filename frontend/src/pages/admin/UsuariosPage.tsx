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
}

type RolDisponible = {
    id: number
    nombre: string
}

function UsuariosPage() {
    const [usuarios, setUsuarios] =
        useState<UsuarioAdministracion[]>([])

    const [roles, setRoles] =
        useState<RolDisponible[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')


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
    return (
        <main className="min-h-screen bg-base-200 p-6">
            <section className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold">
                    Gestión de Usuarios
                </h1>
                <Link to="/admin"
                    className="btn btn-primary mt-4">
                    Volver al Panel de Administración
                </Link>

                {cargando && (
                    <div className="alert mt-6">
                        Cargando usuarios...
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-6">
                        {error}
                    </div>
                )}

                {!cargando && (
                    <div className="mt-6 overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>RUT</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Gestionar roles</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>

                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>
                                            {usuario.username}
                                        </td>

                                        <td>
                                            {usuario.rut ?? '-'}
                                        </td>

                                        <td>
                                            {[
                                                usuario.nombres,
                                                usuario.apellido_paterno,
                                                usuario.apellido_materno,
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </td>

                                        <td>
                                            {usuario.email}
                                        </td>

                                        <td>
                                            {usuario.roles.filter((rol) => rol.activo).length > 0
                                                ? usuario.roles
                                                    .filter((rol) => rol.activo)
                                                    .map((rol) => rol.nombre)
                                                    .join(', ')
                                                : 'Sin rol'}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                {roles.map((rolDisponible) => {
                                                    const rolUsuario = usuario.roles.find(
                                                        (rol) => rol.id === rolDisponible.id
                                                    )

                                                    const rolActivo =
                                                        rolUsuario?.activo ?? false

                                                    return (
                                                        <button
                                                            key={rolDisponible.id}
                                                            className={
                                                                rolActivo
                                                                    ? 'btn btn-xs btn-success'
                                                                    : 'btn btn-xs btn-outline'
                                                            }
                                                            disabled={
                                                                rolActualizando === usuario.id ||
                                                                (
                                                                    usuario.id === usuarioSesionId &&
                                                                    rolDisponible.nombre === 'Administrador' &&
                                                                    rolActivo
                                                                )
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
                                                            {rolDisponible.nombre}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </td>

                                        <td>
                                            {usuario.is_active ? (
                                                <span className="badge badge-success">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="badge badge-error">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={
                                                    usuario.is_active
                                                        ? 'btn btn-sm btn-error'
                                                        : 'btn btn-sm btn-success'
                                                }
                                                disabled={
                                                    usuarioActualizando === usuario.id ||
                                                    usuario.id === usuarioSesionId
                                                }
                                                onClick={() =>
                                                    setConfirmacionEstado(usuario)
                                                }
                                            >
                                                {usuarioActualizando === usuario.id
                                                    ? 'Actualizando...'
                                                    : usuario.is_active
                                                        ? 'Deshabilitar'
                                                        : 'Habilitar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            {confirmacionRol && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold">
                            Confirmar cambio de rol
                        </h3>

                        <p className="py-4">
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

                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() =>
                                    setConfirmacionRol(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    cambiarRolUsuario(
                                        confirmacionRol.usuarioId,
                                        confirmacionRol.rolId,
                                        confirmacionRol.activo
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
                        onClick={() =>
                            setConfirmacionRol(null)
                        }
                    />
                </div>
            )}
            {confirmacionEstado && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold">
                            Confirmar cambio de estado
                        </h3>

                        <p className="py-4">
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

                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() =>
                                    setConfirmacionEstado(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                className={
                                    confirmacionEstado.is_active
                                        ? 'btn btn-error'
                                        : 'btn btn-success'
                                }
                                onClick={() => {
                                    cambiarEstadoUsuario(
                                        confirmacionEstado
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
                        onClick={() =>
                            setConfirmacionEstado(null)
                        }
                    />
                </div>
            )}
        </main>
    )
}

export default UsuariosPage