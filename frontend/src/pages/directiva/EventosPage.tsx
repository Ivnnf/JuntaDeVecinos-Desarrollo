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
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
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

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
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

                        <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
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

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
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

                        <div className="rounded-2xl border border-red-500/30 bg-base-100 p-5 shadow-sm">
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
                    className={`mb-6 overflow-hidden rounded-2xl border bg-base-100 shadow-sm ${eventoAEditar
                            ? 'border-amber-500/40'
                            : 'border-base-300'
                        }`}
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
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
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
                                        className={`flex h-full flex-col rounded-2xl border bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${obtenerBordeEvento(
                                            evento.estado
                                        )}`}
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