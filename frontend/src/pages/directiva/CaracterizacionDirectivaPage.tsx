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


const estilosCaracterizacionDirectiva = `
.caracterizacion-directiva {
  --cd-oro: #d5b86d;
  --cd-crema: #f5f0df;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  color: var(--cd-crema);
  font-family: Georgia, 'Times New Roman', serif;
}
.caracterizacion-directiva::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: linear-gradient(105deg, rgba(6,29,22,.82), rgba(9,38,28,.57)),
    url('/images/photo-1560518883-ce09059eeffa.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.caracterizacion-directiva::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(5,28,20,.12), rgba(3,19,15,.48));
}
.caracterizacion-directiva h1,
.caracterizacion-directiva h2,
.caracterizacion-directiva h3 {
  color: #f1d99f;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  letter-spacing: .01em;
}
.caracterizacion-directiva p,
.caracterizacion-directiva span { color: inherit; }
.caracterizacion-directiva .cd-encabezado,
.caracterizacion-directiva .cd-estadistica,
.caracterizacion-directiva .cd-panel,
.caracterizacion-directiva .cd-vacio,
.caracterizacion-directiva .cd-aviso,
.caracterizacion-directiva .cd-privacidad {
  border: 1px solid rgba(218, 185, 107, .59);
  background-color: rgba(8, 39, 30, .86);
  color: var(--cd-crema);
  box-shadow: 0 14px 35px rgba(2, 16, 12, .28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.caracterizacion-directiva .cd-encabezado {
  background-image: linear-gradient(98deg, rgba(4,31,23,.94), rgba(11,48,36,.72)),
    url('/images/photo-1494526585095-c41746248156.jpg');
  background-position: center 54%;
  background-size: cover;
  padding: clamp(22px, 4vw, 38px);
  border-radius: 22px;
}
.caracterizacion-directiva .cd-encabezado h1 { font-size: clamp(1.8rem, 3vw, 2.5rem); }
.caracterizacion-directiva .cd-encabezado p { color: #e2e4d4; line-height: 1.7; }
.caracterizacion-directiva .cd-estadistica {
  min-height: 148px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.caracterizacion-directiva .cd-estadistica:nth-child(1) {
  background-image: linear-gradient(110deg, rgba(4,35,25,.93), rgba(8,46,33,.65)),
    url('/images/photo-1494526585095-c41746248156.jpg');
}
.caracterizacion-directiva .cd-estadistica:nth-child(2) {
  background-image: linear-gradient(110deg, rgba(4,35,25,.93), rgba(8,46,33,.65)),
    url('/images/photo-1484154218962-a197022b5858.jpg');
}
.caracterizacion-directiva .cd-estadistica:nth-child(3) {
  background-image: linear-gradient(110deg, rgba(4,35,25,.93), rgba(8,46,33,.65)),
    url('/images/photo-1522708323590-d24dbb6b0267.jpg');
}
.caracterizacion-directiva .cd-estadistica:nth-child(4) {
  background-image: linear-gradient(110deg, rgba(4,35,25,.93), rgba(8,46,33,.65)),
    url('/images/photo-1519501025264-65ba15a82390.jpg');
}
.caracterizacion-directiva .cd-estadistica > p:first-child {
  color: #f6ebcd;
  font: 600 0.95rem/1.4 system-ui, sans-serif;
}
.caracterizacion-directiva .cd-estadistica > p:last-child {
  color: #f3d693;
  font: 750 2.15rem/1.2 system-ui, sans-serif;
}
.caracterizacion-directiva .cd-panel {
  overflow: hidden;
  border-radius: 20px;
  background-image: linear-gradient(130deg, rgba(5,40,28,.96), rgba(7,47,35,.84)),
    url('/images/photo-1486406146926-c627a92ad1ab.jpg');
  background-size: cover;
  background-position: center;
}
.caracterizacion-directiva .cd-panel:nth-child(2) {
  background-image: linear-gradient(130deg, rgba(5,40,28,.96), rgba(7,47,35,.84)),
    url('/images/photo-1497366754035-f200968a6e72.jpg');
}
.caracterizacion-directiva .cd-panel:nth-child(3) {
  background-image: linear-gradient(130deg, rgba(5,40,28,.96), rgba(7,47,35,.84)),
    url('/images/photo-1494526585095-c41746248156.jpg');
}
.caracterizacion-directiva .cd-panel:nth-child(4) {
  background-image: linear-gradient(130deg, rgba(5,40,28,.96), rgba(7,47,35,.84)),
    url('/images/photo-1560518883-ce09059eeffa.jpg');
}
.caracterizacion-directiva .cd-panel > div:first-child { border-bottom: 1px solid rgba(221,183,105,.38); }
.caracterizacion-directiva .cd-panel h2 { font-size: 1.3rem; }
.caracterizacion-directiva .cd-fila {
  border: 1px solid rgba(217,183,106,.22);
  background: rgba(4,27,21,.70);
  color: #f2efdf;
  font: 500 .92rem/1.5 system-ui, sans-serif;
}
.caracterizacion-directiva .badge {
  border: 1px solid rgba(222,192,119,.75);
  background: rgba(205,164,79,.13);
  color: #f3d58d;
  padding: .35rem .65rem;
  font-family: system-ui, sans-serif;
}
.caracterizacion-directiva .cd-privacidad,
.caracterizacion-directiva .cd-aviso {
  border-radius: 16px;
  background-image: linear-gradient(110deg, rgba(6,44,34,.92), rgba(14,60,47,.80)),
    url('/images/photo-1522708323590-d24dbb6b0267.jpg');
  background-size: cover;
  background-position: center;
  padding: 18px 22px;
  line-height: 1.6;
  font-family: system-ui, sans-serif;
}
.caracterizacion-directiva .cd-error {
  border: 1px solid #f3a3a3;
  border-radius: 16px;
  background: rgba(83,20,26,.94);
  color: #ffe3e3;
}
.caracterizacion-directiva .cd-vacio {
  border-radius: 20px;
  background-image: linear-gradient(110deg, rgba(7,44,32,.94), rgba(8,43,35,.81)),
    url('/images/photo-1494526585095-c41746248156.jpg');
  background-size: cover;
  background-position: center;
}
.caracterizacion-directiva .cd-encabezado a {
  border: 1px solid var(--cd-oro);
  background: rgba(5,29,21,.72);
  color: #f5e0ab;
  border-radius: 12px;
  font-weight: 650;
}
.caracterizacion-directiva .cd-encabezado a:hover { background: #d5b86d; color: #123a2a; }
.caracterizacion-directiva [class~="text-base-content/70"],
.caracterizacion-directiva [class~="text-base-content/60"] { color: #e8e5d5; }

/* Distinción visual de indicadores: colores accesibles y consistentes. */
.caracterizacion-directiva .cd-estadistica {
  position: relative;
  border-color: var(--cd-acento, #d5b86d);
  box-shadow: inset 0 3px 0 var(--cd-acento, #d5b86d), 0 14px 35px rgba(2,16,12,.28);
}
.caracterizacion-directiva .cd-estadistica:nth-child(1) { --cd-acento: #e9c579; }
.caracterizacion-directiva .cd-estadistica:nth-child(2) { --cd-acento: #80c9e5; }
.caracterizacion-directiva .cd-estadistica:nth-child(3) { --cd-acento: #81d5ad; }
.caracterizacion-directiva .cd-estadistica:nth-child(4) { --cd-acento: #e6aa9a; }
.caracterizacion-directiva .cd-estadistica > p:last-child {
  color: var(--cd-acento, #f3d693);
  font-size: clamp(2rem, 3vw, 2.45rem);
  font-variant-numeric: tabular-nums;
}
.caracterizacion-directiva .cd-estadistica > p:first-child {
  color: #f6f3e9;
}
.caracterizacion-directiva .cd-panel { --cd-panel-acento: #80c9e5; }
.caracterizacion-directiva .cd-panel:nth-child(2) { --cd-panel-acento: #b9a7ed; }
.caracterizacion-directiva .cd-panel:nth-child(3) { --cd-panel-acento: #e9b375; }
.caracterizacion-directiva .cd-panel:nth-child(4) { --cd-panel-acento: #85d4af; }
.caracterizacion-directiva .cd-panel > div:first-child {
  border-bottom-color: color-mix(in srgb, var(--cd-panel-acento) 45%, transparent);
  box-shadow: inset 4px 0 0 var(--cd-panel-acento);
}
.caracterizacion-directiva .cd-panel h2 { color: var(--cd-panel-acento); }
.caracterizacion-directiva .cd-distribucion {
  --cd-item: #e8c980;
  display: block;
  border-color: color-mix(in srgb, var(--cd-item) 34%, transparent);
  background: rgba(4,27,21,.76);
  transition: background .18s ease, border-color .18s ease;
}
.caracterizacion-directiva .cd-distribucion:hover {
  background: rgba(19,50,38,.94);
  border-color: var(--cd-item);
}
.caracterizacion-directiva .cd-tono-0 { --cd-item: #79cdb3; }
.caracterizacion-directiva .cd-tono-1 { --cd-item: #84bfe5; }
.caracterizacion-directiva .cd-tono-2 { --cd-item: #edc575; }
.caracterizacion-directiva .cd-tono-3 { --cd-item: #c2a6ef; }
.caracterizacion-directiva .cd-tono-4 { --cd-item: #ed9e9f; }
.caracterizacion-directiva .cd-tono-5 { --cd-item: #8cd3d3; }
.caracterizacion-directiva .cd-tono-6 { --cd-item: #e3b591; }
.caracterizacion-directiva .cd-tono-neutro { --cd-item: #aeb9ba; }
.caracterizacion-directiva .cd-internet-si { --cd-item: #79d4aa; }
.caracterizacion-directiva .cd-internet-no { --cd-item: #efa09d; }
.caracterizacion-directiva .cd-internet-sin { --cd-item: #b0bdc3; }
.caracterizacion-directiva .cd-fila-contenido {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.caracterizacion-directiva .cd-fila-nombre {
  color: #f4f1e6;
  font-size: .92rem;
  font-weight: 600;
}
.caracterizacion-directiva .cd-fila-datos {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.caracterizacion-directiva .cd-fila-porcentaje {
  color: var(--cd-item);
  font-size: .83rem;
  font-weight: 700;
}
.caracterizacion-directiva .cd-fila-cantidad {
  min-width: 42px;
  padding: 4px 9px;
  border: 1px solid var(--cd-item);
  border-radius: 9px;
  background: color-mix(in srgb, var(--cd-item) 16%, transparent);
  color: #fff9ea;
  font-weight: 800;
  text-align: center;
}
.caracterizacion-directiva .cd-barra-fondo {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(212,229,218,.15);
}
.caracterizacion-directiva .cd-barra-relleno {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  background: var(--cd-item);
  transition: width .28s ease;
}
.caracterizacion-directiva .cd-leyenda {
  margin: 0 0 16px;
  color: #cbd6cd;
  font: 500 .8rem/1.5 system-ui, sans-serif;
}
@media (prefers-reduced-motion: reduce) {
  .caracterizacion-directiva .cd-barra-relleno,
  .caracterizacion-directiva .cd-distribucion { transition: none; }
}

@media (max-width: 640px) {
  .caracterizacion-directiva { padding: 16px 12px 32px; }
  .caracterizacion-directiva .cd-encabezado { padding: 22px; }
  .caracterizacion-directiva .cd-estadistica { min-height: 124px; }
}
`;

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

    const total = Object.values(distribucion).reduce(
      (acumulado, cantidad) => acumulado + cantidad,
      0,
    )

    return Object.entries(distribucion).map(
      ([clave, cantidad], indice) => {
        const porcentaje = total > 0 ? (cantidad / total) * 100 : 0
        const tono = clave === 'PREFIERE_NO_RESPONDER'
          ? 'cd-tono-neutro'
          : `cd-tono-${indice % 7}`

        return (
          <div key={clave} className={`cd-fila cd-distribucion ${tono} rounded-xl px-4 py-3`}>
            <div className="cd-fila-contenido">
              <span className="cd-fila-nombre">{etiquetas[clave] ?? clave}</span>
              <div className="cd-fila-datos">
                <span className="cd-fila-porcentaje">{porcentaje.toFixed(1).replace('.', ',')}%</span>
                <span className="cd-fila-cantidad" aria-label={`${cantidad} respuestas`}>{cantidad}</span>
              </div>
            </div>
            <div
              className="cd-barra-fondo"
              role="progressbar"
              aria-label={etiquetas[clave] ?? clave}
              aria-valuenow={cantidad}
              aria-valuemin={0}
              aria-valuemax={total}
            >
              <div className="cd-barra-relleno" style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
        )
      },
    )
  }


  return (
    <main className="caracterizacion-directiva min-h-screen px-4 py-8">
      <style>{estilosCaracterizacionDirectiva}</style>
      <section className="mx-auto w-full max-w-6xl">

        {/* Encabezado */}
        <div className="cd-encabezado mb-6 rounded-2xl border p-6 shadow-sm">
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
        <div className="cd-privacidad alert mb-6 shadow-sm">
          <span>
            Las estadísticas se presentan de forma agregada.
            No se muestran nombres, RUT ni respuestas
            individuales de los vecinos.
          </span>
        </div>


        {cargando && (
          <div className="cd-aviso alert mb-6 border shadow-sm">
            <span className="loading loading-spinner loading-sm" />

            <span>
              Cargando estadísticas comunitarias...
            </span>
          </div>
        )}


        {error && (
          <div className="cd-error alert mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}


        {!cargando &&
          !error &&
          datos &&
          !datos.datos_disponibles && (
            <div className="cd-vacio rounded-2xl border p-8 text-center shadow-sm">
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
              <div className="cd-estadisticas mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="cd-estadistica rounded-2xl border p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Vecinos caracterizados
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.total_caracterizados}
                  </p>
                </div>


                <div className="cd-estadistica rounded-2xl border p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Promedio de personas por hogar
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.promedio_personas_hogar}
                  </p>
                </div>


                <div className="cd-estadistica rounded-2xl border p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Hogares con menores
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.hogares_con_menores}
                  </p>
                </div>


                <div className="cd-estadistica rounded-2xl border p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/60">
                    Hogares con adultos mayores
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {datos.hogares_con_adultos_mayores}
                  </p>
                </div>
              </div>


              {/* Distribuciones */}
              <div className="cd-distribuciones grid gap-6 lg:grid-cols-2">

                {/* Internet */}
                <div className="cd-panel rounded-2xl border shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Acceso a internet
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="cd-leyenda">Distribución del acceso a internet · cantidad y porcentaje de respuestas</p>
                    {([
                      { clave: 'si', etiqueta: 'Con acceso', tono: 'cd-internet-si' },
                      { clave: 'no', etiqueta: 'Sin acceso', tono: 'cd-internet-no' },
                      { clave: 'sin_respuesta', etiqueta: 'Sin respuesta', tono: 'cd-internet-sin' },
                    ] as const).map(({ clave, etiqueta, tono }) => {
                      const cantidad = datos.acceso_internet?.[clave] ?? 0
                      const total = (datos.acceso_internet?.si ?? 0)
                        + (datos.acceso_internet?.no ?? 0)
                        + (datos.acceso_internet?.sin_respuesta ?? 0)
                      const porcentaje = total > 0 ? (cantidad / total) * 100 : 0
                      return (
                        <div key={clave} className={`cd-fila cd-distribucion ${tono} rounded-xl px-4 py-3`}>
                          <div className="cd-fila-contenido">
                            <span className="cd-fila-nombre">{etiqueta}</span>
                            <div className="cd-fila-datos">
                              <span className="cd-fila-porcentaje">{porcentaje.toFixed(1).replace('.', ',')}%</span>
                              <span className="cd-fila-cantidad" aria-label={`${cantidad} respuestas`}>{cantidad}</span>
                            </div>
                          </div>
                          <div className="cd-barra-fondo" role="progressbar" aria-label={etiqueta} aria-valuenow={cantidad} aria-valuemin={0} aria-valuemax={total}>
                            <div className="cd-barra-relleno" style={{ width: `${porcentaje}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>


                {/* Educación */}
                <div className="cd-panel rounded-2xl border shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Nivel educacional
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="cd-leyenda">Cantidad de respuestas y porcentaje dentro de esta categoría</p>
                    {renderDistribucion(
                      datos.nivel_educacional,
                      etiquetasEducacion,
                    )}
                  </div>
                </div>


                {/* Situación laboral */}
                <div className="cd-panel rounded-2xl border shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Situación laboral
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="cd-leyenda">Cantidad de respuestas y porcentaje dentro de esta categoría</p>
                    {renderDistribucion(
                      datos.situacion_laboral,
                      etiquetasLaboral,
                    )}
                  </div>
                </div>


                {/* Vivienda */}
                <div className="cd-panel rounded-2xl border shadow-sm">
                  <div className="border-b border-base-300 p-5">
                    <h2 className="text-xl font-bold">
                      Tipo de vivienda
                    </h2>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="cd-leyenda">Cantidad de respuestas y porcentaje dentro de esta categoría</p>
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