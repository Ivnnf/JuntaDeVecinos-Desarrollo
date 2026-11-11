import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
    id: number
    nombre: string
    comuna: string
    descripcion: string | null
    activa: boolean
    fecha_creacion: string
}

type Directiva = {
    id: number
    junta_vecinos: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    estado: 'VIGENTE' | 'FINALIZADA'
    observacion: string | null
}


// Estilos locales integrados: no se necesita DirectivasPage.css.
const estilosDirectivas = String.raw`
/* APT | Gestión de Directivas
   Estilo aislado de esta página: no afecta a otras rutas ni al backend.
   Los fondos se reutilizan desde frontend/public. */

.apt-directivas {
  --color-base-100: #152e24;
  --color-base-200: #203d30;
  --color-base-300: #697765;
  --color-base-content: #f5efdd;
  --color-primary: #dabb65;
  --color-primary-content: #112a20;
  --color-success: #53c9a0;
  --color-success-content: #0b251a;
  --color-info: #89c3cd;
  --color-info-content: #0e2933;
  --color-warning: #e7c66b;
  --color-warning-content: #302309;
  --color-error: #e8898a;
  --color-error-content: #300b0e;

  min-height: 100vh;
  color: #f5efdd;
  background-color: #10291f;
  background-image:
    linear-gradient(115deg, rgba(5, 28, 20, .75), rgba(5, 28, 20, .54)),
    url('/casitas.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.apt-directivas > section { position: relative; }

.apt-directivas h1,
.apt-directivas h2,
.apt-directivas h3 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.apt-directivas h1 {
  font-size: clamp(2.05rem, 3vw, 3.2rem);
}

.apt-directivas h2 {
  font-size: clamp(1.55rem, 2.5vw, 2.15rem);
}

.apt-directivas .apt-directivas-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .82), rgba(8, 42, 30, .78)),
    url('/junta-v.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(210, 179, 92, .43);
  box-shadow: 0 18px 45px rgba(4, 20, 13, .27);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

/* Tarjetas y contenedores de datos existentes */
.apt-directivas .bg-base-100 {
  background-color: rgba(15, 43, 31, .89);
  border-color: rgba(215, 183, 96, .38);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
}

.apt-directivas .apt-directivas-estadisticas > div {
  border-radius: 1.2rem;
  padding: 1.4rem;
  background-color: rgba(16, 43, 32, .91);
  border: 1px solid rgba(215, 183, 96, .4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Fotografía sutil dentro de cada indicador: misma estética de las
   tarjetas del Panel de Administración, conservando el contraste. */
.apt-directivas .apt-directivas-estadisticas > div {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .2s ease, transform .2s ease;
}

.apt-directivas .apt-directivas-estadisticas > div:hover {
  border-color: rgba(235, 205, 123, .75);
  transform: translateY(-2px);
}

.apt-directivas .apt-directivas-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casas.webp');
}

.apt-directivas .apt-directivas-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/directivas.webp');
}

.apt-directivas .apt-directivas-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casitas.webp');
}

.apt-directivas .apt-directivas-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/muni-santiago.webp');
}

.apt-directivas .apt-directivas-estadisticas .text-3xl {
  color: #f1cf72;
  font-size: 2.2rem;
  font-weight: 800;
}

.apt-directivas .apt-directivas-filtros {
  border-top: 1px solid rgba(224, 196, 117, .38);
  padding-top: 1.4rem;
}

/* Tablas con encabezados oscuros y filas legibles */
.apt-directivas .apt-directivas-tabla {
  border-color: rgba(215, 183, 96, .43);
  background-color: rgba(13, 38, 27, .94);
}

.apt-directivas .table {
  color: #f4f0e3;
  font-size: .87rem;
}

.apt-directivas .table thead {
  background: rgba(6, 28, 18, .97);
  color: #f0d78b;
}

.apt-directivas .table thead th {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .025em;
  padding-block: 1.05rem;
  white-space: nowrap;
}

.apt-directivas .table tbody tr {
  border-bottom-color: rgba(225, 208, 158, .14);
}

.apt-directivas .table tbody tr:hover {
  background-color: rgba(221, 181, 80, .09);
}

.apt-directivas .table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

/* Entradas de formulario: fondo claro para identificar áreas editables */
.apt-directivas :is(.input, .select, .textarea) {
  color: #142e24;
  background-color: #edf2fa;
  border: 1px solid #c0cdc9;
  border-radius: .7rem;
}

.apt-directivas :is(.input, .select, .textarea)::placeholder {
  color: #5c6d6a;
}

.apt-directivas :is(.input, .select, .textarea):focus-visible {
  border-color: #bd9946;
  outline: 2px solid #e3c36b;
  outline-offset: 2px;
}

.apt-directivas select option {
  color: #17352a;
  background: #f1f4f8;
}

.apt-directivas :is(.input, .select, .textarea):disabled {
  opacity: .72;
  cursor: not-allowed;
}

.apt-directivas .label-text,
.apt-directivas .label-text-alt {
  color: #f1e8d1;
}

/* Marca visual APT: acciones positivas doradas, peligros en rojo. */
.apt-directivas .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline) {
  background: linear-gradient(110deg, #eddba3, #cba747);
  border: 1px solid #debf72;
  color: #102b20;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(6, 21, 13, .17);
}

.apt-directivas .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline):hover {
  background: linear-gradient(110deg, #f6e3ae, #ddbc5d);
  color: #0e2a1c;
  filter: brightness(1.03);
}

.apt-directivas .btn.btn-outline {
  background-color: rgba(225, 196, 114, .07);
  border-color: rgba(225, 196, 114, .65);
  color: #f7ebc7;
}

.apt-directivas .btn.btn-outline:hover {
  background-color: rgba(220, 187, 95, .18);
  border-color: #ebd186;
  color: #fff8e4;
}

/* Acciones peligrosas deben conservar su semántica. */
.apt-directivas .btn.btn-error:not(.btn-outline) {
  background: #ab444b;
  border-color: #db8385;
  color: #fff5f3;
}

.apt-directivas .btn.btn-error.btn-outline {
  color: #ffb0aa;
  border-color: rgba(243, 146, 146, .75);
}

.apt-directivas .btn:focus-visible,
.apt-directivas a:focus-visible {
  outline: 2px solid #efd58c;
  outline-offset: 3px;
}

/* Mantener diferencias útiles de estados y alertas. */
.apt-directivas .badge {
  font-weight: 700;
  border-radius: 999px;
}

.apt-directivas .badge-outline,
.apt-directivas .badge-ghost {
  border-color: rgba(223, 195, 110, .55);
  color: #f3dfac;
}

.apt-directivas .alert-error {
  background-color: rgba(113, 37, 43, .93);
  border: 1px solid rgba(247, 150, 151, .72);
  color: #fff0ee;
}

.apt-directivas .alert-success {
  background-color: rgba(21, 83, 58, .93);
  border: 1px solid rgba(128, 215, 174, .55);
  color: #edfff4;
}

.apt-directivas .alert-info,
.apt-directivas .alert-warning {
  background-color: rgba(88, 70, 35, .9);
  border: 1px solid rgba(235, 202, 119, .59);
  color: #fff5d7;
}

/* Diálogos: misma estética, sin perder formularios ni confirmaciones. */
.apt-directivas .modal-box {
  background: linear-gradient(135deg, #18382a, #11291e);
  border: 1px solid rgba(223, 189, 100, .65);
  color: #f5efdd;
  border-radius: 1.3rem;
  box-shadow: 0 28px 80px rgba(0, 10, 5, .55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.apt-directivas .modal-box .bg-base-200\/60 {
  background-color: rgba(7, 30, 19, .65);
  border: 1px solid rgba(225, 199, 124, .22);
}

.apt-directivas .modal-backdrop {
  background-color: rgba(2, 13, 9, .58);
}

@media (max-width: 640px) {
  .apt-directivas {
    background-attachment: scroll;
  }

  .apt-directivas .apt-directivas-encabezado {
    padding: 1.3rem;
  }

  .apt-directivas .table { font-size: .82rem; }
  .apt-directivas .table thead th { padding-inline: .65rem; }
  .apt-directivas .table tbody td { padding-inline: .65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apt-directivas .btn,
  .apt-directivas .table tbody tr { transition: none; }
}


/* Encabezado del formulario: fotografía de barrio bajo una capa verde. */
.apt-directivas .apt-directivas-formulario > div:first-child {
  background-image:
    linear-gradient(115deg, rgba(9, 36, 26, .78), rgba(9, 36, 26, .85)),
    url('/junta-v.jpg');
  background-position: center;
  background-size: cover;
}
.apt-directivas .apt-directivas-formulario {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .92), rgba(8, 34, 24, .89)),
    url('/casitas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-color: rgba(215, 183, 96, .45);
}
.apt-directivas .apt-directivas-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .32);
}
.apt-directivas .apt-directivas-formulario :is(.bg-base-200\/50, .bg-base-200\/70) {
  background: rgba(8, 30, 20, .60);
  border-color: rgba(215, 183, 96, .35);
}
.apt-directivas .apt-directivas-formulario .checkbox {
  border-color: #e1c577;
}
.apt-directivas .apt-directivas-formulario .checkbox:checked {
  background: #d7b758;
  border-color: #e1c577;
  color: #113124;
}
.apt-directivas .apt-directivas-encabezado .badge-warning {
  color: #182d20;
  background-color: #e5c775;
  border-color: #e5c775;
}
.apt-directivas .apt-directivas-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .60);
  padding-inline: .6rem;
}
.apt-directivas .apt-directivas-tabla .btn.btn-warning:not(.btn-outline) {
  color: #102b20;
}
.apt-directivas .apt-directivas-filtros {
  border-top: 1px solid rgba(224, 196, 117, .40);
  padding-top: 1.4rem;
}
.apt-directivas .apt-directivas-filtros h2 {
  margin-bottom: .3rem;
}
.apt-directivas .apt-directivas-tabla .table tbody tr.bg-warning\/5 {
  background-color: rgba(217, 178, 66, .13);
}
.apt-directivas .apt-directivas-tabla .table thead th:last-child,
.apt-directivas .apt-directivas-tabla .table tbody td:last-child {
  text-align: right;
}
/* Bloque de registros con fotografía tenue en toda su superficie. */
.apt-directivas .apt-directivas-listado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .86), rgba(8, 34, 24, .89)),
    url('/junta-v.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border: 1px solid rgba(215, 183, 96, .44);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 16px 34px rgba(4, 20, 13, .27);
  overflow: hidden;
}

.apt-directivas .apt-directivas-listado .apt-directivas-filtros {
  border-top: 0;
  border-bottom: 1px solid rgba(224, 196, 117, .35);
  padding-top: 0;
  padding-bottom: 1.2rem;
}

.apt-directivas .apt-directivas-listado .apt-directivas-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .94), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}

@media (max-width: 640px) {
  .apt-directivas .apt-directivas-formulario > div:first-child {
    background-position: 60% center;
  }
  .apt-directivas .apt-directivas-listado {
    padding: 1rem;
  }
}

/* Detalles específicos de las directivas: formularios y listados consistentes. */
.apt-directivas .apt-directivas-encabezado .badge-warning {
  color: #172b20;
  background: #e6c775;
  border-color: #e6c775;
}
.apt-directivas .apt-directivas-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .6);
  padding-inline: .6rem;
}
.apt-directivas .apt-directivas-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .35);
}
.apt-directivas .apt-directivas-listado .apt-directivas-tabla {
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .93), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}
.apt-directivas .apt-directivas-listado .apt-directivas-tabla tbody tr.bg-warning\/5 {
  background: rgba(215, 180, 76, .10);
}
.apt-directivas .apt-directivas-listado .apt-directivas-tabla .table { min-width: 720px; }
.apt-directivas .apt-directivas-formulario .form-control { min-width: 0; }
.apt-directivas .apt-directivas-formulario .input,
.apt-directivas .apt-directivas-formulario .select,
.apt-directivas .apt-directivas-formulario .textarea { width: 100%; }


/* Identidad fotográfica de Gestión de Directivas */
.apt-directivas .apt-directivas-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(112deg, rgba(6, 32, 23, .80), rgba(8, 42, 30, .77)),
    url('/directivas-inicio.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}
.apt-directivas .apt-directivas-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(112deg, rgba(7, 34, 24, .78), rgba(7, 34, 24, .86)),
    url('/panel-directiva.webp');
}
.apt-directivas .apt-directivas-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(112deg, rgba(7, 34, 24, .79), rgba(7, 34, 24, .86)),
    url('/directivas.webp');
}
.apt-directivas .apt-directivas-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(112deg, rgba(7, 34, 24, .79), rgba(7, 34, 24, .87)),
    url('/casitas.webp');
}
.apt-directivas .apt-directivas-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(112deg, rgba(7, 34, 24, .79), rgba(7, 34, 24, .87)),
    url('/junta-v.jpg');
}

/* Toda la superficie del formulario mantiene fotografía, con inputs claros. */
.apt-directivas .apt-directivas-formulario {
  background-color: #102b20;
  background-image:
    linear-gradient(112deg, rgba(8, 34, 24, .89), rgba(8, 34, 24, .90)),
    url('/panel-directiva.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.apt-directivas .apt-directivas-formulario > div:first-child {
  background-image:
    linear-gradient(112deg, rgba(8, 34, 24, .78), rgba(8, 34, 24, .84)),
    url('/gestion-directiva.webp');
  background-size: cover;
  background-position: center;
}
.apt-directivas .apt-directivas-formulario .bg-base-200\/50 {
  background-color: rgba(7, 30, 19, .67);
  border-color: rgba(215, 183, 96, .30);
}

/* El listado y su tabla también incorporan fotografía discreta. */
.apt-directivas .apt-directivas-listado {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .85), rgba(8, 34, 24, .89)),
    url('/directivas.webp');
}
.apt-directivas .apt-directivas-listado .apt-directivas-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .94), rgba(7, 31, 20, .94)),
    url('/panel-directiva.webp');
  background-size: cover;
  background-position: center;
  border-color: rgba(215, 183, 96, .4);
}
.apt-directivas .apt-directivas-listado .table {
  min-width: 760px;
}
.apt-directivas .apt-directivas-formulario :is(.input, .select, .textarea) {
  width: 100%;
}
.apt-directivas .apt-directivas-formulario .text-base-content\/45,
.apt-directivas .apt-directivas-formulario .text-base-content\/60 {
  color: #e4e7da;
}
.apt-directivas .apt-directivas-listado .text-base-content\/60,
.apt-directivas .apt-directivas-listado .text-base-content\/50,
.apt-directivas .apt-directivas-listado .text-base-content\/45 {
  color: #d4ddcf;
}
`

function DirectivasPage() {
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
    const [directivas, setDirectivas] = useState<Directiva[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [observacion, setObservacion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [directivaAFinalizar, setDirectivaAFinalizar] =
        useState<Directiva | null>(null)

    const [finalizando, setFinalizando] = useState(false)

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [responseJuntas, responseDirectivas] =
                    await Promise.all([
                        fetch(
                            'http://localhost:8000/api/organizacion/juntas/',
                            {
                                credentials: 'include',
                            }
                        ),
                        fetch(
                            'http://localhost:8000/api/organizacion/directivas/',
                            {
                                credentials: 'include',
                            }
                        ),
                    ])

                if (!responseJuntas.ok) {
                    throw new Error(
                        'No fue posible cargar las juntas de vecinos.'
                    )
                }

                if (!responseDirectivas.ok) {
                    throw new Error(
                        'No fue posible cargar las directivas.'
                    )
                }

                const juntasData = await responseJuntas.json()
                const directivasData = await responseDirectivas.json()

                setJuntas(juntasData)
                setDirectivas(directivasData)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error al cargar la información.'
                )
            } finally {
                setCargando(false)
            }
        }

        cargarDatos()
    }, [])

    async function crearDirectiva(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/directivas/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        junta_vecinos: Number(juntaSeleccionada),
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin || null,
                        estado: 'VIGENTE',
                        observacion: observacion || null,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.estado?.[0] ||
                    data.detail ||
                    'No fue posible crear la directiva.'
                )
            }

            setDirectivas((actuales) => [
                data,
                ...actuales,
            ])

            setJuntaSeleccionada('')
            setFechaInicio('')
            setFechaFin('')
            setObservacion('')

            setMensaje(
                'Directiva creada correctamente.'
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al crear la directiva.'
            )
        } finally {
            setGuardando(false)
        }
    }

    async function finalizarDirectiva(directiva: Directiva) {
        setFinalizando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/directivas/${directiva.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado: 'FINALIZADA',
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible finalizar la directiva.'
                )
            }

            setDirectivas((actuales) =>
                actuales.map((item) =>
                    item.id === directiva.id
                        ? data
                        : item
                )
            )

            setMensaje(
                'Directiva finalizada correctamente.'
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al finalizar la directiva.'
            )
        } finally {
            setFinalizando(false)
            setDirectivaAFinalizar(null)
        }
    }

    const directivasVigentes =
        directivas.filter(
            (directiva) => directiva.estado === 'VIGENTE'
        ).length

    const directivasFinalizadas =
        directivas.filter(
            (directiva) => directiva.estado === 'FINALIZADA'
        ).length

    const juntasActivas =
        juntas.filter(
            (junta) => junta.activa
        ).length

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) {
            return 'Sin fecha'
        }

        return new Date(`${fecha}T00:00:00`).toLocaleDateString(
            'es-CL',
            {
                dateStyle: 'medium',
            }
        )
    }

    return (
        <main className="apt-directivas min-h-screen px-4 py-8">
            <style>{estilosDirectivas}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="apt-directivas-encabezado mb-6 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold sm:text-5xl">
                                    Gestión de Directivas
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra las directivas asociadas a las
                                Juntas de Vecinos, sus períodos de vigencia y
                                sus integrantes.
                            </p>
                        </div>

                        <Link
                            to="/admin"
                            className="btn btn-outline"
                        >
                            ← Volver al Panel
                        </Link>
                    </div>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Resumen */}
                {!cargando && (
                    <div className="apt-directivas-estadisticas mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total directivas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivas.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registradas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Vigentes
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivasVigentes}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Vigentes
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Finalizadas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {directivasFinalizadas}
                                </span>

                                <span className="badge badge-ghost">
                                    Históricas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Juntas activas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Disponibles
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nueva directiva */}
                <form
                    onSubmit={crearDirectiva}
                    className="apt-directivas-formulario mb-6 overflow-hidden rounded-3xl border border-rose-500/30 bg-base-100 shadow-lg"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Nueva Directiva
                                    </h2>

                                    <span className="badge badge-error badge-outline">
                                        Nuevo período
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Registra una nueva directiva asociada a una
                                    Junta de Vecinos activa.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-5 md:grid-cols-2">

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Junta de Vecinos
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered w-full"
                                    value={juntaSeleccionada}
                                    onChange={(event) =>
                                        setJuntaSeleccionada(
                                            event.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Seleccione una junta
                                    </option>

                                    {juntas
                                        .filter((junta) => junta.activa)
                                        .map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={junta.id}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Fecha de inicio
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={fechaInicio}
                                    onChange={(event) =>
                                        setFechaInicio(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Fecha de término
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={fechaFin}
                                    onChange={(event) =>
                                        setFechaFin(event.target.value)
                                    }
                                />
                            </label>

                            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                    Estado inicial
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="badge badge-success badge-outline">
                                        Vigente
                                    </span>

                                    <span className="text-sm text-base-content/60">
                                        La nueva directiva se crea activa.
                                    </span>
                                </div>
                            </div>

                            <label className="form-control md:col-span-2">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Observación
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-28 w-full resize-y"
                                    value={observacion}
                                    onChange={(event) =>
                                        setObservacion(event.target.value)
                                    }
                                    placeholder="Agrega una observación relacionada con esta directiva..."
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {observacion.length} caracteres
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={guardando}
                            >
                                {guardando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {guardando
                                    ? 'Guardando...'
                                    : 'Crear Directiva'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando directivas...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="apt-directivas-listado mb-6">
                        <div className="apt-directivas-filtros mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Directivas registradas
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa su vigencia y administra sus integrantes.
                                </p>
                            </div>

                            {directivas.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {directivas.length}{' '}
                                    {directivas.length === 1
                                        ? 'directiva'
                                        : 'directivas'}
                                </span>
                            )}
                        </div>

                        {directivas.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-xl font-bold text-rose-700">
                                        D
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen directivas registradas
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea la primera directiva utilizando
                                        el formulario superior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="apt-directivas-tabla overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Junta</th>
                                                <th>Fecha inicio</th>
                                                <th>Fecha término</th>
                                                <th>Estado</th>
                                                <th>Observación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {directivas.map((directiva) => (
                                                <tr
                                                    key={directiva.id}
                                                    className="hover"
                                                >
                                                    <td>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {directiva.junta_nombre}
                                                            </p>

                                                            <p className="mt-1 text-xs text-base-content/45">
                                                                Directiva #{directiva.id}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap">
                                                        {formatearFecha(
                                                            directiva.fecha_inicio
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap">
                                                        {formatearFecha(
                                                            directiva.fecha_fin
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                directiva.estado === 'VIGENTE'
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-ghost'
                                                            }
                                                        >
                                                            {directiva.estado === 'VIGENTE'
                                                                ? 'Vigente'
                                                                : 'Finalizada'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="block max-w-xs truncate text-sm text-base-content/60">
                                                            {directiva.observacion ||
                                                                'Sin observación'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {directiva.estado === 'VIGENTE' ? (
                                                            <div className="flex min-w-[260px] flex-wrap justify-end gap-2">
                                                                <Link
                                                                    to={`/directiva/gestion?directivaId=${directiva.id}`}
                                                                    className="btn btn-sm btn-primary"
                                                                >
                                                                    Gestionar integrantes
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-error btn-outline"
                                                                    onClick={() =>
                                                                        setDirectivaAFinalizar(
                                                                            directiva
                                                                        )
                                                                    }
                                                                >
                                                                    Finalizar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end">
                                                                <span className="text-sm text-base-content/50">
                                                                    Sin acciones
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                )}

                {/* Modal finalizar */}
                {directivaAFinalizar && (
                    <div className="modal modal-open">
                        <div className="modal-box rounded-2xl">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 font-bold text-error">
                                    !
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold">
                                        Finalizar Directiva
                                    </h3>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        Esta acción cambiará el estado de la
                                        directiva a finalizada.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl bg-base-200/60 p-4">
                                <p>
                                    ¿Deseas finalizar la directiva vigente de{' '}
                                    <strong>
                                        {directivaAFinalizar.junta_nombre}
                                    </strong>
                                    ?
                                </p>
                            </div>

                            <div className="alert alert-warning mt-4">
                                <span>
                                    Al finalizar la directiva, sus integrantes
                                    activos dejarán de tener cargos vigentes
                                    asociados a ella.
                                </span>
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={finalizando}
                                    onClick={() =>
                                        setDirectivaAFinalizar(null)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-error"
                                    disabled={finalizando}
                                    onClick={() =>
                                        void finalizarDirectiva(
                                            directivaAFinalizar
                                        )
                                    }
                                >
                                    {finalizando && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {finalizando
                                        ? 'Finalizando...'
                                        : 'Finalizar Directiva'}
                                </button>
                            </div>
                        </div>

                        <div
                            className="modal-backdrop"
                            onClick={() => {
                                if (!finalizando) {
                                    setDirectivaAFinalizar(null)
                                }
                            }}
                        />
                    </div>
                )}
            </section>
        </main>
    )
}

export default DirectivasPage
