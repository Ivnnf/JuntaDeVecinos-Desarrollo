import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import { Link } from 'react-router-dom'


function MunicipalInicioPage() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <section className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Panel Municipal
              </h1>

              <p className="text-base-content/70 mt-2">
                Sesión iniciada correctamente como Usuario Municipal.
              </p>
            </div>

            <CerrarSesionButton />
          </div>
          <div className="mt-6">
            <div className="rounded-2xl border border-base-300 bg-base-200 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Indicadores Comunitarios
                  </h2>

                  <p className="mt-1 text-sm text-base-content/60">
                    Consulta información agregada y comparativa
                    de las Juntas de Vecinos.
                  </p>
                </div>

                <Link
                  to="/municipal/indicadores"
                  className="btn btn-primary"
                >
                  Ver Indicadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MunicipalInicioPage