import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import { Link } from 'react-router-dom'

function AdminInicioPage() {
  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Panel de Administración
                </h1>

                <span className="badge badge-warning badge-lg">
                  Administrador
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Administra usuarios, estructura territorial, cargos y
                directivas de la plataforma.
              </p>
            </div>

            <CerrarSesionButton />
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Módulos disponibles
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-3xl font-bold">
                6
              </span>

              <span className="badge badge-warning badge-outline">
                Administración
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Perfil activo
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xl font-bold">
                Administrador
              </span>

              <span className="badge badge-primary badge-outline">
                Acceso global
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-base-content/60">
              Estado
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xl font-bold">
                Sesión activa
              </span>

              <span className="badge badge-success">
                Conectado
              </span>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            Módulos de administración
          </h2>

          <p className="mt-1 text-base-content/60">
            Selecciona el área que deseas gestionar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Usuarios */}
          <div className="flex h-full flex-col rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-lg font-bold text-indigo-700">
                U
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Usuarios
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Administra cuentas, estados y roles de los usuarios de la
                plataforma.
              </p>
            </div>

            <Link
              to="/admin/usuarios"
              className="btn btn-primary w-full"
            >
              Gestionar Usuarios
            </Link>
          </div>

          {/* Juntas */}
          <div className="flex h-full flex-col rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-700">
                J
              </div>

              <h3 className="text-lg font-bold">
                Juntas de Vecinos
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Administra las Juntas de Vecinos registradas en el sistema.
              </p>
            </div>

            <Link
              to="/admin/juntas"
              className="btn w-full border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
            >
              Gestionar Juntas
            </Link>
          </div>

          {/* Sectores */}
          <div className="flex h-full flex-col rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-bold text-cyan-700">
                S
              </div>

              <h3 className="text-lg font-bold">
                Sectores
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Define y administra los sectores territoriales asociados a
                cada Junta de Vecinos.
              </p>
            </div>

            <Link
              to="/admin/sectores"
              className="btn w-full border-cyan-600 bg-cyan-600 text-white hover:border-cyan-700 hover:bg-cyan-700"
            >
              Gestionar Sectores
            </Link>
          </div>

          {/* Asociaciones */}
          <div className="flex h-full flex-col rounded-2xl border border-violet-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-lg font-bold text-violet-700">
                A
              </div>

              <h3 className="text-lg font-bold">
                Asociaciones por Sector
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Revisa y gestiona las solicitudes de asociación territorial
                realizadas por los vecinos.
              </p>
            </div>

            <Link
              to="/admin/asociaciones"
              className="btn w-full border-violet-600 bg-violet-600 text-white hover:border-violet-700 hover:bg-violet-700"
            >
              Gestionar Asociaciones
            </Link>
          </div>

          {/* Cargos */}
          <div className="flex h-full flex-col rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-lg font-bold text-amber-700">
                C
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Cargos
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Configura los cargos disponibles para la conformación de las
                directivas.
              </p>
            </div>

            <Link
              to="/admin/cargos"
              className="btn w-full border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700"
            >
              Gestionar Cargos
            </Link>
          </div>

          {/* Directivas */}
          <div className="flex h-full flex-col rounded-2xl border border-rose-500/30 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-lg font-bold text-rose-700">
                D
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Directivas
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                Administra las directivas, sus integrantes y su vigencia dentro
                de cada Junta de Vecinos.
              </p>
            </div>

            <Link
              to="/admin/directivas"
              className="btn w-full border-rose-600 bg-rose-600 text-white hover:border-rose-700 hover:bg-rose-700"
            >
              Gestionar Directivas
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AdminInicioPage
