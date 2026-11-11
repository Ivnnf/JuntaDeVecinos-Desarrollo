
import { useEffect, useState } from 'react'
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
  },
  {
    titulo: 'Juntas de Vecinos',
    descripcion:
      'Administra las Juntas de Vecinos registradas en el sistema.',
    boton: 'Gestionar Juntas',
    ruta: '/admin/juntas',
    imagen: '/casas.webp',
    inicial: 'J',
  },
  {
    titulo: 'Sectores',
    descripcion:
      'Define y administra los sectores territoriales asociados a cada Junta de Vecinos.',
    boton: 'Gestionar Sectores',
    ruta: '/admin/sectores',
    imagen: '/sector.webp',
    inicial: 'S',
  },
  {
    titulo: 'Asociaciones por Sector',
    descripcion:
      'Revisa y gestiona las solicitudes de asociación territorial realizadas por los vecinos.',
    boton: 'Gestionar Asociaciones',
    ruta: '/admin/asociaciones',
    imagen: '/asociaciones-directiva.webp',
    inicial: 'A',
  },
  {
    titulo: 'Gestión de Cargos',
    descripcion:
      'Configura los cargos disponibles para la conformación de las directivas.',
    boton: 'Gestionar Cargos',
    ruta: '/admin/cargos',
    imagen: '/cargos.webp',
    inicial: 'C',
  },
  {
    titulo: 'Gestión de Directivas',
    descripcion:
      'Administra las directivas, sus integrantes y su vigencia dentro de cada Junta de Vecinos.',
    boton: 'Gestionar Directivas',
    ruta: '/admin/directivas',
    imagen: '/gestion-directiva.webp',
    inicial: 'D',
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
      valor: String(modulos.length),
      etiqueta: 'Administración',
      imagen: '/casas.webp',
    },
    {
      titulo: 'Perfil activo',
      valor: 'Administrador',
      etiqueta: 'Acceso global',
      imagen: '/gestion-directiva.webp',
    },
    {
      titulo: 'Estado de sesión',
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
      className="min-h-screen px-4 py-8 text-[#f6f0dd] sm:px-6"
      style={{
        backgroundColor: '#102a20',
        backgroundImage: `
          linear-gradient(
            115deg,
            rgba(5, 28, 20, 0.68),
            rgba(5, 28, 20, 0.50)
          ),
          url("/casitas.webp")
        `,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
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

                <span className="rounded-full border border-[#d6b65d]/60 bg-[#d6b65d]/15 px-4 py-2 text-xs font-semibold text-[#f5dda1]">
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
              className={`min-h-[135px] overflow-hidden rounded-2xl border border-[#d6b65d]/45 p-6 shadow-lg transition-all duration-300 hover:border-[#f2d786] hover:shadow-xl ${
                index === 2
                  ? 'sm:col-span-2 lg:col-span-1'
                  : ''
              }`}
              style={estiloFotografico(item.imagen, true)}
            >
              <p className="text-sm font-medium text-[#e3e9dc]">
                {item.titulo}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                <span
                  className={`font-bold ${
                    index === 0
                      ? 'text-4xl text-[#f4d778]'
                      : 'text-xl text-[#f8f2df]'
                  }`}
                >
                  {item.valor}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    index === 2 && sesion
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                      : 'border-[#d6b65d]/50 bg-[#102b20]/40 text-[#f2d98f]'
                  }`}
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
              className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-3xl border border-[#d6b65d]/45 bg-[#112d21] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#f0d27e]"
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

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6b65d]/30 bg-[#d6b65d]/20 text-xl font-bold text-[#f4d778]">
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
                  className="mt-7 flex min-h-12 items-center justify-center rounded-full border border-[#e0c477] bg-gradient-to-r from-[#ebd68e] to-[#cda638] px-4 py-3 text-center text-sm font-extrabold text-[#112d21] shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4d778]"
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
