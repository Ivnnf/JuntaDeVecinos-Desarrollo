import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Distribucion = Record<string, number>

type JuntaIndicadores = {
  junta_id: number
  junta_nombre: string
  datos_disponibles: boolean
  total_caracterizados: number
  minimo_requerido: number
  promedio_personas_hogar?: number
  hogares_con_menores?: number
  hogares_con_adultos_mayores?: number
  acceso_internet?: {
    si: number
    no: number
    sin_respuesta: number
  }
  nivel_educacional?: Distribucion
  situacion_laboral?: Distribucion
  tipo_vivienda?: Distribucion
}

type RespuestaIndicadores = {
  total_caracterizados: number
  minimo_requerido: number
  juntas: JuntaIndicadores[]
}

function IndicadoresMunicipalesPage() {
  const [datos, setDatos] =
    useState<RespuestaIndicadores | null>(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [filtroJunta, setFiltroJunta] =
    useState('TODAS')

  useEffect(() => {
    const cargarIndicadores = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await fetch(
          'http://localhost:8000/api/profiles/municipal/caracterizacion/',
          {
            credentials: 'include',
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ??
            'No fue posible cargar los indicadores.',
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

    void cargarIndicadores()
  }, [])

  const juntasConDatos =
    datos?.juntas.filter(
      (junta) => junta.datos_disponibles,
    ).length ?? 0

  const juntasSinDatos =
    datos?.juntas.filter(
      (junta) => !junta.datos_disponibles,
    ).length ?? 0

  const juntasFiltradas = useMemo(() => {
    if (!datos) {
      return []
    }

    if (filtroJunta === 'TODAS') {
      return datos.juntas
    }

    return datos.juntas.filter(
      (junta) =>
        junta.junta_id === Number(filtroJunta),
    )
  }, [datos, filtroJunta])

  const porcentaje = (
    valor: number,
    total: number,
  ) => {
    if (total <= 0) {
      return 0
    }

    return Math.round((valor / total) * 100)
  }

  const progresoMinimo = (
    actual: number,
    minimo: number,
  ) => {
    if (minimo <= 0) {
      return 100
    }

    return Math.min(
      100,
      Math.round((actual / minimo) * 100),
    )
  }

  const etiquetaNivelEducacional = (
    valor: string,
  ) => {
    const etiquetas: Record<string, string> = {
      SIN_ESTUDIOS: 'Sin estudios formales',
      BASICA: 'Educación básica',
      MEDIA: 'Educación media',
      TECNICO: 'Técnico profesional',
      SUPERIOR: 'Educación superior',
      POSTGRADO: 'Postgrado',
      PREFIERE_NO_RESPONDER: 'Prefiere no responder',
    }

    return etiquetas[valor] ?? valor
  }

  const etiquetaSituacionLaboral = (
    valor: string,
  ) => {
    const etiquetas: Record<string, string> = {
      TRABAJANDO: 'Trabajando',
      ESTUDIANDO: 'Estudiando',
      DESEMPLEADO: 'Buscando empleo',
      JUBILADO: 'Jubilado/a',
      LABORES_HOGAR: 'Labores del hogar',
      OTRA: 'Otra',
      PREFIERE_NO_RESPONDER: 'Prefiere no responder',
    }

    return etiquetas[valor] ?? valor
  }

  const etiquetaTipoVivienda = (
    valor: string,
  ) => {
    const etiquetas: Record<string, string> = {
      CASA: 'Casa',
      DEPARTAMENTO: 'Departamento',
      PIEZA: 'Pieza',
      OTRA: 'Otra',
      PREFIERE_NO_RESPONDER: 'Prefiere no responder',
    }

    return etiquetas[valor] ?? valor
  }

  const renderDistribucion = (
    distribucion: Distribucion,
    formatearEtiqueta: (valor: string) => string,
    colorBarra: string,
  ) => {
    const entradas = Object.entries(distribucion)
    const total = entradas.reduce(
      (acumulado, [, valor]) =>
        acumulado + valor,
      0,
    )

    return (
      <div className="space-y-3">
        {entradas.map(([clave, valor]) => {
          const porcentajeValor =
            porcentaje(valor, total)

          return (
            <div
              key={clave}
              className="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-base-content/75">
                  {formatearEtiqueta(clave)}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold">
                    {valor}
                  </span>

                  <span className="min-w-10 text-right text-xs text-base-content/45">
                    {porcentajeValor}%
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-base-200">
                <div
                  className={`h-full rounded-full ${colorBarra}`}
                  style={{
                    width: `${porcentajeValor}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* Encabezado */}
        <section className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Indicadores Comunitarios
                </h1>

                <span className="badge badge-info badge-lg">
                  Municipal
                </span>
              </div>

              <p className="max-w-2xl text-base-content/65">
                Información agregada de caracterización comunitaria,
                organizada por Junta de Vecinos para facilitar su revisión.
              </p>
            </div>

            <Link
              to="/municipal"
              className="btn btn-outline"
            >
              ← Volver al Panel
            </Link>
          </div>
        </section>

        {cargando && (
          <section className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
            <span className="loading loading-spinner loading-lg" />

            <p className="mt-4 text-base-content/60">
              Cargando indicadores comunitarios...
            </p>
          </section>
        )}

        {error && (
          <div className="alert alert-error shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && datos && (
          <>
            {/* Resumen general */}
            <section className="mb-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Resumen general
                  </h2>

                  <p className="mt-1 text-sm text-base-content/55">
                    Vista rápida de la información disponible.
                  </p>
                </div>

                <label className="form-control w-full sm:w-72">
                  <div className="label py-1">
                    <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Filtrar por Junta
                    </span>
                  </div>

                  <select
                    className="select select-bordered select-sm w-full"
                    value={filtroJunta}
                    onChange={(event) =>
                      setFiltroJunta(event.target.value)
                    }
                  >
                    <option value="TODAS">
                      Todas las Juntas
                    </option>

                    {datos.juntas.map((junta) => (
                      <option
                        key={junta.junta_id}
                        value={String(junta.junta_id)}
                      >
                        {junta.junta_nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/55">
                    Caracterizaciones
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-3xl font-bold">
                      {datos.total_caracterizados}
                    </span>

                    <span className="badge badge-info badge-outline">
                      Total
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/55">
                    Juntas con caracterización
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-3xl font-bold">
                      {datos.juntas.length}
                    </span>

                    <span className="badge badge-primary badge-outline">
                      Juntas
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/55">
                    Con datos disponibles
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-3xl font-bold">
                      {juntasConDatos}
                    </span>

                    <span className="badge badge-success badge-outline">
                      Disponibles
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm font-medium text-base-content/55">
                    Datos insuficientes
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-3xl font-bold">
                      {juntasSinDatos}
                    </span>

                    <span className="badge badge-warning badge-outline">
                      Pendientes
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Juntas */}
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">
                  Información por Junta de Vecinos
                </h2>

                <p className="mt-1 text-sm text-base-content/55">
                  Los indicadores se muestran solo cuando existe una cantidad
                  suficiente de caracterizaciones.
                </p>
              </div>

              <div className="space-y-6">
                {juntasFiltradas.map((junta) => {
                  const avance = progresoMinimo(
                    junta.total_caracterizados,
                    junta.minimo_requerido,
                  )

                  const internetTotal =
                    junta.acceso_internet
                      ? junta.acceso_internet.si +
                        junta.acceso_internet.no +
                        junta.acceso_internet.sin_respuesta
                      : 0

                  return (
                    <article
                      key={junta.junta_id}
                      className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                    >
                      {/* Cabecera Junta */}
                      <header className="border-b border-base-300 bg-gradient-to-r from-cyan-500/[0.08] via-base-100 to-indigo-500/[0.06] p-5 sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-lg font-bold text-cyan-700">
                              {junta.junta_nombre
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xl font-bold">
                                {junta.junta_nombre}
                              </h3>

                              <p className="mt-1 text-sm text-base-content/55">
                                {junta.total_caracterizados}{' '}
                                caracterizaciones registradas
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={
                                junta.datos_disponibles
                                  ? 'badge badge-success badge-lg'
                                  : 'badge badge-warning badge-lg'
                              }
                            >
                              {junta.datos_disponibles
                                ? 'Datos disponibles'
                                : 'Datos insuficientes'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                            <span className="font-medium text-base-content/55">
                              Avance para habilitar indicadores
                            </span>

                            <span className="font-semibold">
                              {junta.total_caracterizados} /{' '}
                              {junta.minimo_requerido}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-base-200">
                            <div
                              className={
                                junta.datos_disponibles
                                  ? 'h-full rounded-full bg-emerald-500'
                                  : 'h-full rounded-full bg-amber-500'
                              }
                              style={{
                                width: `${avance}%`,
                              }}
                            />
                          </div>
                        </div>
                      </header>

                      {!junta.datos_disponibles ? (
                        <div className="p-5 sm:p-6">
                          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 font-bold text-amber-700">
                                !
                              </div>

                              <div>
                                <h4 className="font-semibold">
                                  Aún no hay información suficiente
                                </h4>

                                <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                                  Se requieren al menos{' '}
                                  <strong>
                                    {junta.minimo_requerido}
                                  </strong>{' '}
                                  caracterizaciones para mostrar los
                                  indicadores agregados de esta Junta.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 sm:p-6">

                          {/* Indicadores destacados */}
                          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Personas por hogar
                              </p>

                              <p className="mt-2 text-3xl font-bold">
                                {junta.promedio_personas_hogar ?? 0}
                              </p>

                              <p className="mt-1 text-xs text-base-content/45">
                                Promedio
                              </p>
                            </div>

                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Hogares con menores
                              </p>

                              <p className="mt-2 text-3xl font-bold">
                                {junta.hogares_con_menores ?? 0}
                              </p>

                              <p className="mt-1 text-xs text-base-content/45">
                                Hogares registrados
                              </p>
                            </div>

                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                Adultos mayores
                              </p>

                              <p className="mt-2 text-3xl font-bold">
                                {junta.hogares_con_adultos_mayores ?? 0}
                              </p>

                              <p className="mt-1 text-xs text-base-content/45">
                                Hogares registrados
                              </p>
                            </div>

                            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                                Acceso a Internet
                              </p>

                              <p className="mt-2 text-3xl font-bold">
                                {junta.acceso_internet
                                  ? `${porcentaje(
                                      junta.acceso_internet.si,
                                      internetTotal,
                                    )}%`
                                  : '—'}
                              </p>

                              <p className="mt-1 text-xs text-base-content/45">
                                Hogares con acceso
                              </p>
                            </div>
                          </div>

                          {/* Acceso a internet */}
                          {junta.acceso_internet && (
                            <section className="mb-5 rounded-2xl border border-cyan-500/20 bg-base-200/30 p-5">
                              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <h4 className="text-lg font-bold">
                                    Acceso a Internet
                                  </h4>

                                  <p className="mt-1 text-sm text-base-content/50">
                                    Distribución de respuestas registradas.
                                  </p>
                                </div>

                                <span className="badge badge-info badge-outline">
                                  {internetTotal} respuestas
                                </span>
                              </div>

                              <div className="grid gap-3 md:grid-cols-3">
                                {[
                                  {
                                    label: 'Con acceso',
                                    valor: junta.acceso_internet.si,
                                    clase: 'bg-emerald-500',
                                  },
                                  {
                                    label: 'Sin acceso',
                                    valor: junta.acceso_internet.no,
                                    clase: 'bg-rose-500',
                                  },
                                  {
                                    label: 'Sin respuesta',
                                    valor:
                                      junta.acceso_internet.sin_respuesta,
                                    clase: 'bg-slate-400',
                                  },
                                ].map((item) => {
                                  const porcentajeItem =
                                    porcentaje(
                                      item.valor,
                                      internetTotal,
                                    )

                                  return (
                                    <div
                                      key={item.label}
                                      className="rounded-xl border border-base-300 bg-base-100 p-4"
                                    >
                                      <div className="flex items-end justify-between gap-3">
                                        <div>
                                          <p className="text-sm text-base-content/55">
                                            {item.label}
                                          </p>

                                          <p className="mt-1 text-2xl font-bold">
                                            {item.valor}
                                          </p>
                                        </div>

                                        <span className="text-sm font-semibold text-base-content/55">
                                          {porcentajeItem}%
                                        </span>
                                      </div>

                                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-200">
                                        <div
                                          className={`h-full rounded-full ${item.clase}`}
                                          style={{
                                            width: `${porcentajeItem}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </section>
                          )}

                          {/* Distribuciones */}
                          <div className="grid gap-5 xl:grid-cols-3">
                            {junta.nivel_educacional && (
                              <section className="rounded-2xl border border-indigo-500/20 bg-base-200/30 p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-bold">
                                    Nivel educacional
                                  </h4>

                                  <p className="mt-1 text-xs text-base-content/45">
                                    Distribución de respuestas
                                  </p>
                                </div>

                                {renderDistribucion(
                                  junta.nivel_educacional,
                                  etiquetaNivelEducacional,
                                  'bg-indigo-500',
                                )}
                              </section>
                            )}

                            {junta.situacion_laboral && (
                              <section className="rounded-2xl border border-emerald-500/20 bg-base-200/30 p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-bold">
                                    Situación laboral
                                  </h4>

                                  <p className="mt-1 text-xs text-base-content/45">
                                    Distribución de respuestas
                                  </p>
                                </div>

                                {renderDistribucion(
                                  junta.situacion_laboral,
                                  etiquetaSituacionLaboral,
                                  'bg-emerald-500',
                                )}
                              </section>
                            )}

                            {junta.tipo_vivienda && (
                              <section className="rounded-2xl border border-violet-500/20 bg-base-200/30 p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-bold">
                                    Tipo de vivienda
                                  </h4>

                                  <p className="mt-1 text-xs text-base-content/45">
                                    Distribución de respuestas
                                  </p>
                                </div>

                                {renderDistribucion(
                                  junta.tipo_vivienda,
                                  etiquetaTipoVivienda,
                                  'bg-violet-500',
                                )}
                              </section>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default IndicadoresMunicipalesPage
