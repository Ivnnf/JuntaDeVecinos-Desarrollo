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

  const passwordsCoinciden =
    confirmarPassword.length === 0 ||
    password === confirmarPassword

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
                  Nueva contraseña
                </h1>

                <p className="mt-3 leading-relaxed text-base-content/70">
                  Define una nueva contraseña para recuperar el acceso a tu
                  cuenta.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                  <p className="font-semibold">
                    Recomendaciones
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-base-content/70">
                    <li>• Utiliza al menos 8 caracteres.</li>
                    <li>• Evita reutilizar contraseñas de otras cuentas.</li>
                    <li>• Confirma exactamente la misma contraseña.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100/70 p-4">
                  <p className="text-sm text-base-content/60">
                    Después de actualizar tu contraseña podrás volver al inicio
                    de sesión y acceder normalmente.
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
                    Restablecer contraseña
                  </h2>

                  <span className="badge badge-info badge-outline">
                    Cuenta
                  </span>
                </div>

                <p className="text-base-content/60">
                  Ingresa y confirma tu nueva contraseña.
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
                  <div className="label pb-1">
                    <span className="label-text font-semibold">
                      Nueva contraseña
                    </span>

                    <span className="label-text-alt text-error">
                      Obligatorio
                    </span>
                  </div>

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

                  <span className="mt-2 text-xs text-base-content/50">
                    Mínimo 8 caracteres
                  </span>
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text font-semibold">
                      Confirmar contraseña
                    </span>

                    <span className="label-text-alt text-error">
                      Obligatorio
                    </span>
                  </div>

                  <input
                    id="confirmar-password"
                    type="password"
                    autoComplete="new-password"
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
                      ? 'Repite tu nueva contraseña'
                      : 'Las contraseñas no coinciden'}
                  </span>
                </label>

                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                  <p className="text-sm text-base-content/60">
                    Al confirmar el cambio, la nueva contraseña reemplazará la
                    anterior para futuros inicios de sesión.
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
                      ? 'Actualizando...'
                      : 'Restablecer contraseña'}
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

export default RestablecerPasswordPage
