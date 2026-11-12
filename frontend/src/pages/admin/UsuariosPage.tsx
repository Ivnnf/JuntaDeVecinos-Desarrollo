import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type RolUsuario = {
    id: number
    nombre: string
    activo: boolean
}

type UsuarioAdministracion = {
    id: number
    username: string
    rut: string | null
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    is_active: boolean
    roles: RolUsuario[]

    sector_id: number | null
    sector_nombre: string | null

    junta_id: number | null
    junta_nombre: string | null

    estado_asociacion_sector:
    | 'PENDIENTE'
    | 'CONFIRMADA'
    | 'RECHAZADA'
    | null
}

type RolDisponible = {
    id: number
    nombre: string
}

type JuntaDisponible = {
    id: number
    nombre: string
}

type SectorDisponible = {
    id: number
    nombre: string
    junta_vecinos: number
}

// Estilos locales integrados: este componente no necesita UsuariosPage.css.
const estilosUsuarios = String.raw`
/* APT | Gestión de Usuarios
   Estilo aislado de esta página: no afecta a otras rutas ni al backend.
   Los fondos se reutilizan desde frontend/public. */

.apt-usuarios {
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

.apt-usuarios > section { position: relative; }

.apt-usuarios h1,
.apt-usuarios h2,
.apt-usuarios h3 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.apt-usuarios h1 {
  font-size: clamp(2.05rem, 3vw, 3.2rem);
}

.apt-usuarios h2 {
  font-size: clamp(1.55rem, 2.5vw, 2.15rem);
}

.apt-usuarios .apt-usuarios-encabezado {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(6, 32, 23, .82), rgba(8, 42, 30, .76)),
    url('/registro-vecino.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(210, 179, 92, .43);
  box-shadow: 0 18px 45px rgba(4, 20, 13, .27);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  overflow: hidden;
  transition: border-color .25s ease;
}

.apt-usuarios .apt-usuarios-encabezado:hover {
  border-color: rgba(235, 205, 123, .65);
}

/* Tarjetas y contenedores de datos existentes */
.apt-usuarios .bg-base-100 {
  background-color: rgba(15, 43, 31, .89);
  border-color: rgba(215, 183, 96, .38);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
}

.apt-usuarios .apt-usuarios-estadisticas > div {
  border-radius: 1.2rem;
  padding: 1.4rem;
  background-color: rgba(16, 43, 32, .91);
  border: 1px solid rgba(215, 183, 96, .4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Fotografía sutil dentro de cada indicador: misma estética de las
   tarjetas del Panel de Administración, conservando el contraste. */
.apt-usuarios .apt-usuarios-estadisticas > div {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .2s ease, transform .2s ease;
}

.apt-usuarios .apt-usuarios-estadisticas > div:hover {
  border-color: rgba(235, 205, 123, .75);
  transform: translateY(-2px);
}

.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/registro-vecino.webp');
}

.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/directivas.webp');
}

.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casitas.webp');
}

.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/gestion-directiva.webp');
}

.apt-usuarios .apt-usuarios-estadisticas .text-3xl {
  color: #f1cf72;
  font-size: 2.2rem;
  font-weight: 800;
}

/* Área inferior: títulos y filtros sobre fotografía tenue. */
.apt-usuarios .apt-usuarios-filtros {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(7, 34, 23, .78), rgba(8, 39, 29, .87)),
    url('/casas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border: 1px solid rgba(215, 183, 96, .43);
  border-radius: 1.35rem;
  padding: 1.4rem;
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Tablas con encabezados oscuros y filas legibles */
/* La fotografía permanece visible discretamente detrás de las filas.
   El encabezado y los datos conservan un contraste suficiente. */
.apt-usuarios .apt-usuarios-tabla {
  border-color: rgba(215, 183, 96, .43);
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 28, 19, .78), rgba(8, 33, 23, .84)),
    url('/casitas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.apt-usuarios .table {
  color: #f4f0e3;
  font-size: .87rem;
}

.apt-usuarios .table thead {
  background: rgba(6, 28, 18, .97);
  color: #f0d78b;
}

.apt-usuarios .table thead th {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .025em;
  padding-block: 1.05rem;
  white-space: nowrap;
}

.apt-usuarios .table tbody tr {
  border-bottom-color: rgba(225, 208, 158, .18);
  background-color: rgba(9, 34, 23, .57);
}

.apt-usuarios .table tbody tr:hover {
  background-color: rgba(65, 67, 38, .74);
}

.apt-usuarios .table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

/* Entradas de formulario: fondo claro para identificar áreas editables */
.apt-usuarios :is(.input, .select, .textarea) {
  color: #142e24;
  background-color: #edf2fa;
  border: 1px solid #c0cdc9;
  border-radius: .7rem;
}

.apt-usuarios :is(.input, .select, .textarea)::placeholder {
  color: #5c6d6a;
}

.apt-usuarios :is(.input, .select, .textarea):focus-visible {
  border-color: #bd9946;
  outline: 2px solid #e3c36b;
  outline-offset: 2px;
}

.apt-usuarios select option {
  color: #17352a;
  background: #f1f4f8;
}

.apt-usuarios :is(.input, .select, .textarea):disabled {
  opacity: .72;
  cursor: not-allowed;
}

.apt-usuarios .label-text,
.apt-usuarios .label-text-alt {
  color: #f1e8d1;
}

/* Marca visual APT: acciones positivas doradas, peligros en rojo. */
.apt-usuarios .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline) {
  background: linear-gradient(110deg, #eddba3, #cba747);
  border: 1px solid #debf72;
  color: #102b20;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(6, 21, 13, .17);
}

.apt-usuarios .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline):hover {
  background: linear-gradient(110deg, #f6e3ae, #ddbc5d);
  color: #0e2a1c;
  filter: brightness(1.03);
}

.apt-usuarios .btn.btn-outline {
  background-color: rgba(225, 196, 114, .07);
  border-color: rgba(225, 196, 114, .65);
  color: #f7ebc7;
}

.apt-usuarios .btn.btn-outline:hover {
  background-color: rgba(220, 187, 95, .18);
  border-color: #ebd186;
  color: #fff8e4;
}

/* Acciones peligrosas deben conservar su semántica. */
.apt-usuarios .btn.btn-error:not(.btn-outline) {
  background: #ab444b;
  border-color: #db8385;
  color: #fff5f3;
}

.apt-usuarios .btn.btn-error.btn-outline {
  color: #ffb0aa;
  border-color: rgba(243, 146, 146, .75);
}

.apt-usuarios .btn:focus-visible,
.apt-usuarios a:focus-visible {
  outline: 2px solid #efd58c;
  outline-offset: 3px;
}

/* Mantener diferencias útiles de estados y alertas. */
.apt-usuarios .badge {
  font-weight: 700;
  border-radius: 999px;
}

.apt-usuarios .badge-outline,
.apt-usuarios .badge-ghost {
  border-color: rgba(223, 195, 110, .55);
  color: #f3dfac;
}

.apt-usuarios .alert-error {
  background-color: rgba(113, 37, 43, .93);
  border: 1px solid rgba(247, 150, 151, .72);
  color: #fff0ee;
}

.apt-usuarios .alert-success {
  background-color: rgba(21, 83, 58, .93);
  border: 1px solid rgba(128, 215, 174, .55);
  color: #edfff4;
}

.apt-usuarios .alert-info,
.apt-usuarios .alert-warning {
  background-color: rgba(88, 70, 35, .9);
  border: 1px solid rgba(235, 202, 119, .59);
  color: #fff5d7;
}

/* Diálogos: misma estética, sin perder formularios ni confirmaciones. */
.apt-usuarios .modal-box {
  background: linear-gradient(135deg, #18382a, #11291e);
  border: 1px solid rgba(223, 189, 100, .65);
  color: #f5efdd;
  border-radius: 1.3rem;
  box-shadow: 0 28px 80px rgba(0, 10, 5, .55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.apt-usuarios .modal-box .bg-base-200\/60 {
  background-color: rgba(7, 30, 19, .65);
  border: 1px solid rgba(225, 199, 124, .22);
}

.apt-usuarios .modal-backdrop {
  background-color: rgba(2, 13, 9, .58);
}

@media (max-width: 640px) {
  .apt-usuarios {
    background-attachment: scroll;
  }

  .apt-usuarios .apt-usuarios-encabezado {
    padding: 1.3rem;
  }

  .apt-usuarios .table { font-size: .82rem; }
  .apt-usuarios .table thead th { padding-inline: .65rem; }
  .apt-usuarios .table tbody td { padding-inline: .65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apt-usuarios .btn,
  .apt-usuarios .table tbody tr { transition: none; }
}

/* ============================================================
   PALETA PROFESIONAL · Gestión de Usuarios
   Solo presentación: se conservan estados, eventos y API.
   ============================================================ */
.apt-usuarios {
  --apt-violeta: #c7b2fa;
  --apt-verde: #8de0b3;
  --apt-coral: #f4a3ab;
  --apt-celeste: #95d6f6;
  --apt-ambar: #f0cd83;
}
.apt-usuarios .apt-usuarios-encabezado { border-top: 5px solid var(--apt-ambar); }
.apt-usuarios .apt-usuarios-encabezado > div > div:first-child > p { color: #e5ecdf; }
.apt-usuarios .apt-usuarios-estadisticas > div {
  position: relative;
  border-top: 4px solid var(--apt-acento);
  border-color: color-mix(in srgb, var(--apt-acento) 55%, transparent);
  border-top-color: var(--apt-acento);
}
.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(1) { --apt-acento: var(--apt-violeta); }
.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(2) { --apt-acento: var(--apt-verde); }
.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(3) { --apt-acento: var(--apt-coral); }
.apt-usuarios .apt-usuarios-estadisticas > div:nth-child(4) { --apt-acento: var(--apt-celeste); }
.apt-usuarios .apt-usuarios-estadisticas > div .text-3xl {
  color: var(--apt-acento);
  text-shadow: 0 2px 14px rgba(0,0,0,.28);
}
.apt-usuarios .apt-usuarios-estadisticas > div .badge {
  color: var(--apt-acento);
  border: 1px solid color-mix(in srgb, var(--apt-acento) 65%, transparent);
  background: rgba(5,25,18,.62);
}
.apt-usuarios .apt-usuarios-filtros { border-top: 4px solid var(--apt-celeste); }
.apt-usuarios .apt-usuarios-tabla { border-top: 4px solid var(--apt-violeta); }
.apt-usuarios .table thead { color: #dcd0ff; }
.apt-usuarios .table tbody tr:hover { background-color: rgba(50,77,66,.78); }
.apt-usuarios .table tbody tr.bg-warning\/5 { box-shadow: inset 4px 0 0 var(--apt-ambar); }
.apt-usuarios .table tbody td .bg-indigo-500\/10 { background: rgba(199,178,250,.18); color: #e4d7ff; }
.apt-usuarios .table tbody .badge.badge-warning { color: #ffe5a2; border-color: #ddb861; background: rgba(141,94,23,.26); }
.apt-usuarios .table tbody .badge.badge-primary { color: #e3d3ff; border-color: #b69ae6; background: rgba(106,72,158,.27); }
.apt-usuarios .table tbody .badge.badge-success { color: #c5f8d9; border-color: #70d7a1; background: rgba(21,103,57,.29); }
.apt-usuarios .table tbody .badge.badge-info { color: #caf0ff; border-color: #88cbed; background: rgba(29,97,129,.27); }
.apt-usuarios .table tbody .badge.badge-error { color: #ffc7cb; border-color: #e88f98; background: rgba(139,38,51,.28); }
/* Botones de roles: cada perfil mantiene su propia semántica cromática. */
.apt-usuarios .table .btn.btn-warning:not(.btn-outline) { background: linear-gradient(120deg,#f5dfa0,#d4aa4b); border-color:#f0cd83; color:#2a220f; }
.apt-usuarios .table .btn.btn-primary:not(.btn-outline) { background: linear-gradient(120deg,#e1ceff,#b39ae6); border-color:#cab0f5; color:#281b43; }
.apt-usuarios .table .btn.btn-success:not(.btn-outline) { background: linear-gradient(120deg,#bdf4d3,#6bcca0); border-color:#8de0b3; color:#113c2b; }
.apt-usuarios .table .btn.btn-info:not(.btn-outline) { background: linear-gradient(120deg,#c9efff,#80c9e9); border-color:#95d6f6; color:#123648; }
/* Crear cuentas: vecinos en verde y municipales en celeste. */
.apt-usuarios .apt-crear-vecino.btn { background: linear-gradient(120deg,#bdf4d3,#76d5aa); border:1px solid #8de0b3; color:#103725; font-weight:800; }
.apt-usuarios .apt-crear-municipal.btn { background: linear-gradient(120deg,#c8f0ff,#85d0ee); border:1px solid #95d6f6; color:#133547; font-weight:800; }
.apt-usuarios .apt-crear-vecino.btn:hover:not(:disabled),
.apt-usuarios .apt-crear-municipal.btn:hover:not(:disabled) { filter: brightness(1.08); }
/* Acciones generales de tipo confirmación y alertas. */
.apt-usuarios .btn.btn-success.btn-outline { border-color:#79d7a6; color:#c2f6d8; background:rgba(42,123,82,.14); }
.apt-usuarios .btn.btn-error.btn-outline { border-color:#ee9da3; color:#ffbac2; background:rgba(146,43,54,.15); }
.apt-usuarios .alert-info { background:rgba(30,78,100,.89); border-color:#89cfe9; color:#e1f7ff; }
.apt-usuarios .alert-warning { background:rgba(115,83,29,.88); border-color:#e4bd65; color:#fff1c9; }
.apt-usuarios .modal-box { border-top:4px solid var(--apt-celeste); }
.apt-usuarios .modal-box .btn.btn-success:not(.btn-outline) { background:linear-gradient(120deg,#bdf4d3,#77d2a7); border-color:#8de0b3; color:#123b29; }
.apt-usuarios .modal-box .btn.btn-primary:not(.btn-outline) { background:linear-gradient(120deg,#c7eefe,#8accea); border-color:#95d6f6; color:#123547; }
.apt-usuarios .modal-box .btn.btn-warning:not(.btn-outline) { background:linear-gradient(120deg,#f5dfa0,#d4aa4b); border-color:#f0cd83; color:#30240d; }
.apt-usuarios .modal-box .btn.btn-error:not(.btn-outline) { background:#b84855; border-color:#e58d98; color:#fff3f4; }
@media (prefers-reduced-motion: reduce) {
  .apt-usuarios .apt-usuarios-estadisticas > div { transition:none; }
}

`

function UsuariosPage() {

    const [mostrarCrearVecino, setMostrarCrearVecino] =
        useState(false)

    const [creandoVecino, setCreandoVecino] =
        useState(false)

    const [juntas, setJuntas] =
        useState<JuntaDisponible[]>([])

    const [sectores, setSectores] =
        useState<SectorDisponible[]>([])

    const [formVecino, setFormVecino] = useState({
        username: '',
        rut: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: '',
        confirmar_password: '',
        junta_id: '',
        sector_id: '',
    })

    const [mostrarCrearMunicipal, setMostrarCrearMunicipal] =
        useState(false)

    const [creandoMunicipal, setCreandoMunicipal] =
        useState(false)

    const [mensaje, setMensaje] =
        useState('')

    const [formMunicipal, setFormMunicipal] = useState({
        username: '',
        rut: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: '',
        confirmar_password: '',
    })
    const [usuarios, setUsuarios] =
        useState<UsuarioAdministracion[]>([])

    const [roles, setRoles] =
        useState<RolDisponible[]>([])

    const [cargando, setCargando] =
        useState(true)

    const [error, setError] =
        useState('')

    const [juntaSeleccionada, setJuntaSeleccionada] =
        useState('TODAS')

    const [sectorSeleccionado, setSectorSeleccionado] =
        useState('TODOS')

    const [rolSeleccionado, setRolSeleccionado] =
        useState('TODOS')

    const [usuarioActualizando, setUsuarioActualizando] =
        useState<number | null>(null)

    const [usuarioSesionId, setUsuarioSesionId] =
        useState<number | null>(null)

    const [rolActualizando, setRolActualizando] =
        useState<number | null>(null)

    const [confirmacionRol, setConfirmacionRol] =
        useState<{
            usuarioId: number
            rolId: number
            nombreRol: string
            activo: boolean
        } | null>(null)

    const [confirmacionEstado, setConfirmacionEstado] =
        useState<UsuarioAdministracion | null>(null)

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true)
                setError('')

                const [
                    responseUsuarios,
                    responseRoles,
                    responseSesion,
                ] = await Promise.all([
                    fetch(
                        'http://localhost:8000/api/auth/admin/usuarios/',
                        {
                            credentials: 'include',
                        }
                    ),
                    fetch(
                        'http://localhost:8000/api/auth/admin/roles/',
                        {
                            credentials: 'include',
                        }
                    ),
                    fetch(
                        'http://localhost:8000/api/auth/sesion/',
                        {
                            credentials: 'include',
                        }
                    ),
                ])

                if (!responseUsuarios.ok) {
                    throw new Error(
                        'No fue posible cargar los usuarios.'
                    )
                }

                if (!responseRoles.ok) {
                    throw new Error(
                        'No fue posible cargar los roles.'
                    )
                }

                if (!responseSesion.ok) {
                    throw new Error(
                        'No fue posible obtener la sesión actual.'
                    )
                }

                const usuariosData =
                    await responseUsuarios.json()

                const rolesData =
                    await responseRoles.json()

                const sesionData =
                    await responseSesion.json()

                setUsuarios(usuariosData)
                setRoles(rolesData)
                setUsuarioSesionId(sesionData.id)
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

        cargarDatos()
    }, [])

    useEffect(() => {
        const cargarDatosTerritoriales = async () => {
            try {
                const [
                    responseJuntas,
                    responseSectores,
                ] = await Promise.all([
                    fetch(
                        'http://localhost:8000/api/organizacion/registro/juntas-disponibles/',
                        {
                            credentials: 'include',
                        },
                    ),
                    fetch(
                        'http://localhost:8000/api/organizacion/registro/sectores-disponibles/',
                        {
                            credentials: 'include',
                        },
                    ),
                ])

                if (
                    !responseJuntas.ok ||
                    !responseSectores.ok
                ) {
                    throw new Error(
                        'No fue posible cargar juntas y sectores.',
                    )
                }

                const juntasData =
                    await responseJuntas.json()

                const sectoresData =
                    await responseSectores.json()

                setJuntas(juntasData)
                setSectores(sectoresData)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No fue posible cargar la información territorial.',
                )
            }
        }

        void cargarDatosTerritoriales()
    }, [])

    const cambiarEstadoUsuario = async (
        usuario: UsuarioAdministracion
    ) => {
        try {
            setUsuarioActualizando(usuario.id)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/auth/admin/usuarios/${usuario.id}/estado/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_active: !usuario.is_active,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible actualizar el usuario.'
                )
            }

            setUsuarios((usuariosActuales) =>
                usuariosActuales.map((usuarioActual) =>
                    usuarioActual.id === usuario.id
                        ? data.usuario
                        : usuarioActual
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setUsuarioActualizando(null)
        }
    }

    const cambiarRolUsuario = async (
        usuarioId: number,
        rolId: number,
        activo: boolean
    ) => {
        try {
            setRolActualizando(usuarioId)
            setError('')

            const response = await fetch(
                `http://localhost:8000/api/auth/admin/usuarios/${usuarioId}/rol/`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rol_id: rolId,
                        activo: activo,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ??
                    'No fue posible actualizar el rol.'
                )
            }

            setUsuarios((usuariosActuales) =>
                usuariosActuales.map((usuarioActual) =>
                    usuarioActual.id === usuarioId
                        ? data.usuario
                        : usuarioActual
                )
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setRolActualizando(null)
        }
    }
    const crearUsuarioMunicipal = async () => {
        try {
            setCreandoMunicipal(true)
            setError('')
            setMensaje('')

            const response = await fetch(
                'http://localhost:8000/api/auth/admin/usuarios/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formMunicipal),
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

                throw new Error(
                    typeof primerError === 'string'
                        ? primerError
                        : 'No fue posible crear el usuario Municipal.',
                )
            }

            setUsuarios((actuales) => [
                ...actuales,
                data.usuario,
            ])

            setFormMunicipal({
                username: '',
                rut: '',
                nombres: '',
                apellido_paterno: '',
                apellido_materno: '',
                email: '',
                password: '',
                confirmar_password: '',
            })

            setMostrarCrearMunicipal(false)

            setMensaje(
                data.message ??
                'Usuario Municipal creado correctamente.',
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setCreandoMunicipal(false)
        }
    }

    const crearUsuarioVecino = async () => {
        try {
            setCreandoVecino(true)
            setError('')
            setMensaje('')

            const response = await fetch(
                'http://localhost:8000/api/auth/admin/usuarios/vecino/',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formVecino,
                        junta_id: Number(formVecino.junta_id),
                        sector_id: Number(formVecino.sector_id),
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

                throw new Error(
                    typeof primerError === 'string'
                        ? primerError
                        : 'No fue posible crear el vecino.',
                )
            }

            setUsuarios((actuales) => [
                ...actuales,
                data.usuario,
            ])

            setFormVecino({
                username: '',
                rut: '',
                nombres: '',
                apellido_paterno: '',
                apellido_materno: '',
                email: '',
                password: '',
                confirmar_password: '',
                junta_id: '',
                sector_id: '',
            })

            setMostrarCrearVecino(false)

            setMensaje(
                data.message ??
                'Vecino creado y asociado correctamente.',
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.',
            )
        } finally {
            setCreandoVecino(false)
        }
    }

    const obtenerNombreCompleto = (
        usuario: UsuarioAdministracion
    ) => {
        return [
            usuario.nombres,
            usuario.apellido_paterno,
            usuario.apellido_materno,
        ]
            .filter(Boolean)
            .join(' ') || usuario.username
    }

    const obtenerIniciales = (
        usuario: UsuarioAdministracion
    ) => {
        return obtenerNombreCompleto(usuario)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) =>
                parte.charAt(0).toUpperCase()
            )
            .join('')
    }

    const claseRol = (nombreRol: string) => {
        switch (nombreRol) {
            case 'Administrador':
                return 'badge badge-warning badge-outline'
            case 'Directiva':
                return 'badge badge-primary badge-outline'
            case 'Vecino':
                return 'badge badge-success badge-outline'
            case 'Municipal':
                return 'badge badge-info badge-outline'
            default:
                return 'badge badge-outline'
        }
    }

    const claseBotonRol = (
        nombreRol: string,
        activo: boolean
    ) => {
        if (!activo) {
            return 'btn btn-xs btn-outline'
        }

        switch (nombreRol) {
            case 'Administrador':
                return 'btn btn-xs btn-warning'
            case 'Directiva':
                return 'btn btn-xs btn-primary'
            case 'Vecino':
                return 'btn btn-xs btn-success'
            case 'Municipal':
                return 'btn btn-xs btn-info'
            default:
                return 'btn btn-xs btn-success'
        }
    }


    const juntasDisponibles = usuarios
        .reduce<{ id: number; nombre: string }[]>(
            (acumulador, usuario) => {
                if (
                    usuario.junta_id === null ||
                    !usuario.junta_nombre
                ) {
                    return acumulador
                }

                const yaExiste = acumulador.some(
                    (junta) =>
                        junta.id === usuario.junta_id,
                )

                if (!yaExiste) {
                    acumulador.push({
                        id: usuario.junta_id,
                        nombre: usuario.junta_nombre,
                    })
                }

                return acumulador
            },
            [],
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es'),
        )

    const sectoresDisponibles = usuarios
        .filter((usuario) => {
            if (juntaSeleccionada === 'TODAS') {
                return usuario.sector_id !== null
            }

            if (juntaSeleccionada === 'SIN_ASOCIACION') {
                return false
            }

            return (
                usuario.junta_id === Number(juntaSeleccionada) &&
                usuario.sector_id !== null
            )
        })
        .reduce<{ id: number; nombre: string }[]>(
            (acumulador, usuario) => {
                if (
                    usuario.sector_id === null ||
                    !usuario.sector_nombre
                ) {
                    return acumulador
                }

                const yaExiste = acumulador.some(
                    (sector) =>
                        sector.id === usuario.sector_id,
                )

                if (!yaExiste) {
                    acumulador.push({
                        id: usuario.sector_id,
                        nombre: usuario.sector_nombre,
                    })
                }

                return acumulador
            },
            [],
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es'),
        )

    const usuariosFiltrados = usuarios.filter((usuario) => {
        let coincideJunta = true

        if (juntaSeleccionada === 'SIN_ASOCIACION') {
            const esAdministrador = usuario.roles.some(
                (rol) =>
                    rol.nombre === 'Administrador' &&
                    rol.activo,
            )

            coincideJunta =
                usuario.junta_id === null &&
                !esAdministrador
        } else if (juntaSeleccionada !== 'TODAS') {
            coincideJunta =
                usuario.junta_id === Number(juntaSeleccionada)
        }

        const coincideSector =
            sectorSeleccionado === 'TODOS' ||
            usuario.sector_id === Number(sectorSeleccionado)

        const coincideRol =
            rolSeleccionado === 'TODOS' ||
            usuario.roles.some(
                (rol) =>
                    rol.nombre === rolSeleccionado &&
                    rol.activo,
            )

        return (
            coincideJunta &&
            coincideSector &&
            coincideRol
        )
    })

    const usuariosActivosFiltrados =
        usuariosFiltrados.filter(
            (usuario) => usuario.is_active,
        ).length

    const usuariosInactivosFiltrados =
        usuariosFiltrados.length -
        usuariosActivosFiltrados

    const usuariosConRolesFiltrados =
        usuariosFiltrados.filter(
            (usuario) =>
                usuario.roles.some(
                    (rol) => rol.activo,
                ),
        ).length
    const sectoresVecinoDisponibles = sectores.filter(
        (sector) =>
            formVecino.junta_id !== '' &&
            sector.junta_vecinos === Number(formVecino.junta_id),
    )
    return (
        <main className="apt-usuarios min-h-screen px-4 py-8 sm:px-6">
            <style>{estilosUsuarios}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="apt-usuarios-encabezado mb-7 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xl sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Gestión de Usuarios
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra el estado de las cuentas y los roles
                                habilitados para cada usuario de la plataforma.
                            </p>
                        </div>



                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn btn-success apt-crear-vecino"
                                onClick={() => {
                                    setError('')
                                    setMensaje('')
                                    setMostrarCrearVecino(true)
                                }}
                            >
                                + Crear vecino
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary apt-crear-municipal"
                                onClick={() => {
                                    setError('')
                                    setMensaje('')
                                    setMostrarCrearMunicipal(true)
                                }}
                            >
                                + Crear usuario Municipal
                            </button>

                            <Link
                                to="/admin"
                                className="btn btn-outline"
                            >
                                ← Volver al Panel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                {!cargando && (
                    <div className="apt-usuarios-estadisticas mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total usuarios
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosFiltrados.length}
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
                                    {usuariosActivosFiltrados}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-red-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosInactivosFiltrados}
                                </span>

                                <span className="badge badge-error badge-outline">
                                    Inactivos
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Con roles activos
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {usuariosConRolesFiltrados}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Con acceso
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
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

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando usuarios...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <>
                        <div className="apt-usuarios-filtros mb-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Usuarios registrados
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa la información de cada usuario y
                                    administra sus roles y estado.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <label className="form-control w-full sm:w-72">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Junta Vecinal
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={juntaSeleccionada}
                                        onChange={(event) => {
                                            setJuntaSeleccionada(event.target.value)
                                            setSectorSeleccionado('TODOS')
                                        }}
                                    >
                                        <option value="TODAS">
                                            Todas las juntas
                                        </option>

                                        <option value="SIN_ASOCIACION">
                                            Sin asociación
                                        </option>

                                        {juntasDisponibles.map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={String(junta.id)}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control w-full sm:w-64">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Sector
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={sectorSeleccionado}
                                        onChange={(event) =>
                                            setSectorSeleccionado(event.target.value)
                                        }
                                        disabled={
                                            juntaSeleccionada === 'SIN_ASOCIACION'
                                        }
                                    >
                                        <option value="TODOS">
                                            Todos los sectores
                                        </option>

                                        {sectoresDisponibles.map((sector) => (
                                            <option
                                                key={sector.id}
                                                value={String(sector.id)}
                                            >
                                                {sector.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control w-full sm:w-56">
                                    <div className="label">
                                        <span className="label-text font-medium">
                                            Rol
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={rolSeleccionado}
                                        onChange={(event) =>
                                            setRolSeleccionado(event.target.value)
                                        }
                                    >
                                        <option value="TODOS">
                                            Todos los roles
                                        </option>

                                        {roles.map((rol) => (
                                            <option
                                                key={rol.id}
                                                value={rol.nombre}
                                            >
                                                {rol.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {usuariosFiltrados.length > 0 && (
                                    <span className="badge badge-outline badge-lg">
                                        {usuariosFiltrados.length}{' '}
                                        {usuariosFiltrados.length === 1
                                            ? 'usuario'
                                            : 'usuarios'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {usuarios.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-700">
                                        U
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen usuarios registrados
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Los usuarios aparecerán aquí cuando
                                        existan cuentas disponibles para administrar.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="apt-usuarios-tabla overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Usuario</th>
                                                <th>RUT</th>
                                                <th>Junta / Sector</th>
                                                <th>Roles activos</th>
                                                <th>Gestionar roles</th>
                                                <th>Estado</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {usuariosFiltrados.map((usuario) => {
                                                const rolesActivos =
                                                    usuario.roles.filter(
                                                        (rol) => rol.activo
                                                    )

                                                const esUsuarioSesion =
                                                    usuario.id === usuarioSesionId

                                                return (
                                                    <tr
                                                        key={usuario.id}
                                                        className={
                                                            esUsuarioSesion
                                                                ? 'bg-warning/5'
                                                                : 'hover'
                                                        }
                                                    >
                                                        <td>
                                                            <div className="flex min-w-[210px] items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-700">
                                                                    {obtenerIniciales(usuario)}
                                                                </div>

                                                                <div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-semibold">
                                                                            {obtenerNombreCompleto(usuario)}
                                                                        </p>

                                                                        {esUsuarioSesion && (
                                                                            <span className="badge badge-warning badge-xs">
                                                                                Tú
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="mt-1 text-xs text-base-content/50">
                                                                        @{usuario.username}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-base-content/40">
                                                                        {usuario.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap">
                                                            {usuario.rut ?? '-'}
                                                        </td>


                                                        <td>
                                                            <div className="min-w-[180px]">
                                                                {usuario.junta_nombre ? (
                                                                    <>
                                                                        <p className="font-medium leading-tight">
                                                                            {usuario.junta_nombre}
                                                                        </p>

                                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                            <span className="text-xs text-base-content/50">
                                                                                {usuario.sector_nombre ?? 'Sin sector'}
                                                                            </span>

                                                                            {usuario.estado_asociacion_sector === 'PENDIENTE' && (
                                                                                <span className="badge badge-warning badge-xs">
                                                                                    Pendiente
                                                                                </span>
                                                                            )}

                                                                            {usuario.estado_asociacion_sector === 'RECHAZADA' && (
                                                                                <span className="badge badge-error badge-outline badge-xs">
                                                                                    Rechazada
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : rolesActivos.some(
                                                                    (rol) => rol.nombre === 'Administrador',
                                                                ) ? (
                                                                    <span className="badge badge-ghost">
                                                                        No aplica
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <span className="badge badge-warning badge-outline">
                                                                            Sin asociación
                                                                        </span>

                                                                        <p className="mt-1 text-xs text-base-content/40">
                                                                            Sin sector
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {rolesActivos.length > 0 ? (
                                                                <div className="flex min-w-[150px] flex-wrap gap-1.5">
                                                                    {rolesActivos.map((rol) => (
                                                                        <span
                                                                            key={rol.id}
                                                                            className={claseRol(
                                                                                rol.nombre
                                                                            )}
                                                                        >
                                                                            {rol.nombre}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="badge badge-ghost">
                                                                    Sin rol
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td>
                                                            <div className="flex min-w-[210px] flex-wrap gap-2">
                                                                {roles.map((rolDisponible) => {
                                                                    const rolUsuario =
                                                                        usuario.roles.find(
                                                                            (rol) =>
                                                                                rol.id ===
                                                                                rolDisponible.id
                                                                        )

                                                                    const rolActivo =
                                                                        rolUsuario?.activo ?? false

                                                                    const protegido =
                                                                        usuario.id === usuarioSesionId &&
                                                                        rolDisponible.nombre === 'Administrador' &&
                                                                        rolActivo

                                                                    return (
                                                                        <button
                                                                            key={rolDisponible.id}
                                                                            type="button"
                                                                            className={claseBotonRol(
                                                                                rolDisponible.nombre,
                                                                                rolActivo
                                                                            )}
                                                                            disabled={
                                                                                rolActualizando === usuario.id ||
                                                                                protegido
                                                                            }
                                                                            title={
                                                                                protegido
                                                                                    ? 'No puedes desactivar tu propio rol Administrador.'
                                                                                    : rolActivo
                                                                                        ? `Desactivar rol ${rolDisponible.nombre}`
                                                                                        : `Activar rol ${rolDisponible.nombre}`
                                                                            }
                                                                            onClick={() =>
                                                                                setConfirmacionRol({
                                                                                    usuarioId: usuario.id,
                                                                                    rolId: rolDisponible.id,
                                                                                    nombreRol: rolDisponible.nombre,
                                                                                    activo: !rolActivo,
                                                                                })
                                                                            }
                                                                        >
                                                                            {rolActualizando === usuario.id && (
                                                                                <span className="loading loading-spinner loading-xs" />
                                                                            )}

                                                                            {rolDisponible.nombre}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    usuario.is_active
                                                                        ? 'badge badge-success'
                                                                        : 'badge badge-error badge-outline'
                                                                }
                                                            >
                                                                {usuario.is_active
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        usuario.is_active
                                                                            ? 'btn btn-sm btn-error btn-outline'
                                                                            : 'btn btn-sm btn-success btn-outline'
                                                                    }
                                                                    disabled={
                                                                        usuarioActualizando === usuario.id ||
                                                                        usuario.id === usuarioSesionId
                                                                    }
                                                                    title={
                                                                        usuario.id === usuarioSesionId
                                                                            ? 'No puedes deshabilitar tu propia cuenta.'
                                                                            : undefined
                                                                    }
                                                                    onClick={() =>
                                                                        setConfirmacionEstado(usuario)
                                                                    }
                                                                >
                                                                    {usuarioActualizando === usuario.id && (
                                                                        <span className="loading loading-spinner loading-xs" />
                                                                    )}

                                                                    {usuarioActualizando === usuario.id
                                                                        ? 'Actualizando...'
                                                                        : usuario.is_active
                                                                            ? 'Deshabilitar'
                                                                            : 'Habilitar'}
                                                                </button>
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
                    </>
                )}
            </section>

            {/* Modal crear vecino */}
            {mostrarCrearVecino && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl rounded-2xl">
                        <div className="mb-5">
                            <h3 className="text-2xl font-bold">
                                Crear vecino
                            </h3>

                            <p className="mt-1 text-sm text-base-content/60">
                                Registra presencialmente a un vecino y asócialo
                                directamente a su Junta de Vecinos y sector.
                            </p>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                void crearUsuarioVecino()
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombre de usuario
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formVecino.username}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                username: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            RUT
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="12.345.678-5"
                                        value={formVecino.rut}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                rut: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombres
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formVecino.nombres}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                nombres: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido paterno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formVecino.apellido_paterno}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                apellido_paterno:
                                                    event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido materno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formVecino.apellido_materno}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                apellido_materno:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Correo electrónico
                                        </span>
                                    </div>

                                    <input
                                        type="email"
                                        className="input input-bordered w-full"
                                        value={formVecino.email}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                email: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Junta de Vecinos
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={formVecino.junta_id}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                junta_id: event.target.value,
                                                sector_id: '',
                                            }))
                                        }
                                        required
                                    >
                                        <option value="">
                                            Seleccionar Junta
                                        </option>

                                        {juntas.map((junta) => (
                                            <option
                                                key={junta.id}
                                                value={String(junta.id)}
                                            >
                                                {junta.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Sector
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered w-full"
                                        value={formVecino.sector_id}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                sector_id: event.target.value,
                                            }))
                                        }
                                        disabled={!formVecino.junta_id}
                                        required
                                    >
                                        <option value="">
                                            {formVecino.junta_id
                                                ? 'Seleccionar sector'
                                                : 'Primero selecciona una Junta'}
                                        </option>

                                        {sectoresVecinoDisponibles.map(
                                            (sector) => (
                                                <option
                                                    key={sector.id}
                                                    value={String(sector.id)}
                                                >
                                                    {sector.nombre}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Contraseña inicial
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formVecino.password}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                password: event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Confirmar contraseña
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formVecino.confirmar_password}
                                        onChange={(event) =>
                                            setFormVecino((actual) => ({
                                                ...actual,
                                                confirmar_password:
                                                    event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="alert alert-success mt-5">
                                <span>
                                    El usuario será creado con rol Vecino y su
                                    asociación territorial quedará confirmada
                                    automáticamente por el Administrador.
                                </span>
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={creandoVecino}
                                    onClick={() =>
                                        setMostrarCrearVecino(false)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={creandoVecino}
                                >
                                    {creandoVecino && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {creandoVecino
                                        ? 'Creando...'
                                        : 'Crear vecino'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (!creandoVecino) {
                                setMostrarCrearVecino(false)
                            }
                        }}
                    />
                </div>
            )}

            {/* Modal crear usuario Municipal */}
            {mostrarCrearMunicipal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl rounded-2xl">
                        <div className="mb-5">
                            <h3 className="text-2xl font-bold">
                                Crear usuario Municipal
                            </h3>

                            <p className="mt-1 text-sm text-base-content/60">
                                Crea una cuenta institucional con acceso al
                                módulo Municipal. Esta cuenta no quedará
                                asociada a una Junta de Vecinos ni a un sector.
                            </p>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                void crearUsuarioMunicipal()
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">

                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombre de usuario
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.username}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                username: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            RUT
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="12.345.678-5"
                                        value={formMunicipal.rut}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                rut: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Nombres
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.nombres}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                nombres: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido paterno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.apellido_paterno}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                apellido_paterno:
                                                    event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Apellido materno
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.apellido_materno}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                apellido_materno:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Correo electrónico
                                        </span>
                                    </div>

                                    <input
                                        type="email"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.email}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                email: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Contraseña inicial
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.password}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                password: event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>


                                <label className="form-control">
                                    <div className="label">
                                        <span className="label-text font-semibold">
                                            Confirmar contraseña
                                        </span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={formMunicipal.confirmar_password}
                                        onChange={(event) =>
                                            setFormMunicipal((actual) => ({
                                                ...actual,
                                                confirmar_password:
                                                    event.target.value,
                                            }))
                                        }
                                        minLength={8}
                                        required
                                    />
                                </label>
                            </div>


                            <div className="alert alert-info mt-5">
                                <span>
                                    El rol Municipal será asignado
                                    automáticamente al crear la cuenta.
                                </span>
                            </div>


                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={creandoMunicipal}
                                    onClick={() =>
                                        setMostrarCrearMunicipal(false)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creandoMunicipal}
                                >
                                    {creandoMunicipal && (
                                        <span className="loading loading-spinner loading-sm" />
                                    )}

                                    {creandoMunicipal
                                        ? 'Creando...'
                                        : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (!creandoMunicipal) {
                                setMostrarCrearMunicipal(false)
                            }
                        }}
                    />
                </div>
            )}
            {/* Modal cambio de rol */}
            {confirmacionRol && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-2xl">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                                R
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Confirmar cambio de rol
                                </h3>

                                <p className="mt-1 text-sm text-base-content/60">
                                    Verifica la acción antes de continuar.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-base-200/60 p-4">
                            <p>
                                ¿Seguro que deseas{' '}
                                <strong>
                                    {confirmacionRol.activo
                                        ? 'activar'
                                        : 'desactivar'}
                                </strong>{' '}
                                el rol{' '}
                                <strong>
                                    {confirmacionRol.nombreRol}
                                </strong>
                                ?
                            </p>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={rolActualizando !== null}
                                onClick={() =>
                                    setConfirmacionRol(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={rolActualizando !== null}
                                onClick={() => {
                                    const confirmacion =
                                        confirmacionRol

                                    void cambiarRolUsuario(
                                        confirmacion.usuarioId,
                                        confirmacion.rolId,
                                        confirmacion.activo
                                    )

                                    setConfirmacionRol(null)
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (rolActualizando === null) {
                                setConfirmacionRol(null)
                            }
                        }}
                    />
                </div>
            )}

            {/* Modal cambio de estado */}
            {confirmacionEstado && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-2xl">
                        <div className="mb-4 flex items-start gap-3">
                            <div
                                className={
                                    confirmacionEstado.is_active
                                        ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 font-bold text-error'
                                        : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 font-bold text-success'
                                }
                            >
                                !
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Confirmar cambio de estado
                                </h3>

                                <p className="mt-1 text-sm text-base-content/60">
                                    Esta acción modificará el acceso de la cuenta.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-base-200/60 p-4">
                            <p>
                                ¿Seguro que deseas{' '}
                                <strong>
                                    {confirmacionEstado.is_active
                                        ? 'deshabilitar'
                                        : 'habilitar'}
                                </strong>{' '}
                                la cuenta de{' '}
                                <strong>
                                    {confirmacionEstado.username}
                                </strong>
                                ?
                            </p>
                        </div>

                        {confirmacionEstado.is_active && (
                            <div className="alert alert-warning mt-4">
                                <span>
                                    El usuario no podrá ingresar mientras su
                                    cuenta permanezca deshabilitada.
                                </span>
                            </div>
                        )}

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={usuarioActualizando !== null}
                                onClick={() =>
                                    setConfirmacionEstado(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={
                                    confirmacionEstado.is_active
                                        ? 'btn btn-error'
                                        : 'btn btn-success'
                                }
                                disabled={usuarioActualizando !== null}
                                onClick={() => {
                                    const usuario =
                                        confirmacionEstado

                                    void cambiarEstadoUsuario(
                                        usuario
                                    )

                                    setConfirmacionEstado(null)
                                }}
                            >
                                {confirmacionEstado.is_active
                                    ? 'Deshabilitar'
                                    : 'Habilitar'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (usuarioActualizando === null) {
                                setConfirmacionEstado(null)
                            }
                        }}
                    />
                </div>
            )}
        </main>
    )
}

export default UsuariosPage
