import CerrarSesionButton from '../../components/auth/CerrarSesionButton'

function DirectivaInicioPage() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <section className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Panel de Directiva
              </h1>

              <p className="text-base-content/70 mt-2">
                Sesión iniciada correctamente como integrante de la Directiva.
              </p>
            </div>

            <CerrarSesionButton />
          </div>
        </div>
      </section>
    </main>
  )
}

export default DirectivaInicioPage