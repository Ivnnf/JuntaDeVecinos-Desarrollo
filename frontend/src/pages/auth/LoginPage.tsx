import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

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

      if (sesion.roles?.length > 1) {
        navigate('/seleccionar-perfil')
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
    <main className="relative min-h-screen overflow-hidden bg-base-200 px-4 py-8">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* Panel institucional */}
          <div className="relative overflow-hidden border-b border-base-300 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-indigo-500/15 p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-black text-white shadow-md">
                  JV
                </div>

                <span className="badge border-emerald-500/40 bg-emerald-500/10 text-emerald-700">
                  Comunidad conectada
                </span>

                <h1 className="mt-5 text-4xl font-black leading-tight">
                  Tu comunidad,
                  <span className="block text-primary">
                    más cerca de ti
                  </span>
                </h1>

                <p className="mt-4 max-w-md leading-relaxed text-base-content/70">
                  Accede a la plataforma de gestión comunitaria para participar,
                  informarte y realizar tus trámites con tu Junta de Vecinos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-emerald-500/20 bg-base-100/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-700">
                      C
                    </div>

                    <div>
                      <p className="font-semibold">
                        Comunicación
                      </p>

                      <p className="text-xs text-base-content/55">
                        Mantente informado de tu comunidad.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-base-100/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-700">
                      P
                    </div>

                    <div>
                      <p className="font-semibold">
                        Participación
                      </p>

                      <p className="text-xs text-base-content/55">
                        Eventos, actividades y solicitudes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-base-100/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-700">
                      G
                    </div>

                    <div>
                      <p className="font-semibold">
                        Gestión
                      </p>

                      <p className="text-xs text-base-content/55">
                        Todo en un solo lugar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="flex items-center p-7 sm:p-9 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold">
                    Iniciar sesión
                  </h2>

                  <span className="badge badge-primary badge-outline">
                    Acceso
                  </span>
                </div>

                <p className="text-base-content/60">
                  Ingresa tus credenciales para acceder a la plataforma.
                </p>
              </div>

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

              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text font-semibold">
                      Usuario
                    </span>

                    <span className="label-text-alt text-error">
                      Obligatorio
                    </span>
                  </div>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Ingresa tu usuario"
                    className="input input-bordered w-full focus:border-primary"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    required
                  />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text font-semibold">
                      Contraseña
                    </span>

                    <span className="label-text-alt text-error">
                      Obligatorio
                    </span>
                  </div>

                  <div className="join w-full">
                    <input
                      id="password"
                      name="password"
                      type={mostrarPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      className="input join-item input-bordered w-full focus:border-primary"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                    />

                    <button
                      type="button"
                      className="btn join-item border-base-300 bg-base-200 px-4"
                      onClick={() =>
                        setMostrarPassword((actual) => !actual)
                      }
                      aria-label={
                        mostrarPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {mostrarPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name="recordar"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={recordar}
                      onChange={(event) =>
                        setRecordar(event.target.checked)
                      }
                    />

                    <span className="text-sm text-base-content/70">
                      Recordarme
                    </span>
                  </label>

                  <Link
                    to="/recuperar-password"
                    className="link link-primary text-sm font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="btn btn-primary w-full shadow-sm"
                    disabled={cargando}
                  >
                    {cargando && (
                      <span className="loading loading-spinner loading-sm" />
                    )}

                    {cargando
                      ? 'Ingresando...'
                      : 'Iniciar sesión'}
                  </button>
                </div>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-base-300" />
                <span className="text-xs font-medium uppercase tracking-wider text-base-content/40">
                  ¿Eres nuevo?
                </span>
                <div className="h-px flex-1 bg-base-300" />
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 text-center">
                <p className="text-sm text-base-content/70">
                  ¿Aún no tienes una cuenta?
                </p>

                <Link
                  to="/registro"
                  className="btn mt-3 w-full border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                >
                  Crear cuenta de vecino
                </Link>
              </div>

              <p className="mt-6 text-center text-xs text-base-content/40">
                Plataforma de Gestión Comunitaria · Junta de Vecinos
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
