
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Evento = {
  id: number
  directiva: number
  junta_nombre: string
  creador: number
  creador_username: string
  titulo: string
  descripcion: string
  lugar: string
  fecha_inicio: string
  fecha_fin: string | null
  cupo_maximo: number | null
  estado: 'PROGRAMADO' | 'CANCELADO' | 'FINALIZADO'
  fecha_creacion: string
  fecha_actualizacion: string
  inscrito: boolean
  inscripcion_id: number | null
  inscritos_actuales: number
}

const API = 'http://localhost:8000'

function EventosVecinoPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesandoEventoId, setProcesandoEventoId] =
    useState<number | null>(null)

  // CARGAR EVENTOS

  useEffect(() => {
    const controlador = new AbortController()

    const cargarEventos = async () => {
      try {
        const response = await fetch(
          `${API}/api/eventos/vecino/eventos/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )

        if (!response.ok) {
          throw new Error('No fue posible cargar los eventos.')
        }

        const data = (await response.json()) as Evento[]

        if (!controlador.signal.aborted) {
          setEventos(data)
          setError('')
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.'
          )
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargarEventos()

    return () => controlador.abort()
  }, [])

  // INSCRIBIRSE EN EVENTO

  const inscribirseEvento = async (eventoId: number) => {
    setProcesandoEventoId(eventoId)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        `${API}/api/eventos/inscripciones/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            evento: eventoId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.evento?.[0] ||
            data.detail ||
            'No fue posible realizar la inscripción.'
        )
      }

      setEventos((actuales) =>
        actuales.map((evento) =>
          evento.id === eventoId
            ? {
                ...evento,
                inscrito: true,
                inscripcion_id: data.id,
                inscritos_actuales:
                  evento.inscritos_actuales + 1,
              }
            : evento
        )
      )

      setMensaje('Te has inscrito correctamente en el evento.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setProcesandoEventoId(null)
    }
  }

  // CANCELAR INSCRIPCIÓN

  const cancelarInscripcion = async (
    eventoId: number,
    inscripcionId: number
  ) => {
    setProcesandoEventoId(eventoId)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        `${API}/api/eventos/inscripciones/${inscripcionId}/cancelar/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.estado?.[0] ||
            data.detail ||
            'No fue posible cancelar la inscripción.'
        )
      }

      setEventos((actuales) =>
        actuales.map((evento) =>
          evento.id === eventoId
            ? {
                ...evento,
                inscrito: false,
                inscripcion_id: null,
                inscritos_actuales: Math.max(
                  0,
                  evento.inscritos_actuales - 1
                ),
              }
            : evento
        )
      )

      setMensaje('Tu inscripción fue cancelada correctamente.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setProcesandoEventoId(null)
    }
  }

  // FUNCIONES AUXILIARES

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const nombreEstado = (estado: Evento['estado']) => {
    switch (estado) {
      case 'PROGRAMADO':
        return 'Programado'
      case 'CANCELADO':
        return 'Cancelado'
      case 'FINALIZADO':
        return 'Finalizado'
      default:
        return estado
    }
  }

  const claseEstado = (estado: Evento['estado']) => {
    switch (estado) {
      case 'PROGRAMADO':
        return 'ev-badge ev-green'
      case 'CANCELADO':
        return 'ev-badge ev-red'
      case 'FINALIZADO':
        return 'ev-badge ev-muted'
      default:
        return 'ev-badge'
    }
  }

  const disponibles = eventos.filter(
    (evento) => evento.estado === 'PROGRAMADO'
  ).length

  const inscritos = eventos.filter(
    (evento) => evento.inscrito
  ).length

  const conCupos = eventos.filter(
    (evento) =>
      evento.estado === 'PROGRAMADO' &&
      (evento.cupo_maximo === null ||
        evento.inscritos_actuales < evento.cupo_maximo)
  ).length

  return (
    <main className="eventos-vecino-bosque">
      <style>{`
        /* FONDO PRINCIPAL */

        .eventos-vecino-bosque {
          --ev-oro: #d7ac32;
          --ev-crema: #f6efd9;
          --ev-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 20px;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/vecino-eventos.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: var(--ev-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .eventos-vecino-bosque,
        .eventos-vecino-bosque * {
          box-sizing: border-box;
        }

        .eventos-vecino-bosque .ev-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* PANELES */

        .eventos-vecino-bosque .ev-panel {
          background: rgba(8, 29, 19, 0.74);
          border: 1px solid rgba(215, 172, 50, 0.35);
          border-radius: 22px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TITULOS */

        .eventos-vecino-bosque h1,
        .eventos-vecino-bosque h2,
        .eventos-vecino-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--ev-crema);
          line-height: 1.25;
        }

        .eventos-vecino-bosque .ev-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
        }

        .eventos-vecino-bosque .ev-heading {
          margin: 0;
          font-size: 29px;
        }

        .eventos-vecino-bosque .ev-subtitle {
          margin: 9px 0 0;
          color: var(--ev-suave);
          font-size: 15px;
          line-height: 1.7;
        }

        /* ENCABEZADO */

        .eventos-vecino-bosque .ev-header {
          padding: 30px;
          margin-bottom: 27px;
        }

        .eventos-vecino-bosque .ev-row-between {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .eventos-vecino-bosque .ev-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 13px;
        }

        /* ETIQUETAS */

        .eventos-vecino-bosque .ev-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 15px;
          border-radius: 999px;

          background: rgba(215, 172, 50, 0.14);
          border: 1px solid rgba(215, 172, 50, 0.50);
          color: #edce70;

          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .eventos-vecino-bosque .ev-green {
          background: rgba(28, 125, 78, 0.23);
          border-color: rgba(80, 183, 125, 0.58);
          color: #a6eac4;
        }

        .eventos-vecino-bosque .ev-red {
          background: rgba(145, 43, 45, 0.26);
          border-color: rgba(230, 116, 116, 0.60);
          color: #ffc4c1;
        }

        .eventos-vecino-bosque .ev-muted {
          background: rgba(230, 230, 210, 0.08);
          border-color: rgba(220, 220, 200, 0.25);
          color: #e6e9df;
        }

        /* BOTONES */

        .eventos-vecino-bosque .ev-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 45px;
          padding: 11px 21px;
          border-radius: 13px;

          border: 1px solid rgba(215, 172, 50, 0.70);
          background: rgba(215, 172, 50, 0.17);
          color: #f8e8b4;

          font: inherit;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            color 0.2s ease;
        }

        .eventos-vecino-bosque .ev-button:hover {
          background: rgba(215, 172, 50, 0.34);
          color: #fff4d2;
          transform: translateY(-1px);
        }

        .eventos-vecino-bosque .ev-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );
          color: #102419;
          border-color: #d7ac32;
          font-weight: 800;
        }

        .eventos-vecino-bosque .ev-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
        }

        .eventos-vecino-bosque .ev-button-danger {
          background: rgba(145, 43, 45, 0.25);
          border-color: rgba(230, 116, 116, 0.70);
          color: #ffc4c1;
        }

        .eventos-vecino-bosque .ev-button-danger:hover {
          background: rgba(165, 50, 52, 0.55);
          color: #fff0ee;
        }

        .eventos-vecino-bosque .ev-button:disabled {
          opacity: 0.50;
          cursor: not-allowed;
          transform: none;
        }

        /* ESTADISTICAS */

        .eventos-vecino-bosque .ev-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 29px;
        }

        .eventos-vecino-bosque .ev-stat {
          padding: 24px 25px;
          transition: transform 0.2s ease;
        }

        .eventos-vecino-bosque .ev-stat:hover {
          transform: translateY(-2px);
        }

        .eventos-vecino-bosque .ev-stat-label {
          margin: 0 0 18px;
          color: #cbd2c4;
          font-size: 15px;
          font-weight: 600;
        }

        .eventos-vecino-bosque .ev-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .eventos-vecino-bosque .ev-stat-value {
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
          color: #d7ac32;
        }

        /* MENSAJES */

        .eventos-vecino-bosque .ev-alert {
          padding: 17px 20px;
          margin-bottom: 23px;
          border-radius: 13px;
          font-size: 14px;
          line-height: 1.6;
        }

        .eventos-vecino-bosque .ev-alert-error {
          background: rgba(118, 33, 35, 0.85);
          border: 1px solid rgba(231, 104, 104, 0.55);
          color: #ffe4e4;
        }

        .eventos-vecino-bosque .ev-alert-success {
          background: rgba(18, 93, 57, 0.83);
          border: 1px solid rgba(102, 201, 140, 0.50);
          color: #dbffe6;
        }

        .eventos-vecino-bosque .ev-alert-warning {
          background: rgba(180, 113, 22, 0.18);
          border: 1px solid rgba(232, 180, 75, 0.48);
          color: #ffdf94;
        }

        .eventos-vecino-bosque .ev-alert-neutral {
          background: rgba(215, 172, 50, 0.10);
          border: 1px solid rgba(215, 172, 50, 0.30);
          color: #f6efd9;
        }

        /* SECCION EVENTOS */

        .eventos-vecino-bosque .ev-list-heading {
          margin-bottom: 21px;
        }

        .eventos-vecino-bosque .ev-empty {
          padding: 60px 25px;
          text-align: center;
        }

        .eventos-vecino-bosque .ev-empty-icon {
          display: grid;
          place-items: center;
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;

          background: rgba(215, 172, 50, 0.17);
          color: #edce70;
          font-size: 28px;
          font-weight: 800;
        }

        .eventos-vecino-bosque .ev-empty h3 {
          margin: 0 0 12px;
          font-size: 24px;
        }

        .eventos-vecino-bosque .ev-empty p {
          max-width: 470px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        /* TARJETAS DE EVENTOS */

        .eventos-vecino-bosque .ev-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 23px;
        }

        .eventos-vecino-bosque .ev-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .eventos-vecino-bosque .ev-card:hover {
          transform: translateY(-3px);
          border-color: rgba(215, 172, 50, 0.70);
        }

        .eventos-vecino-bosque .ev-card-body {
          padding: 27px;
          flex: 1;
        }

        .eventos-vecino-bosque .ev-card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 23px;
        }

        .eventos-vecino-bosque .ev-eyebrow {
          margin: 0 0 10px;
          color: #edce70;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .eventos-vecino-bosque .ev-card-title {
          margin: 0;
          font-size: 26px;
        }

        .eventos-vecino-bosque .ev-description {
          margin: 0 0 24px;
          color: #d3d9cb;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .eventos-vecino-bosque .ev-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 22px;
        }

        .eventos-vecino-bosque .ev-detail {
          min-width: 0;
          padding: 17px;
          border-radius: 14px;
          border: 1px solid rgba(215, 172, 50, 0.17);
          background: rgba(3, 20, 12, 0.45);
        }

        .eventos-vecino-bosque .ev-detail-label {
          margin: 0 0 8px;
          color: #b8c7b6;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .eventos-vecino-bosque .ev-detail-value {
          margin: 0;
          color: #f6efd9;
          font-size: 14px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .eventos-vecino-bosque .ev-card-actions {
          display: flex;
          justify-content: flex-end;
          padding: 20px 27px;
          border-top: 1px solid rgba(215, 172, 50, 0.23);
          background: rgba(3, 20, 12, 0.18);
        }

        /* ACCESIBILIDAD */

        .eventos-vecino-bosque button:focus-visible,
        .eventos-vecino-bosque a:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 950px) {
          .eventos-vecino-bosque .ev-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .eventos-vecino-bosque .ev-stats {
            grid-template-columns: 1fr;
            gap: 13px;
          }
        }

        @media (max-width: 600px) {
          .eventos-vecino-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .eventos-vecino-bosque .ev-header,
          .eventos-vecino-bosque .ev-card-body {
            padding: 22px;
          }

          .eventos-vecino-bosque .ev-details-grid {
            grid-template-columns: 1fr;
          }

          .eventos-vecino-bosque .ev-card-actions {
            padding: 18px 22px;
          }
        }
      `}</style>

      <section className="ev-container">

        {/* ENCABEZADO */}

        <header className="ev-panel ev-header">
          <div className="ev-row-between">
            <div>
              <div className="ev-title-row">
                <h1 className="ev-title">
                  Actividades y Eventos
                </h1>

                <span className="ev-badge">
                  Vecino
                </span>
              </div>

              <p className="ev-subtitle">
                Consulta las actividades programadas por tu
                Junta de Vecinos y administra tus inscripciones.
              </p>
            </div>

            <Link to="/vecino" className="ev-button">
              ← Volver al Panel
            </Link>
          </div>
        </header>

        {/* RESUMEN DE EVENTOS */}

        {!cargando && (
          <div className="ev-stats">

            <div className="ev-panel ev-stat">
              <p className="ev-stat-label">
                Eventos programados
              </p>

              <div className="ev-stat-bottom">
                <span className="ev-stat-value">
                  {disponibles}
                </span>

                <span className="ev-badge ev-green">
                  Disponibles
                </span>
              </div>
            </div>

            <div className="ev-panel ev-stat">
              <p className="ev-stat-label">
                Mis inscripciones
              </p>

              <div className="ev-stat-bottom">
                <span className="ev-stat-value">
                  {inscritos}
                </span>

                <span className="ev-badge">
                  Inscrito
                </span>
              </div>
            </div>

            <div className="ev-panel ev-stat">
              <p className="ev-stat-label">
                Con cupos disponibles
              </p>

              <div className="ev-stat-bottom">
                <span className="ev-stat-value">
                  {conCupos}
                </span>

                <span className="ev-badge ev-green">
                  Con cupo
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ESTADO DE CARGA */}

        {cargando && (
          <div className="ev-panel ev-alert" role="status">
            Cargando actividades y eventos...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className="ev-alert ev-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* MENSAJE DE CONFIRMACION */}

        {mensaje && (
          <div
            className="ev-alert ev-alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {/* LISTADO DE EVENTOS */}

        {!cargando && (
          <section>

            <div className="ev-row-between ev-list-heading">

              <div>
                <h2 className="ev-heading">
                  Eventos disponibles
                </h2>

                <p className="ev-subtitle">
                  Revisa los detalles y confirma tu participación.
                </p>
              </div>

              {eventos.length > 0 && (
                <span className="ev-badge">
                  {eventos.length}{' '}
                  {eventos.length === 1
                    ? 'evento'
                    : 'eventos'}
                </span>
              )}
            </div>

            {/* SIN EVENTOS */}

            {eventos.length === 0 ? (
              <div className="ev-panel ev-empty">
                <div className="ev-empty-icon">
                  E
                </div>

                <h3>
                  {error
                    ? 'No se pudieron consultar los eventos'
                    : 'No hay eventos programados'}
                </h3>

                <p>
                  {error
                    ? 'No fue posible verificar los eventos disponibles. Revisa la conexión con el servidor.'
                    : 'Cuando la directiva publique nuevas actividades aparecerán en esta sección.'}
                </p>
              </div>
            ) : (

              <div className="ev-grid">

                {eventos.map((evento) => {
                  const sinCupos =
                    evento.cupo_maximo !== null &&
                    evento.inscritos_actuales >=
                      evento.cupo_maximo

                  const procesando =
                    procesandoEventoId === evento.id

                  return (
                    <article
                      key={evento.id}
                      className="ev-panel ev-card"
                    >
                      <div className="ev-card-body">

                        {/* CABECERA DEL EVENTO */}

                        <div className="ev-card-heading">

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="ev-eyebrow">
                              {evento.junta_nombre}
                            </p>

                            <h3 className="ev-card-title">
                              {evento.titulo}
                            </h3>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <span
                              className={claseEstado(
                                evento.estado
                              )}
                            >
                              {nombreEstado(evento.estado)}
                            </span>

                            {evento.inscrito && (
                              <span className="ev-badge">
                                Inscrito
                              </span>
                            )}
                          </div>

                        </div>

                        {/* DESCRIPCION */}

                        <p className="ev-description">
                          {evento.descripcion}
                        </p>

                        {/* INFORMACION DEL EVENTO */}

                        <div className="ev-details-grid">

                          <div className="ev-detail">
                            <p className="ev-detail-label">
                              Lugar
                            </p>

                            <p className="ev-detail-value">
                              {evento.lugar}
                            </p>
                          </div>

                          <div className="ev-detail">
                            <p className="ev-detail-label">
                              Cupos
                            </p>

                            <p className="ev-detail-value">
                              {evento.cupo_maximo !== null
                                ? `${evento.inscritos_actuales} de ${evento.cupo_maximo}`
                                : `${evento.inscritos_actuales} inscritos · Sin límite`}
                            </p>
                          </div>

                          <div className="ev-detail">
                            <p className="ev-detail-label">
                              Inicio
                            </p>

                            <p className="ev-detail-value">
                              {formatearFecha(
                                evento.fecha_inicio
                              )}
                            </p>
                          </div>

                          <div className="ev-detail">
                            <p className="ev-detail-label">
                              Término
                            </p>

                            <p className="ev-detail-value">
                              {evento.fecha_fin
                                ? formatearFecha(
                                    evento.fecha_fin
                                  )
                                : 'Sin definir'}
                            </p>
                          </div>

                        </div>

                        {/* DISPONIBILIDAD */}

                        {evento.estado === 'PROGRAMADO' && (
                          <div
                            className={
                              sinCupos && !evento.inscrito
                                ? 'ev-alert ev-alert-warning'
                                : evento.inscrito
                                  ? 'ev-alert ev-alert-success'
                                  : 'ev-alert ev-alert-neutral'
                            }
                            style={{ marginBottom: 0 }}
                          >
                            {sinCupos && !evento.inscrito
                              ? 'Este evento ya no tiene cupos disponibles.'
                              : evento.inscrito
                                ? 'Ya estás inscrito en esta actividad.'
                                : 'Hay cupos disponibles para esta actividad.'}
                          </div>
                        )}

                      </div>

                      {/* BOTONES DE INSCRIPCION */}

                      {evento.estado === 'PROGRAMADO' && (
                        <div className="ev-card-actions">

                          {evento.inscrito ? (

                            <button
                              type="button"
                              className="ev-button ev-button-danger"
                              disabled={
                                !evento.inscripcion_id ||
                                procesandoEventoId !== null
                              }
                              onClick={() => {
                                if (evento.inscripcion_id) {
                                  void cancelarInscripcion(
                                    evento.id,
                                    evento.inscripcion_id
                                  )
                                }
                              }}
                            >
                              {procesando
                                ? 'Cancelando...'
                                : 'Cancelar inscripción'}
                            </button>

                          ) : (

                            <button
                              type="button"
                              className="ev-button ev-button-primary"
                              disabled={
                                sinCupos ||
                                procesandoEventoId !== null
                              }
                              onClick={() =>
                                void inscribirseEvento(
                                  evento.id
                                )
                              }
                            >
                              {procesando
                                ? 'Inscribiendo...'
                                : sinCupos
                                  ? 'Sin cupos'
                                  : 'Inscribirse'}
                            </button>

                          )}

                        </div>
                      )}

                    </article>
                  )
                })}

              </div>
            )}

          </section>
        )}

      </section>
    </main>
  )
}

export default EventosVecinoPage
