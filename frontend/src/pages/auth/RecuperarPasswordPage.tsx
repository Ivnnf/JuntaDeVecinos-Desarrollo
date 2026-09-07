import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    setError('')
    setMensaje('')
    setCargando(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/recuperar-password/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.email?.[0] ??
            data.detail ??
            'No fue posible procesar la solicitud.',
        )
        return
      }

      setMensaje(data.message)
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
              Recuperar contraseña
            </h1>

            <p className="text-base-content/70 mt-2">
              Ingresa el correo asociado a tu cuenta.
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
                htmlFor="email"
              >
                <span className="label-text">
                  Correo electrónico
                </span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={cargando}
            >
              {cargando
                ? 'Enviando...'
                : 'Enviar instrucciones'}
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

export default RecuperarPasswordPage