import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type CaracterizacionComunitaria = {
    id: number
    cantidad_personas_hogar: number
    cantidad_menores_18: number
    cantidad_adultos_mayores: number
    nivel_educacional: string
    situacion_laboral: string
    tipo_vivienda: string
    acceso_internet: boolean | null
    fecha_creacion: string
    fecha_actualizacion: string
}


function CaracterizacionComunitariaPage() {
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const [cantidadPersonasHogar, setCantidadPersonasHogar] =
        useState('1')

    const [cantidadMenores18, setCantidadMenores18] =
        useState('0')

    const [cantidadAdultosMayores, setCantidadAdultosMayores] =
        useState('0')

    const [nivelEducacional, setNivelEducacional] =
        useState('PREFIERE_NO_RESPONDER')

    const [situacionLaboral, setSituacionLaboral] =
        useState('PREFIERE_NO_RESPONDER')

    const [tipoVivienda, setTipoVivienda] =
        useState('PREFIERE_NO_RESPONDER')

    const [accesoInternet, setAccesoInternet] =
        useState('')


    useEffect(() => {
        const cargarCaracterizacion = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/profiles/mi-caracterizacion/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    setError(
                        'No fue posible obtener tu caracterización comunitaria.',
                    )
                    return
                }

                const data =
                    (await response.json()) as CaracterizacionComunitaria

                setCantidadPersonasHogar(
                    String(data.cantidad_personas_hogar),
                )

                setCantidadMenores18(
                    String(data.cantidad_menores_18),
                )

                setCantidadAdultosMayores(
                    String(data.cantidad_adultos_mayores),
                )

                setNivelEducacional(data.nivel_educacional)
                setSituacionLaboral(data.situacion_laboral)
                setTipoVivienda(data.tipo_vivienda)

                if (data.acceso_internet === true) {
                    setAccesoInternet('SI')
                } else if (data.acceso_internet === false) {
                    setAccesoInternet('NO')
                } else {
                    setAccesoInternet('')
                }
            } catch {
                setError(
                    'No fue posible comunicarse con el servidor.',
                )
            } finally {
                setCargando(false)
            }
        }

        void cargarCaracterizacion()
    }, [])


    const guardarCaracterizacion = async () => {
        setError('')
        setMensaje('')

        const personas = Number(cantidadPersonasHogar)
        const menores = Number(cantidadMenores18)
        const adultosMayores = Number(cantidadAdultosMayores)

        if (personas < 1) {
            setError(
                'El hogar debe tener al menos una persona.',
            )
            return
        }

        if (menores < 0 || adultosMayores < 0) {
            setError(
                'Las cantidades no pueden ser negativas.',
            )
            return
        }

        if (menores > personas) {
            setError(
                'La cantidad de menores no puede superar el total de personas del hogar.',
            )
            return
        }

        if (adultosMayores > personas) {
            setError(
                'La cantidad de adultos mayores no puede superar el total de personas del hogar.',
            )
            return
        }

        if (menores + adultosMayores > personas) {
            setError(
                'La suma de menores y adultos mayores no puede superar el total de personas del hogar.',
            )
            return
        }

        setGuardando(true)

        try {
            const response = await fetch(
                'http://localhost:8000/api/profiles/mi-caracterizacion/',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        cantidad_personas_hogar: personas,
                        cantidad_menores_18: menores,
                        cantidad_adultos_mayores: adultosMayores,
                        nivel_educacional: nivelEducacional,
                        situacion_laboral: situacionLaboral,
                        tipo_vivienda: tipoVivienda,
                        acceso_internet:
                            accesoInternet === ''
                                ? null
                                : accesoInternet === 'SI',
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                const primerError = Object.values(data)
                    .flat()
                    .find(
                        (valor) =>
                            typeof valor === 'string',
                    )

                setError(
                    typeof primerError === 'string'
                        ? primerError
                        : 'No fue posible guardar la caracterización.',
                )

                return
            }

            setMensaje(
                'Caracterización comunitaria guardada correctamente.',
            )
        } catch {
            setError(
                'No fue posible comunicarse con el servidor.',
            )
        } finally {
            setGuardando(false)
        }
    }


    return (
        <main className="min-h-screen bg-base-200 px-4 py-8">
            <section className="mx-auto w-full max-w-5xl">

                {/* Encabezado */}
                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Caracterización comunitaria
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Vecino
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Completa información general sobre tu hogar.
                                Estos datos permiten conocer mejor las
                                características y necesidades de la comunidad.
                            </p>
                        </div>

                        <Link
                            to="/vecino/perfil"
                            className="btn btn-outline"
                        >
                            ← Volver a Mi Perfil
                        </Link>
                    </div>
                </div>


                {/* Privacidad */}
                <div className="alert alert-info mb-6 shadow-sm">
                    <div>
                        <p className="font-semibold">
                            Tu información se utiliza con fines comunitarios.
                        </p>

                        <p className="mt-1 text-sm">
                            La Directiva accederá a resultados agregados para
                            apoyar la planificación de actividades y decisiones
                            de la Junta de Vecinos, no a una ficha individual
                            con tus respuestas.
                        </p>
                    </div>
                </div>


                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />

                        <span>
                            Cargando caracterización...
                        </span>
                    </div>
                )}


                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}


                {mensaje && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{mensaje}</span>
                    </div>
                )}


                {!cargando && (
                    <form
                        className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                        onSubmit={(event) => {
                            event.preventDefault()
                            void guardarCaracterizacion()
                        }}
                    >
                        <div className="border-b border-base-300 p-6">
                            <h2 className="text-2xl font-bold">
                                Información del hogar
                            </h2>

                            <p className="mt-1 text-base-content/60">
                                Puedes actualizar esta información cuando cambie
                                la composición o situación de tu hogar.
                            </p>
                        </div>


                        <div className="space-y-8 p-6">

                            {/* Composición del hogar */}
                            <div>
                                <h3 className="mb-4 text-lg font-bold">
                                    Composición del hogar
                                </h3>

                                <div className="grid gap-5 md:grid-cols-3">
                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Personas en el hogar
                                            </span>
                                        </div>

                                        <input
                                            type="number"
                                            min="1"
                                            className="input input-bordered w-full"
                                            value={cantidadPersonasHogar}
                                            onChange={(event) =>
                                                setCantidadPersonasHogar(
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </label>


                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Menores de 18 años
                                            </span>
                                        </div>

                                        <input
                                            type="number"
                                            min="0"
                                            className="input input-bordered w-full"
                                            value={cantidadMenores18}
                                            onChange={(event) =>
                                                setCantidadMenores18(
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </label>


                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Adultos mayores
                                            </span>
                                        </div>

                                        <input
                                            type="number"
                                            min="0"
                                            className="input input-bordered w-full"
                                            value={cantidadAdultosMayores}
                                            onChange={(event) =>
                                                setCantidadAdultosMayores(
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </label>
                                </div>
                            </div>


                            <div className="divider" />


                            {/* Información general */}
                            <div>
                                <h3 className="mb-4 text-lg font-bold">
                                    Información general
                                </h3>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Nivel educacional
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={nivelEducacional}
                                            onChange={(event) =>
                                                setNivelEducacional(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="SIN_ESTUDIOS">
                                                Sin estudios formales
                                            </option>

                                            <option value="BASICA">
                                                Educación básica
                                            </option>

                                            <option value="MEDIA">
                                                Educación media
                                            </option>

                                            <option value="TECNICO">
                                                Técnico profesional
                                            </option>

                                            <option value="SUPERIOR">
                                                Educación superior
                                            </option>

                                            <option value="POSTGRADO">
                                                Postgrado
                                            </option>

                                            <option value="PREFIERE_NO_RESPONDER">
                                                Prefiero no responder
                                            </option>
                                        </select>
                                    </label>


                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Situación laboral
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={situacionLaboral}
                                            onChange={(event) =>
                                                setSituacionLaboral(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="TRABAJANDO">
                                                Trabajando
                                            </option>

                                            <option value="ESTUDIANDO">
                                                Estudiando
                                            </option>

                                            <option value="DESEMPLEADO">
                                                Buscando empleo
                                            </option>

                                            <option value="JUBILADO">
                                                Jubilado/a
                                            </option>

                                            <option value="LABORES_HOGAR">
                                                Labores del hogar
                                            </option>

                                            <option value="OTRA">
                                                Otra
                                            </option>

                                            <option value="PREFIERE_NO_RESPONDER">
                                                Prefiero no responder
                                            </option>
                                        </select>
                                    </label>


                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Tipo de vivienda
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={tipoVivienda}
                                            onChange={(event) =>
                                                setTipoVivienda(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="CASA">
                                                Casa
                                            </option>

                                            <option value="DEPARTAMENTO">
                                                Departamento
                                            </option>

                                            <option value="PIEZA">
                                                Pieza
                                            </option>

                                            <option value="OTRA">
                                                Otra
                                            </option>

                                            <option value="PREFIERE_NO_RESPONDER">
                                                Prefiero no responder
                                            </option>
                                        </select>
                                    </label>


                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Acceso a internet en el hogar
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={accesoInternet}
                                            onChange={(event) =>
                                                setAccesoInternet(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Prefiero no responder
                                            </option>

                                            <option value="SI">
                                                Sí
                                            </option>

                                            <option value="NO">
                                                No
                                            </option>
                                        </select>
                                    </label>
                                </div>
                            </div>


                            <div className="flex justify-end border-t border-base-300 pt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary min-w-40"
                                    disabled={guardando}
                                >
                                    {guardando && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {guardando
                                        ? 'Guardando...'
                                        : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </section>
        </main>
    )
}


export default CaracterizacionComunitariaPage