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
              className="municipal-distribucion-fila rounded-xl border border-base-300 bg-base-100 p-3"
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
    <main className="municipal-indicadores min-h-screen bg-base-200 px-4 py-8">
        <style>{`
          .municipal-indicadores,
          .municipal-indicadores * { box-sizing: border-box; }

          .municipal-indicadores {
            position: relative;
            isolation: isolate;
            min-height: 100vh;
            min-height: 100dvh;
            padding: 35px 22px 65px;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #f7f1dc;
            background-color: #0b241a !important;
            background-image:
              linear-gradient(130deg, rgba(5, 24, 17, .77), rgba(7, 29, 20, .81)),
              url('/images/photo-1600607687920-4e2a09cf159d.jpg') !important;
            background-size: cover !important;
            background-position: center center !important;
            background-attachment: fixed !important;
          }

          .municipal-indicadores > div { position: relative; }
          .municipal-indicadores h1,
          .municipal-indicadores h2,
          .municipal-indicadores h3,
          .municipal-indicadores h4 {
            color: #fff4d9 !important;
            text-shadow: 0 2px 10px rgba(0, 0, 0, .30);
          }
          .municipal-indicadores h1,
          .municipal-indicadores h2,
          .municipal-indicadores h3 { font-family: Georgia, 'Times New Roman', serif; }
          .municipal-indicadores [class*='text-base-content'] { color: #dce7dc !important; }
          .municipal-indicadores p { line-height: 1.65; }
          .municipal-indicadores strong { color: #ffe1a1; }

          /* Fotografía independiente para el encabezado municipal */
          .municipal-indicadores .municipal-hero {
            border: 1px solid rgba(228, 187, 96, .73) !important;
            border-radius: 25px;
            padding: 32px;
            background-color: rgba(8, 36, 25, .91) !important;
            background-image:
              linear-gradient(108deg, rgba(5, 34, 24, .93), rgba(7, 33, 24, .73)),
              url('/images/photo-1497366754035-f200968a6e72.jpg') !important;
            background-position: center;
            background-size: cover;
            box-shadow: 0 14px 38px rgba(0, 0, 0, .26);
          }
          .municipal-indicadores .municipal-hero h1 {
            font-size: clamp(28px, 3vw, 42px);
            line-height: 1.2;
          }
          .municipal-indicadores .badge {
            background-color: rgba(19, 57, 40, .88) !important;
            color: #f4dc9c !important;
            border: 1px solid rgba(230, 195, 119, .65) !important;
            font-weight: 700;
          }
          .municipal-indicadores .btn,
          .municipal-indicadores button.btn,
          .municipal-indicadores a.btn {
            border: 1px solid #e9ca82 !important;
            border-radius: 12px;
            background: linear-gradient(115deg, #f3dea5, #cda75e) !important;
            color: #102a1e !important;
            font-weight: 800;
            opacity: 1 !important;
            text-shadow: none !important;
            box-shadow: 0 5px 13px rgba(0, 0, 0, .2);
          }
          .municipal-indicadores .btn:hover,
          .municipal-indicadores a.btn:hover {
            background: linear-gradient(115deg, #ffe9b6, #ddb974) !important;
          }
          .municipal-indicadores .btn:disabled {
            opacity: .68 !important;
            cursor: wait;
          }

          /* Paneles generales y estados: sin superficies blancas */
          .municipal-indicadores [class~='bg-base-100'] {
            background-color: rgba(9, 39, 27, .88) !important;
            border-color: rgba(217, 179, 101, .48) !important;
            color: #f5f0df !important;
          }
          .municipal-indicadores [class~='bg-base-200'],
          .municipal-indicadores [class~='bg-base-200/30'],
          .municipal-indicadores [class~='bg-base-200/60'] {
            background-color: rgba(25, 61, 44, .63) !important;
          }
          .municipal-indicadores .border-base-300 {
            border-color: rgba(218, 185, 111, .4) !important;
          }
          .municipal-indicadores section > div > h2,
          .municipal-indicadores section > div > div > h2 { color: #fff1cf !important; }

          /* Cuatro tarjetas de resumen, cuatro fotografías */
          .municipal-indicadores .municipal-stat {
            border: 1px solid rgba(222, 187, 112, .63) !important;
            border-radius: 19px;
            min-height: 126px;
            background-color: rgba(10, 40, 29, .93) !important;
            background-size: cover !important;
            background-position: center !important;
            box-shadow: 0 9px 24px rgba(0, 0, 0, .22);
          }
          .municipal-indicadores .municipal-stat span.text-3xl,
          .municipal-indicadores .municipal-indicador p.text-3xl { color: #ffebbf !important; }
          .municipal-indicadores .municipal-stat-cyan {
            background-image: linear-gradient(rgba(7, 36, 27, .88), rgba(7, 36, 27, .91)),
              url('/images/photo-1600585154340-be6161a56a0c.jpg') !important;
          }
          .municipal-indicadores .municipal-stat-indigo {
            background-image: linear-gradient(rgba(7, 36, 27, .88), rgba(7, 36, 27, .91)),
              url('/images/photo-1497366811353-6870744d04b2.jpg') !important;
          }
          .municipal-indicadores .municipal-stat-emerald {
            background-image: linear-gradient(rgba(7, 36, 27, .88), rgba(7, 36, 27, .91)),
              url('/images/photo-1529156069898-49953e39b3ac.jpg') !important;
          }
          .municipal-indicadores .municipal-stat-amber {
            background-image: linear-gradient(rgba(7, 36, 27, .88), rgba(7, 36, 27, .91)),
              url('/images/photo-1600596542815-ffad4c1539a9.jpg') !important;
          }

          /* Filtros: legibles incluso con fotografías */
          .municipal-indicadores select,
          .municipal-indicadores .select {
            min-height: 42px;
            border: 1px solid #dbc17f !important;
            border-radius: 11px;
            background: #f5f0e3 !important;
            color: #172c21 !important;
            font-size: 14px;
            font-weight: 600;
            color-scheme: light;
          }
          .municipal-indicadores select option {
            background: #f5f0e3;
            color: #172c21;
          }
          .municipal-indicadores select:focus-visible,
          .municipal-indicadores button:focus-visible,
          .municipal-indicadores a:focus-visible {
            outline: 3px solid #e9ca82;
            outline-offset: 3px;
          }

          /* Hallazgos automáticos */
          .municipal-indicadores .municipal-hallazgo {
            border: 1px solid rgba(229, 188, 102, .62) !important;
            background-image: linear-gradient(rgba(8, 37, 27, .90), rgba(8, 37, 27, .92)),
              url('/images/photo-1497366858526-0766cadbe8fa.jpg') !important;
            background-size: cover !important;
            background-position: center !important;
            border-radius: 18px;
          }

          /* Cada Junta tiene una fotografía de cabecera */
          .municipal-indicadores .municipal-junta {
            border: 1px solid rgba(222, 181, 101, .66) !important;
            border-radius: 23px;
            background: rgba(7, 34, 24, .89) !important;
            box-shadow: 0 14px 34px rgba(0, 0, 0, .2);
          }
          .municipal-indicadores .municipal-junta-header {
            border-bottom: 1px solid rgba(228, 192, 116, .49) !important;
            background-image: linear-gradient(115deg, rgba(6, 36, 25, .90), rgba(9, 39, 29, .80)),
              url('/images/photo-1600607687939-ce8a6c25118c.jpg') !important;
            background-size: cover !important;
            background-position: center !important;
          }
          .municipal-indicadores .municipal-junta-header h3 { font-size: 25px; }
          .municipal-indicadores .municipal-indicador {
            border: 1px solid rgba(229, 190, 106, .47) !important;
            border-radius: 15px;
            background-color: rgba(15, 49, 35, .92) !important;
          }
          .municipal-indicadores .municipal-indicador-violet {
            background-image: linear-gradient(rgba(10, 43, 31, .90), rgba(10, 43, 31, .94)),
              url('/images/photo-1497366412874-3415097a27e7.jpg') !important;
            background-size: cover !important;
          }
          .municipal-indicadores .municipal-indicador-emerald {
            background-image: linear-gradient(rgba(10, 43, 31, .90), rgba(10, 43, 31, .94)),
              url('/images/photo-1529156069898-49953e39b3ac.jpg') !important;
            background-size: cover !important;
          }
          .municipal-indicadores .municipal-indicador-amber {
            background-image: linear-gradient(rgba(10, 43, 31, .90), rgba(10, 43, 31, .94)),
              url('/images/photo-1524230572899-a752b3835840.jpg') !important;
            background-size: cover !important;
          }
          .municipal-indicadores .municipal-indicador-cyan {
            background-image: linear-gradient(rgba(10, 43, 31, .90), rgba(10, 43, 31, .94)),
              url('/images/photo-1486406146926-c627a92ad1ab.jpg') !important;
            background-size: cover !important;
          }
          .municipal-indicadores .municipal-indicador [class*='text-'][class*='700'] {
            color: #f4dfac !important;
          }

          /* Distribuciones, agrupaciones y barras de progreso */
          .municipal-indicadores .rounded-xl,
          .municipal-indicadores .rounded-2xl {
            color: #f5f0df;
          }
          .municipal-indicadores .rounded-xl.border,
          .municipal-indicadores .rounded-2xl.border {
            border-color: rgba(224, 188, 110, .46) !important;
          }
          .municipal-indicadores [class~='bg-violet-500/[0.05]'],
          .municipal-indicadores [class~='bg-emerald-500/[0.05]'],
          .municipal-indicadores [class~='bg-cyan-500/[0.05]'],
          .municipal-indicadores [class~='bg-amber-500/[0.05]'],
          .municipal-indicadores [class~='bg-amber-500/[0.06]'] {
            background-color: rgba(22, 62, 44, .78) !important;
          }
          .municipal-indicadores .h-2.overflow-hidden {
            background: rgba(239, 221, 176, .17) !important;
          }
          .municipal-indicadores .h-2 > div { min-height: 8px; }
          .municipal-indicadores .bg-emerald-500 { background-color: #5bc19a !important; }
          .municipal-indicadores .bg-amber-500 { background-color: #e6bd69 !important; }
          .municipal-indicadores .bg-indigo-500 { background-color: #b3a1de !important; }
          .municipal-indicadores .bg-violet-500 { background-color: #b7a6e2 !important; }
          .municipal-indicadores .bg-rose-500 { background-color: #e48c91 !important; }
          .municipal-indicadores .bg-slate-400 { background-color: #b4bec4 !important; }
          .municipal-indicadores .bg-cyan-500 { background-color: #89c6d2 !important; }
          .municipal-indicadores .alert-error {
            border: 1px solid #d99e88;
            border-radius: 15px;
            background: rgba(91, 35, 31, .92) !important;
            color: #ffe5dc !important;
          }
          .municipal-indicadores .alert-error span { color: #ffe5dc !important; }
          .municipal-indicadores .loading { color: #ebd098 !important; }


          /* Identidad cromática consistente: cada métrica conserva su fotografía. */
          .municipal-indicadores .municipal-stat { border-width:1px !important; border-top-width:5px !important; transition:transform .18s ease,box-shadow .18s ease; }
          .municipal-indicadores .municipal-stat:hover { transform:translateY(-2px); box-shadow:0 16px 30px rgba(0,0,0,.3); }
          .municipal-indicadores .municipal-stat-cyan { border-top-color:#8cd5f2 !important; }
          .municipal-indicadores .municipal-stat-indigo { border-top-color:#b7a5f7 !important; }
          .municipal-indicadores .municipal-stat-emerald { border-top-color:#83dca9 !important; }
          .municipal-indicadores .municipal-stat-amber { border-top-color:#f4c777 !important; }
          .municipal-indicadores .municipal-stat-cyan .text-3xl { color:#9bdffd !important; }
          .municipal-indicadores .municipal-stat-indigo .text-3xl { color:#c5b9ff !important; }
          .municipal-indicadores .municipal-stat-emerald .text-3xl { color:#91ebbd !important; }
          .municipal-indicadores .municipal-stat-amber .text-3xl { color:#ffdb91 !important; }
          .municipal-indicadores .municipal-stat-cyan .badge { color:#a5e4ff !important; border-color:#7ccded !important; background:rgba(28,82,110,.46) !important; }
          .municipal-indicadores .municipal-stat-indigo .badge { color:#d1c4ff !important; border-color:#ab98e9 !important; background:rgba(77,59,129,.46) !important; }
          .municipal-indicadores .municipal-stat-emerald .badge { color:#b2f2d2 !important; border-color:#7bdab0 !important; background:rgba(26,105,72,.46) !important; }
          .municipal-indicadores .municipal-stat-amber .badge { color:#ffe3a6 !important; border-color:#e7b65e !important; background:rgba(122,77,24,.48) !important; }
          .municipal-indicadores .municipal-indicador { border-top-width:4px !important; }
          .municipal-indicadores .municipal-indicador-violet { border-top-color:#c5a6fa !important; }
          .municipal-indicadores .municipal-indicador-emerald { border-top-color:#81e6ac !important; }
          .municipal-indicadores .municipal-indicador-amber { border-top-color:#f6c271 !important; }
          .municipal-indicadores .municipal-indicador-cyan { border-top-color:#8ad8ed !important; }
          .municipal-indicadores .municipal-indicador-violet p.text-3xl { color:#d3c1ff !important; }
          .municipal-indicadores .municipal-indicador-emerald p.text-3xl { color:#a5f4cb !important; }
          .municipal-indicadores .municipal-indicador-amber p.text-3xl { color:#ffe09d !important; }
          .municipal-indicadores .municipal-indicador-cyan p.text-3xl { color:#b1edfb !important; }
          .municipal-indicadores .municipal-hallazgo { border-top:4px solid #b7a5f7 !important; }
          .municipal-indicadores .municipal-hallazgo:nth-child(3n+2) { border-top-color:#8dd5e7 !important; }
          .municipal-indicadores .municipal-hallazgo:nth-child(3n) { border-top-color:#f5c97b !important; }
          .municipal-indicadores .municipal-hallazgo .badge { border-color:#b7a5f7 !important; color:#e0d5ff !important; background:rgba(80,58,135,.40) !important; }
          .municipal-indicadores .municipal-hallazgo:nth-child(3n+2) .badge { border-color:#8dd5e7 !important; color:#c9f4ff !important; background:rgba(27,94,116,.4) !important; }
          .municipal-indicadores .municipal-hallazgo:nth-child(3n) .badge { border-color:#f5c97b !important; color:#ffe9ba !important; background:rgba(117,78,27,.4) !important; }
          .municipal-indicadores .municipal-edad { border:1px solid rgba(222,188,112,.36); border-left:4px solid #8cd5f2; border-radius:12px; background:rgba(15,47,40,.76) !important; }
          .municipal-indicadores .municipal-edad:nth-child(2) { border-left-color:#a7a5f5; }
          .municipal-indicadores .municipal-edad:nth-child(3) { border-left-color:#8ddbb7; }
          .municipal-indicadores .municipal-edad:nth-child(4) { border-left-color:#f1c47a; }
          .municipal-indicadores .municipal-edad:nth-child(5) { border-left-color:#ef9aaf; }
          .municipal-indicadores .municipal-edad .text-2xl { color:#f7e6c6 !important; }
          .municipal-indicadores .municipal-internet { border-top:4px solid #81cfeb !important; }
          .municipal-indicadores .municipal-internet-valor { border-left:4px solid #83dbaa !important; }
          .municipal-indicadores .municipal-internet-valor:nth-child(2) { border-left-color:#f2a4a8 !important; }
          .municipal-indicadores .municipal-internet-valor:nth-child(3) { border-left-color:#aebdc7 !important; }
          .municipal-indicadores .municipal-distribucion-educacion { border-top:4px solid #bbaafa !important; }
          .municipal-indicadores .municipal-distribucion-laboral { border-top:4px solid #83dfb0 !important; }
          .municipal-indicadores .municipal-distribucion-vivienda { border-top:4px solid #edb37f !important; }
          .municipal-indicadores .municipal-distribucion-fila { background:rgba(9,42,34,.92) !important; }
          .municipal-indicadores .municipal-distribucion-fila .text-sm.font-bold { color:#fff2d4 !important; }
          .municipal-indicadores .municipal-distribucion-fila .text-xs { color:#dce9dc !important; }
          .municipal-indicadores .municipal-junta-header .badge-success { color:#baf4d3 !important; border-color:#80dba9 !important; background:rgba(18,92,65,.75) !important; }
          .municipal-indicadores .municipal-junta-header .badge-warning { color:#ffe1a1 !important; border-color:#edbf70 !important; background:rgba(109,75,21,.76) !important; }
          .municipal-indicadores .btn-success { color:#112c24 !important; background:linear-gradient(110deg,#aaf0d0,#6ed6ad) !important; border-color:#93e9c2 !important; }
          .municipal-indicadores .btn-success:hover { background:linear-gradient(110deg,#c6ffe4,#8de9c2) !important; }
          .municipal-indicadores :where(button,a,select):focus-visible { outline:3px solid #ffdf97 !important; outline-offset:3px; }

          @media (max-width: 640px) {
            .municipal-indicadores { padding: 18px 12px 38px; background-attachment: scroll !important; }
            .municipal-indicadores .municipal-hero { padding: 23px 18px; }
            .municipal-indicadores .municipal-hero h1 { font-size: 30px; }
            .municipal-indicadores .municipal-junta-header { padding: 20px 15px; }
            .municipal-indicadores .municipal-stat { min-height: 108px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .municipal-indicadores *,
            .municipal-indicadores *::before,
            .municipal-indicadores *::after { transition-duration: .01ms !important; }
          }
        `}</style>
      <div className="mx-auto w-full max-w-7xl">

        {/* Encabezado */}
        <section className="municipal-hero mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
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
                <div className="municipal-stat municipal-stat-cyan rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
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

                <div className="municipal-stat municipal-stat-indigo rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
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

                <div className="municipal-stat municipal-stat-emerald rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
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

                <div className="municipal-stat municipal-stat-amber rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
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
                          className="municipal-hallazgo rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
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
                      className="municipal-junta overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                    >
                      {/* Cabecera Junta */}
                      <header className="municipal-junta-header border-b border-base-300 bg-gradient-to-r from-cyan-500/[0.08] via-base-100 to-indigo-500/[0.06] p-5 sm:p-6">
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
                            <div className="municipal-indicador municipal-indicador-violet rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
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

                            <div className="municipal-indicador municipal-indicador-emerald rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
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

                            <div className="municipal-indicador municipal-indicador-amber rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
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

                            <div className="municipal-indicador municipal-indicador-cyan rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4">
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
                              <div className="municipal-edad rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  0 a 17 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_0_17 ?? 0}
                                </p>
                              </div>

                              <div className="municipal-edad rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  18 a 29 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_18_29 ?? 0}
                                </p>
                              </div>

                              <div className="municipal-edad rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  30 a 44 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_30_44 ?? 0}
                                </p>
                              </div>

                              <div className="municipal-edad rounded-lg bg-base-200/60 p-4">
                                <p className="text-xs font-semibold uppercase text-base-content/55">
                                  45 a 59 años
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                  {junta.personas_45_59 ?? 0}
                                </p>
                              </div>

                              <div className="municipal-edad rounded-lg bg-base-200/60 p-4">
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
                            <section className="municipal-internet mb-5 rounded-2xl border border-cyan-500/20 bg-base-200/30 p-5">
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
                                      className="municipal-internet-valor rounded-xl border border-base-300 bg-base-100 p-4"
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
                              <section className="municipal-distribucion-educacion rounded-2xl border border-indigo-500/20 bg-base-200/30 p-5">
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
                              <section className="municipal-distribucion-laboral rounded-2xl border border-emerald-500/20 bg-base-200/30 p-5">
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
                              <section className="municipal-distribucion-vivienda rounded-2xl border border-violet-500/20 bg-base-200/30 p-5">
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
