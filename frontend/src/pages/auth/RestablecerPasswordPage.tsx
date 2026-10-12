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
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const passwordsCoinciden =
    confirmarPassword.length === 0 ||
    password === confirmarPassword

  return (
    <main className="jv-restablecer">
      <style>{`
        .jv-restablecer,
        .jv-restablecer * {
          box-sizing: border-box;
        }

        .jv-restablecer {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          color: #f3f5f2;
          font-family: 'Segoe UI', Arial, sans-serif;
          background:
            linear-gradient(
              rgba(4, 23, 16, .45),
              rgba(4, 23, 16, .55)
            ),
            url('/casas.webp') center / cover no-repeat;
          background-color: #0c2118;
        }

        .jv-restablecer .rs-card {
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          width: 100%;
          max-width: 1120px;
          overflow: hidden;
          border: 1px solid rgba(188, 213, 192, .2);
          border-radius: 28px;
          background: rgba(9, 31, 23, .48);
          box-shadow: 0 24px 70px rgba(0, 0, 0, .3);
          backdrop-filter: blur(4px);
        }

        .jv-restablecer .rs-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          padding: 38px;
          border-right: 1px solid rgba(194, 214, 194, .16);
          background: linear-gradient(
            145deg,
            rgba(31, 62, 47, .30),
            rgba(13, 37, 28, .15)
          );
        }

        .jv-restablecer .rs-logo {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          margin-bottom: 24px;
          border-radius: 19px;
          background: linear-gradient(125deg, #efdfad, #c8a95f);
          box-shadow: 0 8px 22px rgba(0, 0, 0, .16);
          color: #10291f;
          font-size: 25px;
          font-weight: 850;
        }

        .jv-restablecer .rs-badge {
          display: inline-block;
          align-self: flex-start;
          padding: 5px 11px;
          border: 1px solid rgba(225, 204, 143, .22);
          border-radius: 999px;
          background: rgba(226, 203, 143, .09);
          color: #ead69f;
          font-size: 13px;
          font-weight: 600;
        }

        .jv-restablecer h1 {
          margin: 25px 0 20px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(34px, 3.4vw, 46px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -.7px;
        }

        .jv-restablecer h1 span {
          display: block;
          margin-top: 5px;
          color: #e7d39a;
          font-style: italic;
          font-weight: 400;
        }

        .jv-restablecer .rs-description {
          margin: 0;
          color: #d0dbd3;
          font-size: 15px;
          line-height: 1.8;
        }

        .jv-restablecer .rs-tips {
          margin-top: 30px;
          padding: 22px;
          border: 1px solid rgba(190, 213, 197, .18);
          border-radius: 18px;
          background: rgba(100, 147, 122, .12);
        }

        .jv-restablecer .rs-tips h3 {
          margin: 0 0 18px;
          color: #f0f4ef;
          font-size: 16px;
          font-weight: 700;
        }

        .jv-restablecer .rs-tips ul {
          display: grid;
          gap: 16px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .jv-restablecer .rs-tips li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #d0dbd3;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-restablecer .rs-check {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 27px;
          height: 27px;
          border-radius: 9px;
          background: rgba(217, 196, 130, .16);
          color: #ead69d;
          font-size: 14px;
          font-weight: 750;
        }

        .jv-restablecer .rs-panel {
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 42px;
          background: rgba(5, 25, 17, .25);
        }

        .jv-restablecer .rs-content {
          width: 100%;
          min-width: 0;
        }

        .jv-restablecer .rs-heading {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }

        .jv-restablecer .rs-heading .rs-badge {
          align-self: center;
        }

        .jv-restablecer h2 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(28px, 2.8vw, 34px);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -.5px;
        }

        .jv-restablecer .rs-intro {
          margin: 15px 0 27px;
          color: #ccd8cf;
          font-size: 15px;
          line-height: 1.7;
        }

        .jv-restablecer .rs-form {
          display: grid;
          gap: 21px;
        }

        .jv-restablecer .rs-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .jv-restablecer .rs-label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 7px;
          color: #edf1ed;
          font-size: 15px;
          font-weight: 650;
          line-height: 1.5;
        }

        .jv-restablecer .rs-required {
          color: #e8b9a7;
          font-size: 12px;
          font-weight: 400;
        }

        .jv-restablecer .rs-input {
          display: block;
          width: 100%;
          min-width: 0;
          height: 49px;
          padding: 0 15px;
          border: 1px solid rgba(178, 203, 193, .3);
          border-radius: 13px;
          outline: none;
          background: rgba(40, 66, 72, .92);
          color: #f4f7f5;
          font: inherit;
          font-size: 15px;
          transition: border-color .2s, box-shadow .2s;
        }

        .jv-restablecer .rs-input::placeholder {
          color: #c0cdd0;
          opacity: 1;
        }

        .jv-restablecer .rs-input:focus {
          border-color: #d6bc79;
          box-shadow: 0 0 0 3px rgba(214, 188, 121, .17);
        }

        .jv-restablecer .rs-input.rs-invalid {
          border-color: #edac9f;
        }

        .jv-restablecer .rs-help {
          display: block;
          color: #c0d0c5;
          font-size: 12px;
          line-height: 1.7;
        }

        .jv-restablecer .rs-error-text {
          color: #ffd0c2;
        }

        .jv-restablecer .rs-note {
          margin: 0;
          padding: 17px 19px;
          border: 1px solid rgba(224, 202, 146, .23);
          border-radius: 15px;
          background: rgba(66, 98, 71, .16);
          color: #d0dbd3;
          font-size: 13px;
          line-height: 1.8;
        }

        .jv-restablecer .rs-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 49px;
          padding: 13px 17px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(110deg, #ead8a6, #c6a65c);
          box-shadow: 0 8px 18px rgba(0, 0, 0, .2);
          color: #122b21;
          font: inherit;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: 1px;
          cursor: pointer;
          transition: filter .2s;
        }

        .jv-restablecer .rs-submit:hover {
          filter: brightness(1.07);
        }

        .jv-restablecer .rs-submit:disabled {
          opacity: .7;
          cursor: wait;
        }

        .jv-restablecer .rs-spinner {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(18, 43, 33, .25);
          border-top-color: #122b21;
          border-radius: 50%;
          animation: rs-spin .8s linear infinite;
        }

        @keyframes rs-spin {
          to { transform: rotate(360deg); }
        }

        .jv-restablecer .rs-back {
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid rgba(192, 210, 195, .18);
          text-align: center;
        }

        .jv-restablecer .rs-back p {
          margin: 0 0 15px;
          color: #c5d1ca;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-restablecer .rs-back-link {
          display: block;
          padding: 12px;
          border: 1px solid rgba(213, 186, 112, .65);
          border-radius: 12px;
          color: #e7d39a;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: .6px;
          text-decoration: none;
          transition: background .2s, border-color .2s;
        }

        .jv-restablecer .rs-back-link:hover {
          border-color: #e7d39a;
          background: rgba(231, 211, 154, .08);
        }

        .jv-restablecer .rs-alert {
          margin-bottom: 22px;
          padding: 14px 16px;
          border: 1px solid #b67b69;
          border-radius: 12px;
          background: rgba(78, 37, 30, .92);
          color: #ffe0d5;
          font-size: 14px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .jv-restablecer .rs-success {
          border-color: #6dab85;
          background: rgba(29, 70, 48, .92);
          color: #d6f6df;
        }

        .jv-restablecer .rs-footer {
          margin: 22px 0 0;
          color: #b8cabe;
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        .jv-restablecer button:focus-visible,
        .jv-restablecer a:focus-visible {
          outline: 2px solid #ead69d;
          outline-offset: 4px;
        }

        @media (max-width: 800px) {
          .jv-restablecer {
            padding: 22px 14px;
          }

          .jv-restablecer .rs-card {
            max-width: 560px;
            grid-template-columns: 1fr;
          }

          .jv-restablecer .rs-info {
            padding: 28px;
            border-right: 0;
            border-bottom: 1px solid rgba(194, 214, 194, .16);
          }

          .jv-restablecer .rs-panel {
            padding: 30px 28px;
          }
        }

        @media (max-width: 400px) {
          .jv-restablecer .rs-info,
          .jv-restablecer .rs-panel {
            padding: 24px 20px;
          }

          .jv-restablecer .rs-tips {
            padding: 18px 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jv-restablecer .rs-spinner {
            animation: none;
          }
        }
      `}</style>

      <section className="rs-card" aria-label="Restablecer contraseña">
        <div className="rs-info">
          <div className="rs-logo">JV</div>
          <span className="rs-badge">Seguridad de tu cuenta</span>

          <h1>
            Una nueva contraseña,
            <span>para volver a conectar</span>
          </h1>

          <p className="rs-description">
            Define una nueva contraseña para recuperar el acceso
            a tu cuenta y seguir participando en tu comunidad.
          </p>

          <div className="rs-tips">
            <h3>Recomendaciones</h3>

            <ul>
              <li>
                <span className="rs-check" aria-hidden="true">✓</span>
                <span>Utiliza al menos 8 caracteres.</span>
              </li>
              <li>
                <span className="rs-check" aria-hidden="true">✓</span>
                <span>
                  Evita reutilizar contraseñas de otras cuentas.
                </span>
              </li>
              <li>
                <span className="rs-check" aria-hidden="true">✓</span>
                <span>
                  Confirma exactamente la misma contraseña.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rs-panel">
          <div className="rs-content">
            <div className="rs-heading">
              <h2>Restablecer contraseña</h2>
              <span className="rs-badge">Cuenta</span>
            </div>

            <p className="rs-intro">
              Ingresa y confirma tu nueva contraseña.
            </p>

            {error && (
              <div className="rs-alert" role="alert">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="rs-alert rs-success" role="status">
                {mensaje}
              </div>
            )}

            <form
              className="rs-form"
              onSubmit={handleSubmit}
              aria-busy={cargando}
            >
              <div className="rs-field">
                <label className="rs-label" htmlFor="password">
                  Nueva contraseña
                  <span className="rs-required">Obligatorio</span>
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ingresa tu nueva contraseña"
                  className="rs-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  aria-describedby="password-ayuda"
                  required
                />

                <span id="password-ayuda" className="rs-help">
                  Mínimo 8 caracteres.
                </span>
              </div>

              <div className="rs-field">
                <label className="rs-label" htmlFor="confirmar-password">
                  Confirmar contraseña
                  <span className="rs-required">Obligatorio</span>
                </label>

                <input
                  id="confirmar-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite tu nueva contraseña"
                  className={
                    passwordsCoinciden
                      ? 'rs-input'
                      : 'rs-input rs-invalid'
                  }
                  value={confirmarPassword}
                  onChange={(event) =>
                    setConfirmarPassword(event.target.value)
                  }
                  minLength={8}
                  aria-invalid={!passwordsCoinciden}
                  aria-describedby="confirmar-ayuda"
                  required
                />

                <span
                  id="confirmar-ayuda"
                  className={
                    passwordsCoinciden
                      ? 'rs-help'
                      : 'rs-help rs-error-text'
                  }
                >
                  {passwordsCoinciden
                    ? 'Repite tu nueva contraseña.'
                    : 'Las contraseñas no coinciden.'}
                </span>
              </div>

              <p className="rs-note">
                Al confirmar el cambio, la nueva contraseña
                reemplazará la anterior para futuros inicios
                de sesión.
              </p>

              <button
                type="submit"
                className="rs-submit"
                disabled={cargando}
              >
                {cargando && (
                  <span className="rs-spinner" aria-hidden="true" />
                )}
                {cargando
                  ? 'ACTUALIZANDO…'
                  : 'RESTABLECER CONTRASEÑA'}
              </button>
            </form>

            <div className="rs-back">
              <p>
                Después de actualizar tu contraseña podrás volver
                al inicio de sesión y acceder normalmente.
              </p>

              <Link to="/login" className="rs-back-link">
                VOLVER AL INICIO DE SESIÓN
              </Link>
            </div>

            <p className="rs-footer">
              Plataforma de Gestión Comunitaria · Junta de Vecinos
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default RestablecerPasswordPage