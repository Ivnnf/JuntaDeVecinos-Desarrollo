import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)

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
        'http://localhost:8000/api/auth/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username,
            password,
            recordar,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
            data.motivo ??
            'No fue posible iniciar sesión.',
        )
        return
      }

      const sesionResponse = await fetch(
  'http://localhost:8000/api/auth/sesion/',
  {
    credentials: 'include',
  },
)

const sesion = await sesionResponse.json()

if (!sesionResponse.ok) {
  setError('No fue posible obtener la sesión del usuario.')
  return
}

if (sesion.roles?.includes(1)) {
  navigate('/admin')
  return
}

if (sesion.roles?.includes(2)) {
  navigate('/directiva')
  return
}

if (sesion.roles?.includes(3)) {
  navigate('/vecino')
  return
}

if (sesion.roles?.includes(4)) {
  navigate('/municipal')
  return
}

setMensaje('Autenticación correcta.')
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
              Iniciar sesión
            </h1>

            <p className="text-base-content/70 mt-2">
              Plataforma de Gestión Comunitaria
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
                htmlFor="username"
              >
                <span className="label-text">
                  Usuario
                </span>
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                className="input input-bordered w-full"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="password"
              >
                <span className="label-text">
                  Contraseña
                </span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                className="input input-bordered w-full"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="recordar"
                  className="checkbox checkbox-sm"
                  checked={recordar}
                  onChange={(event) =>
                    setRecordar(event.target.checked)
                  }
                />

                <span className="label-text">
                  Recordarme
                </span>
              </label>

              <Link
                to="/recuperar-password"
                className="link link-primary text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={cargando}
            >
              {cargando
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>
          </form>

          <div className="divider">
            o
          </div>

          <p className="text-center text-sm">
            ¿Aún no tienes una cuenta?{' '}
            <Link
              to="/registro"
              className="link link-primary font-medium"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage