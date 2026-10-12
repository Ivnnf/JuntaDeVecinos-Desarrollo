
import { useState } from 'react'
import type { FormEvent } from 'react'
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
          data.motivo ??
          'No fue posible iniciar sesión.'
        )
        return
      }

      const sesionResponse = await fetch(
        'http://localhost:8000/api/auth/sesion/',
        {
          credentials: 'include',
        }
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
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="jv-login">
      <style>{`
        .jv-login,
        .jv-login * {
          box-sizing: border-box;
        }

        /* FONDO PRINCIPAL */

        .jv-login {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          color: #f3f5f2;
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #10291f;

          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.18),
              rgba(4, 23, 16, 0.28)
            ),
            url('/junta-v.jpg');

          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        /* TARJETA PRINCIPAL TRANSPARENTE */

        .jv-login .jv-card {
          width: 100%;
          max-width: 1120px;
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          overflow: hidden;

          border: 1px solid rgba(213, 186, 112, 0.24);
          border-radius: 28px;

          background: rgba(9, 31, 23, 0.58);

          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.35);

          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        /* PANEL IZQUIERDO */

        .jv-login .jv-info {
          padding: 42px;

          border-right:
            1px solid rgba(213, 186, 112, 0.18);

          background:
            radial-gradient(
              ellipse at 85% 70%,
              rgba(99, 150, 119, 0.14),
              transparent 70%
            ),
            linear-gradient(
              145deg,
              rgba(31, 62, 47, 0.34),
              rgba(13, 37, 28, 0.18)
            );
        }

        /* LOGOTIPO */

        .jv-login .jv-logo {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin-bottom: 26px;

          border-radius: 20px;

          background:
            linear-gradient(
              125deg,
              #efdfad,
              #c8a95f
            );

          box-shadow:
            0 8px 22px rgba(0, 0, 0, 0.16);

          color: #10291f;
          font-size: 27px;
          font-weight: 850;
        }

        /* ETIQUETAS */

        .jv-login .jv-badge {
          display: inline-block;
          padding: 5px 13px;

          border:
            1px solid rgba(225, 204, 143, 0.25);

          border-radius: 999px;

          background:
            rgba(226, 203, 143, 0.12);

          color: #e6d39b;
          font-size: 13px;
          font-weight: 600;
        }

        /* TITULOS */

        .jv-login h1 {
          margin: 28px 0 20px;

          font-family:
            Georgia, 'Times New Roman', serif;

          font-size:
            clamp(34px, 3.4vw, 49px);

          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.7px;
          color: #f5f1e6;
        }

        .jv-login h1 span {
          display: block;
          margin-top: 6px;
          color: #e7d39a;
          font-style: italic;
          font-weight: 400;
        }

        .jv-login .jv-description {
          margin: 0;
          color: #c4d2c7;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.8;
        }

        /* TARJETAS DE CARACTERISTICAS */

        .jv-login .jv-features {
          display: grid;
          gap: 12px;
          margin-top: 36px;
        }

        .jv-login .jv-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;

          border:
            1px solid rgba(190, 213, 197, 0.18);

          border-radius: 18px;

          background:
            rgba(100, 147, 122, 0.07);
        }

        .jv-login .jv-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: grid;
          place-items: center;

          border-radius: 13px;

          background:
            rgba(213, 186, 112, 0.18);

          color: #ead69d;
          font-size: 18px;
          font-weight: 800;
        }

        .jv-login .jv-feature h3 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 700;
          color: #f3f5f2;
        }

        .jv-login .jv-feature p {
          margin: 0;
          color: #b9cabd;
          font-size: 13px;
          line-height: 1.5;
        }

        /* PANEL DERECHO */

        .jv-login .jv-form-panel {
          display: flex;
          align-items: center;
          padding: 46px;

          background:
            linear-gradient(
              155deg,
              rgba(24, 52, 40, 0.22),
              rgba(3, 21, 15, 0.30)
            );
        }

        .jv-login .jv-form-content {
          width: 100%;
          min-width: 0;
        }

        .jv-login .jv-heading {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .jv-login h2 {
          margin: 0;
          color: #f5f1e6;

          font-family:
            Georgia, 'Times New Roman', serif;

          font-size:
            clamp(30px, 3vw, 40px);

          font-weight: 700;
          line-height: 1.2;
        }

        .jv-login .jv-intro {
          margin: 16px 0 30px;
          color: #bdcbc3;
          font-size: 15px;
          line-height: 1.6;
        }

        /* CAMPOS */

        .jv-login .jv-field {
          margin-bottom: 19px;
        }

        .jv-login .jv-label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 9px;

          color: #e0e7e2;
          font-size: 16px;
          font-weight: 650;
        }

        .jv-login .jv-required {
          color: #e3ac9b;
          font-size: 14px;
          font-weight: 400;
        }

        .jv-login .jv-input {
          width: 100%;
          min-width: 0;
          height: 51px;
          padding: 0 17px;

          border:
            1px solid rgba(168, 191, 190, 0.3);

          border-radius: 13px;
          outline: none;

          background:
            rgba(236, 243, 255, 0.96);

          color: #11251b;
          font-family: inherit;
          font-size: 15px;
        }

        .jv-login .jv-input::placeholder {
          color: #697b73;
        }

        .jv-login .jv-input:focus {
          border-color: #d6bc79;

          box-shadow:
            0 0 0 3px rgba(214, 188, 121, 0.18);
        }

        /* CONTRASEÑA */

        .jv-login .jv-password {
          display: flex;
          overflow: hidden;

          border:
            1px solid rgba(168, 191, 190, 0.3);

          border-radius: 13px;

          background:
            rgba(236, 243, 255, 0.96);
        }

        .jv-login .jv-password .jv-input {
          flex: 1;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }

        .jv-login .jv-toggle {
          flex-shrink: 0;
          padding: 0 19px;
          border: 0;

          border-left:
            1px solid rgba(191, 212, 195, 0.22);

          background: #314b3e;
          color: #f0f2e9;

          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .jv-login .jv-toggle:hover {
          background: #41634f;
        }

        /* OPCIONES */

        .jv-login .jv-options {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin: 6px 0 27px;
          font-size: 14px;
        }

        .jv-login .jv-remember {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #c5d1ca;
          cursor: pointer;
        }

        .jv-login .jv-checkbox {
          appearance: auto;
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: #d5ba79;
          cursor: pointer;
        }

        .jv-login .jv-forgot {
          color: #e7d39a;
          font-weight: 650;
          text-decoration: none;
        }

        .jv-login .jv-forgot:hover {
          text-decoration: underline;
        }

        /* BOTON INICIAR SESION */

        .jv-login .jv-submit {
          width: 100%;
          min-height: 54px;
          padding: 14px 18px;

          border: 0;
          border-radius: 14px;

          background:
            linear-gradient(
              110deg,
              #ead8a6,
              #c6a65c
            );

          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.2);

          color: #122b21;
          font-family: inherit;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1.4px;
          cursor: pointer;
        }

        .jv-login .jv-submit:hover {
          filter: brightness(1.08);
        }

        .jv-login .jv-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        /* DIVISOR */

        .jv-login .jv-divider {
          display: flex;
          align-items: center;
          gap: 17px;
          margin: 30px 0;
          color: #acbeb2;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .jv-login .jv-divider::before,
        .jv-login .jv-divider::after {
          content: '';
          flex: 1;
          height: 1px;

          background:
            rgba(192, 210, 195, 0.2);
        }

        /* REGISTRO */

        .jv-login .jv-register {
          padding: 23px;

          border:
            1px solid rgba(218, 192, 121, 0.25);

          border-radius: 18px;

          background:
            rgba(110, 144, 113, 0.10);

          text-align: center;
        }

        .jv-login .jv-register p {
          margin: 0 0 15px;
          color: #c5d1ca;
          font-size: 14px;
        }

        .jv-login .jv-register-link {
          display: block;
          padding: 13px 10px;

          border:
            2px solid rgba(213, 186, 112, 0.65);

          border-radius: 12px;
          color: #e7d39a;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: 1px;
          text-decoration: none;
        }

        .jv-login .jv-register-link:hover {
          background:
            rgba(231, 211, 154, 0.08);
        }

        .jv-login .jv-footer {
          margin: 26px 0 0;
          color: #a9bcb0;
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        /* MENSAJES */

        .jv-login .jv-alert {
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #985955;
          border-radius: 11px;
          background: #452c29;
          color: #ffe0d9;
          font-size: 14px;
        }

        .jv-login .jv-success {
          border-color: #4b8c70;
          background: #1f4635;
          color: #d0f4df;
        }

        /* ACCESIBILIDAD */

        .jv-login button:focus-visible,
        .jv-login a:focus-visible,
        .jv-login .jv-checkbox:focus-visible {
          outline: 2px solid #ead69d;
          outline-offset: 4px;
        }

        /* DISEÑO RESPONSIVE */

        @media (max-width: 800px) {
          .jv-login {
            padding: 20px 14px;
            background-attachment: scroll;
          }

          .jv-login .jv-card {
            max-width: 560px;
            grid-template-columns: 1fr;
          }

          .jv-login .jv-info {
            padding: 28px;
            border-right: 0;

            border-bottom:
              1px solid rgba(194, 214, 194, 0.15);
          }

          .jv-login .jv-form-panel {
            padding: 30px 28px;
          }

          .jv-login .jv-features {
            margin-top: 25px;
          }
        }

        @media (max-width: 400px) {
          .jv-login .jv-info,
          .jv-login .jv-form-panel {
            padding: 24px 20px;
          }

          .jv-login .jv-register {
            padding: 18px 13px;
          }
        }
      `}</style>

      <section
        className="jv-card"
        aria-label="Acceso a la comunidad"
      >
        <div className="jv-info">

          <div className="jv-logo">
            JV
          </div>

          <span className="jv-badge">
            Comunidad conectada
          </span>

          <h1>
            Tu comunidad,
            <span>
              más cerca de ti
            </span>
          </h1>

          <p className="jv-description">
            Accede a la plataforma de gestión comunitaria
            para participar, informarte y realizar tus
            trámites con tu Junta de Vecinos.
          </p>

          <div className="jv-features">

            <div className="jv-feature">
              <div
                className="jv-icon"
                aria-hidden="true"
              >
                C
              </div>

              <div>
                <h3>Comunicación</h3>
                <p>
                  Mantente informado de tu comunidad.
                </p>
              </div>
            </div>

            <div className="jv-feature">
              <div
                className="jv-icon"
                aria-hidden="true"
              >
                P
              </div>

              <div>
                <h3>Participación</h3>
                <p>
                  Eventos, actividades y solicitudes.
                </p>
              </div>
            </div>

            <div className="jv-feature">
              <div
                className="jv-icon"
                aria-hidden="true"
              >
                G
              </div>

              <div>
                <h3>Gestión</h3>
                <p>
                  Todo en un solo lugar.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="jv-form-panel">
          <div className="jv-form-content">

            <div className="jv-heading">
              <h2>Iniciar sesión</h2>

              <span className="jv-badge">
                Acceso
              </span>
            </div>

            <p className="jv-intro">
              Ingresa tus credenciales para acceder
              a la plataforma.
            </p>

            {error && (
              <div
                className="jv-alert"
                role="alert"
              >
                {error}
              </div>
            )}

            {mensaje && (
              <div
                className="jv-alert jv-success"
                role="status"
              >
                {mensaje}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              aria-busy={cargando}
            >

              <div className="jv-field">

                <label
                  className="jv-label"
                  htmlFor="username"
                >
                  Usuario

                  <span className="jv-required">
                    Obligatorio
                  </span>
                </label>

                <input
                  className="jv-input"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                />

              </div>

              <div className="jv-field">

                <label
                  className="jv-label"
                  htmlFor="password"
                >
                  Contraseña

                  <span className="jv-required">
                    Obligatorio
                  </span>
                </label>

                <div className="jv-password">

                  <input
                    className="jv-input"
                    id="password"
                    name="password"
                    type={
                      mostrarPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    className="jv-toggle"
                    type="button"
                    aria-label={
                      mostrarPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                    aria-pressed={mostrarPassword}
                    onClick={() =>
                      setMostrarPassword(
                        (actual) => !actual
                      )
                    }
                  >
                    {mostrarPassword
                      ? 'Ocultar'
                      : 'Ver'}
                  </button>

                </div>
              </div>

              <div className="jv-options">

                <label className="jv-remember">

                  <input
                    className="jv-checkbox"
                    type="checkbox"
                    checked={recordar}
                    onChange={(event) =>
                      setRecordar(event.target.checked)
                    }
                  />

                  Recordarme
                </label>

                <Link
                  className="jv-forgot"
                  to="/recuperar-password"
                >
                  ¿Olvidaste tu contraseña?
                </Link>

              </div>

              <button
                className="jv-submit"
                type="submit"
                disabled={cargando}
              >
                {cargando
                  ? 'INGRESANDO…'
                  : 'INICIAR SESIÓN'}
              </button>

            </form>

            <div className="jv-divider">
              ¿ERES NUEVO?
            </div>

            <div className="jv-register">

              <p>
                ¿Aún no tienes una cuenta?
              </p>

              <Link
                className="jv-register-link"
                to="/registro"
              >
                CREAR CUENTA DE VECINO
              </Link>

            </div>

            <p className="jv-footer">
              Plataforma de Gestión Comunitaria
              {' · '}
              Junta de Vecinos
            </p>

          </div>
        </div>

      </section>
    </main>
  )
}

export default LoginPage
