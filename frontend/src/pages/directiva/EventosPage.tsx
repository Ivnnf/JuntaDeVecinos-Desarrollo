import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Evento = {
    id: number
    directiva: number
    junta_nombre: string
    creador: number
    creador_username: string
    titulo: string
    descripcion: string
    lugar: string
    fecha_inicio: string
    fecha_fin: string | null
    cupo_maximo: number | null
    estado: 'PROGRAMADO' | 'CANCELADO' | 'FINALIZADO'
    fecha_creacion: string
    fecha_actualizacion: string
}

type IntegranteDirectiva = {
    id: number
    directiva: number
    activo: boolean
}

type TipoMensaje = 'success' | 'error' | ''

function EventosPage() {
    const [eventos, setEventos] =
        useState<Evento[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [titulo, setTitulo] =
        useState('')

    const [descripcion, setDescripcion] =
        useState('')

    const [lugar, setLugar] =
        useState('')

    const [fechaInicio, setFechaInicio] =
        useState('')

    const [fechaFin, setFechaFin] =
        useState('')

    const [cupoMaximo, setCupoMaximo] =
        useState('')

    const [directivaId, setDirectivaId] =
        useState<number | null>(null)

    const [creando, setCreando] =
        useState(false)

    const [cancelando, setCancelando] =
        useState(false)

    const [mensaje, setMensaje] =
        useState('')

    const [tipoMensaje, setTipoMensaje] =
        useState<TipoMensaje>('')

    const [eventoACancelar, setEventoACancelar] =
        useState<Evento | null>(null)

    const [eventoAEditar, setEventoAEditar] =
        useState<Evento | null>(null)

    useEffect(() => {
        const cargarEventos = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/eventos/eventos/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los eventos.'
                    )
                }

                const data =
                    (await response.json()) as Evento[]

                setEventos(data)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.'
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarEventos()
    }, [])

    useEffect(() => {
        const cargarDirectivaActiva = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/integrantes-directiva/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible obtener la directiva activa.'
                    )
                }

                const data =
                    (await response.json()) as IntegranteDirectiva[]

                const integranteActivo = data.find(
                    (integrante) => integrante.activo
                )

                if (integranteActivo) {
                    setDirectivaId(
                        integranteActivo.directiva
                    )
                }
            } catch (error) {
                console.error(
                    'Error al obtener la directiva activa:',
                    error
                )
            }
        }

        void cargarDirectivaActiva()
    }, [])

    const limpiarFormulario = () => {
        setTitulo('')
        setDescripcion('')
        setLugar('')
        setFechaInicio('')
        setFechaFin('')
        setCupoMaximo('')
        setEventoAEditar(null)
    }

    const crearEvento = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!directivaId) {
            setMensaje(
                'No se encontró una directiva activa para este usuario.'
            )
            setTipoMensaje('error')
            return
        }

        try {
            setCreando(true)
            setMensaje('')
            setTipoMensaje('')

            const url = eventoAEditar
                ? `http://localhost:8000/api/eventos/eventos/${eventoAEditar.id}/`
                : 'http://localhost:8000/api/eventos/eventos/'

            const method = eventoAEditar
                ? 'PATCH'
                : 'POST'

            const response = await fetch(
                url,
                {
                    method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        directiva: directivaId,
                        titulo,
                        descripcion,
                        lugar,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin || null,
                        cupo_maximo:
                            cupoMaximo !== ''
                                ? Number(cupoMaximo)
                                : null,
                        estado: 'PROGRAMADO',
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible guardar el evento.'
                )
            }

            const eventoGuardado =
                data as Evento

            if (eventoAEditar) {
                setEventos((actuales) =>
                    actuales.map((evento) =>
                        evento.id === eventoGuardado.id
                            ? eventoGuardado
                            : evento
                    )
                )

                setMensaje(
                    'Evento actualizado correctamente.'
                )
            } else {
                setEventos((actuales) => [
                    ...actuales,
                    eventoGuardado,
                ])

                setMensaje(
                    'Evento creado correctamente.'
                )
            }

            setTipoMensaje('success')
            limpiarFormulario()
        } catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )

            setTipoMensaje('error')
        } finally {
            setCreando(false)
        }
    }

    const cancelarEvento = async (
        eventoId: number
    ) => {
        try {
            setCancelando(true)
            setMensaje('')
            setTipoMensaje('')

            const response = await fetch(
                `http://localhost:8000/api/eventos/eventos/${eventoId}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        estado: 'CANCELADO',
                    }),
                }
            )

            if (!response.ok) {
                throw new Error(
                    'No fue posible cancelar el evento.'
                )
            }

            const eventoActualizado =
                (await response.json()) as Evento

            setEventos((actuales) =>
                actuales.map((evento) =>
                    evento.id === eventoActualizado.id
                        ? eventoActualizado
                        : evento
                )
            )

            setMensaje(
                'Evento cancelado correctamente.'
            )

            setTipoMensaje('success')
            setEventoACancelar(null)
        } catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )

            setTipoMensaje('error')
        } finally {
            setCancelando(false)
        }
    }

    const prepararEdicion = (
        evento: Evento
    ) => {
        setEventoAEditar(evento)

        setTitulo(evento.titulo)
        setDescripcion(evento.descripcion)
        setLugar(evento.lugar)

        setFechaInicio(
            evento.fecha_inicio.slice(0, 16)
        )

        setFechaFin(
            evento.fecha_fin
                ? evento.fecha_fin.slice(0, 16)
                : ''
        )

        setCupoMaximo(
            evento.cupo_maximo !== null
                ? String(evento.cupo_maximo)
                : ''
        )

        setMensaje('')
        setTipoMensaje('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const cancelarEdicion = () => {
        limpiarFormulario()
        setMensaje('')
        setTipoMensaje('')
    }

    const formatearFecha = (
        fecha: string
    ) => {
        return new Date(fecha).toLocaleString(
            'es-CL',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            }
        )
    }

    const obtenerClaseEstado = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'badge badge-info badge-outline'
            case 'CANCELADO':
                return 'badge badge-error badge-outline'
            case 'FINALIZADO':
                return 'badge badge-success badge-outline'
            default:
                return 'badge badge-ghost'
        }
    }

    const obtenerTextoEstado = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'Programado'
            case 'CANCELADO':
                return 'Cancelado'
            case 'FINALIZADO':
                return 'Finalizado'
            default:
                return estado
        }
    }

    const obtenerBordeEvento = (
        estado: Evento['estado']
    ) => {
        switch (estado) {
            case 'PROGRAMADO':
                return 'border-blue-500/30'
            case 'CANCELADO':
                return 'border-red-500/30'
            case 'FINALIZADO':
                return 'border-emerald-500/30'
            default:
                return 'border-base-300'
        }
    }

    const totalProgramados =
        eventos.filter(
            (evento) =>
                evento.estado === 'PROGRAMADO'
        ).length

    const totalFinalizados =
        eventos.filter(
            (evento) =>
                evento.estado === 'FINALIZADO'
        ).length

    const totalCancelados =
        eventos.filter(
            (evento) =>
                evento.estado === 'CANCELADO'
        ).length

    return (
        <main
            className="eventos-bosque min-h-screen px-4 py-8 sm:px-6"
            style={{
                backgroundImage: 'linear-gradient(135deg, rgba(5, 25, 20, .84), rgba(8, 34, 25, .71)), url("/images/photo-1519331379826-f10be5486c6f.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: '#f6f0db',
            }}
        >
            <style>{`
                .eventos-bosque { font-family: Arial, Helvetica, sans-serif; }
                .eventos-bosque h1, .eventos-bosque h2, .eventos-bosque h3 { font-family: Georgia, 'Times New Roman', serif; color: #fff4d5; }
                .eventos-bosque .bg-base-100 { background-color: rgba(9, 32, 26, .90); }
                .eventos-bosque .bg-base-200 { background-color: rgba(5, 25, 20, .60); }
                .eventos-bosque [class*="text-base-content/"] { color: #d8dfd0; }
                .eventos-bosque [class*="border-base-300"] { border-color: rgba(215, 181, 100, .35); }
                .eventos-bosque .btn { min-height: 2.65rem; border-radius: .85rem; font-weight: 700; }
                .eventos-bosque .btn-primary, .eventos-bosque .btn-warning { background: linear-gradient(115deg,#f5df9b,#cba64e); color: #142b1f; border-color: #cda952; }
                .eventos-bosque .btn-primary:hover, .eventos-bosque .btn-warning:hover { background: #f3da90; color: #10251a; }
                .eventos-bosque .btn-outline { border-color: #d8ba72; color: #f5dfab; background: rgba(5,25,20,.34); }
                .eventos-bosque .btn-outline:hover { background: rgba(211,178,98,.19); color: #fff2c7; }
                .eventos-bosque input, .eventos-bosque textarea, .eventos-bosque select { background: rgba(252, 249, 235, .97); border: 1px solid #c6a75c; border-radius: .75rem; color: #19382b; color-scheme: light; }
                .eventos-bosque input::placeholder, .eventos-bosque textarea::placeholder { color: #617365; }
                .eventos-bosque input:focus, .eventos-bosque textarea:focus { outline: 2px solid #d8bb76; outline-offset: 1px; }
                .eventos-bosque .badge { border-radius: 999px; font-weight: 700; }
                .eventos-bosque .badge-outline { border-color: #ddbe70; color: #f5dca2; }
                .eventos-bosque .badge-error { border-color: #f8a5a0; color: #ffd8d5; }
                .eventos-bosque .badge-success { border-color: #80d9ab; color: #d0ffe8; }
                .eventos-bosque .badge-info { border-color: #a5d4e3; color: #d9f6ff; }
                .eventos-bosque .alert-success { background: rgba(18,78,54,.92); color: #e1ffeb; border: 1px solid #85bf92; }
                .eventos-bosque .alert-error { background: rgba(103,37,37,.95); color: #fff0e8; border: 1px solid #eba5a0; }
                .eventos-bosque .alert-warning { background: rgba(98,71,30,.82); color: #fff2d5; border: 1px solid #dfbd78; }
                .eventos-bosque .modal { z-index: 100; }
                .eventos-bosque .modal-box { color: #f7efd8; background: linear-gradient(150deg, #173c31, #092219); border: 1px solid #cfaf65; box-shadow: 0 20px 65px rgba(0,0,0,.62); }
                .eventos-bosque .modal-backdrop { background: rgba(0,0,0,.66); }
                .eventos-bosque .panel-foto { border: 1px solid rgba(213,179,103,.58); box-shadow: 0 16px 35px rgba(0,0,0,.24); background-position: center; background-size: cover; }

                /* Jerarquía visual de estados: cada color mantiene su significado. */
                .eventos-bosque { --ev-blue:#8bcaf2; --ev-green:#8cddb0; --ev-red:#f3a0a7; --ev-amber:#f2ca7e; --ev-violet:#c5aff7; }
                .eventos-bosque .ev-kpi { position:relative; overflow:hidden; border-width:1px; border-style:solid; border-radius:1.15rem; transition:transform .18s ease, box-shadow .18s ease; }
                .eventos-bosque .ev-kpi::after { content:''; position:absolute; left:0; right:0; top:0; height:4px; background:var(--ev-accent); }
                .eventos-bosque .ev-kpi:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(0,0,0,.32); }
                .eventos-bosque .ev-kpi .text-3xl { color:var(--ev-accent); font-size:2.1rem; font-weight:850; font-variant-numeric:tabular-nums; }
                .eventos-bosque .ev-kpi .badge { background:var(--ev-tint); border:1px solid var(--ev-accent); color:var(--ev-accent); }
                .eventos-bosque .ev-kpi-total { --ev-accent:var(--ev-violet); --ev-tint:rgba(197,175,247,.13); border-color:rgba(197,175,247,.60); }
                .eventos-bosque .ev-kpi-programados { --ev-accent:var(--ev-blue); --ev-tint:rgba(139,202,242,.13); border-color:rgba(139,202,242,.60); }
                .eventos-bosque .ev-kpi-finalizados { --ev-accent:var(--ev-green); --ev-tint:rgba(140,221,176,.13); border-color:rgba(140,221,176,.60); }
                .eventos-bosque .ev-kpi-cancelados { --ev-accent:var(--ev-red); --ev-tint:rgba(243,160,167,.13); border-color:rgba(243,160,167,.60); }
                .eventos-bosque .ev-evento { --ev-accent:var(--ev-blue); position:relative; overflow:hidden; border-color:var(--ev-accent)!important; border-width:1px; }
                .eventos-bosque .ev-evento::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--ev-accent); pointer-events:none; }
                .eventos-bosque .ev-evento[data-estado='PROGRAMADO'] { --ev-accent:var(--ev-blue); }
                .eventos-bosque .ev-evento[data-estado='FINALIZADO'] { --ev-accent:var(--ev-green); }
                .eventos-bosque .ev-evento[data-estado='CANCELADO'] { --ev-accent:var(--ev-red); }
                .eventos-bosque .ev-evento h3 { color:var(--ev-accent); }
                .eventos-bosque .ev-evento .badge-info { color:var(--ev-blue); background:rgba(19,75,103,.80); border:1px solid var(--ev-blue); }
                .eventos-bosque .ev-evento .badge-success { color:var(--ev-green); background:rgba(16,73,45,.80); border:1px solid var(--ev-green); }
                .eventos-bosque .ev-evento .badge-error { color:var(--ev-red); background:rgba(103,35,45,.80); border:1px solid var(--ev-red); }
                .eventos-bosque .ev-evento .btn-primary { background:linear-gradient(115deg,#c7e9fa,#82c4e8); border-color:var(--ev-blue); color:#102b3a; }
                .eventos-bosque .ev-evento .btn-primary:hover { background:#def3ff; }
                .eventos-bosque .ev-evento .btn-error { color:#ffd9dd; border-color:var(--ev-red); background:rgba(111,36,48,.40); }
                .eventos-bosque .ev-evento .btn-error:hover { color:#fff; background:#a53c50; }
                .eventos-bosque .ev-evento .btn-outline:not(.btn-error):hover { background:rgba(198,169,104,.24); }
                .eventos-bosque .ev-evento .bg-base-200\/60 { border:1px solid rgba(207,188,142,.16); border-radius:.8rem; }
                .eventos-bosque .ev-evento .bg-base-200\/60 p:last-child { color:#fff8e8; }
                .eventos-bosque .badge-warning { background:rgba(140,96,26,.36); border-color:var(--ev-amber); color:#ffdfa0; }
                .eventos-bosque .modal-box .btn-error { background:#aa3f50; border-color:var(--ev-red); color:white; }
                .eventos-bosque .modal-box .btn-error:hover { background:#bc5361; }
                .eventos-bosque .modal-box .text-base-content { color:#fff4df; }
                .eventos-bosque .form-control .label-text { color:#f5edd8; }
                .eventos-bosque .form-control .label-text-alt { color:#dccda9; }
                .eventos-bosque .form-control .label-text-alt.text-error { color:#ffc0ba; }
                .eventos-bosque .btn:focus-visible { outline:3px solid #f0d18c; outline-offset:3px; }
                @media (prefers-reduced-motion: reduce) { .eventos-bosque .ev-kpi { transition:none; } .eventos-bosque .ev-kpi:hover { transform:none; } }
            `}</style>
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="panel-foto mb-6 rounded-3xl p-6 shadow-xl sm:p-8"
                    style={{backgroundImage: 'linear-gradient(110deg, rgba(4, 31, 23, .94), rgba(8, 42, 33, .69)), url("/images/photo-1529156069898-49953e39b3ac.jpg")'}}>
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold sm:text-4xl">
                                    Actividades y Eventos
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Gestión
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Crea y administra actividades comunitarias,
                                controla sus fechas, cupos y asistencia de
                                participantes.
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

                {/* Resumen */}
                {!cargando && !error && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="panel-foto ev-kpi ev-kpi-total rounded-2xl p-5" style={{backgroundImage: 'linear-gradient(115deg, rgba(7,30,23,.92), rgba(10,37,29,.68)), url("/images/photo-1492684223066-81342ee5ff30.jpg")'}}>
                            <p className="text-sm font-medium text-base-content/60">
                                Total de eventos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {eventos.length}
                                </span>

                                <span className="badge badge-outline">
                                    Registrados
                                </span>
                            </div>
                        </div>

                        <div className="panel-foto ev-kpi ev-kpi-programados rounded-2xl p-5" style={{backgroundImage: 'linear-gradient(115deg, rgba(7,30,23,.92), rgba(10,37,29,.68)), url("/images/photo-1500534623283-312aade485b7.jpg")'}}>
                            <p className="text-sm font-medium text-base-content/60">
                                Programados
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {totalProgramados}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Próximos
                                </span>
                            </div>
                        </div>

                        <div className="panel-foto ev-kpi ev-kpi-finalizados rounded-2xl p-5" style={{backgroundImage: 'linear-gradient(115deg, rgba(7,30,23,.92), rgba(10,37,29,.68)), url("/images/photo-1511795409834-ef04bbd61622.jpg")'}}>
                            <p className="text-sm font-medium text-base-content/60">
                                Finalizados
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {totalFinalizados}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Completados
                                </span>
                            </div>
                        </div>

                        <div className="panel-foto ev-kpi ev-kpi-cancelados rounded-2xl p-5" style={{backgroundImage: 'linear-gradient(115deg, rgba(7,30,23,.92), rgba(10,37,29,.68)), url("/images/photo-1527525443983-6e60c75fff46.jpg")'}}>
                            <p className="text-sm font-medium text-base-content/60">
                                Cancelados
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {totalCancelados}
                                </span>

                                <span className="badge badge-error badge-outline">
                                    Cancelados
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form
                    onSubmit={crearEvento}
                    className={`panel-foto mb-6 overflow-hidden rounded-3xl border bg-base-100 shadow-xl ${eventoAEditar
                            ? 'border-amber-500/40'
                            : 'border-base-300'
                        }`}
                    style={{backgroundImage: 'linear-gradient(115deg, rgba(6, 32, 25, .96), rgba(8, 34, 27, .88)), url("/images/photo-1517457373958-b7bdd4587205.jpg")'}}
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        {eventoAEditar
                                            ? 'Editar evento'
                                            : 'Crear nuevo evento'}
                                    </h2>

                                    <span
                                        className={
                                            eventoAEditar
                                                ? 'badge badge-warning badge-outline'
                                                : 'badge badge-primary badge-outline'
                                        }
                                    >
                                        {eventoAEditar
                                            ? 'Modo edición'
                                            : 'Nuevo'}
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    {eventoAEditar
                                        ? 'Modifica la información del evento seleccionado.'
                                        : 'Completa los datos para registrar una nueva actividad comunitaria.'}
                                </p>
                            </div>

                            {eventoAEditar && (
                                <span className="text-sm text-base-content/50">
                                    Evento #{eventoAEditar.id}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6">

                        {mensaje && (
                            <div
                                className={`alert mb-6 ${tipoMensaje === 'error'
                                        ? 'alert-error'
                                        : 'alert-success'
                                    }`}
                            >
                                <span>{mensaje}</span>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Título
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={titulo}
                                    onChange={(e) =>
                                        setTitulo(e.target.value)
                                    }
                                    placeholder="Ej: Reunión comunitaria"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Lugar
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={lugar}
                                    onChange={(e) =>
                                        setLugar(e.target.value)
                                    }
                                    placeholder="Ej: Sede vecinal"
                                    required
                                />
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
                                    type="datetime-local"
                                    className="input input-bordered w-full"
                                    value={fechaInicio}
                                    onChange={(e) =>
                                        setFechaInicio(e.target.value)
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
                                    type="datetime-local"
                                    className="input input-bordered w-full"
                                    value={fechaFin}
                                    onChange={(e) =>
                                        setFechaFin(e.target.value)
                                    }
                                />
                            </label>

                            <label className="form-control md:col-span-1">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Cupo máximo
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <input
                                    type="number"
                                    min="1"
                                    className="input input-bordered w-full"
                                    value={cupoMaximo}
                                    onChange={(e) =>
                                        setCupoMaximo(e.target.value)
                                    }
                                    placeholder="Sin límite"
                                />

                                <span className="mt-2 text-xs text-base-content/50">
                                    Déjalo vacío si la actividad no tiene límite.
                                </span>
                            </label>

                            <label className="form-control md:col-span-2">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Descripción
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-32 w-full resize-y"
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    placeholder="Describe el objetivo, detalles o información importante del evento..."
                                    required
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">
                            {eventoAEditar && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={creando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar edición
                                </button>
                            )}

                            <button
                                type="submit"
                                className={
                                    eventoAEditar
                                        ? 'btn btn-warning'
                                        : 'btn btn-primary'
                                }
                                disabled={creando}
                            >
                                {creando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {creando
                                    ? 'Guardando...'
                                    : eventoAEditar
                                        ? 'Guardar cambios'
                                        : 'Crear evento'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando actividades y eventos...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Eventos */}
                {!cargando && !error && (
                    <div>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Eventos registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa y administra las actividades de la
                                    junta de vecinos.
                                </p>
                            </div>

                            {eventos.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {eventos.length}{' '}
                                    {eventos.length === 1
                                        ? 'evento'
                                        : 'eventos'}
                                </span>
                            )}
                        </div>

                        {eventos.length === 0 ? (
                            <div className="panel-foto rounded-2xl p-10 text-center" style={{backgroundImage: 'linear-gradient(120deg,rgba(6,29,22,.94),rgba(12,40,31,.78)),url("/images/photo-1519331379826-f10be5486c6f.jpg")'}}>
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                                        +
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No hay eventos registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Utiliza el formulario superior para
                                        crear la primera actividad de la junta.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-5 lg:grid-cols-2">
                                {eventos.map((evento) => (
                                    <article
                                        key={evento.id}
                                        data-estado={evento.estado}
                                        className={`panel-foto ev-evento flex h-full flex-col rounded-2xl border bg-base-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${obtenerBordeEvento(
                                            evento.estado
                                        )}`}
                                        style={{backgroundImage: 'linear-gradient(125deg, rgba(6, 31, 25, .94), rgba(10, 35, 26, .86)), url("/images/photo-1500530855697-b586d89ba3ee.jpg")'}}
                                    >
                                        <div className="flex-1 p-6">

                                            {/* Cabecera */}
                                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-base-content/45">
                                                        {evento.junta_nombre}
                                                    </p>

                                                    <h3 className="text-xl font-bold leading-snug">
                                                        {evento.titulo}
                                                    </h3>
                                                </div>

                                                <span
                                                    className={obtenerClaseEstado(
                                                        evento.estado
                                                    )}
                                                >
                                                    {obtenerTextoEstado(
                                                        evento.estado
                                                    )}
                                                </span>
                                            </div>

                                            {/* Descripción */}
                                            <p className="mb-5 whitespace-pre-wrap leading-relaxed text-base-content/70">
                                                {evento.descripcion}
                                            </p>

                                            {/* Datos */}
                                            <div className="grid gap-3 sm:grid-cols-2">

                                                <div className="rounded-xl bg-base-200/60 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                        Lugar
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {evento.lugar}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-base-200/60 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                        Cupo
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {evento.cupo_maximo !== null
                                                            ? `${evento.cupo_maximo} personas`
                                                            : 'Sin límite'}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-base-200/60 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                        Inicio
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium">
                                                        {formatearFecha(
                                                            evento.fecha_inicio
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-base-200/60 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                        Término
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium">
                                                        {evento.fecha_fin
                                                            ? formatearFecha(
                                                                evento.fecha_fin
                                                            )
                                                            : 'Sin definir'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-base-content/50">
                                                <span>
                                                    Creado por{' '}
                                                    <strong className="font-semibold text-base-content/70">
                                                        {evento.creador_username}
                                                    </strong>
                                                </span>

                                                <span>
                                                    Evento #{evento.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        {evento.estado !== 'CANCELADO' && (
                                            <div className="border-t border-base-300 p-4">
                                                <div className="flex flex-wrap justify-end gap-2">

                                                    <Link
                                                        to={`/directiva/eventos/${evento.id}/asistencia`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        {evento.estado === 'FINALIZADO'
                                                            ? 'Ver asistencia'
                                                            : 'Gestionar asistencia'}
                                                    </Link>

                                                    {evento.estado === 'PROGRAMADO' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline"
                                                                onClick={() =>
                                                                    prepararEdicion(evento)
                                                                }
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-error btn-outline"
                                                                onClick={() =>
                                                                    setEventoACancelar(evento)
                                                                }
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Modal de cancelación */}
            {eventoACancelar && (
                <dialog
                    open
                    className="modal modal-open"
                >
                    <div className="modal-box rounded-2xl border border-base-300">

                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-xl font-bold text-error">
                            !
                        </div>

                        <h3 className="text-xl font-bold">
                            Cancelar evento
                        </h3>

                        <p className="mt-2 leading-relaxed text-base-content/70">
                            Estás a punto de cancelar el evento{' '}
                            <strong className="text-base-content">
                                {eventoACancelar.titulo}
                            </strong>
                            .
                        </p>

                        <div className="alert alert-warning mt-5">
                            <span>
                                El evento quedará registrado como cancelado.
                            </span>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={cancelando}
                                onClick={() =>
                                    setEventoACancelar(null)
                                }
                            >
                                Volver
                            </button>

                            <button
                                type="button"
                                className="btn btn-error"
                                disabled={cancelando}
                                onClick={() => {
                                    void cancelarEvento(
                                        eventoACancelar.id
                                    )
                                }}
                            >
                                {cancelando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {cancelando
                                    ? 'Cancelando...'
                                    : 'Sí, cancelar evento'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop bg-black/30"
                        onClick={() => {
                            if (!cancelando) {
                                setEventoACancelar(null)
                            }
                        }}
                    />
                </dialog>
            )}
        </main>
    )
}

export default EventosPage
