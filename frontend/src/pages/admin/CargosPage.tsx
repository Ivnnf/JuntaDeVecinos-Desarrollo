import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Cargo = {
    id: number
    nombre: string
    codigo: string | null
    descripcion: string | null
    permite_multiples: boolean
    es_sistema: boolean
    activo: boolean
}


// Estilos fotográficos integrados en este componente: no requiere CargosPage.css.
const estilosCargos = String.raw`
/* APT | Gestión de Cargos
   Estilo aislado de esta página: no afecta a otras rutas ni al backend.
   Los fondos se reutilizan desde frontend/public. */

.apt-cargos {
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

.apt-cargos > section { position: relative; }

.apt-cargos h1,
.apt-cargos h2,
.apt-cargos h3 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.apt-cargos h1 {
  font-size: clamp(2.05rem, 3vw, 3.2rem);
}

.apt-cargos h2 {
  font-size: clamp(1.55rem, 2.5vw, 2.15rem);
}

.apt-cargos .apt-cargos-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .82), rgba(8, 42, 30, .78)),
    url('/cargos.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(210, 179, 92, .43);
  box-shadow: 0 18px 45px rgba(4, 20, 13, .27);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

/* Tarjetas y contenedores de datos existentes */
.apt-cargos .bg-base-100 {
  background-color: rgba(15, 43, 31, .89);
  border-color: rgba(215, 183, 96, .38);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
}

.apt-cargos .apt-cargos-estadisticas > div {
  border-radius: 1.2rem;
  padding: 1.4rem;
  background-color: rgba(16, 43, 32, .91);
  border: 1px solid rgba(215, 183, 96, .4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Fotografía sutil dentro de cada indicador: misma estética de las
   tarjetas del Panel de Administración, conservando el contraste. */
.apt-cargos .apt-cargos-estadisticas > div {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .2s ease, transform .2s ease;
}

.apt-cargos .apt-cargos-estadisticas > div:hover {
  border-color: rgba(235, 205, 123, .75);
  transform: translateY(-2px);
}

.apt-cargos .apt-cargos-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casas.webp');
}

.apt-cargos .apt-cargos-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/directivas.webp');
}

.apt-cargos .apt-cargos-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casitas.webp');
}

.apt-cargos .apt-cargos-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/gestion-directiva.webp');
}

.apt-cargos .apt-cargos-estadisticas .text-3xl {
  color: #f1cf72;
  font-size: 2.2rem;
  font-weight: 800;
}

.apt-cargos .apt-cargos-filtros {
  border-top: 1px solid rgba(224, 196, 117, .38);
  padding-top: 1.4rem;
}

/* Tablas con encabezados oscuros y filas legibles */
.apt-cargos .apt-cargos-tabla {
  border-color: rgba(215, 183, 96, .43);
  background-color: rgba(13, 38, 27, .94);
}

.apt-cargos .table {
  color: #f4f0e3;
  font-size: .87rem;
}

.apt-cargos .table thead {
  background: rgba(6, 28, 18, .97);
  color: #f0d78b;
}

.apt-cargos .table thead th {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .025em;
  padding-block: 1.05rem;
  white-space: nowrap;
}

.apt-cargos .table tbody tr {
  border-bottom-color: rgba(225, 208, 158, .14);
}

.apt-cargos .table tbody tr:hover {
  background-color: rgba(221, 181, 80, .09);
}

.apt-cargos .table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

/* Entradas de formulario: fondo claro para identificar áreas editables */
.apt-cargos :is(.input, .select, .textarea) {
  color: #142e24;
  background-color: #edf2fa;
  border: 1px solid #c0cdc9;
  border-radius: .7rem;
}

.apt-cargos :is(.input, .select, .textarea)::placeholder {
  color: #5c6d6a;
}

.apt-cargos :is(.input, .select, .textarea):focus-visible {
  border-color: #bd9946;
  outline: 2px solid #e3c36b;
  outline-offset: 2px;
}

.apt-cargos select option {
  color: #17352a;
  background: #f1f4f8;
}

.apt-cargos :is(.input, .select, .textarea):disabled {
  opacity: .72;
  cursor: not-allowed;
}

.apt-cargos .label-text,
.apt-cargos .label-text-alt {
  color: #f1e8d1;
}

/* Marca visual APT: acciones positivas doradas, peligros en rojo. */
.apt-cargos .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline) {
  background: linear-gradient(110deg, #eddba3, #cba747);
  border: 1px solid #debf72;
  color: #102b20;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(6, 21, 13, .17);
}

.apt-cargos .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline):hover {
  background: linear-gradient(110deg, #f6e3ae, #ddbc5d);
  color: #0e2a1c;
  filter: brightness(1.03);
}

.apt-cargos .btn.btn-outline {
  background-color: rgba(225, 196, 114, .07);
  border-color: rgba(225, 196, 114, .65);
  color: #f7ebc7;
}

.apt-cargos .btn.btn-outline:hover {
  background-color: rgba(220, 187, 95, .18);
  border-color: #ebd186;
  color: #fff8e4;
}

/* Acciones peligrosas deben conservar su semántica. */
.apt-cargos .btn.btn-error:not(.btn-outline) {
  background: #ab444b;
  border-color: #db8385;
  color: #fff5f3;
}

.apt-cargos .btn.btn-error.btn-outline {
  color: #ffb0aa;
  border-color: rgba(243, 146, 146, .75);
}

.apt-cargos .btn:focus-visible,
.apt-cargos a:focus-visible {
  outline: 2px solid #efd58c;
  outline-offset: 3px;
}

/* Mantener diferencias útiles de estados y alertas. */
.apt-cargos .badge {
  font-weight: 700;
  border-radius: 999px;
}

.apt-cargos .badge-outline,
.apt-cargos .badge-ghost {
  border-color: rgba(223, 195, 110, .55);
  color: #f3dfac;
}

.apt-cargos .alert-error {
  background-color: rgba(113, 37, 43, .93);
  border: 1px solid rgba(247, 150, 151, .72);
  color: #fff0ee;
}

.apt-cargos .alert-success {
  background-color: rgba(21, 83, 58, .93);
  border: 1px solid rgba(128, 215, 174, .55);
  color: #edfff4;
}

.apt-cargos .alert-info,
.apt-cargos .alert-warning {
  background-color: rgba(88, 70, 35, .9);
  border: 1px solid rgba(235, 202, 119, .59);
  color: #fff5d7;
}

/* Diálogos: misma estética, sin perder formularios ni confirmaciones. */
.apt-cargos .modal-box {
  background: linear-gradient(135deg, #18382a, #11291e);
  border: 1px solid rgba(223, 189, 100, .65);
  color: #f5efdd;
  border-radius: 1.3rem;
  box-shadow: 0 28px 80px rgba(0, 10, 5, .55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.apt-cargos .modal-box .bg-base-200\/60 {
  background-color: rgba(7, 30, 19, .65);
  border: 1px solid rgba(225, 199, 124, .22);
}

.apt-cargos .modal-backdrop {
  background-color: rgba(2, 13, 9, .58);
}

@media (max-width: 640px) {
  .apt-cargos {
    background-attachment: scroll;
  }

  .apt-cargos .apt-cargos-encabezado {
    padding: 1.3rem;
  }

  .apt-cargos .table { font-size: .82rem; }
  .apt-cargos .table thead th { padding-inline: .65rem; }
  .apt-cargos .table tbody td { padding-inline: .65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apt-cargos .btn,
  .apt-cargos .table tbody tr { transition: none; }
}


/* Encabezado del formulario: fotografía relacionada con cargos de directiva. */
.apt-cargos .apt-cargos-formulario > div:first-child {
  background-image:
    linear-gradient(115deg, rgba(9, 36, 26, .78), rgba(9, 36, 26, .85)),
    url('/gestion-directiva.webp');
  background-position: center;
  background-size: cover;
}
.apt-cargos .apt-cargos-formulario {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .89), rgba(8, 34, 24, .90)),
    url('/directivas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-color: rgba(215, 183, 96, .45);
}
.apt-cargos .apt-cargos-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .32);
}
.apt-cargos .apt-cargos-formulario :is(.bg-base-200\/50, .bg-base-200\/70) {
  background: rgba(8, 30, 20, .60);
  border-color: rgba(215, 183, 96, .35);
}
.apt-cargos .apt-cargos-formulario .checkbox {
  border-color: #e1c577;
}
.apt-cargos .apt-cargos-formulario .checkbox:checked {
  background: #d7b758;
  border-color: #e1c577;
  color: #113124;
}
.apt-cargos .apt-cargos-encabezado .badge-warning {
  color: #182d20;
  background-color: #e5c775;
  border-color: #e5c775;
}
.apt-cargos .apt-cargos-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .60);
  padding-inline: .6rem;
}
.apt-cargos .apt-cargos-tabla .btn.btn-warning:not(.btn-outline) {
  color: #102b20;
}
.apt-cargos .apt-cargos-filtros {
  border-top: 1px solid rgba(224, 196, 117, .40);
  padding-top: 1.4rem;
}
.apt-cargos .apt-cargos-filtros h2 {
  margin-bottom: .3rem;
}
.apt-cargos .apt-cargos-tabla .table tbody tr.bg-warning\/5 {
  background-color: rgba(217, 178, 66, .13);
}
.apt-cargos .apt-cargos-tabla .table thead th:last-child,
.apt-cargos .apt-cargos-tabla .table tbody td:last-child {
  text-align: right;
}
/* Bloque de registros con fotografía tenue en toda su superficie. */
.apt-cargos .apt-cargos-listado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .86), rgba(8, 34, 24, .89)),
    url('/cargos.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border: 1px solid rgba(215, 183, 96, .44);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 16px 34px rgba(4, 20, 13, .27);
  overflow: hidden;
}

.apt-cargos .apt-cargos-listado .apt-cargos-filtros {
  border-top: 0;
  border-bottom: 1px solid rgba(224, 196, 117, .35);
  padding-top: 0;
  padding-bottom: 1.2rem;
}

.apt-cargos .apt-cargos-listado .apt-cargos-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .94), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}

@media (max-width: 640px) {
  .apt-cargos .apt-cargos-formulario > div:first-child {
    background-position: 60% center;
  }
  .apt-cargos .apt-cargos-listado {
    padding: 1rem;
  }
}

/* Detalles específicos de los cargos: formularios y listados consistentes. */
.apt-cargos .apt-cargos-encabezado .badge-warning {
  color: #172b20;
  background: #e6c775;
  border-color: #e6c775;
}
.apt-cargos .apt-cargos-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .6);
  padding-inline: .6rem;
}
.apt-cargos .apt-cargos-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .35);
}
.apt-cargos .apt-cargos-listado .apt-cargos-tabla {
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .93), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}
.apt-cargos .apt-cargos-listado .apt-cargos-tabla tbody tr.bg-warning\/5 {
  background: rgba(215, 180, 76, .10);
}
.apt-cargos .apt-cargos-listado .apt-cargos-tabla .table { min-width: 720px; }
.apt-cargos .apt-cargos-formulario .form-control { min-width: 0; }
.apt-cargos .apt-cargos-formulario .input,
.apt-cargos .apt-cargos-formulario .select,
.apt-cargos .apt-cargos-formulario .textarea { width: 100%; }


/* Ajustes finales específicos de Gestión de Cargos. */
.apt-cargos .apt-cargos-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .80), rgba(8, 42, 30, .79)),
    url('/cargos.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}
.apt-cargos .apt-cargos-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .78), rgba(8, 34, 24, .85)),
    url('/cargos.webp');
}
.apt-cargos .apt-cargos-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .78), rgba(8, 34, 24, .85)),
    url('/directivas.webp');
}
.apt-cargos .apt-cargos-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .85)),
    url('/casitas.webp');
}
.apt-cargos .apt-cargos-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .79), rgba(8, 34, 24, .86)),
    url('/gestion-directiva.webp');
}
.apt-cargos .apt-cargos-formulario {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .87), rgba(8, 34, 24, .91)),
    url('/directivas.webp');
}
.apt-cargos .apt-cargos-listado {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .85), rgba(8, 34, 24, .89)),
    url('/cargos.webp');
}
.apt-cargos .apt-cargos-listado .apt-cargos-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .93), rgba(7, 31, 20, .95)),
    url('/gestion-directiva.webp');
  background-size: cover;
  background-position: center;
  border-color: rgba(215, 183, 96, .45);
}
.apt-cargos .apt-cargos-listado .table { min-width: 725px; }
.apt-cargos .apt-cargos-formulario .input { width: 100%; }
.apt-cargos .apt-cargos-formulario .bg-base-200\/50 {
  background-color: rgba(7, 30, 19, .68);
  border-color: rgba(215, 183, 96, .34);
}
.apt-cargos .apt-cargos-encabezado .badge-warning {
  color: #172b20;
  background: #e6c775;
  border-color: #e6c775;
}
.apt-cargos .apt-cargos-formulario .text-base-content\/60,
.apt-cargos .apt-cargos-listado .text-base-content\/60,
.apt-cargos .apt-cargos-listado .text-base-content\/70 {
  color: #e0e5d7;
}
`

function CargosPage() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [permiteMultiples, setPermiteMultiples] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [procesandoId, setProcesandoId] = useState<number | null>(null)

    useEffect(() => {
        async function cargarCargos() {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/cargos/',
                    {
                        credentials: 'include',
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'No fue posible cargar los cargos.'
                    )
                }

                setCargos(data)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error al cargar los cargos.'
                )
            } finally {
                setCargando(false)
            }
        }

        cargarCargos()
    }, [])

    async function crearCargo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setGuardando(true)
        setError('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/cargos/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre,
                        descripcion,
                        permite_multiples: permiteMultiples,
                        activo: true,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail || 'No fue posible crear el cargo.'
                )
            }

            setCargos((actuales) => [...actuales, data])
            setNombre('')
            setDescripcion('')
            setPermiteMultiples(false)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al crear el cargo.'
            )
        } finally {
            setGuardando(false)
        }
    }

    async function cambiarEstadoCargo(cargo: Cargo) {
        setError('')
        setProcesandoId(cargo.id)

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/cargos/${cargo.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        activo: !cargo.activo,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail || 'No fue posible actualizar el cargo.'
                )
            }

            setCargos((actuales) =>
                actuales.map((item) =>
                    item.id === cargo.id ? data : item
                )
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al actualizar el cargo.'
            )
        } finally {
            setProcesandoId(null)
        }
    }

    const cargosActivos = cargos.filter((cargo) => cargo.activo).length
    const cargosInactivos = cargos.length - cargosActivos
    const cargosMultiples = cargos.filter(
        (cargo) => cargo.permite_multiples
    ).length

    return (
        <main className="apt-cargos min-h-screen px-4 py-8">
            <style>{estilosCargos}</style>
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="apt-cargos-encabezado mb-6 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold sm:text-5xl">
                                    Gestión de Cargos
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra los cargos disponibles para las
                                directivas y define cuáles permiten múltiples
                                integrantes.
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

                {/* Resumen */}
                {!cargando && (
                    <div className="apt-cargos-estadisticas mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total cargos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargos.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registrados
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargosActivos}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargosInactivos}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Permiten múltiples
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {cargosMultiples}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Múltiples
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Crear cargo */}
                <form
                    onSubmit={crearCargo}
                    className="apt-cargos-formulario mb-7 overflow-hidden rounded-3xl border border-amber-500/30 bg-base-100 shadow-lg"
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        Crear nuevo cargo
                                    </h2>

                                    <span className="badge badge-warning badge-outline">
                                        Nuevo
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    Crea cargos adicionales para complementar los cargos predefinidos de la directiva.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="alert alert-error mb-6">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Nombre
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={nombre}
                                    onChange={(event) =>
                                        setNombre(event.target.value)
                                    }
                                    placeholder="Ej: Encargado de Deportes"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Descripción
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={descripcion}
                                    onChange={(event) =>
                                        setDescripcion(event.target.value)
                                    }
                                    placeholder="Describe brevemente las funciones del cargo"
                                />
                            </label>
                        </div>

                        <div className="mt-5 rounded-xl border border-base-300 bg-base-200/50 p-4">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary mt-0.5"
                                    checked={permiteMultiples}
                                    onChange={(event) =>
                                        setPermiteMultiples(event.target.checked)
                                    }
                                />

                                <div>
                                    <p className="font-semibold">
                                        Permitir múltiples integrantes
                                    </p>

                                    <p className="mt-1 text-sm text-base-content/60">
                                        Activa esta opción si más de una persona
                                        puede ocupar este cargo simultáneamente
                                        dentro de una directiva.
                                    </p>
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
                                    : 'Crear cargo'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando cargos...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="apt-cargos-listado mb-7">
                        {/* Listado */}
                        <div className="apt-cargos-filtros mb-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Cargos registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa el estado y configuración de cada cargo.
                                </p>
                            </div>

                            {cargos.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {cargos.length}{' '}
                                    {cargos.length === 1
                                        ? 'cargo'
                                        : 'cargos'}
                                </span>
                            )}
                        </div>

                        {cargos.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-xl font-bold text-warning">
                                        C
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen cargos registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea el primer cargo utilizando el
                                        formulario superior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="apt-cargos-tabla overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Descripción</th>
                                                <th>Permite múltiples</th>
                                                <th>Estado</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {cargos.map((cargo) => {
                                                const procesando =
                                                    procesandoId === cargo.id

                                                return (
                                                    <tr
                                                        key={cargo.id}
                                                        className="hover"
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-bold text-amber-700">
                                                                    {cargo.nombre
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </div>

                                                                <span className="font-semibold">
                                                                    {cargo.nombre}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="text-sm text-base-content/70">
                                                                {cargo.descripcion ||
                                                                    'Sin descripción'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    cargo.permite_multiples
                                                                        ? 'badge badge-info badge-outline'
                                                                        : 'badge badge-ghost'
                                                                }
                                                            >
                                                                {cargo.permite_multiples
                                                                    ? 'Sí'
                                                                    : 'No'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    cargo.activo
                                                                        ? 'badge badge-success badge-outline'
                                                                        : 'badge badge-ghost'
                                                                }
                                                            >
                                                                {cargo.activo
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex justify-end">
                                                                {cargo.es_sistema ? (
                                                                    <span className="badge badge-primary badge-outline">
                                                                        Predefinido
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            cargo.activo
                                                                                ? 'btn btn-sm btn-error btn-outline'
                                                                                : 'btn btn-sm btn-success btn-outline'
                                                                        }
                                                                        disabled={procesando}
                                                                        onClick={() =>
                                                                            void cambiarEstadoCargo(cargo)
                                                                        }
                                                                    >
                                                                        {procesando && (
                                                                            <span className="loading loading-spinner loading-xs" />
                                                                        )}

                                                                        {procesando
                                                                            ? 'Procesando...'
                                                                            : cargo.activo
                                                                                ? 'Desactivar'
                                                                                : 'Activar'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}

export default CargosPage
