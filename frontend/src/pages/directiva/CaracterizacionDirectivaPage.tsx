import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type CaracterizacionAgregada = {
  datos_disponibles: boolean
  total_caracterizados: number
  minimo_requerido?: number
  detail?: string

  promedio_personas_hogar?: number
  hogares_con_menores?: number
  hogares_con_adultos_mayores?: number

  acceso_internet?: {
    si: number
    no: number
    sin_respuesta: number
  }

  nivel_educacional?: Record<string, number>
  situacion_laboral?: Record<string, number>
  tipo_vivienda?: Record<string, number>
}


const etiquetasEducacion: Record<string, string> = {
  SIN_ESTUDIOS: 'Sin estudios formales',
  BASICA: 'Educación básica',
  MEDIA: 'Educación media',
  TECNICO: 'Técnico profesional',
  SUPERIOR: 'Educación superior',
  POSTGRADO: 'Postgrado',
  PREFIERE_NO_RESPONDER: 'Prefiere no responder',
}

const etiquetasLaboral: Record<string, string> = {
  TRABAJANDO: 'Trabajando',
  ESTUDIANDO: 'Estudiando',
  DESEMPLEADO: 'Buscando empleo',
  JUBILADO: 'Jubilado/a',
  LABORES_HOGAR: 'Labores del hogar',
  OTRA: 'Otra',
  PREFIERE_NO_RESPONDER: 'Prefiere no responder',
}

const etiquetasVivienda: Record<string, string> = {
  CASA: 'Casa',
  DEPARTAMENTO: 'Departamento',
  PIEZA: 'Pieza',
  OTRA: 'Otra',
  PREFIERE_NO_RESPONDER: 'Prefiere no responder',
}


function CaracterizacionDirectivaPage() {
  const [datos, setDatos] =
    useState<CaracterizacionAgregada | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const cargarCaracterizacion = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          'http://localhost:8000/api/profiles/directiva/caracterizacion/',
          {
            credentials: 'include',
          },
        )

        const data =
          (await response.json()) as CaracterizacionAgregada

        if (!response.ok) {
          throw new Error(
            data.detail ??
            'No fue posible obtener la caracterización comunitaria.',
          )
        }

        setDatos(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.',
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarCaracterizacion()
  }, [])


  const renderDistribucion = (
    distribucion: Record<string, number> | undefined,
    etiquetas: Record<string, string>,
  ) => {
    if (!distribucion) {
      return null
    }

    return Object.entries(distribucion).map(
      ([clave, cantidad]) => (
        <div
          key={clave}
          className="flex items-center justify-between gap-4 rounded-xl bg-base-200/60 px-4 py-3"
        >
          <span className="text-sm font-medium">
            {etiquetas[clave] ?? clave}
          </span>

          <span className="badge badge-primary badge-outline">
            {cantidad}
          </span>
        </div>
      ),
    )
  }


  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Caracterización comunitaria
                </h1>

                <span className="badge badge-primary badge-lg">
                  Directiva
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Consulta información agregada de los hogares
                pertenecientes a tu Junta de Vecinos.
              </p>
            </div>

            <Link
              to="/directiva"
              className="btn btn-outline"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>


        {/* Privacidad */}
        <div className="alert alert-info mb-6 shadow-sm">
          <span>
            Las estadísticas se presentan de forma agregada.
            No se muestran nombres, RUT ni respuestas
            individuales de los vecinos.
          </span>
        </div>


        {cargando && (
          <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
            <span className="loading loading-spinner loading-sm" />

            <span>
              Cargando estadísticas comunitarias...
            </span>
          </div>
        )}


        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}


        {!cargando &&
          !error &&
          datos &&
          !datos.datos_disponibles && (
            <div className="rounded-2xl border border-warning/40 bg-base-100 p-8 text-center shadow-sm">
              <div className="mx-auto max-w-xl">
                <h2 className="text-2xl font-bold">
                  Aún no hay suficientes respuestas
                </h2>

                <p className="mt-3 text-base-content/70">
                  {datos.detail}
                </p>

                <div className="mt-5 flex justify-center">
                  <span className="badge badge-warning badge-lg">
                    {datos.total_caracterizados} de{' '}
                    {datos.minimo_requerido} respuestas
                  </span>
                </div>
              </div>
            </div>
          )}


        {!cargando &&
          !error &&
          datos?.datos_disponibles && (
            <>
              {/* Resumen */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-primary/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Vecinos caracterizados
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.total_caracterizados}
                  </p>
                </div>


                <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Promedio de personas por hogar
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.promedio_personas_hogar}
                  </p>
                </div>


                <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Hogares con menores
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.hogares_con_menores}
                  </p>
                </div>


                <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Hogares con adultos mayores
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.hogares_con_adultos_mayores}
                  </p>
                </div>
              </div>


              {/* Distribuciones */}
              <div className="grid gap-6 lg:grid-cols-2">

                {/* Internet */}
                <div className="rounded-2xl border border-cyan-500/30 bg-base-100 shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Acceso a internet
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex justify-between rounded-xl bg-base-200/60 px-4 py-3">
                      <span>Con acceso</span>

                      <span className="badge badge-success">
                        {datos.acceso_internet?.si ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between rounded-xl bg-base-200/60 px-4 py-3">
                      <span>Sin acceso</span>

                      <span className="badge badge-error badge-outline">
                        {datos.acceso_internet?.no ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between rounded-xl bg-base-200/60 px-4 py-3">
                      <span>Sin respuesta</span>

                      <span className="badge badge-ghost">
                        {datos.acceso_internet?.sin_respuesta ?? 0}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Educación */}
                <div className="rounded-2xl border border-violet-500/30 bg-base-100 shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Nivel educacional
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    {renderDistribucion(
                      datos.nivel_educacional,
                      etiquetasEducacion,
                    )}
                  </div>
                </div>


                {/* Situación laboral */}
                <div className="rounded-2xl border border-rose-500/30 bg-base-100 shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Situación laboral
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    {renderDistribucion(
                      datos.situacion_laboral,
                      etiquetasLaboral,
                    )}
                  </div>
                </div>


                {/* Vivienda */}
                <div className="rounded-2xl border border-emerald-500/30 bg-base-100 shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Tipo de vivienda
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    {renderDistribucion(
                      datos.tipo_vivienda,
                      etiquetasVivienda,
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
      </section>
    </main>
  )
}


export default CaracterizacionDirectivaPage