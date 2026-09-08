import { useEffect, useState } from 'react'

type PerfilVecino = {
    username: string
    rut: string | null
    nombres: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    email: string
    fecha_nacimiento: string | null
}

function MiPerfilPage() {
    const [perfil, setPerfil] = useState<PerfilVecino | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [editando, setEditando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')

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

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-3xl">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Mi Perfil
                            </h1>

                            <p className="text-base-content/70 mt-2">
                                Revisa y actualiza tus datos personales.
                            </p>
                        </div>

                        <div className="divider" />

                        {cargando && (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner loading-lg" />
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        )}

                        {!cargando && perfil && (
                            <div className="space-y-6">
                                {mensaje && (
                                    <div className="alert alert-success">
                                        <span>{mensaje}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-xl font-semibold">
                                        Información personal
                                    </h2>

                                    {!editando && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setMensaje('')
                                                setEditando(true)
                                            }}
                                        >
                                            Editar perfil
                                        </button>
                                    )}
                                </div>

                                {!editando ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Nombre de usuario
                                            </span>

                                            <p className="font-medium">
                                                {perfil.username}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                RUT
                                            </span>

                                            <p className="font-medium">
                                                {perfil.rut ?? 'Sin información'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Nombres
                                            </span>

                                            <p className="font-medium">
                                                {perfil.nombres ?? 'Sin información'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Apellido paterno
                                            </span>

                                            <p className="font-medium">
                                                {perfil.apellido_paterno ?? 'Sin información'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Apellido materno
                                            </span>

                                            <p className="font-medium">
                                                {perfil.apellido_materno || 'Sin información'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Correo electrónico
                                            </span>

                                            <p className="font-medium">
                                                {perfil.email}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-base-content/60">
                                                Fecha de nacimiento
                                            </span>

                                            <p className="font-medium">
                                                {perfil.fecha_nacimiento ?? 'Sin información'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text">
                                                    Nombre de usuario
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={perfil.username}
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label className="label">
                                                <span className="label-text">
                                                    RUT
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={perfil.rut ?? ''}
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="label"
                                                htmlFor="perfil-nombres"
                                            >
                                                <span className="label-text">
                                                    Nombres
                                                </span>
                                            </label>

                                            <input
                                                id="perfil-nombres"
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={nombres}
                                                onChange={(event) =>
                                                    setNombres(event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="label"
                                                htmlFor="perfil-apellido-paterno"
                                            >
                                                <span className="label-text">
                                                    Apellido paterno
                                                </span>
                                            </label>

                                            <input
                                                id="perfil-apellido-paterno"
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={apellidoPaterno}
                                                onChange={(event) =>
                                                    setApellidoPaterno(event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="label"
                                                htmlFor="perfil-apellido-materno"
                                            >
                                                <span className="label-text">
                                                    Apellido materno
                                                </span>
                                            </label>

                                            <input
                                                id="perfil-apellido-materno"
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={apellidoMaterno}
                                                onChange={(event) =>
                                                    setApellidoMaterno(event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="label"
                                                htmlFor="perfil-email"
                                            >
                                                <span className="label-text">
                                                    Correo electrónico
                                                </span>
                                            </label>

                                            <input
                                                id="perfil-email"
                                                type="email"
                                                className="input input-bordered w-full"
                                                value={email}
                                                onChange={(event) =>
                                                    setEmail(event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="label"
                                                htmlFor="perfil-fecha-nacimiento"
                                            >
                                                <span className="label-text">
                                                    Fecha de nacimiento
                                                </span>
                                            </label>

                                            <input
                                                id="perfil-fecha-nacimiento"
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={fechaNacimiento}
                                                onChange={(event) =>
                                                    setFechaNacimiento(event.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                disabled={guardando}
                                                onClick={() => {
                                                    setNombres(perfil.nombres ?? '')
                                                    setApellidoPaterno(
                                                        perfil.apellido_paterno ?? '',
                                                    )
                                                    setApellidoMaterno(
                                                        perfil.apellido_materno ?? '',
                                                    )
                                                    setEmail(perfil.email)
                                                    setFechaNacimiento(
                                                        perfil.fecha_nacimiento ?? '',
                                                    )
                                                    setError('')
                                                    setEditando(false)
                                                }}
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={guardando}
                                                onClick={() => void guardarPerfil()}
                                            >
                                                {guardando
                                                    ? 'Guardando...'
                                                    : 'Guardar cambios'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default MiPerfilPage