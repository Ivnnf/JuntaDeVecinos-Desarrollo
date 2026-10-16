

import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import CerrarSesionButton from '../../components/auth/CerrarSesionButton'

import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'



type Notificacion = {
  id: number
  tipo: 'PUBLICACION' | 'EVENTO'
  publicacion_id: number | null
  evento_id: number | null
  titulo: string
  junta_nombre: string
  leida: boolean
  fecha_creacion: string
  fecha_lectura: string | null
}



type PerfilResumen = {

  sector_nombre: string | null

  junta_nombre: string | null

  estado_asociacion_sector:

  | 'PENDIENTE'

  | 'CONFIRMADA'

  | 'RECHAZADA'

  | null

}



const servicios = [

  {

    letra: 'E',

    titulo: 'Actividades y Eventos',

    descripcion:

      'Revisa las actividades comunitarias e inscríbete en los eventos disponibles.',

    ruta: '/vecino/eventos',

    boton: 'Ver Eventos',

  },

  {

    letra: 'S',

    titulo: 'Consultas y Solicitudes',

    descripcion:

      'Envía consultas, reclamos o solicitudes y revisa el avance de tus gestiones.',

    ruta: '/vecino/solicitudes',

    boton: 'Ver Solicitudes',

  },

  {

    letra: 'SG',

    titulo: 'Seguimiento de Solicitudes',

    descripcion:

      'Revisa en un solo lugar el estado, las respuestas y el historial de tus solicitudes.',

    ruta: '/vecino/seguimiento',

    boton: 'Ver Seguimiento',

  },

  {

    letra: 'M',

    titulo: 'Mensajería',

    descripcion:

      'Comunícate directamente con la directiva de tu Junta de Vecinos.',

    ruta: '/vecino/mensajeria',

    boton: 'Ver Mensajes',

  },

  {

    letra: 'D',

    titulo: 'Solicitud de Documentos',

    descripcion:

      'Solicita documentos a la directiva y consulta el estado de cada solicitud.',

    ruta: '/vecino/documentos',

    boton: 'Solicitar Documentos',

  },

  {

    letra: 'P',

    titulo: 'Mi Perfil',

    descripcion:

      'Revisa y actualiza tus datos personales y administra tu asociación territorial.',

    ruta: '/vecino/perfil',

    boton: 'Ver Mi Perfil',

  },

]



function VecinoInicioPage() {

  const [perfil, setPerfil] =

    useState<PerfilResumen | null>(null)



  const [cargandoPerfil, setCargandoPerfil] =

    useState(true)



  const [errorPerfil, setErrorPerfil] = useState('')



  const [notificaciones, setNotificaciones] =

    useState<Notificacion[]>([])



  const [cargando, setCargando] = useState(true)

  const [error, setError] = useState('')



  const [mostrarNotificaciones, setMostrarNotificaciones] =

    useState(false)



  const [procesandoNotificacion, setProcesandoNotificacion] =

    useState<number | null>(null)



  // CARGAR NOTIFICACIONES



  useEffect(() => {

    let cancelado = false



    const cargarNotificaciones = async () => {

      try {

        const response = await fetch(

          'http://localhost:8000/api/comunicaciones/notificaciones/',

          {

            credentials: 'include',

          }

        )



        if (!response.ok) {

          throw new Error(

            'No fue posible cargar las notificaciones.'

          )

        }



        const data =

          (await response.json()) as Notificacion[]



        if (!cancelado) {

          setNotificaciones(data)

          setError('')

        }

      } catch (err) {

        if (!cancelado) {

          setError(

            err instanceof Error

              ? err.message

              : 'Ocurrió un error inesperado.'

          )

        }

      } finally {

        if (!cancelado) {

          setCargando(false)

        }

      }

    }



    void cargarNotificaciones()



    return () => {

      cancelado = true

    }

  }, [])



  // CARGAR PERFIL TERRITORIAL



  useEffect(() => {

    let cancelado = false



    const cargarPerfil = async () => {

      try {

        const response = await fetch(

          'http://localhost:8000/api/auth/perfil/',

          {

            credentials: 'include',

          }

        )



        if (!response.ok) {

          throw new Error(

            'No fue posible obtener tu información territorial.'

          )

        }



        const data =

          (await response.json()) as PerfilResumen



        if (!cancelado) {

          setPerfil(data)

          setErrorPerfil('')

        }

      } catch (err) {

        if (!cancelado) {

          setErrorPerfil(

            err instanceof Error

              ? err.message

              : 'Ocurrió un error inesperado.'

          )

        }

      } finally {

        if (!cancelado) {

          setCargandoPerfil(false)

        }

      }

    }



    void cargarPerfil()



    return () => {

      cancelado = true

    }

  }, [])



  const notificacionesNoLeidas =

    notificaciones.filter(

      (notificacion) => !notificacion.leida

    ).length



  // MARCAR NOTIFICACION COMO LEIDA



  async function marcarComoLeida(

    notificacion: Notificacion

  ) {

    if (notificacion.leida || procesandoNotificacion !== null) {

      return

    }



    setError('')

    setProcesandoNotificacion(notificacion.id)



    try {

      const response = await fetch(

        `http://localhost:8000/api/comunicaciones/notificaciones/${notificacion.id}/`,

        {

          method: 'PATCH',

          credentials: 'include',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify({

            leida: true,

          }),

        }

      )



      const data = await response.json()



      if (!response.ok) {

        throw new Error(

          data.detail ||

          'No fue posible marcar la notificación como leída.'

        )

      }



      setNotificaciones((actuales) =>

        actuales.map((item) =>

          item.id === notificacion.id

            ? (data as Notificacion)

            : item

        )

      )

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : 'Ocurrió un error inesperado.'

      )

    } finally {

      setProcesandoNotificacion(null)

    }

  }



  const formatearFecha = (fecha: string) => {

    return new Date(fecha).toLocaleString('es-CL', {

      dateStyle: 'medium',

      timeStyle: 'short',

    })

  }



  return (

    <main className="vecino-inicio-bosque">

      <style>{`

        /* =====================================

           FONDO Y COLORES GENERALES

           ===================================== */



        .vecino-inicio-bosque {

          --vi-oro: #d7ac32;

          --vi-oro-claro: #f0d375;

          --vi-crema: #f6efd9;

          --vi-suave: #cbd2c4;



          min-height: 100vh;

          padding: 32px 20px;



          color: var(--vi-crema);

          font-family: 'Segoe UI', Arial, sans-serif;



          background-color: #092318;

          background-image:

            linear-gradient(

              120deg,

              rgba(4, 23, 16, 0.35),

              rgba(4, 23, 16, 0.48)

            ),

            url('/vecino-inicio.webp');



          background-position: center;

          background-size: cover;

          background-repeat: no-repeat;

          background-attachment: fixed;

        }



        .vecino-inicio-bosque,

        .vecino-inicio-bosque * {

          box-sizing: border-box;

        }



        .vecino-inicio-bosque .vi-container {

          width: 100%;

          max-width: 1480px;

          margin: 0 auto;

        }



        /* =====================================

           PANELES TRANSPARENTES

           ===================================== */



        .vecino-inicio-bosque .vi-panel {

          background: rgba(8, 29, 19, 0.70);

          border: 1px solid rgba(215, 172, 50, 0.32);

          border-radius: 23px;



          box-shadow:

            0 12px 35px rgba(0, 0, 0, 0.20);



          backdrop-filter: blur(4px);

          -webkit-backdrop-filter: blur(4px);

        }



        /* =====================================

           TIPOGRAFIA

           ===================================== */



        .vecino-inicio-bosque h1,

        .vecino-inicio-bosque h2,

        .vecino-inicio-bosque h3 {

          font-family: Georgia, 'Times New Roman', serif;

          color: var(--vi-crema);

          line-height: 1.2;

        }



        .vecino-inicio-bosque .vi-subtitle {

          margin: 0;

          color: var(--vi-suave);

          font-size: 16px;

          line-height: 1.7;

        }



        /* =====================================

           ENCABEZADO

           ===================================== */



        .vecino-inicio-bosque .vi-header {

          /* Mantener el encabezado por delante del panel territorial */
          position: relative;
          z-index: 20;

          padding: 30px;

          margin-bottom: 26px;

        }



        .vecino-inicio-bosque .vi-header-row {

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          flex-wrap: wrap;

          gap: 20px;

        }



        .vecino-inicio-bosque .vi-title-row {

          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 16px;

          margin-bottom: 15px;

        }



        .vecino-inicio-bosque .vi-title {

          margin: 0;

          font-size: clamp(30px, 3vw, 42px);

          font-weight: 700;

        }



        /* =====================================

           ETIQUETAS

           ===================================== */



        .vecino-inicio-bosque .vi-badge {

          display: inline-flex;

          align-items: center;

          justify-content: center;



          padding: 7px 16px;

          border-radius: 999px;



          border: 1px solid rgba(215, 172, 50, 0.50);

          background: rgba(215, 172, 50, 0.15);



          color: #e9c454;

          font-size: 13px;

          font-weight: 700;

        }



        .vecino-inicio-bosque .vi-badge-green {

          background: rgba(28, 125, 78, 0.22);

          border-color: rgba(80, 183, 125, 0.55);

          color: #a6eac4;

        }



        .vecino-inicio-bosque .vi-badge-warning {

          background: rgba(180, 113, 22, 0.24);

          border-color: rgba(232, 180, 75, 0.65);

          color: #ffdf94;

        }



        .vecino-inicio-bosque .vi-badge-error {

          background: rgba(145, 43, 45, 0.24);

          border-color: rgba(230, 116, 116, 0.55);

          color: #ffc4c1;

        }



        .vecino-inicio-bosque .vi-badge-muted {

          background: rgba(230, 230, 210, 0.08);

          border-color: rgba(220, 220, 200, 0.25);

          color: #e6e9df;

        }



        /* =====================================

           BOTONES DE SESION

           ===================================== */



        .vecino-inicio-bosque .vi-header-actions {

          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 12px;

        }



        .vecino-inicio-bosque

        .vi-header-actions button {

          min-height: 48px;

          padding: 12px 22px;



          border: 1.5px solid #d7ac32;

          border-radius: 13px;



          background: rgba(215, 172, 50, 0.22);

          color: #f8e8b4;



          font-family: 'Segoe UI', Arial, sans-serif;

          font-size: 15px;

          font-weight: 700;



          cursor: pointer;

          box-shadow:

            0 4px 15px rgba(0, 0, 0, 0.20);



          transition:

            background 0.2s ease,

            color 0.2s ease,

            transform 0.2s ease;

        }



        .vecino-inicio-bosque

        .vi-header-actions button:hover {

          background: #d7ac32;

          color: #102419;

          transform: translateY(-2px);

        }



        .vecino-inicio-bosque
.vi-header-actions .vi-notification-button {
  width: 50px;
  height: 50px;
  min-height: 50px;
  padding: 0;

  display: grid;
  place-items: center;

  position: relative;
  line-height: 0;
  flex-shrink: 0;
}

.vecino-inicio-bosque
.vi-header-actions .vi-notification-button svg {
  display: block;
}



        .vecino-inicio-bosque .vi-notification-count {

          position: absolute;

          top: -8px;

          right: -8px;



          display: grid;

          place-items: center;



          min-width: 24px;

          height: 24px;

          padding: 0 5px;



          border-radius: 999px;

          background: #d7ac32;

          color: #102419;



          font-size: 12px;

          font-weight: 800;

        }



        /* =====================================

           PANEL DE NOTIFICACIONES

           ===================================== */



        .vecino-inicio-bosque .vi-notification-wrapper {

          position: relative;

        }



        .vecino-inicio-bosque .vi-notification-panel {

          position: absolute;

          top: calc(100% + 12px);

          right: 0;

          z-index: 100;



          width: 390px;

          max-width: calc(100vw - 40px);



          overflow: hidden;



          border: 1px solid rgba(215, 172, 50, 0.48);

          border-radius: 20px;



          background: rgba(9, 31, 23, 0.97);

          color: #f6efd9;



          box-shadow:

            0 20px 55px rgba(0, 0, 0, 0.48);



          backdrop-filter: blur(12px);

          -webkit-backdrop-filter: blur(12px);

        }



        .vecino-inicio-bosque .vi-notification-header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;



          padding: 18px;



          border-bottom:

            1px solid rgba(215, 172, 50, 0.22);

        }



        .vecino-inicio-bosque .vi-notification-heading {

          margin: 0 0 5px;

          font-size: 21px;

        }



        .vecino-inicio-bosque .vi-notification-help {

          margin: 0;

          color: #b7c8b9;

          font-size: 12px;

        }



        .vecino-inicio-bosque .vi-notification-list {

          max-height: 430px;

          overflow-y: auto;

        }



        .vecino-inicio-bosque .vi-notification-item {

          padding: 18px;

          border-bottom:

            1px solid rgba(215, 172, 50, 0.15);

        }



        .vecino-inicio-bosque .vi-notification-item:last-child {

          border-bottom: none;

        }



        .vecino-inicio-bosque .vi-notification-unread {

          background: rgba(215, 172, 50, 0.08);

        }



        .vecino-inicio-bosque .vi-notification-content {

          display: flex;

          align-items: flex-start;

          gap: 12px;

        }



        .vecino-inicio-bosque .vi-notification-icon {

          display: grid;

          place-items: center;

          flex-shrink: 0;



          width: 36px;

          height: 36px;



          border-radius: 50%;

          background: rgba(215, 172, 50, 0.16);

          color: #e9c454;

          font-weight: 800;

        }



        .vecino-inicio-bosque .vi-notification-title {

          margin: 10px 0 4px;

          color: #f6efd9;

          font-size: 14px;

          font-weight: 750;

          line-height: 1.5;

        }



        .vecino-inicio-bosque .vi-notification-date {

          color: #aebfb0;

          font-size: 11px;

        }



        .vecino-inicio-bosque .vi-notification-actions {

          display: flex;

          flex-wrap: wrap;

          gap: 8px;

          margin-top: 14px;

        }



        /* =====================================

           BOTONES GENERALES

           ===================================== */



        .vecino-inicio-bosque .vi-button {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;



          min-height: 43px;

          padding: 10px 19px;



          border: 1px solid rgba(215, 172, 50, 0.65);

          border-radius: 12px;



          background: rgba(215, 172, 50, 0.16);

          color: #f8e8b4;



          font: inherit;

          font-size: 14px;

          font-weight: 700;



          text-decoration: none;

          cursor: pointer;



          transition:

            background 0.2s ease,

            color 0.2s ease,

            transform 0.2s ease;

        }



        .vecino-inicio-bosque .vi-button:hover {

          background: #d7ac32;

          color: #102419;

          transform: translateY(-1px);

        }



        .vecino-inicio-bosque .vi-button-small {

          min-height: 33px;

          padding: 7px 11px;

          font-size: 12px;

        }



        .vecino-inicio-bosque .vi-button:disabled {

          opacity: 0.55;

          cursor: not-allowed;

          transform: none;

        }



        /* =====================================

           INFORMACION TERRITORIAL

           ===================================== */



        .vecino-inicio-bosque .vi-junta-panel {

          /* Evita que el backdrop-filter tape las notificaciones */
          position: relative;
          z-index: 1;

          padding: 28px 30px;

          margin-bottom: 30px;

        }



        .vecino-inicio-bosque .vi-junta-row {

          display: flex;

          align-items: center;

          justify-content: space-between;

          flex-wrap: wrap;

          gap: 20px;

        }



        .vecino-inicio-bosque .vi-eyebrow {

          margin: 0 0 12px;

          color: #e9c454;



          font-size: 12px;

          font-weight: 750;

          letter-spacing: 1px;

          text-transform: uppercase;

        }



        .vecino-inicio-bosque .vi-junta-title {

          margin: 0 0 12px;

          font-size: clamp(23px, 2.5vw, 31px);

        }



        .vecino-inicio-bosque .vi-junta-description {

          margin: 0 0 15px;

          max-width: 780px;

          color: #cbd2c4;

          font-size: 15px;

          line-height: 1.7;

        }



        .vecino-inicio-bosque .vi-sector-row {

          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 12px;

          margin-top: 15px;



          color: #cbd2c4;

          font-size: 14px;

        }



        .vecino-inicio-bosque .vi-sector-row strong {

          color: #f6efd9;

        }



        /* =====================================

           SERVICIOS

           ===================================== */



        .vecino-inicio-bosque .vi-section-title {

          margin: 0 0 10px;

          font-size: 30px;

        }



        .vecino-inicio-bosque .vi-services-grid {

          display: grid;

          grid-template-columns:

            repeat(4, minmax(0, 1fr));



          gap: 20px;

          margin-top: 23px;

        }



        .vecino-inicio-bosque .vi-service-card {

          display: flex;

          flex-direction: column;

          min-width: 0;

          min-height: 290px;



          padding: 24px;



          transition:

            transform 0.2s ease,

            background 0.2s ease,

            border-color 0.2s ease;

        }



        .vecino-inicio-bosque .vi-service-card:hover {

          transform: translateY(-4px);

          background: rgba(12, 43, 26, 0.84);

          border-color: rgba(215, 172, 50, 0.75);

        }



        .vecino-inicio-bosque .vi-service-content {

          flex: 1;

        }



        .vecino-inicio-bosque .vi-service-icon {

          display: grid;

          place-items: center;



          width: 55px;

          height: 55px;

          margin-bottom: 22px;



          border-radius: 16px;

          background: rgba(215, 172, 50, 0.17);



          color: #e9c454;

          font-size: 22px;

          font-weight: 800;

        }



        .vecino-inicio-bosque .vi-service-title {

          margin: 0 0 13px;

          font-size: 22px;

          font-weight: 700;

        }



        .vecino-inicio-bosque .vi-service-description {

          margin: 0 0 24px;

          color: #cbd2c4;

          font-size: 14px;

          line-height: 1.7;

        }



        /* =====================================

           BOTON DORADO DE SERVICIOS

           ===================================== */



        .vecino-inicio-bosque .vi-service-button {

          display: flex;

          align-items: center;

          justify-content: center;



          width: 100%;

          min-height: 49px;

          padding: 12px 15px;



          border: 1px solid #d7ac32;

          border-radius: 999px;



          background:

            linear-gradient(

              115deg,

              #e4c55b,

              #c49a28

            );



          color: #102419;



          font-family: 'Segoe UI', Arial, sans-serif;

          font-size: 14px;

          font-weight: 800;

          text-align: center;

          text-decoration: none;



          box-shadow:

            0 5px 15px rgba(0, 0, 0, 0.20);



          transition:

            background 0.2s ease,

            transform 0.2s ease,

            box-shadow 0.2s ease;

        }



        .vecino-inicio-bosque .vi-service-button:hover {

          background:

            linear-gradient(

              115deg,

              #f0d67c,

              #dfb646

            );



          color: #102419;

          transform: translateY(-2px);



          box-shadow:

            0 8px 20px rgba(0, 0, 0, 0.25);

        }



        /* =====================================

           MENSAJES Y ESTADOS

           ===================================== */



        .vecino-inicio-bosque .vi-loading {

          display: flex;

          align-items: center;

          gap: 10px;



          color: #e9c454;

          font-size: 14px;

        }



        .vecino-inicio-bosque .vi-alert-error {

          padding: 14px 17px;



          border: 1px solid rgba(231, 104, 104, 0.50);

          border-radius: 12px;



          background: rgba(118, 33, 35, 0.55);

          color: #ffe4e4;



          font-size: 14px;

          line-height: 1.5;

        }



        .vecino-inicio-bosque .vi-empty {

          padding: 30px 18px;

          color: #cbd2c4;

          text-align: center;

        }



        .vecino-inicio-bosque .vi-empty-icon {

          display: grid;

          place-items: center;



          width: 46px;

          height: 46px;

          margin: 0 auto 13px;



          border-radius: 50%;

          background: rgba(215, 172, 50, 0.16);

          color: #e9c454;

          font-size: 22px;

        }



        /* =====================================

           ACCESIBILIDAD

           ===================================== */



        .vecino-inicio-bosque button:focus-visible,

        .vecino-inicio-bosque a:focus-visible {

          outline: 2px solid #f0d375;

          outline-offset: 3px;

        }



        /* =====================================

           RESPONSIVE

           ===================================== */



        @media (max-width: 1100px) {

          .vecino-inicio-bosque .vi-services-grid {

            grid-template-columns:

              repeat(3, minmax(0, 1fr));

          }

        }



        @media (max-width: 850px) {

          .vecino-inicio-bosque .vi-services-grid {

            grid-template-columns:

              repeat(2, minmax(0, 1fr));

          }

        }



        @media (max-width: 650px) {

          .vecino-inicio-bosque {

            padding: 18px 12px;

            background-attachment: scroll;

          }



          .vecino-inicio-bosque .vi-header,

          .vecino-inicio-bosque .vi-junta-panel {

            padding: 23px;

          }



          .vecino-inicio-bosque .vi-header-actions {

            width: 100%;

          }



          .vecino-inicio-bosque .vi-services-grid {

            grid-template-columns: 1fr;

            gap: 15px;

          }



          .vecino-inicio-bosque .vi-service-card {

            min-height: 0;

            padding: 22px;

          }



          .vecino-inicio-bosque .vi-notification-panel {

            right: auto;

            left: 0;

          }

        }



      `}</style>



      <section className="vi-container">



        {/* ENCABEZADO */}



        <header className="vi-panel vi-header">

          <div className="vi-header-row">



            <div>

              <div className="vi-title-row">

                <h1 className="vi-title">

                  Inicio del Vecino

                </h1>



                <span className="vi-badge">

                  Vecino

                </span>

              </div>



              <p className="vi-subtitle">

                Accede a las actividades, solicitudes,

                documentos y comunicados de tu Junta de Vecinos.

              </p>

            </div>



            {/* ACCIONES SUPERIORES */}



            <div className="vi-header-actions">



              {/* NOTIFICACIONES */}



              <div className="vi-notification-wrapper">



                <button

                  type="button"

                  className="vi-notification-button"

                  onClick={() =>

                    setMostrarNotificaciones(

                      (mostrar) => !mostrar

                    )

                  }

                  aria-label="Notificaciones"

                  aria-expanded={mostrarNotificaciones}

                  title="Notificaciones"

                >

                  <svg

                    xmlns="http://www.w3.org/2000/svg"

                    fill="none"

                    viewBox="0 0 24 24"

                    strokeWidth={1.8}

                    stroke="currentColor"

                    width="24"

                    height="24"

                    aria-hidden="true"

                  >

                    <path

                      strokeLinecap="round"

                      strokeLinejoin="round"

                      d="M14.857 17.082a23.848 23.848 0 0 1 5.454 1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.312 8.642 23.848 23.848 0 0 1 5.454-1.31m5.715 0a24.255 24.255 0 0 0-5.714 0m5.714 0a3 3 0 1 1-5.714 0"

                    />

                  </svg>



                  {notificacionesNoLeidas > 0 && (

                    <span className="vi-notification-count">

                      {notificacionesNoLeidas > 9

                        ? '9+'

                        : notificacionesNoLeidas}

                    </span>

                  )}

                </button>



                {/* PANEL DESPLEGABLE */}



                {mostrarNotificaciones && (

                  <div className="vi-notification-panel">



                    <div className="vi-notification-header">



                      <div>

                        <h3 className="vi-notification-heading">

                          Notificaciones

                        </h3>



                        <p className="vi-notification-help">

                          Comunicados y eventos de tu Junta de Vecinos

                        </p>

                      </div>



                      <span className="vi-badge">

                        {notificacionesNoLeidas} sin leer

                      </span>



                    </div>



                    <div className="vi-notification-list">



                      {/* CARGANDO */}



                      {cargando && (

                        <div className="vi-empty">

                          <span className="loading loading-spinner loading-sm" />

                          <p>Cargando notificaciones...</p>

                        </div>

                      )}



                      {/* ERROR */}



                      {!cargando && error && (

                        <div style={{ padding: 16 }}>

                          <div

                            className="vi-alert-error"

                            role="alert"

                          >

                            {error}

                          </div>

                        </div>

                      )}



                      {/* SIN NOTIFICACIONES */}



                      {!cargando &&

                        !error &&

                        notificaciones.length === 0 && (

                          <div className="vi-empty">

                            <div className="vi-empty-icon">

                              ✓

                            </div>



                            <strong>

                              No tienes notificaciones

                            </strong>



                            <p style={{ marginTop: 8 }}>

                              Los nuevos comunicados y eventos aparecerán aquí.

                            </p>

                          </div>

                        )}



                      {/* LISTA DE NOTIFICACIONES */}



                      {!cargando &&

                        !error &&

                        notificaciones.map((notificacion) => (



                          <div

                            key={notificacion.id}

                            className={

                              notificacion.leida

                                ? 'vi-notification-item'

                                : 'vi-notification-item vi-notification-unread'

                            }

                          >



                            <div className="vi-notification-content">



                              <div className="vi-notification-icon">

                                {notificacion.leida ? '✓' : '!'}

                              </div>



                              <div style={{ minWidth: 0, flex: 1 }}>



                                <div

                                  style={{

                                    display: 'flex',

                                    alignItems: 'center',

                                    flexWrap: 'wrap',

                                    gap: 8,

                                  }}

                                >

                                  <span

                                    className={

                                      notificacion.leida

                                        ? 'vi-badge vi-badge-muted'

                                        : 'vi-badge'

                                    }

                                  >

                                    {notificacion.leida

                                      ? 'Leída'

                                      : 'Nueva'}

                                  </span>



                                  <span className="vi-notification-date">

                                    {formatearFecha(

                                      notificacion.fecha_creacion

                                    )}

                                  </span>

                                </div>



                                <p className="vi-notification-title">

                                  {notificacion.titulo}

                                </p>



                                <p className="vi-notification-help">

                                  {notificacion.junta_nombre}

                                </p>



                                <div className="vi-notification-actions">



                                  <Link
                                    to={
                                      notificacion.tipo === 'EVENTO'
                                        ? '/vecino/eventos'
                                        : `/vecino/publicaciones/${notificacion.publicacion_id}?notificacion=${notificacion.id}`
                                    }
                                    className="vi-button vi-button-small"
                                    onClick={() =>
                                      setMostrarNotificaciones(false)
                                    }
                                  >
                                    {notificacion.tipo === 'EVENTO'
                                      ? 'Ver evento'
                                      : 'Ver comunicado'}
                                  </Link>



                                  {!notificacion.leida && (

                                    <button

                                      type="button"

                                      className="vi-button vi-button-small"

                                      disabled={procesandoNotificacion !== null}

                                      onClick={() =>

                                        void marcarComoLeida(

                                          notificacion

                                        )

                                      }

                                    >

                                      {procesandoNotificacion === notificacion.id

                                        ? 'Guardando...'

                                        : 'Marcar como leída'}

                                    </button>

                                  )}



                                </div>

                              </div>

                            </div>

                          </div>

                        ))}



                    </div>

                  </div>

                )}



              </div>



              {/* CAMBIAR PERFIL Y CERRAR SESION */}



              <CambiarPerfilButton />

              <CerrarSesionButton />



            </div>



          </div>

        </header>



        {/* INFORMACION TERRITORIAL */}



        <section className="vi-panel vi-junta-panel">



          <div className="vi-junta-row">



            <div>

              <p className="vi-eyebrow">

                Tu Junta de Vecinos

              </p>



              {cargandoPerfil ? (



                <div className="vi-loading">

                  <span className="loading loading-spinner loading-sm" />

                  Cargando información...

                </div>



              ) : errorPerfil ? (



                <div

                  className="vi-alert-error"

                  role="alert"

                >

                  {errorPerfil}

                </div>



              ) : perfil ? (



                perfil.estado_asociacion_sector === 'PENDIENTE' ? (

                  <>

                    <h2 className="vi-junta-title">

                      Solicitud de asociación pendiente

                    </h2>



                    <p className="vi-junta-description">

                      Tu solicitud de asociación territorial está

                      pendiente de aprobación por la Directiva.

                    </p>



                    <span className="vi-badge vi-badge-warning">

                      Asociación pendiente

                    </span>

                  </>

                ) : (

                  <>

                    <h2 className="vi-junta-title">

                      {perfil.junta_nombre ??

                        'Sin Junta de Vecinos asociada'}

                    </h2>



                    <div className="vi-sector-row">



                      <span>

                        Sector:{' '}

                        <strong>

                          {perfil.sector_nombre ??

                            'Sin sector asociado'}

                        </strong>

                      </span>



                      <span

                        className={

                          perfil.estado_asociacion_sector === 'CONFIRMADA'

                            ? 'vi-badge vi-badge-green'

                            : perfil.estado_asociacion_sector === 'RECHAZADA'

                              ? 'vi-badge vi-badge-error'

                              : 'vi-badge vi-badge-muted'

                        }

                      >

                        {perfil.estado_asociacion_sector === 'CONFIRMADA'

                          ? 'Asociación confirmada'

                          : perfil.estado_asociacion_sector === 'RECHAZADA'

                            ? 'Asociación rechazada'

                            : 'Sin asociación'}

                      </span>



                    </div>

                  </>

                )



              ) : null}



            </div>



            <Link

              to="/vecino/perfil"

              className="vi-button"

            >

              Ver mi perfil

            </Link>



          </div>



        </section>



        {/* SERVICIOS */}



        <section>



          <h2 className="vi-section-title">

            Servicios

          </h2>



          <p className="vi-subtitle">

            Selecciona el módulo que deseas consultar.

          </p>



          <div className="vi-services-grid">



            {servicios.map((servicio) => (

              <article

                key={servicio.ruta}

                className="vi-panel vi-service-card"

              >



                <div className="vi-service-content">



                  <div className="vi-service-icon">

                    {servicio.letra}

                  </div>



                  <h3 className="vi-service-title">

                    {servicio.titulo}

                  </h3>



                  <p className="vi-service-description">

                    {servicio.descripcion}

                  </p>



                </div>



                <Link

                  to={servicio.ruta}

                  className="vi-service-button"

                >

                  {servicio.boton}

                </Link>



              </article>

            ))}



          </div>



        </section>



      </section>

    </main>

  )

}



export default VecinoInicioPage
