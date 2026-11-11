import { useEffect, useState } from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router-dom'


type UsuarioElegible = {
    id: number
    username: string
    rut: string | null
    nombres: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    email: string
    sector_id: number
    sector_nombre: string
    junta_id: number
    junta_nombre: string
    estado_asociacion_sector: string
}

type IntegranteDirectivaActual = {
    id: number
    directiva: number
    usuario: number
    usuario_username: string
    usuario_nombres: string
    cargo_codigo: string | null
    usuario_apellido_paterno: string
    sector_id: number | null
    sector_nombre: string | null
    cargo: number
    cargo_nombre: string
    junta_id: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    activo: boolean
}

type Cargo = {
    id: number
    nombre: string
    descripcion: string | null
    permite_multiples: boolean
    activo: boolean
}

function GestionDirectivaPage() {
    const [searchParams] = useSearchParams()

    const directivaIdDesdeUrl =
        searchParams.get('directivaId')

    const [usuariosElegibles, setUsuariosElegibles] =
        useState<UsuarioElegible[]>([])

    const [integrantesActuales, setIntegrantesActuales] =
        useState<IntegranteDirectivaActual[]>([])

    const [filtroSectorIntegrantes, setFiltroSectorIntegrantes] =
        useState('TODOS')

    const [cargos, setCargos] =
        useState<Cargo[]>([])

    const [usuarioSeleccionado, setUsuarioSeleccionado] =
        useState('')

    const [cargoSeleccionado, setCargoSeleccionado] =
        useState('')

    const [guardandoAsignacion, setGuardandoAsignacion] =
        useState(false)

    const [directivaId, setDirectivaId] =
        useState<number | null>(null)

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [integranteReasignando, setIntegranteReasignando] =
        useState<IntegranteDirectivaActual | null>(null)

    const [nuevoCargoSeleccionado, setNuevoCargoSeleccionado] =
        useState('')

    const [reasignandoCargo, setReasignandoCargo] =
        useState(false)

    const [desactivandoId, setDesactivandoId] =
        useState<number | null>(null)

    const [integranteADesactivar, setIntegranteADesactivar] =
        useState<IntegranteDirectivaActual | null>(null)

    const [usuarioSesionId, setUsuarioSesionId] =
        useState<number | null>(null)

    useEffect(() => {
        const cargarSesionActual = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/auth/sesion/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    return
                }

                const data = await response.json()

                setUsuarioSesionId(data.id)
            } catch {
                // La protección principal está en el backend.
            }
        }

        void cargarSesionActual()
    }, [])

    useEffect(() => {
        const cargarDirectivaActual = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    'http://localhost:8000/api/organizacion/integrantes-directiva/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible obtener la directiva actual.',
                    )
                }

                const data =
                    (await response.json()) as IntegranteDirectivaActual[]

                // Si viene una Directiva en la URL, estamos entrando
                // desde el Panel de Administración.
                if (directivaIdDesdeUrl) {
                    const idDirectiva = Number(directivaIdDesdeUrl)

                    if (Number.isNaN(idDirectiva)) {
                        throw new Error(
                            'El identificador de la directiva no es válido.',
                        )
                    }

                    setDirectivaId(idDirectiva)

                    setIntegrantesActuales(
                        data.filter(
                            (integrante) =>
                                integrante.directiva === idDirectiva &&
                                integrante.activo,
                        ),
                    )

                    return
                }

                // Si no viene ID en la URL, corresponde al acceso
                // normal de un integrante de Directiva.
                if (data.length === 0) {
                    throw new Error(
                        'No se encontró una directiva vigente asociada al usuario.',
                    )
                }

                setIntegrantesActuales(
                    data.filter(
                        (integrante) =>
                            integrante.directiva === data[0].directiva &&
                            integrante.activo,
                    ),
                )

                setDirectivaId(data[0].directiva)
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

        void cargarDirectivaActual()
    }, [directivaIdDesdeUrl])

    useEffect(() => {
        if (directivaId === null) {
            return
        }

        const cargarUsuariosElegibles = async () => {
            try {
                setCargando(true)
                setError('')

                const response = await fetch(
                    `http://localhost:8000/api/organizacion/directivas/${directivaId}/usuarios-elegibles/`,
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los usuarios elegibles.',
                    )
                }

                const data =
                    (await response.json()) as UsuarioElegible[]

                setUsuariosElegibles(data)
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

        void cargarUsuariosElegibles()
    }, [directivaId])

    useEffect(() => {
        const cargarCargos = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/cargos/',
                    {
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar los cargos.',
                    )
                }

                const data =
                    (await response.json()) as Cargo[]

                setCargos(
                    data.filter((cargo) => cargo.activo),
                )
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error inesperado.',
                )
            }
        }

        void cargarCargos()
    }, [])

    const asignarIntegrante = async () => {
        if (
            directivaId === null ||
            !usuarioSeleccionado ||
            !cargoSeleccionado
        ) {
            setError(
                'Debe seleccionar un usuario y un cargo.',
            )
            return
        }

        try {
            setGuardandoAsignacion(true)
            setError('')

            const response = await fetch(
                'http://localhost:8000/api/organizacion/integrantes-directiva/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        directiva: directivaId,
                        usuario: Number(usuarioSeleccionado),
                        cargo: Number(cargoSeleccionado),
                        fecha_inicio: new Date()
                            .toISOString()
                            .slice(0, 10),
                        activo: true,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.usuario?.[0] ??
                    data.cargo?.[0] ??
                    'No fue posible asignar el integrante.',
                )
            }

            setIntegrantesActuales((actuales) => [
                ...actuales,
                data as IntegranteDirectivaActual,
            ])

            setUsuariosElegibles((actuales) =>
                actuales.filter(
                    (usuario) =>
                        usuario.id !== Number(usuarioSeleccionado),
                ),
            )

            setUsuarioSeleccionado('')
            setCargoSeleccionado('')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setGuardandoAsignacion(false)
        }
    }

    const reasignarCargoIntegrante = async () => {
        if (
            integranteReasignando === null ||
            !nuevoCargoSeleccionado
        ) {
            setError(
                'Debe seleccionar un nuevo cargo.',
            )
            return
        }

        try {
            setReasignandoCargo(true)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/organizacion/integrantes-directiva/${integranteReasignando.id}/reasignar/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cargo: Number(nuevoCargoSeleccionado),
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    data.cargo?.[0] ??
                    'No fue posible reasignar el cargo.',
                )
            }

            setIntegrantesActuales((actuales) =>
                actuales.map((integrante) =>
                    integrante.id === integranteReasignando.id
                        ? (data as IntegranteDirectivaActual)
                        : integrante,
                ),
            )

            setIntegranteReasignando(null)
            setNuevoCargoSeleccionado('')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setReasignandoCargo(false)
        }
    }
    const desactivarIntegrante = async (
        integrante: IntegranteDirectivaActual,
    ) => {
        try {
            setDesactivandoId(integrante.id)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/organizacion/integrantes-directiva/${integrante.id}/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        activo: false,
                    }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible desactivar al integrante.',
                )
            }

            setIntegrantesActuales((actuales) =>
                actuales.filter(
                    (item) => item.id !== integrante.id,
                ),
            )

            if (directivaId !== null) {
                const responseElegibles = await fetch(
                    `http://localhost:8000/api/organizacion/directivas/${directivaId}/usuarios-elegibles/`,
                    {
                        credentials: 'include',
                    },
                )

                if (responseElegibles.ok) {
                    const usuariosActualizados =
                        (await responseElegibles.json()) as UsuarioElegible[]

                    setUsuariosElegibles(usuariosActualizados)
                }
            }

            setIntegranteADesactivar(null)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setDesactivandoId(null)
        }
    }
    const sectoresIntegrantesDisponibles = integrantesActuales
        .filter(
            (integrante) =>
                integrante.sector_id !== null &&
                integrante.sector_nombre,
        )
        .reduce<{ id: number; nombre: string }[]>(
            (acumulador, integrante) => {
                const yaExiste = acumulador.some(
                    (sector) =>
                        sector.id === integrante.sector_id,
                )

                if (!yaExiste) {
                    acumulador.push({
                        id: integrante.sector_id as number,
                        nombre: integrante.sector_nombre as string,
                    })
                }

                return acumulador
            },
            [],
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es'),
        )

    const integrantesFiltrados =
        integrantesActuales.filter((integrante) => {
            if (filtroSectorIntegrantes === 'TODOS') {
                return true
            }

            if (filtroSectorIntegrantes === 'SIN_SECTOR') {
                return integrante.sector_id === null
            }

            return (
                integrante.sector_id ===
                Number(filtroSectorIntegrantes)
            )
        })
    const esPresidenteSesion = integrantesActuales.some(
        (integrante) =>
            integrante.usuario === usuarioSesionId &&
            integrante.activo &&
            integrante.cargo_codigo === 'PRESIDENCIA',
    )
    return (
        <main className="gestion-bosque min-h-screen px-4 py-8">
            <style>{`
                .gestion-bosque { position:relative; isolation:isolate; min-height:100vh; color:#f7efd9; background:#091b17; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
                .gestion-bosque::before { content:""; position:fixed; inset:0; z-index:-1; background:linear-gradient(110deg,rgba(4,24,19,.85),rgba(5,35,26,.68) 48%,rgba(4,23,20,.91)),url("/images/photo-1486406146926-c627a92ad1ab.jpg") center/cover no-repeat; }
                .gestion-bosque > section { position:relative; z-index:1; }
                .gestion-bosque .gestion-hero { border:1px solid rgba(220,179,92,.46); background:linear-gradient(95deg,rgba(4,30,22,.92),rgba(11,40,32,.72)),url("/images/photo-1497366811353-6870744d04b2.jpg") center/cover; box-shadow:0 14px 42px rgba(0,0,0,.25); }
                .gestion-bosque h1,.gestion-bosque h2,.gestion-bosque h3 { font-family:Georgia,"Times New Roman",serif; color:#fbf2dc; letter-spacing:-.02em; }
                .gestion-bosque h1 {font-size:clamp(2rem,4vw,3.2rem);line-height:1.12;}
                .gestion-bosque .gestion-hero p { color:#e2e8d8; }
                .gestion-bosque .gestion-estadisticas > div { min-height:142px; border:1px solid rgba(224,183,92,.44); border-radius:20px; color:#fff3d5; box-shadow:0 12px 25px rgba(0,0,0,.18); }
                .gestion-bosque .gestion-estadisticas > div:nth-child(1) { background:linear-gradient(120deg,rgba(6,34,26,.91),rgba(9,45,35,.74)),url("/images/photo-1527576539890-dfa815648363.jpg") center/cover; }
                .gestion-bosque .gestion-estadisticas > div:nth-child(2) { background:linear-gradient(120deg,rgba(6,34,26,.89),rgba(9,45,35,.77)),url("/images/photo-1560518883-ce09059eeffa.jpg") center/cover; }
                .gestion-bosque .gestion-estadisticas > div:nth-child(3) { background:linear-gradient(120deg,rgba(6,34,26,.91),rgba(9,45,35,.75)),url("/images/photo-1497366754035-f200968a6e72.jpg") center/cover; }
                .gestion-bosque .gestion-estadisticas .text-3xl { color:#ffe29a; font-family:Georgia,"Times New Roman",serif; font-size:2.4rem; }
                .gestion-bosque .gestion-panel { border:1px solid rgba(220,179,92,.45); border-radius:22px; box-shadow:0 16px 36px rgba(0,0,0,.28); background-color:rgba(10,37,28,.92); }
                .gestion-bosque .gestion-miembros { background:linear-gradient(105deg,rgba(5,34,27,.96),rgba(8,44,33,.89)),url("/images/photo-1497366754035-f200968a6e72.jpg") center/cover; }
                .gestion-bosque .gestion-asignar { background:linear-gradient(110deg,rgba(8,39,29,.95),rgba(10,46,34,.85)),url("/images/photo-1524758631624-e2822e304c36.jpg") center/cover; }
                .gestion-bosque .gestion-reasignar { background:linear-gradient(110deg,rgba(8,39,29,.97),rgba(10,46,34,.9)),url("/images/photo-1497366412874-3415097a27e7.jpg") center/cover; }
                .gestion-bosque .gestion-elegibles { background:linear-gradient(110deg,rgba(8,39,29,.97),rgba(10,46,34,.90)),url("/images/photo-1486406146926-c627a92ad1ab.jpg") center/cover; }
                .gestion-bosque .gestion-panel > div:first-child {border-bottom-color:rgba(230,194,110,.28);}
                .gestion-bosque p,.gestion-bosque td,.gestion-bosque th,.gestion-bosque label,.gestion-bosque span { color:inherit; }
                .gestion-bosque [class~="text-base-content/50"],.gestion-bosque [class~="text-base-content/60"],.gestion-bosque [class~="text-base-content/70"],.gestion-bosque [class~="text-base-content/40"],.gestion-bosque [class~="text-base-content/45"] { color:#d8dfd1; }
                .gestion-bosque .badge {border-radius:999px;border-color:rgba(228,190,99,.5);background:rgba(19,68,47,.72);color:#fbe4ac;font-weight:650;}
                .gestion-bosque .badge-success {border-color:#7ccba4;background:rgba(27,100,65,.78);color:#d0f6df;}
                .gestion-bosque .badge-warning {border-color:#d7ac58;color:#ffe0a1;background:rgba(83,60,22,.77);}
                .gestion-bosque .badge-error {border-color:#f09990;color:#ffe2df;background:rgba(116,37,36,.76);}
                .gestion-bosque .btn {border-radius:12px;min-height:40px;transition:filter .2s,transform .2s;}
                .gestion-bosque .btn:hover:not(:disabled) {filter:brightness(1.09);transform:translateY(-1px);}
                .gestion-bosque .btn-primary {background:linear-gradient(100deg,#f2d88d,#d5ae55);border:1px solid #efd18b;color:#193123;font-weight:750;}
                .gestion-bosque .btn-outline {border:1px solid rgba(226,188,101,.72);background:rgba(10,43,31,.85);color:#fce8b7;}
                .gestion-bosque .btn-error {background:rgba(115,32,32,.78);border-color:#c87871;color:#ffe4e0;}
                .gestion-bosque .select,.gestion-bosque .input,.gestion-bosque .textarea {background:rgba(250,248,236,.97);border:1px solid #c9b67e;border-radius:11px;color:#173426;min-height:44px;max-width:100%;}
                .gestion-bosque .select option {color:#193327;background:#fffaf0;}
                .gestion-bosque .select:focus,.gestion-bosque .input:focus {outline:2px solid #e0be6e;outline-offset:1px;}
                .gestion-bosque .label-text {color:#eee7cd;font-weight:650;}
                .gestion-bosque table {color:#f7eed8;border-collapse:separate;border-spacing:0;}
                .gestion-bosque thead {background:rgba(3,21,17,.72);}
                .gestion-bosque th {font-weight:700;color:#f0d48d;}
                .gestion-bosque td {border-color:rgba(231,197,118,.18);}
                .gestion-bosque tbody tr:hover {background:rgba(202,170,89,.09);}
                .gestion-bosque [class~="bg-base-200/60"],.gestion-bosque [class~="bg-base-200/50"] {background-color:rgba(4,22,18,.55);}
                .gestion-bosque .alert {border:1px solid rgba(229,184,92,.42);background:rgba(13,57,40,.90);color:#fff0d3;border-radius:14px;}
                .gestion-bosque .alert-error {border-color:#e19a85;background:rgba(111,35,35,.95);color:#ffe9e6;}
                .gestion-bosque .alert-warning {border-color:#e0b76d;background:rgba(74,53,18,.85);color:#ffe8bf;}
                .gestion-bosque .gestion-modal {z-index:1000;backdrop-filter:blur(5px);}
                .gestion-bosque .gestion-modal-caja {background:linear-gradient(145deg,rgba(13,49,36,.99),rgba(7,28,23,.99));border:1px solid #d0a65f;color:#f8efd7;max-height:90vh;overflow:auto;}
                .gestion-bosque .gestion-modal-caja [class*="bg-base-200"] {background:rgba(4,22,17,.62);}
                @media(max-width:640px){ .gestion-bosque {padding:16px 12px;} .gestion-bosque .gestion-panel .p-6 {padding:1rem;} .gestion-bosque .gestion-hero{padding:1.3rem;} .gestion-bosque table {font-size:.85rem;} }

                /* Identidad cromática profesional: cada sección mantiene una función clara. */
                .gestion-bosque {
                    --gestion-violeta:#bda9fa;
                    --gestion-verde:#83e1ae;
                    --gestion-celeste:#83d5f2;
                    --gestion-ambar:#f5c778;
                    --gestion-rojo:#f4a0a2;
                }
                .gestion-bosque .gestion-estadisticas > div {
                    position:relative; overflow:hidden; border-width:1px;
                    border-top-width:4px; padding-top:17px;
                    transition:transform .2s ease,box-shadow .2s ease;
                }
                .gestion-bosque .gestion-estadisticas > div:hover {
                    transform:translateY(-3px);box-shadow:0 18px 35px rgba(0,0,0,.32);
                }
                .gestion-bosque .gestion-estadisticas > div:nth-child(1) {
                    border-color:rgba(189,169,250,.61); border-top-color:var(--gestion-violeta);
                    background-image:linear-gradient(112deg,rgba(28,24,54,.94),rgba(15,39,41,.85)),url("/images/photo-1527576539890-dfa815648363.jpg");
                }
                .gestion-bosque .gestion-estadisticas > div:nth-child(2) {
                    border-color:rgba(131,225,174,.58); border-top-color:var(--gestion-verde);
                    background-image:linear-gradient(112deg,rgba(8,47,35,.96),rgba(10,45,35,.79)),url("/images/photo-1560518883-ce09059eeffa.jpg");
                }
                .gestion-bosque .gestion-estadisticas > div:nth-child(3) {
                    border-color:rgba(131,213,242,.58); border-top-color:var(--gestion-celeste);
                    background-image:linear-gradient(112deg,rgba(9,41,51,.96),rgba(8,45,43,.83)),url("/images/photo-1497366754035-f200968a6e72.jpg");
                }
                .gestion-bosque .gestion-estadisticas > div:nth-child(1) .text-3xl {color:#d9cbff;}
                .gestion-bosque .gestion-estadisticas > div:nth-child(2) .text-3xl {color:#a1f3c6;}
                .gestion-bosque .gestion-estadisticas > div:nth-child(3) .text-3xl {color:#a7e7fb;}
                .gestion-bosque .gestion-estadisticas > div:nth-child(1) .badge {background:#554481;color:#f4edff;border-color:#c9b5ff;}
                .gestion-bosque .gestion-estadisticas > div:nth-child(2) .badge {background:#215b42;color:#d9ffe9;border-color:#80e2ad;}
                .gestion-bosque .gestion-estadisticas > div:nth-child(3) .badge {background:#1c5264;color:#e0f8ff;border-color:#81d9fa;}
                .gestion-bosque .gestion-panel {border-top-width:4px;}
                .gestion-bosque .gestion-miembros {border-top-color:var(--gestion-violeta);}
                .gestion-bosque .gestion-asignar {border-top-color:var(--gestion-verde);}
                .gestion-bosque .gestion-reasignar {border-top-color:var(--gestion-ambar);}
                .gestion-bosque .gestion-elegibles {border-top-color:var(--gestion-celeste);}
                .gestion-bosque .gestion-miembros h2 {color:#d8cafa;}
                .gestion-bosque .gestion-asignar h2 {color:#a1f3c6;}
                .gestion-bosque .gestion-reasignar h2 {color:#f9d690;}
                .gestion-bosque .gestion-elegibles h2 {color:#a8e7fb;}
                .gestion-bosque .badge-info {background:rgba(25,82,103,.88);border-color:#80d5f2;color:#d9f5ff;}
                .gestion-bosque .badge-primary {background:rgba(81,64,124,.82);border-color:#bda9fa;color:#f0eaff;}
                .gestion-bosque .badge-success {background:rgba(26,102,65,.88);border-color:#83e1ae;color:#e3ffef;}
                .gestion-bosque .badge-warning {background:rgba(113,78,27,.83);border-color:#f5c778;color:#fff0c9;}
                .gestion-bosque .badge-error {background:rgba(117,37,45,.90);border-color:#f4a0a2;color:#ffe8e8;}
                .gestion-bosque .badge-ghost {background:rgba(94,105,106,.35);border-color:rgba(199,217,211,.3);color:#e5ece7;}
                .gestion-bosque .gestion-miembros .btn-outline:not(.btn-error) {border-color:var(--gestion-violeta);color:#ebdcff;background:rgba(65,45,102,.5);}
                .gestion-bosque .gestion-miembros .btn-outline:not(.btn-error):hover {background:rgba(112,85,167,.6);}
                .gestion-bosque .gestion-asignar .btn-primary {background:linear-gradient(110deg,#a6ecc1,#62c793);border-color:#8fe4b2;color:#123522;}
                .gestion-bosque .gestion-reasignar .btn-primary {background:linear-gradient(110deg,#f8d99a,#e7b45e);border-color:#f5d28a;color:#382709;}
                .gestion-bosque .btn-error, .gestion-bosque .btn-error.btn-outline {background:rgba(115,36,42,.9);border:1px solid #f09da1;color:#ffe5e5;}
                .gestion-bosque .btn-error:hover:not(:disabled) {background:#a8434d;color:white;}
                .gestion-bosque .btn:focus-visible,.gestion-bosque .select:focus-visible {outline:3px solid #f2d286;outline-offset:3px;}
                .gestion-bosque .gestion-elegibles tbody tr:nth-child(even),
                .gestion-bosque .gestion-miembros tbody tr:nth-child(even) {background:rgba(100,126,112,.08);}
                .gestion-bosque .gestion-modal-caja {border-top:4px solid var(--gestion-rojo);}
                .gestion-bosque .gestion-modal-caja h3 {color:#ffd4d5;}
                @media(prefers-reduced-motion:reduce) {
                    .gestion-bosque .gestion-estadisticas > div,.gestion-bosque .btn {transition:none;}
                    .gestion-bosque .gestion-estadisticas > div:hover,.gestion-bosque .btn:hover {transform:none;}
                }
            `}</style>

            <section className="mx-auto w-full max-w-6xl">
                {/* Encabezado */}
                <div className="gestion-hero mb-6 rounded-2xl border p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Gestión de Directiva
                                </h1>

                                <span className="badge badge-primary badge-lg">
                                    Directiva
                                </span>

                                {directivaIdDesdeUrl && (
                                    <span className="badge badge-secondary badge-outline badge-lg">
                                        Administración
                                    </span>
                                )}
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administración de integrantes y cargos de la directiva vigente.
                            </p>
                        </div>

                        <Link
                            to={
                                directivaIdDesdeUrl
                                    ? '/admin/directivas'
                                    : '/directiva'
                            }
                            className="btn btn-outline"
                        >
                            ←{' '}
                            {directivaIdDesdeUrl
                                ? 'Volver a Gestión de Directivas'
                                : 'Volver al Panel'}
                        </Link>
                    </div>
                </div>

                {/* Estado de carga */}
                {cargando && (
                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
                        <span className="loading loading-spinner loading-sm" />
                        <span>
                            Cargando información de la directiva...
                        </span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                {!cargando && !error && (
                    <>
                        {/* Resumen */}
                        <div className="gestion-estadisticas mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Integrantes actuales
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {integrantesActuales.length}
                                    </span>

                                    <span className="badge badge-primary badge-outline">
                                        Activos
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                                <p className="text-sm font-medium text-base-content/60">
                                    Usuarios elegibles
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {usuariosElegibles.length}
                                    </span>

                                    <span className="badge badge-success badge-outline">
                                        Disponibles
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                                <p className="text-sm font-medium text-base-content/60">
                                    Cargos disponibles
                                </p>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-3xl font-bold">
                                        {cargos.length}
                                    </span>

                                    <span className="badge badge-info badge-outline">
                                        Activos
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Integrantes actuales */}
                        <div className="gestion-panel gestion-miembros mb-6 overflow-hidden rounded-2xl border shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Integrantes actuales
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Miembros activos y cargos asignados dentro de la directiva.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-end gap-3">
                                        <label className="form-control w-52">
                                            <div className="label">
                                                <span className="label-text font-medium">
                                                    Sector
                                                </span>
                                            </div>

                                            <select
                                                className="select select-bordered w-full"
                                                value={filtroSectorIntegrantes}
                                                onChange={(event) =>
                                                    setFiltroSectorIntegrantes(
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="TODOS">
                                                    Todos los sectores
                                                </option>

                                                {sectoresIntegrantesDisponibles.map(
                                                    (sector) => (
                                                        <option
                                                            key={sector.id}
                                                            value={String(sector.id)}
                                                        >
                                                            {sector.nombre}
                                                        </option>
                                                    ),
                                                )}

                                                {integrantesActuales.some(
                                                    (integrante) =>
                                                        integrante.sector_id === null,
                                                ) && (
                                                        <option value="SIN_SECTOR">
                                                            Sin sector
                                                        </option>
                                                    )}
                                            </select>
                                        </label>

                                        <span className="badge badge-outline badge-lg">
                                            {integrantesFiltrados.length}{' '}
                                            {integrantesFiltrados.length === 1
                                                ? 'integrante'
                                                : 'integrantes'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[820px]">
                                    <thead className="bg-base-200/60">
                                        <tr>
                                            <th className="pl-6">Nombre</th>
                                            <th>Usuario</th>
                                            <th>Sector</th>
                                            <th>Cargo</th>
                                            <th>Estado</th>
                                            <th className="pr-6 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {integrantesFiltrados.map((integrante) => (
                                            <tr
                                                key={integrante.id}
                                                className="transition-colors hover:bg-base-200/50"
                                            >
                                                <td className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                            {(
                                                                integrante.usuario_nombres ||
                                                                integrante.usuario_username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {[
                                                                    integrante.usuario_nombres,
                                                                    integrante.usuario_apellido_paterno,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' ') || '-'}
                                                            </p>

                                                            <p className="text-xs text-base-content/50">
                                                                Integrante de directiva
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="font-medium">
                                                    {integrante.usuario_username}
                                                </td>
                                                <td>
                                                    {integrante.sector_nombre ? (
                                                        <span className="badge badge-info badge-outline">
                                                            {integrante.sector_nombre}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-base-content/40">
                                                            Sin sector
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="badge badge-outline">
                                                        {integrante.cargo_nombre}
                                                    </span>
                                                </td>

                                                <td>
                                                    {integrante.activo ? (
                                                        <span className="badge badge-success">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-ghost">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        {usuarioSesionId === integrante.usuario ? (
                                                            <span className="badge badge-ghost">
                                                                Tu cuenta
                                                            </span>
                                                        ) : directivaIdDesdeUrl || esPresidenteSesion ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline"
                                                                    disabled={
                                                                        desactivandoId === integrante.id
                                                                    }
                                                                    onClick={() => {
                                                                        setIntegranteReasignando(integrante)
                                                                        setNuevoCargoSeleccionado('')
                                                                    }}
                                                                >
                                                                    Reasignar cargo
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-error btn-outline"
                                                                    disabled={
                                                                        desactivandoId === integrante.id
                                                                    }
                                                                    onClick={() => {
                                                                        setIntegranteADesactivar(integrante)
                                                                    }}
                                                                >
                                                                    {desactivandoId === integrante.id ? (
                                                                        <>
                                                                            <span className="loading loading-spinner loading-xs" />
                                                                            Desactivando...
                                                                        </>
                                                                    ) : (
                                                                        'Desactivar'
                                                                    )}
                                                                </button>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {integrantesFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-10 text-center text-base-content/60"
                                                >
                                                    No existen integrantes registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Asignar integrante */}
                        <div className="gestion-panel gestion-asignar mb-6 overflow-hidden rounded-2xl border shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl font-bold">
                                                Asignar integrante
                                            </h2>

                                            <span className="badge badge-primary badge-outline">
                                                Nueva incorporación
                                            </span>
                                        </div>

                                        <p className="text-base-content/60">
                                            Selecciona un usuario elegible y el cargo que ocupará en la directiva.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {usuariosElegibles.length === 0 ? (
                                    <div className="alert">
                                        <span>
                                            No existen usuarios elegibles para asignar a la Directiva.
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Usuario
                                                    </span>
                                                </div>

                                                <select
                                                    className="select select-bordered w-full"
                                                    value={usuarioSeleccionado}
                                                    onChange={(event) =>
                                                        setUsuarioSeleccionado(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione un usuario
                                                    </option>

                                                    {usuariosElegibles.map((usuario) => (
                                                        <option
                                                            key={usuario.id}
                                                            value={usuario.id}
                                                        >
                                                            {[
                                                                usuario.nombres,
                                                                usuario.apellido_paterno,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' ') || usuario.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="form-control">
                                                <div className="label">
                                                    <span className="label-text font-semibold">
                                                        Cargo
                                                    </span>
                                                </div>

                                                <select
                                                    className="select select-bordered w-full"
                                                    value={cargoSeleccionado}
                                                    onChange={(event) =>
                                                        setCargoSeleccionado(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione un cargo
                                                    </option>

                                                    {cargos.map((cargo) => (
                                                        <option
                                                            key={cargo.id}
                                                            value={cargo.id}
                                                        >
                                                            {cargo.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={
                                                    guardandoAsignacion ||
                                                    !usuarioSeleccionado ||
                                                    !cargoSeleccionado
                                                }
                                                onClick={() =>
                                                    void asignarIntegrante()
                                                }
                                            >
                                                {guardandoAsignacion && (
                                                    <span className="loading loading-spinner loading-sm" />
                                                )}

                                                {guardandoAsignacion
                                                    ? 'Asignando...'
                                                    : 'Asignar integrante'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Reasignación de cargo */}
                        {integranteReasignando && (
                            <div className="gestion-panel gestion-reasignar mb-6 overflow-hidden rounded-2xl border shadow-sm">
                                <div className="border-b border-base-300 p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-bold">
                                                    Reasignar cargo
                                                </h2>

                                                <span className="badge badge-warning badge-outline">
                                                    Cambio de cargo
                                                </span>
                                            </div>

                                            <p className="text-base-content/60">
                                                Selecciona el nuevo cargo para el integrante indicado.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-5 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl bg-base-200/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                Usuario
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {integranteReasignando.usuario_username}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-base-200/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                Cargo actual
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {integranteReasignando.cargo_nombre}
                                            </p>
                                        </div>
                                    </div>

                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text font-semibold">
                                                Nuevo cargo
                                            </span>
                                        </div>

                                        <select
                                            className="select select-bordered w-full"
                                            value={nuevoCargoSeleccionado}
                                            onChange={(event) =>
                                                setNuevoCargoSeleccionado(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Seleccione un cargo
                                            </option>

                                            {cargos
                                                .filter((cargo) => {
                                                    if (
                                                        cargo.id === integranteReasignando.cargo
                                                    ) {
                                                        return false
                                                    }

                                                    if (cargo.permite_multiples) {
                                                        return true
                                                    }

                                                    const cargoOcupado =
                                                        integrantesActuales.some(
                                                            (integrante) =>
                                                                integrante.activo &&
                                                                integrante.cargo === cargo.id &&
                                                                integrante.id !==
                                                                integranteReasignando.id,
                                                        )

                                                    return !cargoOcupado
                                                })
                                                .map((cargo) => (
                                                    <option
                                                        key={cargo.id}
                                                        value={cargo.id}
                                                    >
                                                        {cargo.nombre}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>

                                    {cargos.filter((cargo) => {
                                        if (
                                            cargo.id === integranteReasignando.cargo
                                        ) {
                                            return false
                                        }

                                        if (cargo.permite_multiples) {
                                            return true
                                        }

                                        return !integrantesActuales.some(
                                            (integrante) =>
                                                integrante.activo &&
                                                integrante.cargo === cargo.id &&
                                                integrante.id !==
                                                integranteReasignando.id,
                                        )
                                    }).length === 0 && (
                                            <div className="alert alert-warning mt-4">
                                                <span>
                                                    No existen otros cargos disponibles para reasignar.
                                                </span>
                                            </div>
                                        )}

                                    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            disabled={reasignandoCargo}
                                            onClick={() => {
                                                setIntegranteReasignando(null)
                                                setNuevoCargoSeleccionado('')
                                            }}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={
                                                reasignandoCargo ||
                                                !nuevoCargoSeleccionado
                                            }
                                            onClick={() =>
                                                void reasignarCargoIntegrante()
                                            }
                                        >
                                            {reasignandoCargo && (
                                                <span className="loading loading-spinner loading-sm" />
                                            )}

                                            {reasignandoCargo
                                                ? 'Reasignando...'
                                                : 'Confirmar reasignación'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Usuarios elegibles */}
                        <div className="gestion-panel gestion-elegibles overflow-hidden rounded-2xl border shadow-sm">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Usuarios elegibles
                                        </h2>

                                        <p className="mt-1 text-base-content/60">
                                            Vecinos que actualmente pueden ser asignados a la directiva.
                                        </p>
                                    </div>

                                    <span className="badge badge-outline badge-lg">
                                        {usuariosElegibles.length}{' '}
                                        {usuariosElegibles.length === 1
                                            ? 'disponible'
                                            : 'disponibles'}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[760px]">
                                    <thead className="bg-base-200/60">
                                        <tr>
                                            <th className="pl-6">Nombre</th>
                                            <th>Usuario</th>
                                            <th>RUT</th>
                                            <th className="pr-6">Sector</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {usuariosElegibles.map((usuario) => (
                                            <tr
                                                key={usuario.id}
                                                className="transition-colors hover:bg-base-200/50"
                                            >
                                                <td className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-700">
                                                            {(
                                                                usuario.nombres ||
                                                                usuario.username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {[
                                                                    usuario.nombres,
                                                                    usuario.apellido_paterno,
                                                                    usuario.apellido_materno,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' ') || '-'}
                                                            </p>

                                                            <p className="text-xs text-base-content/50">
                                                                {usuario.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="font-medium">
                                                    {usuario.username}
                                                </td>

                                                <td>
                                                    {usuario.rut ?? '-'}
                                                </td>

                                                <td className="pr-6">
                                                    <span className="badge badge-ghost">
                                                        {usuario.sector_nombre}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {usuariosElegibles.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-10 text-center text-base-content/60"
                                                >
                                                    No existen usuarios elegibles para asignar a la Directiva.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
                {integranteADesactivar && (
                    <div className="gestion-modal fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
                        <div className="gestion-modal-caja w-full max-w-md rounded-2xl border shadow-2xl">
                            <div className="border-b border-base-300 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                                        <span className="text-2xl font-bold">!</span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Desactivar integrante
                                        </h3>

                                        <p className="mt-1 text-sm text-base-content/60">
                                            Esta acción retirará al usuario de la directiva actual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="rounded-xl bg-base-200/60 p-4">
                                    <p className="text-sm text-base-content/60">
                                        Integrante
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {[
                                            integranteADesactivar.usuario_nombres,
                                            integranteADesactivar.usuario_apellido_paterno,
                                        ]
                                            .filter(Boolean)
                                            .join(' ') ||
                                            integranteADesactivar.usuario_username}
                                    </p>

                                    <p className="mt-1 text-sm text-base-content/50">
                                        {integranteADesactivar.cargo_nombre}
                                    </p>
                                </div>

                                <div className="alert alert-warning mt-5">
                                    <span>
                                        El integrante dejará de pertenecer a la directiva
                                        y su rol Directiva será desactivado si no posee
                                        otra asignación activa.
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-base-300 p-6">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={
                                        desactivandoId === integranteADesactivar.id
                                    }
                                    onClick={() =>
                                        setIntegranteADesactivar(null)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-error"
                                    disabled={
                                        desactivandoId === integranteADesactivar.id
                                    }
                                    onClick={() => {
                                        void desactivarIntegrante(
                                            integranteADesactivar,
                                        )
                                    }}
                                >
                                    {desactivandoId ===
                                        integranteADesactivar.id ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Desactivando...
                                        </>
                                    ) : (
                                        'Sí, desactivar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}

export default GestionDirectivaPage
