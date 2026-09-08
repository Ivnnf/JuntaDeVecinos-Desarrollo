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

    return (
        <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
            <section className="card w-full max-w-2xl bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <h1 className="text-3xl font-bold">
                            Registro de vecino
                        </h1>

                        <p className="text-base-content/70 mt-2">
                            Crea tu cuenta para acceder a la plataforma comunitaria.
                        </p>
                    </div>
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {mensaje && (
                        <div className="alert alert-success mb-4">
                            <span>{mensaje}</span>
                        </div>
                    )}
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label className="label" htmlFor="username">
                                <span className="label-text">
                                    Nombre de usuario
                                </span>
                            </label>

                            <input
                                id="username"
                                type="text"
                                className="input input-bordered w-full"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="rut">
                                <span className="label-text">
                                    RUT
                                </span>
                            </label>

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
                        </div>

                        <div>
                            <label className="label" htmlFor="nombres">
                                <span className="label-text">
                                    Nombres
                                </span>
                            </label>

                            <input
                                id="nombres"
                                type="text"
                                className="input input-bordered w-full"
                                value={nombres}
                                onChange={(event) =>
                                    setNombres(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="apellido-paterno">
                                <span className="label-text">
                                    Apellido paterno
                                </span>
                            </label>

                            <input
                                id="apellido-paterno"
                                type="text"
                                className="input input-bordered w-full"
                                value={apellidoPaterno}
                                onChange={(event) =>
                                    setApellidoPaterno(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="apellido-materno">
                                <span className="label-text">
                                    Apellido materno
                                </span>
                            </label>

                            <input
                                id="apellido-materno"
                                type="text"
                                className="input input-bordered w-full"
                                value={apellidoMaterno}
                                onChange={(event) =>
                                    setApellidoMaterno(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="email">
                                <span className="label-text">
                                    Correo electrónico
                                </span>
                            </label>

                            <input
                                id="email"
                                type="email"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="password">
                                <span className="label-text">
                                    Contraseña
                                </span>
                            </label>

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
                        </div>

                        <div>
                            <label className="label" htmlFor="confirmar-password">
                                <span className="label-text">
                                    Confirmar contraseña
                                </span>
                            </label>

                            <input
                                id="confirmar-password"
                                type="password"
                                className="input input-bordered w-full"
                                value={confirmarPassword}
                                onChange={(event) =>
                                    setConfirmarPassword(event.target.value)
                                }
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 mt-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={cargando}
                            >
                                {cargando
                                    ? 'Registrando...'
                                    : 'Registrarse'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <Link
                            to="/login"
                            className="link link-primary"
                        >
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default RegistroVecinoPage