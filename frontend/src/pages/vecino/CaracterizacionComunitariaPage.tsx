import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type CaracterizacionComunitaria = {
    id: number
    fecha_nacimiento: string | null
    cantidad_personas_hogar: number
    cantidad_menores_18: number
    cantidad_18_29: number
    cantidad_30_44: number
    cantidad_45_59: number
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
    // Se habilita al crear por primera vez; al cargar o guardar queda en lectura.
    const [editando, setEditando] = useState(true)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const [fechaNacimiento, setFechaNacimiento] =
        useState('')

    const [cantidadPersonasHogar, setCantidadPersonasHogar] =
        useState('1')

    const [cantidadMenores18, setCantidadMenores18] =
        useState('0')

    const [cantidad18a29, setCantidad18a29] =
        useState('0')

    const [cantidad30a44, setCantidad30a44] =
        useState('0')

    const [cantidad45a59, setCantidad45a59] =
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

                setFechaNacimiento(
                    data.fecha_nacimiento ?? '',
                )

                setCantidadPersonasHogar(
                    String(data.cantidad_personas_hogar),
                )

                setCantidadMenores18(
                    String(data.cantidad_menores_18),
                )

                setCantidad18a29(
                    String(data.cantidad_18_29),
                )

                setCantidad30a44(
                    String(data.cantidad_30_44),
                )

                setCantidad45a59(
                    String(data.cantidad_45_59),
                )

                setCantidadAdultosMayores(
                    String(data.cantidad_adultos_mayores),
                )

                setNivelEducacional(data.nivel_educacional)
                setSituacionLaboral(data.situacion_laboral)
                setTipoVivienda(data.tipo_vivienda)
                setEditando(false)

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


    const activarEdicion = () => {
        setError('')
        setMensaje('')
        setEditando(true)
    }

    const guardarCaracterizacion = async () => {
        setError('')
        setMensaje('')

        const personas = Number(cantidadPersonasHogar)
        const menores = Number(cantidadMenores18)
        const adultosMayores = Number(cantidadAdultosMayores)
        const rango18a29 = Number(cantidad18a29)
        const rango30a44 = Number(cantidad30a44)
        const rango45a59 = Number(cantidad45a59)

        const totalRangosEtarios =
            menores +
            rango18a29 +
            rango30a44 +
            rango45a59 +
            adultosMayores
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
        if (
            rango18a29 < 0 ||
            rango30a44 < 0 ||
            rango45a59 < 0
        ) {
            setError(
                'Las cantidades por rango etario no pueden ser negativas.',
            )
            return
        }

        if (totalRangosEtarios !== personas) {
            setError(
                'La suma de los rangos etarios debe coincidir con el total de personas del hogar.',
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
                        fecha_nacimiento:
                            fechaNacimiento === ''
                                ? null
                                : fechaNacimiento,
                        cantidad_personas_hogar: personas,
                        cantidad_menores_18: menores,
                        cantidad_18_29: Number(cantidad18a29),
                        cantidad_30_44: Number(cantidad30a44),
                        cantidad_45_59: Number(cantidad45a59),
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

            setEditando(false)
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
        <main className="cc-page">
            <style>{`
                .cc-page { --cc-gold:#dbb953; --cc-cream:#f6f0dc; --cc-muted:#d0d9cc; position:relative; isolation:isolate; min-height:100vh; padding:32px 20px 64px; color:var(--cc-cream); font-family:'Segoe UI',Arial,sans-serif; background:#081d15; overflow:hidden; }
                .cc-page::before { content:''; position:fixed; inset:0; z-index:-2; background:linear-gradient(115deg,rgba(3,20,13,.82),rgba(5,31,20,.70)),url('/images/photo-1441974231531-c6227db76b6e.jpg') center/cover no-repeat; }
                .cc-page::after { content:''; position:fixed; inset:0; z-index:-1; background:radial-gradient(circle at top right, rgba(219,185,83,.12), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,.05), transparent 24%); pointer-events:none; }
                .cc-page, .cc-page * { box-sizing:border-box; }
                .cc-page .cc-wrap { max-width:1160px; margin:auto; }
                .cc-page .cc-panel { position:relative; isolation:isolate; overflow:hidden; border:1px solid rgba(219,185,83,.43); border-radius:22px; box-shadow:0 14px 40px rgba(0,0,0,.28); background:rgba(7,34,22,.86); }
                .cc-page .cc-photo::before { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(110deg,rgba(4,25,17,.87),rgba(8,38,25,.72)),var(--cc-photo) center/cover no-repeat; }
                .cc-page .cc-hero { --cc-photo:url('/images/photo-1473448912268-2022ce9509d8.jpg'); padding:32px; margin-bottom:22px; }
                .cc-page h1,.cc-page h2,.cc-page h3 { font-family:Georgia,'Times New Roman',serif; color:var(--cc-cream); margin:0; line-height:1.3; }
                .cc-page h1 { font-size:clamp(29px,3.2vw,43px); }
                .cc-page h2 { font-size:clamp(23px,2.4vw,31px); }
                .cc-page h3 { font-size:22px; }
                .cc-page .cc-hero-row { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; flex-wrap:wrap; }
                .cc-page .cc-title-line { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
                .cc-page .cc-subtitle { color:var(--cc-muted); max-width:750px; font-size:15px; line-height:1.75; margin:12px 0 0; }
                .cc-page .cc-badge { display:inline-flex; align-items:center; border:1px solid rgba(219,185,83,.67); border-radius:999px; padding:6px 14px; color:#f5d980; background:rgba(219,185,83,.16); font-size:13px; font-weight:750; }
                .cc-page .cc-button { display:inline-flex; justify-content:center; align-items:center; gap:9px; border:1px solid rgba(219,185,83,.7); border-radius:12px; min-height:45px; padding:11px 20px; text-decoration:none; color:#f7e6b0; background:rgba(219,185,83,.16); font:inherit; font-weight:700; cursor:pointer; transition:background .2s,transform .2s; }
                .cc-page .cc-button:hover { background:rgba(219,185,83,.30); transform:translateY(-1px); }
                .cc-page .cc-primary { background:linear-gradient(120deg,#f1d77c,#d3a83d); color:#152519; border-color:#e2c15f; }
                .cc-page .cc-primary:hover { background:linear-gradient(120deg,#ffe69a,#e9bd52); }
                .cc-page .cc-button:disabled { opacity:.55; cursor:not-allowed; transform:none; }
                .cc-page .cc-notice { padding:20px 24px; margin-bottom:22px; line-height:1.6; }
                .cc-page .cc-notice p { margin:0; }
                .cc-page .cc-notice p+p { margin-top:5px; }
                .cc-page .cc-info { --cc-photo:url('/images/photo-1500534623283-312aade485b7.jpg'); }
                .cc-page .cc-info strong { color:#f5d980; }
                .cc-page .cc-error { border-color:rgba(255,146,146,.65); background:rgba(96,22,27,.93); }
                .cc-page .cc-success { border-color:rgba(131,224,159,.60); background:rgba(18,75,48,.95); }
                .cc-page .cc-form { padding:0; }
                .cc-page .cc-form-intro { --cc-photo:url('/images/photo-1449158743715-0a90ebb6d2d8.jpg'); padding:29px 32px; border-bottom:1px solid rgba(219,185,83,.35); }
                .cc-page .cc-form-body { padding:28px 32px 34px; }
                .cc-page .cc-section { --cc-photo:url('/images/photo-1473448912268-2022ce9509d8.jpg'); padding:25px; margin-bottom:23px; }
                .cc-page .cc-section.household { --cc-photo:url('/images/photo-1449158743715-0a90ebb6d2d8.jpg'); }
                .cc-page .cc-section.general { --cc-photo:url('/images/photo-1500534623283-312aade485b7.jpg'); }
                .cc-page .cc-section-lead { color:var(--cc-muted); font-size:14px; line-height:1.65; margin:7px 0 22px; }
                .cc-page .cc-grid { display:grid; gap:18px; grid-template-columns:repeat(2,minmax(0,1fr)); }
                .cc-page .cc-grid-ages { display:grid; gap:13px; grid-template-columns:repeat(5,minmax(0,1fr)); }
                .cc-page .cc-field { display:flex; flex-direction:column; gap:9px; min-width:0; font-size:14px; font-weight:650; color:#f2ead4; }
                .cc-page .cc-field small { font-size:12px; color:var(--cc-muted); font-weight:400; line-height:1.6; }
                .cc-page .cc-input,.cc-page .cc-select { display:block; width:100%; min-width:0; min-height:45px; padding:11px 13px; border-radius:11px; border:1px solid rgba(219,185,83,.46); background:rgba(3,20,13,.86); color:var(--cc-cream); color-scheme:dark; font:inherit; font-size:14px; outline:none; }
                .cc-page .cc-input:focus,.cc-page .cc-select:focus { border-color:#f5d980; box-shadow:0 0 0 3px rgba(219,185,83,.20); }
                .cc-page .cc-select option { background:#102a1c; color:#f6f0dc; }
                .cc-page .cc-actions { padding-top:22px; border-top:1px solid rgba(219,185,83,.32); display:flex; justify-content:flex-end; }
                .cc-page .cc-actions .cc-button { min-width:180px; }
                .cc-page a:focus-visible,.cc-page button:focus-visible { outline:2px solid #f5d980; outline-offset:3px; }
                @media(max-width:900px) { .cc-page .cc-grid-ages { grid-template-columns:repeat(3,minmax(0,1fr)); } }
                @media(max-width:650px) { .cc-page { padding:16px 12px 42px; } .cc-page .cc-hero,.cc-page .cc-form-intro,.cc-page .cc-form-body { padding:22px; } .cc-page .cc-section { padding:19px; } .cc-page .cc-grid,.cc-page .cc-grid-ages { grid-template-columns:1fr; } .cc-page .cc-hero-row .cc-button { width:100%; } .cc-page .cc-actions .cc-button { width:100%; } }
                @media(prefers-reduced-motion:reduce) { .cc-page .cc-button { transition:none; } }

                .cc-page .cc-edit-button { background:linear-gradient(120deg,#b6dfff,#7bbdf1); border-color:#94cff7; color:#102d42; }
                .cc-page .cc-edit-button:hover { background:linear-gradient(120deg,#cdeaff,#a0d2f8); color:#102d42; }
                .cc-page :is(.cc-input,.cc-select):disabled { opacity:.76; cursor:not-allowed; background:rgba(14,35,27,.68); border-color:rgba(197,210,197,.3); color:#e4e9df; }

                /* Identidad visual diferenciada por bloque, sin alterar campos ni endpoints. */
                .cc-page .cc-hero { border-top:5px solid #e9ce92; }
                .cc-page .cc-info { border-left:5px solid #8fd9c3; }
                .cc-page .cc-info strong { color:#aaf0d3; }
                .cc-page .cc-form-intro { border-top:5px solid #e5c876; }
                .cc-page .cc-section:not(.household):not(.general) { border-top:4px solid #94cff7; }
                .cc-page .cc-section:not(.household):not(.general) > h3 { color:#b7dffc; }
                .cc-page .cc-section.household { border-top:4px solid #8fe1b3; }
                .cc-page .cc-section.household > h3 { color:#aaf0cd; }
                .cc-page .cc-section.general { border-top:4px solid #c6aff9; }
                .cc-page .cc-section.general > h3 { color:#d6c3ff; }
                .cc-page .cc-section:not(.household):not(.general) .cc-input:focus { border-color:#94cff7; box-shadow:0 0 0 3px rgba(148,207,247,.20); }
                .cc-page .cc-section.household .cc-input:focus { border-color:#8fe1b3; box-shadow:0 0 0 3px rgba(143,225,179,.20); }
                .cc-page .cc-section.general .cc-select:focus { border-color:#c6aff9; box-shadow:0 0 0 3px rgba(198,175,249,.20); }
                .cc-page .cc-primary { background:linear-gradient(120deg,#a5ecc7,#5bc99b); border-color:#81d9b0; color:#103324; }
                .cc-page .cc-primary:hover { background:linear-gradient(120deg,#c0f7d7,#83deb2); color:#103324; }
                .cc-page .cc-error { border-left:5px solid #f3a0a5; }
                .cc-page .cc-success { border-left:5px solid #8fe1b3; }
                .cc-page .cc-field small { overflow-wrap:anywhere; }
                .cc-page .cc-grid-ages .cc-field { min-width:0; }
                .cc-page .cc-grid-ages .cc-input { font-variant-numeric:tabular-nums; }
            `}</style>
            <section className="cc-wrap">
                <header className="cc-panel cc-photo cc-hero">
                    <div className="cc-hero-row">
                        <div>
                            <div className="cc-title-line"><h1>Caracterización comunitaria</h1><span className="cc-badge">Vecino</span></div>
                            <p className="cc-subtitle">Completa información general sobre tu hogar. Estos datos permiten conocer mejor las características y necesidades de la comunidad.</p>
                        </div>
                        <Link to="/vecino/perfil" className="cc-button">← Volver a Mi Perfil</Link>
                    </div>
                </header>
                <div className="cc-panel cc-photo cc-info cc-notice">
                    <p><strong>Tu información se utiliza con fines comunitarios.</strong></p>
                    <p>La Directiva accederá a resultados agregados para apoyar la planificación de actividades y decisiones de la Junta de Vecinos, no a una ficha individual con tus respuestas.</p>
                </div>
                {cargando && <div className="cc-panel cc-notice" role="status">Cargando caracterización...</div>}
                {error && <div className="cc-panel cc-notice cc-error" role="alert">{error}</div>}
                {mensaje && <div className="cc-panel cc-notice cc-success" role="status">{mensaje}</div>}
                {!cargando && (
                    <form
                        className="cc-panel cc-form"
                        onSubmit={(event) => {
                            event.preventDefault()

                            if (!editando || guardando) {
                                return
                            }

                            void guardarCaracterizacion()
                        }}
                    >
                        <div className="cc-photo cc-form-intro">
                            <h2>Información del hogar</h2>
                            <p className="cc-subtitle">Puedes actualizar esta información cuando cambie la composición o situación de tu hogar.</p>
                        </div>
                        <div className="cc-form-body">
                            <section className="cc-panel cc-photo cc-section">
                                <h3>Datos personales para caracterización</h3>
                                <p className="cc-section-lead">Información general para elaborar indicadores comunitarios.</p>
                                <div className="cc-grid">
                                    <label className="cc-field">Fecha de nacimiento
                                        <input type="date" className="cc-input" disabled={!editando} value={fechaNacimiento} onChange={(event) => setFechaNacimiento(event.target.value)} />
                                        <small>Se utiliza únicamente para generar rangos etarios e indicadores agregados.</small>
                                    </label>
                                </div>
                            </section>
                            <section className="cc-panel cc-photo cc-section household">
                                <h3>Composición del hogar</h3>
                                <p className="cc-section-lead">Indica cuántas personas viven en tu hogar y cómo se distribuyen por edad. La suma de los rangos debe coincidir con el total.</p>
                                <div className="cc-grid" style={{marginBottom:24}}>
                                    <label className="cc-field">Personas en el hogar
                                        <input type="number" min="1" className="cc-input" disabled={!editando} value={cantidadPersonasHogar} onChange={(event) => setCantidadPersonasHogar(event.target.value)} required />
                                    </label>
                                </div>
                                <h3 style={{fontSize:19, marginBottom:16}}>Distribución etaria del hogar</h3>
                                <div className="cc-grid-ages">
                                    <label className="cc-field">0 a 17 años<input type="number" min="0" className="cc-input" disabled={!editando} value={cantidadMenores18} onChange={(event) => setCantidadMenores18(event.target.value)} required /></label>
                                    <label className="cc-field">18 a 29 años<input type="number" min="0" className="cc-input" disabled={!editando} value={cantidad18a29} onChange={(event) => setCantidad18a29(event.target.value)} required /></label>
                                    <label className="cc-field">30 a 44 años<input type="number" min="0" className="cc-input" disabled={!editando} value={cantidad30a44} onChange={(event) => setCantidad30a44(event.target.value)} required /></label>
                                    <label className="cc-field">45 a 59 años<input type="number" min="0" className="cc-input" disabled={!editando} value={cantidad45a59} onChange={(event) => setCantidad45a59(event.target.value)} required /></label>
                                    <label className="cc-field">60 años o más<input type="number" min="0" className="cc-input" disabled={!editando} value={cantidadAdultosMayores} onChange={(event) => setCantidadAdultosMayores(event.target.value)} required /></label>
                                </div>
                            </section>
                            <section className="cc-panel cc-photo cc-section general">
                                <h3>Información general</h3>
                                <p className="cc-section-lead">Estos antecedentes ayudan a conocer las características y necesidades del sector.</p>
                                <div className="cc-grid">
                                    <label className="cc-field">Nivel educacional
                                        <select className="cc-select" disabled={!editando} value={nivelEducacional} onChange={(event) => setNivelEducacional(event.target.value)}>
                                            <option value="SIN_ESTUDIOS">Sin estudios formales</option>
                                            <option value="BASICA">Educación básica</option>
                                            <option value="MEDIA">Educación media</option>
                                            <option value="TECNICO">Técnico profesional</option>
                                            <option value="SUPERIOR">Educación superior</option>
                                            <option value="POSTGRADO">Postgrado</option>
                                            <option value="PREFIERE_NO_RESPONDER">Prefiero no responder</option>
                                        </select>
                                    </label>
                                    <label className="cc-field">Situación laboral
                                        <select className="cc-select" disabled={!editando} value={situacionLaboral} onChange={(event) => setSituacionLaboral(event.target.value)}>
                                            <option value="TRABAJANDO">Trabajando</option>
                                            <option value="ESTUDIANDO">Estudiando</option>
                                            <option value="DESEMPLEADO">Buscando empleo</option>
                                            <option value="JUBILADO">Jubilado/a</option>
                                            <option value="LABORES_HOGAR">Labores del hogar</option>
                                            <option value="OTRA">Otra</option>
                                            <option value="PREFIERE_NO_RESPONDER">Prefiero no responder</option>
                                        </select>
                                    </label>
                                    <label className="cc-field">Tipo de vivienda
                                        <select className="cc-select" disabled={!editando} value={tipoVivienda} onChange={(event) => setTipoVivienda(event.target.value)}>
                                            <option value="CASA">Casa</option>
                                            <option value="DEPARTAMENTO">Departamento</option>
                                            <option value="PIEZA">Pieza</option>
                                            <option value="OTRA">Otra</option>
                                            <option value="PREFIERE_NO_RESPONDER">Prefiero no responder</option>
                                        </select>
                                    </label>
                                    <label className="cc-field">Acceso a internet en el hogar
                                        <select className="cc-select" disabled={!editando} value={accesoInternet} onChange={(event) => setAccesoInternet(event.target.value)}>
                                            <option value="">Prefiero no responder</option>
                                            <option value="SI">Sí</option>
                                            <option value="NO">No</option>
                                        </select>
                                    </label>
                                </div>
                            </section>
                            <div className="cc-actions">
                                {editando ? (
                                    <button
                                        type="submit"
                                        className="cc-button cc-primary"
                                        disabled={guardando}
                                    >
                                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="cc-button cc-edit-button"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                            activarEdicion()
                                        }}
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </section>
        </main>
    )
}

export default CaracterizacionComunitariaPage
