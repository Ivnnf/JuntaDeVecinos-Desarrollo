import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Distribucion = Record<string, number>

type SectorDisponible = {
  sector_id: number
  sector_nombre: string
  junta_id: number
  junta_nombre: string
}

type JuntaIndicadores = {
  junta_id: number
  junta_nombre: string
  datos_disponibles: boolean
  total_caracterizados: number
  minimo_requerido: number
  promedio_personas_hogar?: number
  hogares_con_menores?: number
  hogares_con_adultos_mayores?: number

  personas_0_17?: number
  personas_18_29?: number
  personas_30_44?: number
  personas_45_59?: number
  personas_60_mas?: number

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
  sectores: SectorDisponible[]
}

type HallazgoMunicipal = {
  tipo: string
  titulo: string
  descripcion: string
}

type AnalisisMunicipal = {
  total_caracterizaciones: number
  minimo_requerido: number
  datos_suficientes: boolean
  distribucion_etaria: Record<string, number> | null
  rango_etario_predominante: string | null
  rango_etario_predominante_texto: string | null
  hogares_con_internet?: number
  porcentaje_internet?: number | null
  nivel_conectividad?: string | null
  conectividad_por_vivienda?: {
    tipo_vivienda: string
    total: number
    respuestas_internet: number
    con_internet: number
    porcentaje_internet: number | null
  }[]
  conectividad_por_situacion_laboral?: {
    situacion_laboral: string
    total: number
    respuestas_internet: number
    con_internet: number
    porcentaje_internet: number | null
  }[]
  conectividad_por_nivel_educacional?: {
    nivel_educacional: string
    total: number
    respuestas_internet: number
    con_internet: number
    porcentaje_internet: number | null
  }[]
  brecha_conectividad_educacional?: {
    nivel_educacional_mayor: string
    porcentaje_mayor: number
    nivel_educacional_menor: string
    porcentaje_menor: number
    diferencia_puntos: number
  } | null
  brecha_conectividad_laboral?: {
    situacion_laboral_mayor: string
    porcentaje_mayor: number
    situacion_laboral_menor: string
    porcentaje_menor: number
    diferencia_puntos: number
  } | null
  brecha_conectividad_vivienda?: {
    tipo_vivienda_mayor: string
    porcentaje_mayor: number
    tipo_vivienda_menor: string
    porcentaje_menor: number
    diferencia_puntos: number
  } | null
  conectividad_vivienda_homogenea?: boolean
  distribucion_laboral?: Record<string, number>
  situacion_laboral_predominante?: string | null
  empate_laboral?: boolean
  situaciones_laborales_principales?: string[]
  hallazgos?: HallazgoMunicipal[]
}

function IndicadoresMunicipalesPage() {
  const [datos, setDatos] =
    useState<RespuestaIndicadores | null>(null)

  const [cargando, setCargando] =
    useState(true)

  const [analisisMunicipal, setAnalisisMunicipal] =
    useState<AnalisisMunicipal | null>(null)

  const [error, setError] =
    useState('')

  const [exportando, setExportando] =
    useState(false)

  const [filtroJunta, setFiltroJunta] =
    useState('TODAS')

  const [filtroSector, setFiltroSector] =
    useState('TODOS')

  const [filtroRangoEtario, setFiltroRangoEtario] =
    useState('TODOS')

  useEffect(() => {
    setFiltroSector('TODOS')
  }, [filtroJunta])

  useEffect(() => {
    const cargarIndicadores = async () => {
      try {
        setCargando(true)
        setError('')
        const params = new URLSearchParams()

        if (filtroJunta !== 'TODAS') {
          params.set('junta_id', filtroJunta)
        }

        if (filtroSector !== 'TODOS') {
          params.set('sector_id', filtroSector)
        }

        if (filtroRangoEtario !== 'TODOS') {
          params.set('rango_etario', filtroRangoEtario)
        }

        const query = params.toString()

        const url =
          'http://localhost:8000/api/profiles/municipal/caracterizacion/' +
          (query ? `?${query}` : '')

        const response = await fetch(
          url,
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
  }, [
    filtroJunta,
    filtroSector,
    filtroRangoEtario,
  ])

  useEffect(() => {
    const cargarAnalisisMunicipal = async () => {
      try {
        const params = new URLSearchParams()

        if (filtroJunta !== 'TODAS') {
          params.set('junta_id', filtroJunta)
        }

        if (filtroSector !== 'TODOS') {
          params.set('sector_id', filtroSector)
        }

        if (filtroRangoEtario !== 'TODOS') {
          params.set('rango_etario', filtroRangoEtario)
        }

        const query = params.toString()

        const url =
          'http://localhost:8000/api/profiles/municipal/caracterizacion/analisis/' +
          (query ? `?${query}` : '')

        const response = await fetch(url, {
          credentials: 'include',
        })

        if (!response.ok) {
          setAnalisisMunicipal(null)
          return
        }

        const data: AnalisisMunicipal =
          await response.json()

        setAnalisisMunicipal(data)
      } catch {
        setAnalisisMunicipal(null)
      }
    }

    void cargarAnalisisMunicipal()
  }, [
    filtroJunta,
    filtroSector,
    filtroRangoEtario,
  ])
  const exportarCsv = async () => {
    try {
      setExportando(true)
      setError('')

      const params = new URLSearchParams()

      if (filtroJunta !== 'TODAS') {
        params.set('junta_id', filtroJunta)
      }

      if (filtroSector !== 'TODOS') {
        params.set('sector_id', filtroSector)
      }

      if (filtroRangoEtario !== 'TODOS') {
        params.set('rango_etario', filtroRangoEtario)
      }

      const query = params.toString()

      const url =
        'http://localhost:8000/api/profiles/municipal/caracterizacion/exportar/' +
        (query ? `?${query}` : '')

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          'No fue posible exportar el reporte municipal.',
        )
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const enlace = document.createElement('a')
      enlace.href = downloadUrl
      enlace.download = 'reporte_municipal.csv'

      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al exportar el reporte.',
      )
    } finally {
      setExportando(false)
    }
  }
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
                    onChange={(event) => {
                      setFiltroJunta(event.target.value)
                      setFiltroSector('TODOS')
                    }}
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
                <label className="form-control w-full sm:w-72">
                  <div className="label py-1">
                    <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Filtrar por Sector
                    </span>
                  </div>

                  <select
                    className="select select-bordered select-sm w-full"
                    value={filtroSector}
                    onChange={(event) =>
                      setFiltroSector(event.target.value)
                    }
                  >
                    <option value="TODOS">
                      Todos los Sectores
                    </option>

                    {datos.sectores.map((sector) => (
                      <option
                        key={sector.sector_id}
                        value={String(sector.sector_id)}
                      >
                        {sector.sector_nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control w-full sm:w-72">
                  <div className="label py-1">
                    <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Filtrar por Rango Etario
                    </span>
                  </div>

                  <select
                    className="select select-bordered select-sm w-full"
                    value={filtroRangoEtario}
                    onChange={(event) =>
                      setFiltroRangoEtario(event.target.value)
                    }
                  >
                    <option value="TODOS">
                      Todos los Rangos
                    </option>

                    <option value="0_17">
                      Menores de 18 años
                    </option>

                    <option value="18_29">
                      18 a 29 años
                    </option>

                    <option value="30_44">
                      30 a 44 años
                    </option>

                    <option value="45_59">
                      45 a 59 años
                    </option>

                    <option value="60_MAS">
                      60 años o más
                    </option>
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-success btn-sm w-full sm:w-auto"
                  onClick={() => void exportarCsv()}
                  disabled={exportando}
                >
                  {exportando && (
                    <span className="loading loading-spinner loading-xs" />
                  )}

                  {exportando
                    ? 'Exportando...'
                    : 'Exportar CSV'}
                </button>
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
            {/* Análisis territorial */}
            {analisisMunicipal?.datos_suficientes &&
              analisisMunicipal.hallazgos &&
              analisisMunicipal.hallazgos.length > 0 && (
                <section className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">
                      Análisis territorial
                    </h2>

                    <p className="mt-1 text-sm text-base-content/55">
                      Hallazgos detectados automáticamente a partir de
                      las caracterizaciones seleccionadas.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {analisisMunicipal.hallazgos.map(
                      (hallazgo, index) => (
                        <div
                          key={`${hallazgo.tipo}-${index}`}
                          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
                        >
                          <div className="mb-3">
                            <span className="badge badge-outline badge-sm">
                              {hallazgo.tipo.replaceAll('_', ' ')}
                            </span>
                          </div>

                          <h3 className="font-bold">
                            {hallazgo.titulo}
                          </h3>

                          <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                            {hallazgo.descripcion}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              )}

            {/* Juntas */}
            <section></section>
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
                          {/* Distribución etaria */}
                          <div className="mb-6 rounded-xl border border-base-300 bg-base-100 p-5">
                            <div className="mb-4">
                              <h4 className="font-bold">
                                Distribución etaria del hogar
                              </h4>

                              <p className="mt-1 text-sm text-base-content/55">
                                Total de personas registradas por rango de edad
                                en las caracterizaciones seleccionadas.
                              </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                              <div className="rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  0 a 17 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_0_17 ?? 0}
                                </p>
                              </div>

                              <div className="rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  18 a 29 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_18_29 ?? 0}
                                </p>
                              </div>

                              <div className="rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  30 a 44 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_30_44 ?? 0}
                                </p>
                              </div>

                              <div className="rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  45 a 59 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_45_59 ?? 0}
                                </p>
                              </div>

                              <div className="rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  60 años o más
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_60_mas ?? 0}
                                </p>
                              </div>
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
