import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
  id: number
  nombre: string
}

type Sector = {
  id: number
  nombre: string
  junta_vecinos: number
}

function RegistroVecinoPage() {
  const [username, setUsername] = useState('')
  const [rut, setRut] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [sectorId, setSectorId] = useState('')
  const [juntaId, setJuntaId] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('ELECTRICIDAD')
  const [archivo, setArchivo] = useState<File | null>(null)

  const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
  const [sectores, setSectores] = useState<Sector[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const cargarDatosTerritoriales = async () => {
      try {
        const [responseJuntas, responseSectores] = await Promise.all([
          fetch(
            'http://localhost:8000/api/organizacion/registro/juntas-disponibles/',
            { credentials: 'include' },
          ),
          fetch(
            'http://localhost:8000/api/organizacion/registro/sectores-disponibles/',
            { credentials: 'include' },
          ),
        ])

        if (!responseJuntas.ok || !responseSectores.ok) {
          throw new Error('No fue posible cargar las juntas y sectores.')
        }

        const juntasData = await responseJuntas.json()
        const sectoresData = await responseSectores.json()

        setJuntas(juntasData)
        setSectores(sectoresData)
      } catch {
        setError('No fue posible cargar la información territorial.')
      }
    }

    void cargarDatosTerritoriales()
  }, [])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setError('')
    setMensaje('')

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!archivo) {
      setError('Debes adjuntar un comprobante de domicilio.')
      return
    }

    setCargando(true)

    try {
      const formData = new FormData()

      formData.append('username', username)
      formData.append('rut', rut)
      formData.append('nombres', nombres)
      formData.append('apellido_paterno', apellidoPaterno)
      formData.append('apellido_materno', apellidoMaterno)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('confirmar_password', confirmarPassword)
      formData.append('sector_id', sectorId)
      formData.append('tipo_documento', tipoDocumento)
      formData.append('archivo', archivo)

      const response = await fetch(
        'http://localhost:8000/api/auth/registro/',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        },
      )

      const data = await response.json()

      if (!response.ok) {
        const primerError = Object.values(data)
          .flat()
          .find((valor) => typeof valor === 'string')

        setError(
          typeof primerError === 'string'
            ? primerError
            : 'No fue posible completar el registro.',
        )
        return
      }

      setMensaje(data.message ?? 'Registro realizado correctamente.')
    } catch {
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const passwordsCoinciden =
    confirmarPassword.length === 0 || password === confirmarPassword

  const sectoresDisponibles = sectores.filter(
    (sector) =>
      juntaId !== '' && sector.junta_vecinos === Number(juntaId),
  )

  return (
    <main className="jv-registro">
      <style>{`
        .jv-registro,
        .jv-registro * {
          box-sizing: border-box;
        }

        .jv-registro {
          position: relative;
          isolation: isolate;
          min-height: 100dvh;
          padding: 36px 24px;
          color: #f1f5f1;
          background: #0c2118;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .jv-registro::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(rgba(4, 23, 16, .48), rgba(4, 23, 16, .62)),
            url('/registro-vecino.webp') center / cover no-repeat;
        }

        .jv-registro .jr-card {
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          border: 1px solid rgba(203, 218, 193, .2);
          border-radius: 28px;
          background: rgba(9, 31, 23, .48);
          box-shadow: 0 24px 70px rgba(0, 0, 0, .3);
          backdrop-filter: blur(4px);
        }

        .jv-registro .jr-sidebar {
          min-width: 0;
          padding: 36px;
          border-right: 1px solid rgba(203, 218, 193, .16);
          border-radius: 28px 0 0 28px;
          background: linear-gradient(
            145deg,
            rgba(40, 76, 56, .3),
            rgba(14, 40, 29, .15)
          );
        }

        .jv-registro .jr-sidebar-content {
          position: sticky;
          top: 28px;
        }

        .jv-registro .jr-logo {
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

        .jv-registro .jr-badge {
          display: inline-block;
          padding: 5px 11px;
          border: 1px solid rgba(225, 204, 143, .22);
          border-radius: 999px;
          background: rgba(226, 203, 143, .09);
          color: #ead69f;
          font-size: 12px;
          font-weight: 600;
        }

        .jv-registro h1 {
          margin: 25px 0 18px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(34px, 3.3vw, 44px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -.7px;
        }

        .jv-registro h1 span {
          display: block;
          margin-top: 5px;
          color: #ead69f;
          font-style: italic;
          font-weight: 400;
        }

        .jv-registro .jr-description {
          margin: 0;
          color: #d1dcd4;
          font-size: 15px;
          line-height: 1.8;
        }

        .jv-registro .jr-benefits,
        .jv-registro .jr-back {
          padding: 20px;
          border: 1px solid rgba(198, 216, 199, .18);
          border-radius: 18px;
          background: rgba(89, 134, 105, .13);
        }

        .jv-registro .jr-benefits {
          margin-top: 32px;
        }

        .jv-registro .jr-benefits h3 {
          margin: 0 0 15px;
          font-size: 16px;
          font-weight: 700;
        }

        .jv-registro .jr-benefits ul {
          display: grid;
          gap: 13px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .jv-registro .jr-benefits li {
          display: flex;
          gap: 10px;
          color: #d1dcd4;
          font-size: 14px;
          line-height: 1.6;
        }

        .jv-registro .jr-check {
          flex-shrink: 0;
          color: #e7d39a;
          font-weight: 700;
        }

        .jv-registro .jr-back {
          margin-top: 16px;
        }

        .jv-registro .jr-back p {
          margin: 0 0 15px;
          color: #c7d5cb;
          font-size: 14px;
          line-height: 1.7;
        }

        .jv-registro .jr-back-link {
          display: block;
          padding: 12px;
          border: 1px solid rgba(220, 194, 127, .65);
          border-radius: 12px;
          color: #ead69f;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.5;
          text-align: center;
          text-decoration: none;
          transition: background .2s;
        }

        .jv-registro .jr-back-link:hover {
          background: rgba(231, 211, 154, .1);
        }

        .jv-registro .jr-panel {
          min-width: 0;
          padding: 36px;
          border-radius: 0 28px 28px 0;
          background: rgba(5, 25, 17, .25);
        }

        .jv-registro .jr-heading {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 13px;
        }

        .jv-registro h2 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 34px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -.5px;
        }

        .jv-registro .jr-intro {
          margin: 13px 0 26px;
          color: #cbd8cf;
          font-size: 15px;
          line-height: 1.7;
        }

        .jv-registro .jr-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 19px;
        }

        .jv-registro .jr-field {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 7px;
        }

        .jv-registro .jr-label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 5px 7px;
          color: #edf1ed;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.5;
        }

        .jv-registro .jr-required {
          color: #e8b9a7;
          font-size: 11px;
          font-weight: 400;
        }

        .jv-registro .jr-input,
        .jv-registro .jr-select {
          width: 100%;
          min-width: 0;
          height: 46px;
          padding: 0 12px;
          border: 1px solid rgba(178, 203, 193, .3);
          border-radius: 11px;
          outline: none;
          background: rgba(40, 66, 72, .92);
          color: #f4f7f4;
          font: inherit;
          font-size: 14px;
          color-scheme: dark;
          transition: border-color .2s, box-shadow .2s;
        }

        .jv-registro .jr-input::placeholder {
          color: #c0cdd0;
          opacity: 1;
        }

        .jv-registro .jr-select option {
          background: #213e35;
          color: #f4f7f4;
        }

        .jv-registro .jr-input:focus,
        .jv-registro .jr-select:focus,
        .jv-registro .jr-file:focus-visible {
          border-color: #d6bc79;
          box-shadow: 0 0 0 3px rgba(214, 188, 121, .17);
        }

        .jv-registro .jr-select:disabled {
          background: rgba(36, 58, 48, .85);
          color: #b4c1b8;
          cursor: not-allowed;
        }

        .jv-registro .jr-help {
          color: #c0d0c5;
          font-size: 12px;
          line-height: 1.7;
        }

        .jv-registro .jr-invalid {
          border-color: #edac9f;
        }

        .jv-registro .jr-error-text {
          color: #ffd0c2;
        }

        .jv-registro .jr-wide {
          grid-column: 1 / -1;
        }

        .jv-registro .jr-document {
          margin: 5px 0 0;
          min-width: 0;
          padding: 22px;
          border: 1px solid rgba(224, 202, 146, .26);
          border-radius: 18px;
          background: rgba(39, 70, 52, .3);
        }

        .jv-registro .jr-document h3 {
          margin: 0;
          color: #ead69f;
          font-size: 18px;
          font-weight: 650;
        }

        .jv-registro .jr-document p {
          margin: 9px 0 19px;
          color: #cfdbd2;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-registro .jr-document-fields {
          display: grid;
          gap: 18px;
        }

        .jv-registro .jr-file {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 9px;
          border: 1px dashed rgba(220, 194, 127, .55);
          border-radius: 11px;
          outline: none;
          background: rgba(9, 30, 21, .5);
          color: #d7e2da;
          font: inherit;
          font-size: 12px;
        }

        .jv-registro .jr-file::file-selector-button {
          margin-right: 10px;
          padding: 9px 12px;
          border: 0;
          border-radius: 7px;
          background: #e3ce98;
          color: #142d21;
          font: inherit;
          font-weight: 650;
          cursor: pointer;
        }

        .jv-registro .jr-note {
          margin: 0;
          padding: 16px 18px;
          border: 1px solid rgba(195, 214, 196, .17);
          border-radius: 13px;
          background: rgba(81, 115, 85, .1);
          color: #ccd9cf;
          font-size: 13px;
          line-height: 1.7;
        }

        .jv-registro .jr-submit {
          width: 100%;
          min-height: 49px;
          padding: 13px 18px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(110deg, #ead8a6, #c6a65c);
          box-shadow: 0 8px 18px rgba(0, 0, 0, .2);
          color: #122b21;
          font: inherit;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: 1.3px;
          cursor: pointer;
          transition: filter .2s;
        }

        .jv-registro .jr-submit:hover {
          filter: brightness(1.08);
        }

        .jv-registro .jr-submit:disabled {
          opacity: .65;
          cursor: wait;
        }

        .jv-registro .jr-alert {
          margin-bottom: 22px;
          padding: 14px 16px;
          border: 1px solid #b67b69;
          border-radius: 12px;
          background: rgba(78, 37, 30, .92);
          color: #ffe0d5;
          font-size: 14px;
          line-height: 1.6;
        }

        .jv-registro .jr-success {
          border-color: #6dab85;
          background: rgba(29, 70, 48, .92);
          color: #d6f6df;
        }

        .jv-registro .jr-footer {
          margin: 23px 0 0;
          color: #b8cabe;
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        .jv-registro button:focus-visible,
        .jv-registro a:focus-visible {
          outline: 2px solid #ead69f;
          outline-offset: 4px;
        }

        @media (max-width: 900px) {
          .jv-registro {
            padding: 22px 14px;
          }

          .jv-registro .jr-card {
            max-width: 680px;
            grid-template-columns: 1fr;
          }

          .jv-registro .jr-sidebar {
            padding: 28px;
            border-right: 0;
            border-bottom: 1px solid rgba(203, 218, 193, .16);
            border-radius: 28px 28px 0 0;
          }

          .jv-registro .jr-sidebar-content {
            position: static;
          }

          .jv-registro .jr-panel {
            padding: 28px;
            border-radius: 0 0 28px 28px;
          }
        }

        @media (max-width: 540px) {
          .jv-registro .jr-form {
            grid-template-columns: minmax(0, 1fr);
          }

          .jv-registro .jr-sidebar,
          .jv-registro .jr-panel {
            padding: 24px 20px;
          }

          .jv-registro .jr-document {
            padding: 18px 14px;
          }

          .jv-registro h2 {
            font-size: 30px;
          }
        }
      `}</style>

      <section className="jr-card" aria-label="Registro de vecino">
        <aside className="jr-sidebar">
          <div className="jr-sidebar-content">
            <div className="jr-logo">JV</div>
            <span className="jr-badge">Comunidad conectada</span>

            <h1>
              Tu comunidad,
              <span>comienza contigo</span>
            </h1>

            <p className="jr-description">
              Crea tu cuenta de vecino para participar, realizar tus
              trámites y mantenerte cerca de tu comunidad.
            </p>

            <div className="jr-benefits">
              <h3>¿Qué podrás hacer?</h3>
              <ul>
                <li>
                  <span className="jr-check" aria-hidden="true">✓</span>
                  Participar en actividades y eventos.
                </li>
                <li>
                  <span className="jr-check" aria-hidden="true">✓</span>
                  Enviar consultas, reclamos y solicitudes.
                </li>
                <li>
                  <span className="jr-check" aria-hidden="true">✓</span>
                  Solicitar documentos.
                </li>
                <li>
                  <span className="jr-check" aria-hidden="true">✓</span>
                  Gestionar tu perfil y asociación territorial.
                </li>
              </ul>
            </div>

            <div className="jr-back">
              <p>
                ¿Ya eres parte de la comunidad? Ingresa con tu cuenta
                para acceder a la plataforma.
              </p>
              <Link to="/login" className="jr-back-link">
                VOLVER AL INICIO DE SESIÓN
              </Link>
            </div>
          </div>
        </aside>

        <div className="jr-panel">
          <div className="jr-heading">
            <h2>Crear cuenta</h2>
            <span className="jr-badge">Vecino</span>
          </div>

          <p className="jr-intro">
            Completa tus datos personales y adjunta tu comprobante
            de domicilio para registrarte.
          </p>

          {error && (
            <div className="jr-alert" role="alert">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="jr-alert jr-success" role="status">
              {mensaje}
            </div>
          )}

          <form
            className="jr-form"
            onSubmit={handleSubmit}
            aria-busy={cargando}
          >
            <div className="jr-field">
              <label className="jr-label" htmlFor="username">
                Nombre de usuario
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="username"
                className="jr-input"
                type="text"
                autoComplete="username"
                placeholder="Ej: juan.perez"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="rut">
                RUT
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="rut"
                className="jr-input"
                type="text"
                placeholder="12.345.678-5"
                value={rut}
                onChange={(event) => setRut(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="nombres">
                Nombres
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="nombres"
                className="jr-input"
                type="text"
                autoComplete="given-name"
                placeholder="Tus nombres"
                value={nombres}
                onChange={(event) => setNombres(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="apellido-paterno">
                Apellido paterno
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="apellido-paterno"
                className="jr-input"
                type="text"
                placeholder="Apellido paterno"
                value={apellidoPaterno}
                onChange={(event) => setApellidoPaterno(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="apellido-materno">
                Apellido materno
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="apellido-materno"
                className="jr-input"
                type="text"
                placeholder="Apellido materno"
                value={apellidoMaterno}
                onChange={(event) => setApellidoMaterno(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="email">
                Correo electrónico
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="email"
                className="jr-input"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.cl"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="junta">
                Junta Vecinal
                <span className="jr-required">Obligatorio</span>
              </label>
              <select
                id="junta"
                className="jr-select"
                value={juntaId}
                onChange={(event) => {
                  setJuntaId(event.target.value)
                  setSectorId('')
                }}
                required
              >
                <option value="">Selecciona una Junta Vecinal</option>
                {juntas.map((junta) => (
                  <option key={junta.id} value={String(junta.id)}>
                    {junta.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="sector">
                Sector
                <span className="jr-required">Obligatorio</span>
              </label>
              <select
                id="sector"
                className="jr-select"
                value={sectorId}
                onChange={(event) => setSectorId(event.target.value)}
                disabled={juntaId === ''}
                required
              >
                <option value="">
                  {juntaId === ''
                    ? 'Primero selecciona una junta'
                    : 'Selecciona un sector'}
                </option>
                {sectoresDisponibles.map((sector) => (
                  <option key={sector.id} value={String(sector.id)}>
                    {sector.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="password">
                Contraseña
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="password"
                className="jr-input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                aria-describedby="password-ayuda"
                required
              />
              <span id="password-ayuda" className="jr-help">
                Mínimo 8 caracteres.
              </span>
            </div>

            <div className="jr-field">
              <label className="jr-label" htmlFor="confirmar-password">
                Confirmar contraseña
                <span className="jr-required">Obligatorio</span>
              </label>
              <input
                id="confirmar-password"
                className={
                  passwordsCoinciden
                    ? 'jr-input'
                    : 'jr-input jr-invalid'
                }
                type="password"
                autoComplete="new-password"
                value={confirmarPassword}
                onChange={(event) => setConfirmarPassword(event.target.value)}
                minLength={8}
                aria-invalid={!passwordsCoinciden}
                aria-describedby="confirmar-ayuda"
                required
              />
              <span
                id="confirmar-ayuda"
                className={
                  passwordsCoinciden
                    ? 'jr-help'
                    : 'jr-help jr-error-text'
                }
              >
                {passwordsCoinciden
                  ? 'Repite tu contraseña.'
                  : 'Las contraseñas no coinciden.'}
              </span>
            </div>

            <section
              className="jr-document jr-wide"
              aria-labelledby="domicilio-titulo"
            >
              <h3 id="domicilio-titulo">Verificación de domicilio</h3>
              <p>
                Adjunta una boleta reciente para verificar que
                perteneces al sector seleccionado.
              </p>

              <div className="jr-document-fields">
                <div className="jr-field">
                  <label className="jr-label" htmlFor="tipo-documento">
                    Tipo de comprobante
                    <span className="jr-required">Obligatorio</span>
                  </label>
                  <select
                    id="tipo-documento"
                    className="jr-select"
                    value={tipoDocumento}
                    onChange={(event) => setTipoDocumento(event.target.value)}
                    required
                  >
                    <option value="ELECTRICIDAD">Boleta de electricidad</option>
                    <option value="AGUA">Boleta de agua</option>
                    <option value="GAS">Boleta de gas</option>
                    <option value="INTERNET">Boleta de internet</option>
                  </select>
                </div>

                <div className="jr-field">
                  <label className="jr-label" htmlFor="comprobante">
                    Comprobante de domicilio
                    <span className="jr-required">Obligatorio</span>
                  </label>
                  <input
                    id="comprobante"
                    className="jr-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) =>
                      setArchivo(event.target.files?.[0] ?? null)
                    }
                    aria-describedby="comprobante-ayuda"
                    required
                  />
                  <span id="comprobante-ayuda" className="jr-help">
                    Formatos permitidos: PDF, JPG o PNG. Utiliza una boleta
                    reciente, idealmente de los últimos 90 días.
                  </span>
                </div>
              </div>
            </section>

            <p className="jr-note jr-wide">
              Al registrarte, tu cuenta quedará disponible para acceder
              a las funciones habilitadas para vecinos dentro de la
              plataforma.
            </p>

            <button
              className="jr-submit jr-wide"
              type="submit"
              disabled={cargando}
            >
              {cargando ? 'REGISTRANDO…' : 'CREAR CUENTA'}
            </button>
          </form>

          <p className="jr-footer">
            Plataforma de Gestión Comunitaria · Junta de Vecinos
          </p>
        </div>
      </section>
    </main>
  )
}

export default RegistroVecinoPage