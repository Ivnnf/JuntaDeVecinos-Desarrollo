import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link, useParams } from 'react-router-dom'

function RestablecerPasswordPage() {
  const { uid, token } = useParams()

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
        `http://localhost:8000/api/auth/restablecer-password/${uid}/${token}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            password,
            confirmar_password: confirmarPassword,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.confirmar_password?.[0] ??
            data.password?.[0] ??
            data.detail ??
            'No fue posible restablecer la contraseña.',
        )
        return
      }

      setMensaje(
        data.message ?? 'Contraseña actualizada correctamente.',
      )

      setPassword('')
      setConfirmarPassword('')
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
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">
              Nueva contraseña
            </h1>

            <p className="text-base-content/70 mt-2">
              Ingresa una nueva contraseña para tu cuenta.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {mensaje && (
            <div className="alert alert-success">
              <span>{mensaje}</span>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                className="label"
                htmlFor="password"
              >
                <span className="label-text">
                  Nueva contraseña
                </span>
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
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
              <label
                className="label"
                htmlFor="confirmar-password"
              >
                <span className="label-text">
                  Confirmar contraseña
                </span>
              </label>

              <input
                id="confirmar-password"
                type="password"
                autoComplete="new-password"
                className="input input-bordered w-full"
                value={confirmarPassword}
                onChange={(event) =>
                  setConfirmarPassword(event.target.value)
                }
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={cargando}
            >
              {cargando
                ? 'Actualizando...'
                : 'Restablecer contraseña'}
            </button>
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

export default RestablecerPasswordPage