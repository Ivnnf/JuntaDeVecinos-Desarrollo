
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'


function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [requiere2FA, setRequiere2FA] = useState(false)
  const [challengeToken, setChallengeToken] = useState('')
  const [codigo2FA, setCodigo2FA] = useState('')

  const [requiereConfigurar2FA, setRequiereConfigurar2FA] =
    useState(false)

  const [provisioningUri, setProvisioningUri] =
    useState('')

  const [secreto2FA, setSecreto2FA] =
    useState('')

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

      if (data.requiere_configurar_2fa === true) {
        const tokenDesafio = data.challenge_token

        setChallengeToken(tokenDesafio)

        const prepararResponse = await fetch(
          'http://localhost:8000/api/auth/2fa/preparar-inicial/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              challenge_token: tokenDesafio,
            }),
          }
        )

        const prepararData = await prepararResponse.json()

        if (!prepararResponse.ok) {
          setError(
            prepararData.detail ??
            'No fue posible preparar la autenticación en dos pasos.'
          )
          return
        }

        setProvisioningUri(
          prepararData.provisioning_uri
        )

        setSecreto2FA(
          prepararData.secreto
        )

        setRequiereConfigurar2FA(true)

        setMensaje(
          'Debes configurar la autenticación en dos pasos antes de continuar.'
        )

        return
      }


      if (data.requiere_2fa === true) {
        setChallengeToken(data.challenge_token)
        setRequiere2FA(true)
        setMensaje('Ingresa el código de 6 dígitos de tu aplicación Authenticator.')
        return
      }

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

  async function handleVerificar2FA() {
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/2fa/verificar/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            challenge_token: challengeToken,
            codigo: codigo2FA,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
          'No fue posible verificar el código.'
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
  async function handleActivar2FAInicial() {
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/2fa/activar-inicial/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            challenge_token: challengeToken,
            codigo: codigo2FA,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setRequiereConfigurar2FA(false)
          setProvisioningUri('')
          setSecreto2FA('')
          setChallengeToken('')
          setCodigo2FA('')
        }

        setError(
          data.detail ??
          'No fue posible activar la autenticación en dos pasos.'
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

      setMensaje(
        'Autenticación en dos pasos configurada correctamente.'
      )
    } catch {
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setCargando(false)
    }
  }
  const pasoActual = requiereConfigurar2FA ? 'configurar' : requiere2FA ? 'verificar' : 'ingresar'

  return (
    <main className="jv-login">
      <style>{`
        .jv-login, .jv-login * { box-sizing: border-box; }
        .jv-login {
          --gold: #e9cd8d; --cream: #faf5e8; --muted: #c2d0c7;
          min-height: 100vh; min-height: 100dvh;
          display:flex; align-items:center; justify-content:center;
          padding: clamp(18px, 4vw, 60px) 20px;
          color: var(--cream); font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(115deg,rgba(3,23,17,.57),rgba(4,26,19,.74)),url('/junta-v.jpg') center/cover fixed no-repeat #0b241a;
        }
        .jv-login button, .jv-login input { font: inherit; }
        .jv-login .jv-shell { width:min(1120px,100%); display:grid; grid-template-columns: minmax(0,.93fr) minmax(0,1.07fr); border-radius:26px; overflow:hidden; border:1px solid rgba(234,205,136,.47); background:#0e2b20; box-shadow:0 26px 90px rgba(0,0,0,.43); }
        .jv-login .jv-aside { display:flex; flex-direction:column; min-height:650px; padding:clamp(28px,4vw,54px); background:linear-gradient(160deg,rgba(5,27,20,.91),rgba(8,39,29,.89)),url('/directivas-inicio.webp') center/cover no-repeat; border-right:1px solid rgba(232,204,136,.22); }
        .jv-login .jv-brand { display:flex; align-items:center; gap:14px; }
        .jv-login .jv-monogram { width:54px;height:54px;flex:none;display:grid;place-items:center;border-radius:16px;background:linear-gradient(135deg,#f9e3aa,#c4a14b);color:#153326;font-family:Georgia,serif;font-size:21px;font-weight:800;box-shadow:0 7px 25px rgba(0,0,0,.22); }
        .jv-login .jv-brand-text { display:flex; flex-direction:column; gap:4px; }
        .jv-login .jv-brand-text strong {font-size:15px;letter-spacing:.02em;}
        .jv-login .jv-brand-text small {font-size:12px;color:#cad9cd;}
        .jv-login .jv-aside-body { margin:auto 0; padding:45px 0 35px; }
        .jv-login .jv-eyebrow {font-size:11px;letter-spacing:.20em;text-transform:uppercase;font-weight:800;color:#f1d494;}
        .jv-login h1,.jv-login h2,.jv-login h3 {font-family:Georgia,'Times New Roman',serif;letter-spacing:-.025em;color:var(--cream);}
        .jv-login h1 {font-size:clamp(36px,4vw,52px);line-height:1.12;margin:18px 0 20px;}
        .jv-login h1 em {display:block;color:#f0d393;font-weight:400;font-style:normal;}
        .jv-login .jv-about {font-size:15px;line-height:1.75;color:#dfebe0;max-width:400px;margin:0;}
        .jv-login .jv-capabilities {display:grid;gap:12px;margin-top:36px;}
        .jv-login .jv-capability {display:flex;align-items:center;gap:13px;padding:13px 15px;border-radius:13px;background:rgba(2,25,17,.39);border:1px solid rgba(211,232,217,.16);}
        .jv-login .jv-capability-mark {width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;font-size:17px;font-weight:800;}
        .jv-login .jv-capability:nth-child(1) .jv-capability-mark {background:rgba(133,209,245,.16);color:#a8ddff;}
        .jv-login .jv-capability:nth-child(2) .jv-capability-mark {background:rgba(145,231,184,.16);color:#a8edc2;}
        .jv-login .jv-capability:nth-child(3) .jv-capability-mark {background:rgba(205,178,248,.18);color:#dcc5ff;}
        .jv-login .jv-capability strong {display:block;font-size:13px;color:#fff5e4;}
        .jv-login .jv-capability small {display:block;font-size:12px;color:#c2d2c4;margin-top:3px;}
        .jv-login .jv-aside-footer {font-size:12px;line-height:1.6;color:#b8ccbe;}
        .jv-login .jv-content {padding:clamp(26px,4vw,54px);background:radial-gradient(circle at top right,rgba(213,184,103,.08),transparent 42%),linear-gradient(155deg,#123528,#0b261c);display:flex;flex-direction:column;justify-content:center;min-width:0;}
        .jv-login .jv-content-inner {width:100%;max-width:475px;margin:0 auto;}
        .jv-login .jv-step-label {display:inline-flex;align-items:center;gap:8px;color:#f2d797;background:rgba(236,203,133,.10);border:1px solid rgba(236,203,133,.33);border-radius:999px;padding:7px 12px;font-weight:700;font-size:12px;}
        .jv-login h2 {font-size:clamp(29px,3vw,38px);margin:18px 0 9px;line-height:1.18;}
        .jv-login .jv-intro {font-size:14px;line-height:1.7;color:var(--muted);margin:0 0 27px;}
        .jv-login .jv-alert {padding:13px 15px;margin:0 0 19px;border-radius:12px;line-height:1.55;font-size:13px;border:1px solid #e5a0a4;background:rgba(114,40,47,.54);color:#ffe7e7;overflow-wrap:anywhere;}
        .jv-login .jv-alert-success {border-color:#7ad8a2;background:rgba(31,99,65,.42);color:#dcfbe8;}
        .jv-login .jv-field {margin-bottom:20px;}
        .jv-login .jv-label {display:block;font-size:13px;color:#f4ebd7;font-weight:700;margin-bottom:9px;}
        .jv-login .jv-input {width:100%;min-width:0;height:50px;border-radius:11px;border:1px solid #b2c8ba;background:#f5f8f4;color:#173327;padding:0 15px;font-size:15px;outline:none;transition:box-shadow .18s,border-color .18s;}
        .jv-login .jv-input::placeholder {color:#677b70;}
        .jv-login .jv-input:focus {border-color:#e8ca7d;box-shadow:0 0 0 3px rgba(234,202,127,.23);}
        .jv-login .jv-password {display:flex;align-items:stretch;border:1px solid #b2c8ba;border-radius:11px;overflow:hidden;background:#f5f8f4;}
        .jv-login .jv-password:focus-within {border-color:#e8ca7d;box-shadow:0 0 0 3px rgba(234,202,127,.23);}
        .jv-login .jv-password .jv-input {border:0;border-radius:0;box-shadow:none;flex:1;}
        .jv-login .jv-visibility {flex:none;border:0;border-left:1px solid #d2ded5;background:#edf1ea;color:#264a38;padding:0 17px;font-size:13px;font-weight:750;cursor:pointer;}
        .jv-login .jv-visibility:hover {background:#e3eadd;}
        .jv-login .jv-options {display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:7px 0 26px;}
        .jv-login .jv-remember {display:flex;gap:9px;align-items:center;color:#dce6dc;font-size:13px;cursor:pointer;}
        .jv-login .jv-remember input {width:17px;height:17px;accent-color:#b7ddbc;}
        .jv-login .jv-link {color:#f2d99f;text-decoration:none;font-weight:700;font-size:13px;}
        .jv-login .jv-link:hover {text-decoration:underline;}
        .jv-login .jv-submit {display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:51px;width:100%;padding:12px 17px;background:linear-gradient(115deg,#f2dd9f,#d8b35f);border:1px solid #f4dfa9;border-radius:12px;color:#153226;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18);transition:filter .18s,transform .18s;}
        .jv-login .jv-submit:hover:not(:disabled) {filter:brightness(1.08);transform:translateY(-1px);}
        .jv-login .jv-submit:disabled {opacity:.55;cursor:not-allowed;}
        .jv-login .jv-outline {min-height:47px;border:1px solid rgba(227,203,148,.55);background:rgba(234,202,137,.08);border-radius:11px;color:#f2dfb7;font-size:13px;font-weight:750;cursor:pointer;padding:11px 16px;}
        .jv-login .jv-outline:hover {background:rgba(234,202,137,.15);}
        .jv-login .jv-separator {display:flex;align-items:center;gap:13px;margin:28px 0 20px;color:#b5c9bb;font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;}
        .jv-login .jv-separator::before,.jv-login .jv-separator::after {content:'';flex:1;height:1px;background:rgba(224,206,163,.22);}
        .jv-login .jv-register {padding:19px 20px;border-radius:15px;background:rgba(170,212,184,.065);border:1px solid rgba(202,225,207,.18);text-align:center;}
        .jv-login .jv-register p {font-size:13px;color:#d3e0d4;margin:0 0 12px;}
        .jv-login .jv-register-link {display:flex;justify-content:center;align-items:center;min-height:44px;border:1px solid rgba(234,203,138,.65);border-radius:10px;color:#f5de9d;font-size:13px;font-weight:800;text-decoration:none;}
        .jv-login .jv-register-link:hover {background:rgba(234,203,138,.11);}
        .jv-login .jv-privacy {display:flex;align-items:center;justify-content:center;gap:7px;margin:23px 0 0;font-size:12px;color:#b8ccbe;text-align:center;}
        .jv-login .jv-2fa-step {margin:20px 0 0;}
        .jv-login .jv-2fa-guide {padding:16px 17px;border:1px solid rgba(145,203,241,.38);border-radius:13px;background:rgba(99,166,208,.095);color:#d9ebf3;font-size:13px;line-height:1.65;}
        .jv-login .jv-2fa-guide strong {display:block;color:#b6def7;margin-bottom:8px;font-size:14px;}
        .jv-login .jv-2fa-guide ol {margin:0;padding-left:20px;}
        .jv-login .jv-2fa-guide li+li {margin-top:5px;}
        .jv-login .jv-expiration {margin-top:13px;border-left:3px solid #e9cb82;background:rgba(232,195,114,.09);border-radius:5px;padding:11px 13px;color:#f2ddad;font-size:12px;line-height:1.6;}
        .jv-login .jv-qr-wrap {display:flex;justify-content:center;margin:19px 0;}
        .jv-login .jv-qr {padding:18px;border-radius:16px;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.2);}
        .jv-login .jv-secret {margin:0 0 21px;padding:14px 16px;border:1px solid rgba(219,192,131,.32);background:rgba(5,25,17,.45);border-radius:12px;}
        .jv-login .jv-secret-label {display:block;color:#bdcfc1;font-size:12px;margin-bottom:7px;}
        .jv-login .jv-secret code {display:block;font-size:14px;font-weight:750;letter-spacing:.06em;overflow-wrap:anywhere;user-select:all;color:#f5df9d;}
        .jv-login .jv-helper {font-size:12px;line-height:1.6;color:#bdd0c2;margin:8px 0 0;}
        .jv-login button:focus-visible,.jv-login a:focus-visible,.jv-login input[type=checkbox]:focus-visible {outline:2px solid #f3d896;outline-offset:3px;}
        @media(max-width:840px) { .jv-login .jv-shell {grid-template-columns:1fr;max-width:570px;} .jv-login .jv-aside {min-height:auto;padding:26px 30px;border-right:0;border-bottom:1px solid rgba(232,204,136,.22);} .jv-login .jv-aside-body {padding:24px 0 8px;} .jv-login h1 {font-size:33px;margin:12px 0;} .jv-login .jv-capabilities {grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:19px;} .jv-login .jv-capability {padding:9px;align-items:flex-start;} .jv-login .jv-capability-mark {display:none;} .jv-login .jv-capability small {font-size:11px;} .jv-login .jv-aside-footer {display:none;} .jv-login .jv-content {padding:32px 30px;} }
        @media(max-width:460px) { .jv-login {padding:12px;background-attachment:scroll;} .jv-login .jv-shell {border-radius:18px;} .jv-login .jv-aside,.jv-login .jv-content {padding:24px 20px;} .jv-login .jv-capabilities {grid-template-columns:1fr;} .jv-login .jv-capability {padding:9px 12px;} .jv-login .jv-about {font-size:13px;} .jv-login .jv-options {align-items:flex-start;} .jv-login .jv-qr {padding:12px;} }
        @media(prefers-reduced-motion:reduce) { .jv-login .jv-submit,.jv-login .jv-input {transition:none;} }
      `}</style>

      <section className="jv-shell" aria-label="Acceso a la plataforma comunitaria">
        <aside className="jv-aside">
          <div className="jv-brand">
            <div className="jv-monogram" aria-hidden="true">JV</div>
            <div className="jv-brand-text"><strong>Juntas de Vecinos</strong><small>Plataforma de gestión comunitaria</small></div>
          </div>
          <div className="jv-aside-body">
            <span className="jv-eyebrow">Conexión y participación</span>
            <h1>Tu comunidad, <em>más cerca de ti.</em></h1>
            <p className="jv-about">Un espacio para mantenerte informado, participar en actividades y gestionar tus solicitudes con tu Junta de Vecinos.</p>
            <div className="jv-capabilities">
              <div className="jv-capability"><span className="jv-capability-mark" aria-hidden="true">✉</span><div><strong>Comunicación</strong><small>Noticias y mensajes de tu comunidad</small></div></div>
              <div className="jv-capability"><span className="jv-capability-mark" aria-hidden="true">✓</span><div><strong>Participación</strong><small>Actividades y eventos comunitarios</small></div></div>
              <div className="jv-capability"><span className="jv-capability-mark" aria-hidden="true">◈</span><div><strong>Gestiones</strong><small>Solicitudes y seguimiento en un lugar</small></div></div>
            </div>
          </div>
          <div className="jv-aside-footer">APT · Gestión y caracterización comunitaria</div>
        </aside>

        <section className="jv-content" aria-label="Formulario de acceso">
          <div className="jv-content-inner">
            <span className="jv-step-label">
              {pasoActual === 'ingresar' ? 'Acceso a tu cuenta' : pasoActual === 'verificar' ? 'Seguridad · Paso 2 de 2' : 'Seguridad · Configuración inicial'}
            </span>
            <h2>{pasoActual === 'ingresar' ? 'Bienvenido de nuevo' : pasoActual === 'verificar' ? 'Verifica tu identidad' : 'Protege tu cuenta'}</h2>
            <p className="jv-intro">
              {pasoActual === 'ingresar'
                ? 'Ingresa tus credenciales para continuar a tu espacio comunitario.'
                : pasoActual === 'verificar'
                ? 'Abre tu aplicación Authenticator y escribe el código temporal de seis dígitos.'
                : 'Vincula tu cuenta a una aplicación Authenticator antes de ingresar a la plataforma.'}
            </p>

            {error && <div className="jv-alert" role="alert">{error}</div>}
            {mensaje && <div className="jv-alert jv-alert-success" role="status">{mensaje}</div>}

            {pasoActual === 'ingresar' && (
              <form onSubmit={handleSubmit} aria-busy={cargando}>
                <div className="jv-field">
                  <label className="jv-label" htmlFor="username">Nombre de usuario</label>
                  <input className="jv-input" id="username" name="username" type="text" autoComplete="username" placeholder="Tu nombre de usuario" value={username} onChange={event => setUsername(event.target.value)} disabled={cargando} required />
                </div>
                <div className="jv-field">
                  <label className="jv-label" htmlFor="password">Contraseña</label>
                  <div className="jv-password">
                    <input className="jv-input" id="password" name="password" type={mostrarPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={event => setPassword(event.target.value)} disabled={cargando} required />
                    <button className="jv-visibility" type="button" aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarPassword} onClick={() => setMostrarPassword(actual => !actual)}>{mostrarPassword ? 'Ocultar' : 'Mostrar'}</button>
                  </div>
                </div>
                <div className="jv-options">
                  <label className="jv-remember"><input type="checkbox" checked={recordar} onChange={event => setRecordar(event.target.checked)} /> Recordarme</label>
                  <Link className="jv-link" to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
                </div>
                <button className="jv-submit" type="submit" disabled={cargando}>{cargando ? 'Iniciando sesión…' : 'Iniciar sesión'}</button>
              </form>
            )}

            {pasoActual === 'configurar' && provisioningUri && (
              <div className="jv-2fa-step">
                <div className="jv-2fa-guide">
                  <strong>Configura tu autenticación en dos pasos</strong>
                  <ol>
                    <li>Abre Microsoft Authenticator, Google Authenticator u otra aplicación compatible.</li>
                    <li>Agrega una cuenta y selecciona la opción para escanear un código QR.</li>
                    <li>Escanea el código y escribe el código temporal de seis dígitos para activar la protección.</li>
                  </ol>
                </div>
                <div className="jv-expiration"><strong>Configuración temporal:</strong> completa este paso dentro de los próximos 5 minutos. Si expira, vuelve a iniciar sesión.</div>
                <div className="jv-qr-wrap"><div className="jv-qr"><QRCodeSVG value={provisioningUri} size={210} /></div></div>
                <div className="jv-secret"><span className="jv-secret-label">¿No puedes escanear el QR? Ingresa esta clave manualmente:</span><code>{secreto2FA}</code><p className="jv-helper">Mantén esta clave privada. No la compartas con otras personas.</p></div>
                <div className="jv-field">
                  <label className="jv-label" htmlFor="codigo2FAInicial">Código de verificación</label>
                  <input className="jv-input" id="codigo2FAInicial" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={codigo2FA} onChange={event => setCodigo2FA(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} disabled={cargando} required />
                </div>
                <button className="jv-submit" type="button" disabled={cargando || codigo2FA.length !== 6} onClick={() => void handleActivar2FAInicial()}>{cargando ? 'Activando protección…' : 'Activar y continuar'}</button>
              </div>
            )}

            {pasoActual === 'verificar' && (
              <div className="jv-2fa-step">
                <div className="jv-2fa-guide"><strong>Autenticación de dos factores</strong>Utiliza el código temporal de tu aplicación Authenticator. Por seguridad, el código cambia periódicamente.</div>
                <div className="jv-field" style={{marginTop:22}}>
                  <label className="jv-label" htmlFor="codigo2FA">Código de seis dígitos</label>
                  <input className="jv-input" id="codigo2FA" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={codigo2FA} onChange={event => setCodigo2FA(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} disabled={cargando} required />
                </div>
                <button className="jv-submit" type="button" disabled={cargando || codigo2FA.length !== 6} onClick={() => void handleVerificar2FA()}>{cargando ? 'Verificando código…' : 'Verificar código e ingresar'}</button>
              </div>
            )}

            {pasoActual !== 'ingresar' && (
              <button type="button" className="jv-outline" style={{width:'100%',marginTop:14}} disabled={cargando} onClick={() => { setRequiere2FA(false); setRequiereConfigurar2FA(false); setChallengeToken(''); setCodigo2FA(''); setProvisioningUri(''); setSecreto2FA(''); setError(''); setMensaje('') }}>Volver al inicio de sesión</button>
            )}

            {pasoActual === 'ingresar' && (
              <>
                <div className="jv-separator">¿Todavía no tienes cuenta?</div>
                <div className="jv-register"><p>Únete a tu comunidad y comienza a participar.</p><Link className="jv-register-link" to="/registro">Crear cuenta de vecino</Link></div>
              </>
            )}
            <p className="jv-privacy"><span aria-hidden="true">✧</span> Plataforma comunitaria · Acceso protegido</p>
          </div>
        </section>
      </section>
    </main>
  )
}

export default LoginPage
