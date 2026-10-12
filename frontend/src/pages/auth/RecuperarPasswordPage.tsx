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
          body: JSON.stringify({ email }),
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
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="jv-recuperar">
      <style>{`
        .jv-recuperar,
        .jv-recuperar * {
          box-sizing: border-box;
        }

        .jv-recuperar {
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
            url('/nños.webp') center / cover no-repeat;
          background-color: #0c2118;
        }

        .jv-recuperar .rc-card {
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

        .jv-recuperar .rc-info {
          min-width: 0;
          padding: 38px;
          border-right: 1px solid rgba(194, 214, 194, .16);
          background: linear-gradient(
            145deg,
            rgba(31, 62, 47, .30),
            rgba(13, 37, 28, .15)
          );
        }

        .jv-recuperar .rc-logo {
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

        .jv-recuperar .rc-badge {
          display: inline-block;
          padding: 5px 11px;
          border: 1px solid rgba(225, 204, 143, .22);
          border-radius: 999px;
          background: rgba(226, 203, 143, .09);
          color: #ead69f;
          font-size: 13px;
          font-weight: 600;
        }

        .jv-recuperar h1 {
          margin: 25px 0 20px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(34px, 3.4vw, 46px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -.7px;
        }

        .jv-recuperar h1 span {
          display: block;
          margin-top: 5px;
          color: #e7d39a;
          font-style: italic;
          font-weight: 400;
        }

        .jv-recuperar .rc-description {
          margin: 0;
          color: #d0dbd3;
          font-size: 15px;
          line-height: 1.8;
        }

        .jv-recuperar .rc-steps {
          margin-top: 28px;
          padding: 21px;
          border: 1px solid rgba(190, 213, 197, .18);
          border-radius: 18px;
          background: rgba(100, 147, 122, .12);
        }

        .jv-recuperar .rc-steps h3 {
          margin: 0 0 18px;
          color: #f0f4ef;
          font-size: 16px;
          font-weight: 700;
        }

        .jv-recuperar .rc-steps ol {
          display: grid;
          gap: 17px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .jv-recuperar .rc-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .jv-recuperar .rc-number {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 29px;
          height: 29px;
          border: 1px solid rgba(226, 203, 143, .17);
          border-radius: 10px;
          background: rgba(217, 196, 130, .15);
          color: #ead69d;
          font-size: 13px;
          font-weight: 750;
        }

        .jv-recuperar .rc-step p {
          margin: 2px 0 0;
          color: #d0dbd3;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-recuperar .rc-panel {
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 42px;
          background: rgba(5, 25, 17, .25);
        }

        .jv-recuperar .rc-content {
          width: 100%;
          min-width: 0;
        }

        .jv-recuperar .rc-heading {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 13px;
        }

        .jv-recuperar h2 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(29px, 3vw, 36px);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -.5px;
        }

        .jv-recuperar .rc-intro {
          margin: 15px 0 28px;
          color: #ccd8cf;
          font-size: 15px;
          line-height: 1.7;
        }

        .jv-recuperar .rc-label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 7px;
          margin-bottom: 9px;
          color: #edf1ed;
          font-size: 15px;
          font-weight: 650;
        }

        .jv-recuperar .rc-required {
          color: #e8b9a7;
          font-size: 12px;
          font-weight: 400;
        }

        .jv-recuperar .rc-input {
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

        .jv-recuperar .rc-input::placeholder {
          color: #c0cdd0;
          opacity: 1;
        }

        .jv-recuperar .rc-input:focus {
          border-color: #d6bc79;
          box-shadow: 0 0 0 3px rgba(214, 188, 121, .17);
        }

        .jv-recuperar .rc-help {
          display: block;
          margin-top: 9px;
          color: #c0d0c5;
          font-size: 12px;
          line-height: 1.7;
        }

        .jv-recuperar .rc-note {
          margin: 22px 0;
          padding: 17px 19px;
          border: 1px solid rgba(224, 202, 146, .23);
          border-radius: 15px;
          background: rgba(66, 98, 71, .16);
          color: #d0dbd3;
          font-size: 13px;
          line-height: 1.8;
        }

        .jv-recuperar .rc-submit {
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
          letter-spacing: 1.2px;
          cursor: pointer;
          transition: filter .2s;
        }

        .jv-recuperar .rc-submit:hover {
          filter: brightness(1.07);
        }

        .jv-recuperar .rc-submit:disabled {
          opacity: .7;
          cursor: wait;
        }

        .jv-recuperar .rc-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(18, 43, 33, .25);
          border-top-color: #122b21;
          border-radius: 50%;
          animation: rc-spin .8s linear infinite;
        }

        @keyframes rc-spin {
          to { transform: rotate(360deg); }
        }

        .jv-recuperar .rc-back {
          margin-top: 27px;
          padding-top: 23px;
          border-top: 1px solid rgba(192, 210, 195, .18);
          text-align: center;
        }

        .jv-recuperar .rc-back p {
          margin: 0 0 14px;
          color: #c5d1ca;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-recuperar .rc-back-link {
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

        .jv-recuperar .rc-back-link:hover {
          border-color: #e7d39a;
          background: rgba(231, 211, 154, .08);
        }

        .jv-recuperar .rc-alert {
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

        .jv-recuperar .rc-success {
          border-color: #6dab85;
          background: rgba(29, 70, 48, .92);
          color: #d6f6df;
        }

        .jv-recuperar .rc-footer {
          margin: 23px 0 0;
          color: #b8cabe;
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        .jv-recuperar button:focus-visible,
        .jv-recuperar a:focus-visible {
          outline: 2px solid #ead69d;
          outline-offset: 4px;
        }

        @media (max-width: 800px) {
          .jv-recuperar {
            padding: 22px 14px;
          }

          .jv-recuperar .rc-card {
            max-width: 560px;
            grid-template-columns: 1fr;
          }

          .jv-recuperar .rc-info {
            padding: 28px;
            border-right: 0;
            border-bottom: 1px solid rgba(194, 214, 194, .16);
          }

          .jv-recuperar .rc-panel {
            padding: 30px 28px;
          }
        }

        @media (max-width: 400px) {
          .jv-recuperar .rc-info,
          .jv-recuperar .rc-panel {
            padding: 24px 20px;
          }

          .jv-recuperar .rc-steps {
            padding: 18px 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jv-recuperar .rc-spinner {
            animation: none;
          }
        }
      `}</style>

      <section className="rc-card" aria-label="Recuperación de contraseña">
        <div className="rc-info">
          <div className="rc-logo">JV</div>
          <span className="rc-badge">Seguridad de tu cuenta</span>

          <h1>
            Recupera el acceso,
            <span>vuelve a tu comunidad</span>
          </h1>

          <p className="rc-description">
            Ingresa el correo electrónico asociado a tu cuenta
            para iniciar el proceso de recuperación de contraseña.
          </p>

          <div className="rc-steps">
            <h3>¿Qué ocurrirá después?</h3>

            <ol>
              <li className="rc-step">
                <span className="rc-number" aria-hidden="true">1</span>
                <p>Ingresa el correo asociado a tu cuenta.</p>
              </li>

              <li className="rc-step">
                <span className="rc-number" aria-hidden="true">2</span>
                <p>
                  Recibirás las instrucciones disponibles para
                  recuperar tu acceso.
                </p>
              </li>

              <li className="rc-step">
                <span className="rc-number" aria-hidden="true">3</span>
                <p>
                  Sigue las indicaciones para establecer una
                  nueva contraseña.
                </p>
              </li>
            </ol>
          </div>
        </div>

        <div className="rc-panel">
          <div className="rc-content">
            <div className="rc-heading">
              <h2>Recuperar acceso</h2>
              <span className="rc-badge">Cuenta</span>
            </div>

            <p className="rc-intro">
              Escribe el correo electrónico registrado en tu cuenta.
            </p>

            {error && (
              <div className="rc-alert" role="alert">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="rc-alert rc-success" role="status">
                {mensaje}
              </div>
            )}

            <form onSubmit={handleSubmit} aria-busy={cargando}>
              <label className="rc-label" htmlFor="email">
                Correo electrónico
                <span className="rc-required">Obligatorio</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.cl"
                className="rc-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby="recuperar-email-ayuda"
                required
              />

              <span id="recuperar-email-ayuda" className="rc-help">
                Usa el mismo correo con el que registraste tu cuenta.
              </span>

              <p className="rc-note">
                Por seguridad, asegúrate de ingresar correctamente
                tu dirección de correo antes de continuar.
              </p>

              <button
                type="submit"
                className="rc-submit"
                disabled={cargando}
              >
                {cargando && (
                  <span className="rc-spinner" aria-hidden="true" />
                )}
                {cargando ? 'ENVIANDO…' : 'ENVIAR INSTRUCCIONES'}
              </button>
            </form>

            <div className="rc-back">
              <p>
                Si recuerdas tu contraseña, puedes volver
                directamente al inicio de sesión.
              </p>
              <Link to="/login" className="rc-back-link">
                VOLVER AL INICIO DE SESIÓN
              </Link>
            </div>

            <p className="rc-footer">
              Plataforma de Gestión Comunitaria · Junta de Vecinos
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default RecuperarPasswordPage