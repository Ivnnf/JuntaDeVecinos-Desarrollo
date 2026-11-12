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
        .jv-recuperar, .jv-recuperar * { box-sizing: border-box; }
        .jv-recuperar {
          min-height: 100vh; min-height: 100dvh; display:flex; align-items:center;
          justify-content:center; padding:clamp(18px,4vw,52px) 18px;
          font-family: 'Segoe UI', Arial, sans-serif; color:#f5f6f1;
          background: linear-gradient(120deg,rgba(4,24,17,.68),rgba(5,31,23,.54)),
            url('/nños.webp') center/cover fixed no-repeat; background-color:#0b241b;
        }
        .jv-recuperar .rc-card {
          display:grid; grid-template-columns: minmax(0,.93fr) minmax(0,1.07fr);
          width:100%; max-width:1050px; overflow:hidden; border-radius:26px;
          border:1px solid rgba(237,215,161,.46);
          background:#f8faf5; box-shadow:0 28px 95px rgba(0,15,9,.40);
        }
        .jv-recuperar .rc-info {
          padding:clamp(30px,4vw,52px); display:flex; flex-direction:column;
          background: linear-gradient(142deg,rgba(7,44,31,.92),rgba(8,35,26,.96)),
            url('/nños.webp') center/cover no-repeat;
          border-right:1px solid rgba(227,203,147,.22);
        }
        .jv-recuperar .rc-logo {
          display:grid; place-items:center; width:70px; height:70px; margin-bottom:25px;
          border-radius:20px; background:linear-gradient(130deg,#f8e7b1,#ddb96c);
          box-shadow:0 8px 24px rgba(0,0,0,.18); color:#143426;
          font-size:25px; font-weight:850; letter-spacing:-1px;
        }
        .jv-recuperar .rc-badge {
          display:inline-flex; align-items:center; width:max-content; max-width:100%;
          padding:7px 14px; border:1px solid rgba(233,209,148,.49);
          border-radius:999px; background:rgba(236,211,153,.13);
          color:#f4dd9e; font-size:12px; font-weight:750; letter-spacing:.025em;
        }
        .jv-recuperar h1, .jv-recuperar h2 { font-family:Georgia,'Times New Roman',serif; letter-spacing:-.025em; }
        .jv-recuperar h1 { margin:23px 0 17px; font-size:clamp(34px,3.7vw,47px); line-height:1.12; color:#fffaf0; }
        .jv-recuperar h1 span { display:block; margin-top:8px; color:#f3d68c; font-weight:400; font-style:italic; }
        .jv-recuperar .rc-description { margin:0; color:#e0ece3; font-size:15px; line-height:1.8; }
        .jv-recuperar .rc-steps {
          margin-top:33px; padding:23px 22px; border:1px solid rgba(204,230,212,.20);
          border-radius:18px; background:rgba(5,30,21,.52);
        }
        .jv-recuperar .rc-steps h3 { margin:0 0 21px; font-size:16px; color:#f5e4b3; font-weight:750; }
        .jv-recuperar .rc-steps ol { display:grid; gap:21px; list-style:none; padding:0; margin:0; }
        .jv-recuperar .rc-step { display:flex; align-items:flex-start; gap:13px; }
        .jv-recuperar .rc-number {
          display:grid; flex:0 0 32px; place-items:center; width:32px; height:32px;
          border-radius:10px; background:rgba(136,213,171,.17);
          border:1px solid rgba(145,225,181,.38); color:#aff0ca; font-weight:800; font-size:13px;
        }
        .jv-recuperar .rc-step:nth-child(2) .rc-number { background:rgba(143,204,246,.16); border-color:rgba(143,204,246,.38); color:#b6e3ff; }
        .jv-recuperar .rc-step:nth-child(3) .rc-number { background:rgba(237,201,125,.16); border-color:rgba(237,201,125,.38); color:#f6dc9d; }
        .jv-recuperar .rc-step p { margin:3px 0 0; color:#e3ede5; font-size:13px; line-height:1.65; }
        .jv-recuperar .rc-panel {
          display:flex; align-items:center; min-width:0; padding:clamp(30px,4.8vw,58px);
          background:linear-gradient(155deg,#fbfcf8,#eff4ec); color:#18352a;
        }
        .jv-recuperar .rc-content { width:100%; min-width:0; }
        .jv-recuperar .rc-heading { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
        .jv-recuperar .rc-heading .rc-badge { color:#226247; background:#e1f2e7; border-color:#a2d9bb; }
        .jv-recuperar h2 { margin:0; font-size:clamp(29px,3vw,37px); line-height:1.2; color:#173d2b; }
        .jv-recuperar .rc-intro { margin:14px 0 30px; font-size:15px; line-height:1.75; color:#53695c; }
        .jv-recuperar .rc-label {
          display:flex; align-items:baseline; flex-wrap:wrap; gap:8px;
          margin-bottom:10px; font-weight:750; font-size:14px; color:#214734;
        }
        .jv-recuperar .rc-required { color:#9d5d33; font-weight:550; font-size:12px; }
        .jv-recuperar .rc-input {
          display:block; width:100%; height:54px; min-width:0; border-radius:12px;
          padding:0 16px; border:1px solid #b7cabd; outline:none;
          background:#ffffff; color:#193a29; font:inherit; font-size:15px;
          transition:border-color .2s, box-shadow .2s;
        }
        .jv-recuperar .rc-input::placeholder { color:#788d81; opacity:1; }
        .jv-recuperar .rc-input:focus { border-color:#3d956b; box-shadow:0 0 0 4px rgba(69,156,109,.16); }
        .jv-recuperar .rc-help { display:block; margin-top:9px; font-size:12px; color:#637a6b; line-height:1.6; }
        .jv-recuperar .rc-note {
          margin:23px 0; padding:16px 18px; border:1px solid #b8d8c3;
          border-left:4px solid #57a77a; border-radius:12px; background:#eaf5ec;
          color:#355a44; font-size:13px; line-height:1.7;
        }
        .jv-recuperar .rc-submit {
          display:flex; justify-content:center; align-items:center; gap:10px; width:100%;
          min-height:54px; padding:13px 18px; border:1px solid #286746;
          border-radius:13px; background:linear-gradient(115deg,#2b8659,#1b6243);
          color:#fff; font:inherit; font-size:14px; font-weight:800; letter-spacing:.045em;
          cursor:pointer; box-shadow:0 9px 20px rgba(22,93,57,.20);
          transition:transform .2s, filter .2s, box-shadow .2s;
        }
        .jv-recuperar .rc-submit:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.08); box-shadow:0 13px 24px rgba(22,93,57,.25); }
        .jv-recuperar .rc-submit:disabled { opacity:.68; cursor:wait; }
        .jv-recuperar .rc-spinner { width:17px; height:17px; border:2px solid rgba(255,255,255,.32); border-top-color:#fff; border-radius:50%; animation:rc-spin .8s linear infinite; }
        @keyframes rc-spin { to { transform:rotate(360deg); } }
        .jv-recuperar .rc-back { margin-top:26px; padding-top:24px; border-top:1px solid #d9e4d8; text-align:center; }
        .jv-recuperar .rc-back p { margin:0 0 13px; font-size:13px; color:#627868; line-height:1.65; }
        .jv-recuperar .rc-back-link {
          display:inline-flex; width:100%; align-items:center; justify-content:center;
          min-height:46px; padding:12px 15px; border:1px solid #77ab89; border-radius:12px;
          color:#246749; background:#eef7ef; font-size:13px; font-weight:800;
          text-decoration:none; letter-spacing:.025em; transition:background .2s;
        }
        .jv-recuperar .rc-back-link:hover { background:#dceee1; }
        .jv-recuperar .rc-alert { margin-bottom:20px; padding:15px 17px; border:1px solid #dc9b94; border-left:4px solid #c35550; border-radius:12px; background:#fff0ee; color:#82352f; font-size:14px; line-height:1.6; overflow-wrap:anywhere; }
        .jv-recuperar .rc-success { border-color:#92d0a8; border-left-color:#2c9d65; background:#e8f8eb; color:#21633d; }
        .jv-recuperar .rc-footer { margin:24px 0 0; color:#7c8f80; font-size:12px; line-height:1.6; text-align:center; }
        .jv-recuperar button:focus-visible, .jv-recuperar a:focus-visible { outline:3px solid #e2b95e; outline-offset:3px; }
        @media(max-width:800px) {
          .jv-recuperar { padding:18px 12px; background-attachment:scroll; }
          .jv-recuperar .rc-card { max-width:570px; grid-template-columns:1fr; }
          .jv-recuperar .rc-info { padding:30px; border-right:0; border-bottom:1px solid rgba(227,203,147,.25); }
          .jv-recuperar .rc-steps { margin-top:23px; }
          .jv-recuperar .rc-panel { padding:32px 30px; }
        }
        @media(max-width:430px) {
          .jv-recuperar .rc-info, .jv-recuperar .rc-panel { padding:25px 20px; }
          .jv-recuperar .rc-steps { padding:18px 16px; }
        }
        @media(prefers-reduced-motion:reduce) {
          .jv-recuperar .rc-spinner { animation:none; }
          .jv-recuperar .rc-submit { transition:none; }
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