import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

function RegistroVecinoPage() {
    const [username, setUsername] = useState('')
    const [rut, setRut] = useState('')
    const [nombres, setNombres] = useState('')
    const [apellidoPaterno, setApellidoPaterno] = useState('')
    const [apellidoMaterno, setApellidoMaterno] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault()

        setError('')
        setMensaje('')

        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setCargando(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/auth/registro/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        username,
                        rut,
                        nombres,
                        apellido_paterno: apellidoPaterno,
                        apellido_materno: apellidoMaterno,
                        email,
                        password,
                        confirmar_password: confirmarPassword,
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
                        : 'No fue posible completar el registro.',
                )

                return
            }

            setMensaje(
                data.message ?? 'Registro realizado correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setCargando(false)
        }
    }

    const passwordsCoinciden =
        confirmarPassword.length === 0 ||
        password === confirmarPassword

    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-5xl">
                <div className="grid overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-[0.8fr_1.2fr]">

                    {/* Panel informativo */}
                    <div className="border-b border-base-300 bg-primary/5 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                        <div className="flex h-full flex-col justify-between gap-8">
                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                                    JV
                                </div>

                                <span className="badge badge-primary badge-outline">
                                    Comunidad
                                </span>

                                <h1 className="mt-4 text-3xl font-bold leading-tight">
                                    Registro de vecino
                                </h1>

                                <p className="mt-3 leading-relaxed text-base-content/70">
                                    Crea tu cuenta para acceder a los servicios
                                    y herramientas disponibles para vecinos.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                                    <p className="font-semibold">
                                        ¿Qué podrás hacer?
                                    </p>

                                    <ul className="mt-3 space-y-2 text-sm text-base-content/70">
                                        <li>• Participar en actividades y eventos</li>
                                        <li>• Enviar consultas, reclamos y solicitudes</li>
                                        <li>• Solicitar documentos</li>
                                        <li>• Gestionar tu perfil y asociación territorial</li>
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                                    <p className="text-sm text-base-content/60">
                                        Si ya tienes una cuenta, puedes volver
                                        directamente al inicio de sesión.
                                    </p>

                                    <Link
                                        to="/login"
                                        className="btn btn-outline mt-3 w-full"
                                    >
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold">
                                    Crear cuenta
                                </h2>

                                <span className="badge badge-success badge-outline">
                                    Vecino
                                </span>
                            </div>

                            <p className="text-base-content/60">
                                Completa tus datos personales para registrarte.
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-error mb-6">
                                <span>{error}</span>
                            </div>
                        )}

                        {mensaje && (
                            <div className="alert alert-success mb-6">
                                <span>{mensaje}</span>
                            </div>
                        )}

                        <form
                            className="grid grid-cols-1 gap-5 md:grid-cols-2"
                            onSubmit={handleSubmit}
                        >
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Nombre de usuario
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="username"
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(event.target.value)
                                    }
                                    placeholder="Ej: juan.perez"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        RUT
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="rut"
                                    type="text"
                                    placeholder="12.345.678-5"
                                    className="input input-bordered w-full"
                                    value={rut}
                                    onChange={(event) =>
                                        setRut(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Nombres
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="nombres"
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={nombres}
                                    onChange={(event) =>
                                        setNombres(event.target.value)
                                    }
                                    placeholder="Tus nombres"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Apellido paterno
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="apellido-paterno"
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={apellidoPaterno}
                                    onChange={(event) =>
                                        setApellidoPaterno(event.target.value)
                                    }
                                    placeholder="Apellido paterno"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Apellido materno
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="apellido-materno"
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={apellidoMaterno}
                                    onChange={(event) =>
                                        setApellidoMaterno(event.target.value)
                                    }
                                    placeholder="Apellido materno"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Correo electrónico
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    id="email"
                                    type="email"
                                    className="input input-bordered w-full"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="correo@ejemplo.cl"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label pb-1">
                                    <span className="label-text font-semibold">
                                        Contraseña
                                    </span>
                                </div>

                                <input
                                    id="password"
                                    type="password"
                                    className="input input-bordered w-full"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    minLength={8}
                                    required
                                />

                                <span className="mt-2 text-xs text-base-content/50">
                                    Mínimo 8 caracteres
                                </span>
                            </label>

                            <label className="form-control">
                                <div className="label pb-1">
                                    <span className="label-text font-semibold">
                                        Confirmar contraseña
                                    </span>
                                </div>

                                <input
                                    id="confirmar-password"
                                    type="password"
                                    className={
                                        passwordsCoinciden
                                            ? 'input input-bordered w-full'
                                            : 'input input-bordered input-error w-full'
                                    }
                                    value={confirmarPassword}
                                    onChange={(event) =>
                                        setConfirmarPassword(event.target.value)
                                    }
                                    minLength={8}
                                    required
                                />

                                <span
                                    className={
                                        passwordsCoinciden
                                            ? 'mt-2 text-xs text-base-content/50'
                                            : 'mt-2 text-xs text-error'
                                    }
                                >
                                    {passwordsCoinciden
                                        ? 'Repite tu contraseña'
                                        : 'Las contraseñas no coinciden'}
                                </span>
                            </label>

                            <div className="md:col-span-2">
                                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                    <p className="text-sm text-base-content/60">
                                        Al registrarte, tu cuenta quedará
                                        disponible para acceder a las funciones
                                        habilitadas para vecinos dentro de la
                                        plataforma.
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-base-300 pt-5 md:col-span-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={cargando}
                                >
                                    {cargando && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {cargando
                                        ? 'Registrando...'
                                        : 'Crear cuenta'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center lg:hidden">
                            <Link
                                to="/login"
                                className="link link-primary"
                            >
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default RegistroVecinoPage
