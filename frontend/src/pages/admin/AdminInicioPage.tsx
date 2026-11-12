
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'

type SesionUsuario = {
  id: number
  username: string
  email: string
  roles: unknown[]
  es_superusuario: boolean
}

const estiloTitulo = {
  fontFamily: 'Georgia, "Times New Roman", serif',
}

const estiloFotografico = (imagen: string, oscuro = false) => ({
  backgroundImage: `
    linear-gradient(
      135deg,
      rgba(6, 32, 23, ${oscuro ? '0.84' : '0.68'}),
      rgba(9, 42, 30, ${oscuro ? '0.82' : '0.76'})
    ),
    url("${imagen}")
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
})

const modulos = [
  {
    titulo: 'Gestión de Usuarios',
    descripcion:
      'Administra cuentas, estados y roles de los usuarios de la plataforma.',
    boton: 'Gestionar Usuarios',
    ruta: '/admin/usuarios',
    imagen: '/registro-vecino.webp',
    inicial: 'U',
    acento: '#91CBF6',
    textoBoton: '#17334B',
    fondoIcono: 'rgba(145,203,246,.16)',
  },
  {
    titulo: 'Juntas de Vecinos',
    descripcion:
      'Administra las Juntas de Vecinos registradas en el sistema.',
    boton: 'Gestionar Juntas',
    ruta: '/admin/juntas',
    imagen: '/casas.webp',
    inicial: 'J',
    acento: '#91DDB6',
    textoBoton: '#123C2A',
    fondoIcono: 'rgba(145,221,182,.16)',
  },
  {
    titulo: 'Sectores',
    descripcion:
      'Define y administra los sectores territoriales asociados a cada Junta de Vecinos.',
    boton: 'Gestionar Sectores',
    ruta: '/admin/sectores',
    imagen: '/sector.webp',
    inicial: 'S',
    acento: '#EACB85',
    textoBoton: '#46330E',
    fondoIcono: 'rgba(234,203,133,.17)',
  },
  {
    titulo: 'Asociaciones por Sector',
    descripcion:
      'Revisa y gestiona las solicitudes de asociación territorial realizadas por los vecinos.',
    boton: 'Gestionar Asociaciones',
    ruta: '/admin/asociaciones',
    imagen: '/asociaciones-directiva.webp',
    inicial: 'A',
    acento: '#C9AFF7',
    textoBoton: '#322349',
    fondoIcono: 'rgba(201,175,247,.17)',
  },
  {
    titulo: 'Gestión de Cargos',
    descripcion:
      'Configura los cargos disponibles para la conformación de las directivas.',
    boton: 'Gestionar Cargos',
    ruta: '/admin/cargos',
    imagen: '/cargos.webp',
    inicial: 'C',
    acento: '#F2ABAC',
    textoBoton: '#51252B',
    fondoIcono: 'rgba(242,171,172,.16)',
  },
  {
    titulo: 'Gestión de Directivas',
    descripcion:
      'Administra las directivas, sus integrantes y su vigencia dentro de cada Junta de Vecinos.',
    boton: 'Gestionar Directivas',
    ruta: '/admin/directivas',
    imagen: '/gestion-directiva.webp',
    inicial: 'D',
    acento: '#91D9D7',
    textoBoton: '#153D3C',
    fondoIcono: 'rgba(145,217,215,.16)',
  },
]

function AdminInicioPage() {
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/auth/sesion/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          return
        }

        const data =
          (await response.json()) as SesionUsuario

        setSesion(data)
      } catch {
        // Si no se puede obtener la sesión,
        // simplemente no mostramos Cambiar perfil.
      } finally {
        setCargandoSesion(false)
      }
    }

    void cargarSesion()
  }, [])

  const resumen = [
    {
      titulo: 'Módulos disponibles',
      acento: '#EACB85',
      valor: String(modulos.length),
      etiqueta: 'Administración',
      imagen: '/casas.webp',
    },
    {
      titulo: 'Perfil activo',
      acento: '#C9AFF7',
      valor: 'Administrador',
      etiqueta: 'Acceso global',
      imagen: '/gestion-directiva.webp',
    },
    {
      titulo: 'Estado de sesión',
      acento: '#91DDB6',
      valor: cargandoSesion
        ? 'Verificando...'
        : sesion
          ? 'Sesión activa'
          : 'Sin confirmar',
      etiqueta: sesion ? 'Conectado' : 'Verificación',
      imagen: '/directivas.webp',
    },
  ]

  return (
    <main
      className="admin-inicio-color min-h-screen px-4 py-8 text-[#f6f0dd] sm:px-6"
      style={{
        backgroundColor: '#0A2018',
        backgroundImage: `
          linear-gradient(
            115deg,
            rgba(5, 28, 20, 0.78),
            rgba(5, 28, 20, 0.65)
          ),
          url("/casitas.webp")
        `,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        .admin-inicio-color .admin-modulo {
          border-color: color-mix(in srgb, var(--admin-acento) 62%, transparent);
          box-shadow: 0 16px 36px rgba(2,18,12,.29), inset 0 4px 0 var(--admin-acento);
        }
        .admin-inicio-color .admin-modulo:hover {
          border-color: var(--admin-acento);
          box-shadow: 0 22px 45px rgba(2,18,12,.37), inset 0 4px 0 var(--admin-acento);
        }
        .admin-inicio-color .admin-modulo-link {
          background: var(--admin-acento);
          border-color: var(--admin-acento);
          color: var(--admin-texto);
          box-shadow: 0 5px 18px rgba(0,0,0,.25);
        }
        .admin-inicio-color .admin-modulo-link:hover { filter: brightness(1.12); }
        .admin-inicio-color .admin-modulo-link:focus-visible {
          outline: 3px solid white;
          outline-offset: 3px;
        }
        .admin-inicio-color .admin-stat { border-color: var(--admin-acento); border-top-width: 4px; }
        .admin-inicio-color .admin-stat-numero { color: var(--admin-acento); }
        .admin-inicio-color .admin-stat-etiqueta {
          border-color: var(--admin-acento);
          color: var(--admin-acento);
          background: rgba(7,26,18,.77);
        }
        .admin-inicio-color .admin-sello {
          color: #1d2a1e;
          background: linear-gradient(115deg,#f5dd96,#d2ac50);
          border: 1px solid #ffe6ac;
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-inicio-color .admin-modulo,
          .admin-inicio-color .admin-modulo-link { transition: none; }
        }
      `}</style>
      <section className="mx-auto w-full max-w-7xl">

        {/* ENCABEZADO CON FOTOGRAFÍA SUTIL */}
        <header
          className="mb-7 overflow-hidden rounded-3xl border border-[#c8a958]/45 p-6 shadow-xl sm:p-8"
          style={estiloFotografico('/directivas-inicio.webp', true)}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">

            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#e2c46d]">
                APT · Gestión comunitaria
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <h1
                  className="text-3xl font-bold leading-tight text-[#f8f2df] sm:text-5xl"
                  style={estiloTitulo}
                >
                  Panel de Administración
                </h1>

                <span className="admin-sello rounded-full px-4 py-2 text-xs font-bold">
                  Administrador
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#e1e8dd]">
                Administra usuarios, estructura territorial, cargos y
                directivas de la plataforma de gestión comunitaria.
              </p>
            </div>

            {/* ACCIONES DE SESIÓN */}
            <div className="flex flex-wrap items-center gap-3">
              {sesion &&
                !sesion.es_superusuario &&
                sesion.roles.length > 1 && (
                  <div className="[&_button]:!border-[#d6b65d] [&_button]:!text-[#f7e5b4]">
                    <CambiarPerfilButton />
                  </div>
                )}

              <div className="[&_button]:!border-[#d6b65d] [&_button]:!bg-[#d6b65d] [&_button]:!text-[#112d21] [&_button]:!font-bold [&_button]:!opacity-100 [&_button]:hover:!brightness-110">
                <CerrarSesionButton />
              </div>
            </div>
          </div>
        </header>

        {/* ESTADÍSTICAS CON FOTOGRAFÍAS INSINUADAS */}
        <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {resumen.map((item, index) => (
            <div
              key={item.titulo}
              className={`admin-stat min-h-[135px] overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                index === 2
                  ? 'sm:col-span-2 lg:col-span-1'
                  : ''
              }`}
              style={{ ...estiloFotografico(item.imagen, true), '--admin-acento': item.acento } as CSSProperties}
            >
              <p className="text-sm font-medium text-[#e3e9dc]">
                {item.titulo}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                <span
                  className={`admin-stat-numero font-bold ${
                    index === 0
                      ? 'text-4xl'
                      : 'text-xl'
                  }`}
                >
                  {item.valor}
                </span>

                <span
                  className="admin-stat-etiqueta rounded-full border px-3 py-1 text-xs font-semibold"
                >
                  {item.etiqueta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TÍTULO DE MÓDULOS */}
        <div className="mb-6">
          <h2
            className="text-3xl font-bold text-[#f8f2df] sm:text-4xl"
            style={estiloTitulo}
          >
            Módulos de Administración
          </h2>

          <p className="mt-3 text-[#f0ebdc]/90">
            Selecciona el área que deseas gestionar.
          </p>
        </div>

        {/* TARJETAS FOTOGRÁFICAS DE MÓDULOS */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {modulos.map((modulo) => (
            <article
              key={modulo.ruta}
              className="admin-modulo group relative flex min-h-[310px] flex-col overflow-hidden rounded-3xl border bg-[#112d21] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ '--admin-acento': modulo.acento, '--admin-texto': modulo.textoBoton } as CSSProperties}
            >
              {/* FOTO DE FONDO */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `
                    linear-gradient(
                      180deg,
                      rgba(8, 31, 21, 0.60),
                      rgba(8, 31, 21, 0.85)
                    ),
                    url("${modulo.imagen}")
                  `,
                }}
              />

              {/* CONTENIDO */}
              <div className="relative z-10 flex h-full flex-1 flex-col">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-bold"
                  style={{ borderColor: modulo.acento, backgroundColor: modulo.fondoIcono, color: modulo.acento }}>
                  {modulo.inicial}
                </div>

                <h3
                  className="text-2xl font-bold leading-tight text-[#f8f2df]"
                  style={estiloTitulo}
                >
                  {modulo.titulo}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#e1e6db]">
                  {modulo.descripcion}
                </p>

                <Link
                  to={modulo.ruta}
                  className="admin-modulo-link mt-7 flex min-h-12 items-center justify-center rounded-full border px-4 py-3 text-center text-sm font-extrabold transition"
                >
                  {modulo.boton}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* PIE DE PÁGINA */}
        <footer className="mt-10 pb-3 text-center text-xs text-[#e3e8db]/80">
          APT · Plataforma Inteligente de Gestión y
          Caracterización Comunitaria para Juntas de Vecinos
        </footer>

      </section>
    </main>
  )
}

export default AdminInicioPage
