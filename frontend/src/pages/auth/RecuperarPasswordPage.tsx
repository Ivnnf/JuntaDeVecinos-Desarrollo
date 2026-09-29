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
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-[0.85fr_1.15fr]">

          {/* Panel informativo */}
          <div className="border-b border-base-300 bg-primary/5 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                  JV
                </div>

                <span className="badge badge-primary badge-outline">
                  Seguridad
                </span>

                <h1 className="mt-4 text-3xl font-bold leading-tight">
                  Recuperar contraseña
                </h1>

                <p className="mt-3 leading-relaxed text-base-content/70">
                  Ingresa el correo electrónico asociado a tu cuenta para
                  iniciar el proceso de recuperación.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                  <p className="font-semibold">
                    ¿Qué ocurrirá después?
                  </p>

                  <div className="mt-3 space-y-3 text-sm text-base-content/70">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        1
                      </span>

                      <p>
                        Ingresa el correo asociado a tu cuenta.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        2
                      </span>

                      <p>
                        Recibirás las instrucciones disponibles para recuperar
                        tu acceso.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        3
                      </span>

                      <p>
                        Sigue las indicaciones para establecer una nueva
                        contraseña.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                  <p className="text-sm text-base-content/60">
                    Si recuerdas tu contraseña, puedes volver directamente al
                    inicio de sesión.
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
          <div className="flex items-center p-6 sm:p-8 lg:p-10">
            <div className="w-full">
              <div className="mb-6">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    Recuperar acceso
                  </h2>

                  <span className="badge badge-info badge-outline">
                    Cuenta
                  </span>
                </div>

                <p className="text-base-content/60">
                  Escribe el correo electrónico registrado en tu cuenta.
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
                className="space-y-5"
                onSubmit={handleSubmit}
              >
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
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.cl"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />

                  <span className="mt-2 text-xs text-base-content/50">
                    Usa el mismo correo con el que registraste tu cuenta.
                  </span>
                </label>

                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                  <p className="text-sm text-base-content/60">
                    Por seguridad, asegúrate de ingresar correctamente tu
                    dirección de correo antes de continuar.
                  </p>
                </div>

                <div className="border-t border-base-300 pt-5">
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={cargando}
                  >
                    {cargando && (
                      <span className="loading loading-spinner loading-sm" />
                    )}

                    {cargando
                      ? 'Enviando...'
                      : 'Enviar instrucciones'}
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
        </div>
      </section>
    </main>
  )
}

export default RecuperarPasswordPage
