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

// Estilos de APT integrados en este archivo; sin CSS independiente.
const estilosJuntas = String.raw`
/* APT | Gestión de Juntas de Vecinos
   Estilo aislado de esta página: no afecta a otras rutas ni al backend.
   Los fondos se reutilizan desde frontend/public. */

.apt-juntas {
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

.apt-juntas > section { position: relative; }

.apt-juntas h1,
.apt-juntas h2,
.apt-juntas h3 {
  color: #fbf4e2;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.apt-juntas h1 {
  font-size: clamp(2.05rem, 3vw, 3.2rem);
}

.apt-juntas h2 {
  font-size: clamp(1.55rem, 2.5vw, 2.15rem);
}

.apt-juntas .apt-juntas-encabezado {
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
.apt-juntas .bg-base-100 {
  background-color: rgba(15, 43, 31, .89);
  border-color: rgba(215, 183, 96, .38);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(5, 25, 16, .22);
}

.apt-juntas .apt-juntas-estadisticas > div {
  border-radius: 1.2rem;
  padding: 1.4rem;
  background-color: rgba(16, 43, 32, .91);
  border: 1px solid rgba(215, 183, 96, .4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Fotografía sutil dentro de cada indicador: misma estética de las
   tarjetas del Panel de Administración, conservando el contraste. */
.apt-juntas .apt-juntas-estadisticas > div {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .2s ease, transform .2s ease;
}

.apt-juntas .apt-juntas-estadisticas > div:hover {
  border-color: rgba(235, 205, 123, .75);
  transform: translateY(-2px);
}

.apt-juntas .apt-juntas-estadisticas > div:nth-child(1) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casas.webp');
}

.apt-juntas .apt-juntas-estadisticas > div:nth-child(2) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/directivas.webp');
}

.apt-juntas .apt-juntas-estadisticas > div:nth-child(3) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/casitas.webp');
}

.apt-juntas .apt-juntas-estadisticas > div:nth-child(4) {
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .80), rgba(8, 34, 24, .86)),
    url('/muni-santiago.webp');
}

.apt-juntas .apt-juntas-estadisticas .text-3xl {
  color: #f1cf72;
  font-size: 2.2rem;
  font-weight: 800;
}

.apt-juntas .apt-juntas-filtros {
  border-top: 1px solid rgba(224, 196, 117, .38);
  padding-top: 1.4rem;
}

/* Tablas con encabezados oscuros y filas legibles */
.apt-juntas .apt-juntas-tabla {
  border-color: rgba(215, 183, 96, .43);
  background-color: rgba(13, 38, 27, .94);
}

.apt-juntas .table {
  color: #f4f0e3;
  font-size: .87rem;
}

.apt-juntas .table thead {
  background: rgba(6, 28, 18, .97);
  color: #f0d78b;
}

.apt-juntas .table thead th {
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .025em;
  padding-block: 1.05rem;
  white-space: nowrap;
}

.apt-juntas .table tbody tr {
  border-bottom-color: rgba(225, 208, 158, .14);
}

.apt-juntas .table tbody tr:hover {
  background-color: rgba(221, 181, 80, .09);
}

.apt-juntas .table tbody td {
  vertical-align: middle;
  line-height: 1.4;
}

/* Entradas de formulario: fondo claro para identificar áreas editables */
.apt-juntas :is(.input, .select, .textarea) {
  color: #142e24;
  background-color: #edf2fa;
  border: 1px solid #c0cdc9;
  border-radius: .7rem;
}

.apt-juntas :is(.input, .select, .textarea)::placeholder {
  color: #5c6d6a;
}

.apt-juntas :is(.input, .select, .textarea):focus-visible {
  border-color: #bd9946;
  outline: 2px solid #e3c36b;
  outline-offset: 2px;
}

.apt-juntas select option {
  color: #17352a;
  background: #f1f4f8;
}

.apt-juntas :is(.input, .select, .textarea):disabled {
  opacity: .72;
  cursor: not-allowed;
}

.apt-juntas .label-text,
.apt-juntas .label-text-alt {
  color: #f1e8d1;
}

/* Marca visual APT: acciones positivas doradas, peligros en rojo. */
.apt-juntas .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline) {
  background: linear-gradient(110deg, #eddba3, #cba747);
  border: 1px solid #debf72;
  color: #102b20;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(6, 21, 13, .17);
}

.apt-juntas .btn:is(.btn-primary, .btn-success, .btn-info, .btn-warning):not(.btn-outline):hover {
  background: linear-gradient(110deg, #f6e3ae, #ddbc5d);
  color: #0e2a1c;
  filter: brightness(1.03);
}

.apt-juntas .btn.btn-outline {
  background-color: rgba(225, 196, 114, .07);
  border-color: rgba(225, 196, 114, .65);
  color: #f7ebc7;
}

.apt-juntas .btn.btn-outline:hover {
  background-color: rgba(220, 187, 95, .18);
  border-color: #ebd186;
  color: #fff8e4;
}

/* Acciones peligrosas deben conservar su semántica. */
.apt-juntas .btn.btn-error:not(.btn-outline) {
  background: #ab444b;
  border-color: #db8385;
  color: #fff5f3;
}

.apt-juntas .btn.btn-error.btn-outline {
  color: #ffb0aa;
  border-color: rgba(243, 146, 146, .75);
}

.apt-juntas .btn:focus-visible,
.apt-juntas a:focus-visible {
  outline: 2px solid #efd58c;
  outline-offset: 3px;
}

/* Mantener diferencias útiles de estados y alertas. */
.apt-juntas .badge {
  font-weight: 700;
  border-radius: 999px;
}

.apt-juntas .badge-outline,
.apt-juntas .badge-ghost {
  border-color: rgba(223, 195, 110, .55);
  color: #f3dfac;
}

.apt-juntas .alert-error {
  background-color: rgba(113, 37, 43, .93);
  border: 1px solid rgba(247, 150, 151, .72);
  color: #fff0ee;
}

.apt-juntas .alert-success {
  background-color: rgba(21, 83, 58, .93);
  border: 1px solid rgba(128, 215, 174, .55);
  color: #edfff4;
}

.apt-juntas .alert-info,
.apt-juntas .alert-warning {
  background-color: rgba(88, 70, 35, .9);
  border: 1px solid rgba(235, 202, 119, .59);
  color: #fff5d7;
}

/* Diálogos: misma estética, sin perder formularios ni confirmaciones. */
.apt-juntas .modal-box {
  background: linear-gradient(135deg, #18382a, #11291e);
  border: 1px solid rgba(223, 189, 100, .65);
  color: #f5efdd;
  border-radius: 1.3rem;
  box-shadow: 0 28px 80px rgba(0, 10, 5, .55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}

.apt-juntas .modal-box .bg-base-200\/60 {
  background-color: rgba(7, 30, 19, .65);
  border: 1px solid rgba(225, 199, 124, .22);
}

.apt-juntas .modal-backdrop {
  background-color: rgba(2, 13, 9, .58);
}

@media (max-width: 640px) {
  .apt-juntas {
    background-attachment: scroll;
  }

  .apt-juntas .apt-juntas-encabezado {
    padding: 1.3rem;
  }

  .apt-juntas .table { font-size: .82rem; }
  .apt-juntas .table thead th { padding-inline: .65rem; }
  .apt-juntas .table tbody td { padding-inline: .65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apt-juntas .btn,
  .apt-juntas .table tbody tr { transition: none; }
}


/* Encabezado del formulario: fotografía de barrio bajo una capa verde. */
.apt-juntas .apt-juntas-formulario > div:first-child {
  background-image:
    linear-gradient(115deg, rgba(9, 36, 26, .78), rgba(9, 36, 26, .85)),
    url('/junta-v.jpg');
  background-position: center;
  background-size: cover;
}
.apt-juntas .apt-juntas-formulario {
  background-color: #102b20;
  background-image:
    linear-gradient(115deg, rgba(8, 34, 24, .92), rgba(8, 34, 24, .89)),
    url('/casitas.webp');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-color: rgba(215, 183, 96, .45);
}
.apt-juntas .apt-juntas-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .32);
}
.apt-juntas .apt-juntas-formulario :is(.bg-base-200\/50, .bg-base-200\/70) {
  background: rgba(8, 30, 20, .60);
  border-color: rgba(215, 183, 96, .35);
}
.apt-juntas .apt-juntas-formulario .checkbox {
  border-color: #e1c577;
}
.apt-juntas .apt-juntas-formulario .checkbox:checked {
  background: #d7b758;
  border-color: #e1c577;
  color: #113124;
}
.apt-juntas .apt-juntas-encabezado .badge-warning {
  color: #182d20;
  background-color: #e5c775;
  border-color: #e5c775;
}
.apt-juntas .apt-juntas-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .60);
  padding-inline: .6rem;
}
.apt-juntas .apt-juntas-tabla .btn.btn-warning:not(.btn-outline) {
  color: #102b20;
}
.apt-juntas .apt-juntas-filtros {
  border-top: 1px solid rgba(224, 196, 117, .40);
  padding-top: 1.4rem;
}
.apt-juntas .apt-juntas-filtros h2 {
  margin-bottom: .3rem;
}
.apt-juntas .apt-juntas-tabla .table tbody tr.bg-warning\/5 {
  background-color: rgba(217, 178, 66, .13);
}
.apt-juntas .apt-juntas-tabla .table thead th:last-child,
.apt-juntas .apt-juntas-tabla .table tbody td:last-child {
  text-align: right;
}
/* Bloque de registros con fotografía tenue en toda su superficie. */
.apt-juntas .apt-juntas-listado {
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

.apt-juntas .apt-juntas-listado .apt-juntas-filtros {
  border-top: 0;
  border-bottom: 1px solid rgba(224, 196, 117, .35);
  padding-top: 0;
  padding-bottom: 1.2rem;
}

.apt-juntas .apt-juntas-listado .apt-juntas-tabla {
  background-color: #0d261b;
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .94), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}

@media (max-width: 640px) {
  .apt-juntas .apt-juntas-formulario > div:first-child {
    background-position: 60% center;
  }
  .apt-juntas .apt-juntas-listado {
    padding: 1rem;
  }
}

/* Detalles específicos de las juntas: formularios y listados consistentes. */
.apt-juntas .apt-juntas-encabezado .badge-warning {
  color: #172b20;
  background: #e6c775;
  border-color: #e6c775;
}
.apt-juntas .apt-juntas-estadisticas .badge {
  color: #f0d996;
  background: rgba(14, 44, 31, .48);
  border: 1px solid rgba(224, 188, 93, .6);
  padding-inline: .6rem;
}
.apt-juntas .apt-juntas-formulario .border-base-300 {
  border-color: rgba(210, 178, 98, .35);
}
.apt-juntas .apt-juntas-listado .apt-juntas-tabla {
  background-image:
    linear-gradient(115deg, rgba(7, 31, 20, .93), rgba(7, 31, 20, .95)),
    url('/casas.webp');
  background-size: cover;
  background-position: center;
}
.apt-juntas .apt-juntas-listado .apt-juntas-tabla tbody tr.bg-warning\/5 {
  background: rgba(215, 180, 76, .10);
}
.apt-juntas .apt-juntas-listado .apt-juntas-tabla .table { min-width: 720px; }
.apt-juntas .apt-juntas-formulario .form-control { min-width: 0; }
.apt-juntas .apt-juntas-formulario .input,
.apt-juntas .apt-juntas-formulario .select,
.apt-juntas .apt-juntas-formulario .textarea { width: 100%; }


/* ================================================
   PALETA PROFESIONAL DIFERENCIADA · ADMINISTRACIÓN
   Exclusivamente estilos: no altera lógica ni API.
   ================================================ */
.apt-juntas { --j-violeta:#c9b5fa; --j-verde:#91e0b4; --j-rojo:#f2a2ad; --j-celeste:#95d6f7; --j-dorado:#efd18b; }

/* Encabezado y contraste general */
.apt-juntas .apt-juntas-encabezado { border-top:5px solid var(--j-dorado); }
.apt-juntas .apt-juntas-encabezado > div > div > p { color:#e0e9df; }
.apt-juntas .apt-juntas-encabezado .badge-warning { background:rgba(225,185,85,.23); border:1px solid #e8c877; color:#ffeba8; }

/* Indicadores: cada categoría tiene su propia identidad */
.apt-juntas .apt-juntas-estadisticas > div { position:relative; border-top:4px solid var(--j-violeta); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(1) { border-top-color:var(--j-violeta); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(2) { border-top-color:var(--j-verde); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(3) { border-top-color:var(--j-rojo); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(4) { border-top-color:var(--j-celeste); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(1) .text-3xl { color:var(--j-violeta); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(2) .text-3xl { color:var(--j-verde); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(3) .text-3xl { color:var(--j-rojo); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(4) .text-3xl { color:var(--j-celeste); }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(1) .badge { border-color:rgba(201,181,250,.74); background:rgba(116,78,178,.21); color:#e0d2ff; }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(2) .badge { border-color:rgba(145,224,180,.74); background:rgba(39,119,74,.24); color:#bdf4d3; }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(3) .badge { border-color:rgba(242,162,173,.74); background:rgba(138,45,66,.24); color:#ffcbd1; }
.apt-juntas .apt-juntas-estadisticas > div:nth-child(4) .badge { border-color:rgba(149,214,247,.74); background:rgba(35,106,142,.25); color:#c3eaff; }
.apt-juntas .apt-juntas-estadisticas > div:hover { transform:translateY(-3px); }

/* Formulario: crear en verde, editar en ámbar */
.apt-juntas .apt-juntas-formulario { border-top:5px solid var(--j-verde); }
.apt-juntas .apt-juntas-formulario:has(.apt-btn-editar) { border-top-color:var(--j-dorado); }
.apt-juntas .apt-juntas-formulario .badge-success { background:rgba(29,118,75,.26); border:1px solid #79d3a6; color:#bdf5d5; }
.apt-juntas .apt-juntas-formulario .badge-warning { background:rgba(165,118,28,.26); border:1px solid #e9c878; color:#ffedae; }
.apt-juntas .apt-juntas-formulario .label-text-alt.text-error { color:#ffbac2; }
.apt-juntas .apt-juntas-formulario :is(.input,.select,.textarea) { background:#edf5f2; border-color:#9ebbb0; color:#133227; }
.apt-juntas .apt-juntas-formulario :is(.input,.select,.textarea):focus-visible { border-color:#82d5b1; outline:2px solid #82d5b1; outline-offset:2px; }
.apt-juntas .apt-juntas-formulario .apt-btn-crear.btn.btn-primary:not(.btn-outline) { background:linear-gradient(115deg,#b0efd0,#66cfa3); border-color:#76dcb0; color:#103629; }
.apt-juntas .apt-juntas-formulario .apt-btn-crear.btn.btn-primary:not(.btn-outline):hover { background:linear-gradient(115deg,#c9f8df,#8ae2bd); color:#103629; }
.apt-juntas .apt-juntas-formulario .apt-btn-editar.btn.btn-primary:not(.btn-outline) { background:linear-gradient(115deg,#f7e0a1,#e5b754); border-color:#efd18b; color:#3e2c0b; }
.apt-juntas .apt-juntas-formulario .apt-btn-editar.btn.btn-primary:not(.btn-outline):hover { background:linear-gradient(115deg,#ffebb7,#f0cd78); color:#3e2c0b; }

/* Tabla: espacio claro para distinguir datos y acciones */
.apt-juntas .apt-juntas-listado { border-top:5px solid var(--j-celeste); }
.apt-juntas .apt-juntas-listado .apt-juntas-filtros h2 { color:#d8efff; }
.apt-juntas .apt-juntas-tabla .table thead { background:rgba(19,46,62,.96); color:#c7e7fc; }
.apt-juntas .apt-juntas-tabla .table thead th { border-bottom:1px solid rgba(149,214,247,.35); }
.apt-juntas .apt-juntas-tabla .table tbody tr:nth-child(even) { background-color:rgba(21,51,40,.42); }
.apt-juntas .apt-juntas-tabla .table tbody tr:hover { background-color:rgba(45,86,77,.58); }
.apt-juntas .apt-juntas-tabla .table tbody tr.bg-warning\/5 { background:rgba(187,141,44,.18); }
.apt-juntas .apt-juntas-tabla .badge-info { border:1px solid rgba(149,214,247,.74); background:rgba(35,106,142,.23); color:#c6ebff; }
.apt-juntas .apt-juntas-tabla .badge-success { border:1px solid rgba(145,224,180,.74); background:rgba(39,119,74,.24); color:#c0f6d8; }
.apt-juntas .apt-juntas-tabla .badge-ghost { border:1px solid rgba(185,198,209,.53); background:rgba(185,198,209,.13); color:#d9e2eb; }
.apt-juntas .apt-juntas-tabla .btn.btn-outline:not(.btn-error) { border-color:#94d0f4; background:rgba(35,106,142,.21); color:#caeaff; }
.apt-juntas .apt-juntas-tabla .btn.btn-outline:not(.btn-error):hover { background:rgba(67,140,176,.35); border-color:#bce6ff; color:#fff; }
.apt-juntas .apt-juntas-tabla .btn.btn-warning:not(.btn-outline) { background:linear-gradient(115deg,#f7e0a1,#e3b54e); border-color:#f0d18b; color:#392a0d; }
.apt-juntas .apt-juntas-tabla .btn.btn-warning:not(.btn-outline):hover { background:linear-gradient(115deg,#ffebb7,#f1d07a); }
.apt-juntas .apt-juntas-tabla .bg-emerald-500\/10 { background-color:rgba(89,203,161,.18); }
.apt-juntas .apt-juntas-tabla .text-emerald-700 { color:#a7f0d0; }
.apt-juntas .apt-juntas-listado .bg-emerald-500\/10 { background-color:rgba(89,203,161,.18); }
.apt-juntas .apt-juntas-listado .text-emerald-700 { color:#a7f0d0; }

/* Alertas: informativas, positivas y negativas diferenciadas */
.apt-juntas .alert-success { background:rgba(18,91,60,.92); border-color:#7ed8ac; color:#e2ffef; }
.apt-juntas .alert-error { background:rgba(107,33,45,.92); border-color:#f2a2ad; color:#ffe3e8; }
@media(max-width:640px) {
  .apt-juntas .apt-juntas-estadisticas > div { padding:1.15rem; }
}
`

const COMUNAS_RM = [
    'Alhué',
    'Buin',
    'Calera de Tango',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'Curacaví',
    'El Bosque',
    'El Monte',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'Isla de Maipo',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Lampa',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'María Pinto',
    'Melipilla',
    'Ñuñoa',
    'Padre Hurtado',
    'Paine',
    'Pedro Aguirre Cerda',
    'Peñaflor',
    'Peñalolén',
    'Pirque',
    'Providencia',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Joaquín',
    'San José de Maipo',
    'San Miguel',
    'San Pedro',
    'San Ramón',
    'Santiago',
    'Talagante',
    'Tiltil',
    'Vitacura',
] as const

function JuntasVecinosPage() {
    const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [comuna, setComuna] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [juntaEditando, setJuntaEditando] =
        useState<JuntaVecinos | null>(null)

    useEffect(() => {
        const cargarJuntas = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/organizacion/juntas/',
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        'No fue posible cargar las juntas de vecinos.'
                    )
                }

                const data = await response.json()
                setJuntas(data)
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

        cargarJuntas()
    }, [])

    const crearJunta = async (event: React.FormEvent) => {
        event.preventDefault()

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                'http://localhost:8000/api/organizacion/juntas/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nombre,
                        comuna,
                        descripcion,
                        activa: true,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible crear la junta de vecinos.'
                )
            }

            setJuntas((actuales) => [
                ...actuales,
                data,
            ])

            setNombre('')
            setComuna('')
            setDescripcion('')

            setMensaje(
                'Junta de vecinos creada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setGuardando(false)
        }
    }

    const comenzarEdicion = (junta: JuntaVecinos) => {
        setJuntaEditando(junta)

        setNombre(junta.nombre)
        setComuna(junta.comuna)
        setDescripcion(junta.descripcion ?? '')

        setMensaje('')
        setError('')
    }

    const cancelarEdicion = () => {
        setJuntaEditando(null)
        setNombre('')
        setComuna('')
        setDescripcion('')
        setError('')
        setMensaje('')
    }

    const actualizarJunta = async () => {
        if (!juntaEditando) {
            return
        }

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const response = await fetch(
                `http://localhost:8000/api/organizacion/juntas/${juntaEditando.id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nombre,
                        comuna,
                        descripcion,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    'No fue posible actualizar la junta de vecinos.'
                )
            }

            setJuntas((actuales) =>
                actuales.map((junta) =>
                    junta.id === data.id
                        ? data
                        : junta
                )
            )

            setJuntaEditando(null)
            setNombre('')
            setComuna('')
            setDescripcion('')

            setMensaje(
                'Junta de vecinos actualizada correctamente.'
            )
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            )
        } finally {
            setGuardando(false)
        }
    }

    const juntasActivas =
        juntas.filter((junta) => junta.activa).length

    const juntasInactivas =
        juntas.length - juntasActivas

    const comunasConJuntas =
        new Set(
            juntas.map((junta) => junta.comuna)
        ).size

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString(
            'es-CL',
            {
                dateStyle: 'medium',
            }
        )
    }

    return (
        <main className="apt-juntas min-h-screen px-4 py-8">
            <style>{estilosJuntas}</style>
            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}
                <div className="apt-juntas-encabezado mb-6 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    Juntas de Vecinos
                                </h1>

                                <span className="badge badge-warning badge-lg">
                                    Administración
                                </span>
                            </div>

                            <p className="max-w-2xl text-base-content/70">
                                Administra las Juntas de Vecinos registradas
                                en la plataforma y su información territorial.
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
                    <div className="apt-juntas-estadisticas mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Total juntas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntas.length}
                                </span>

                                <span className="badge badge-primary badge-outline">
                                    Registradas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Activas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasActivas}
                                </span>

                                <span className="badge badge-success badge-outline">
                                    Activas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Inactivas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {juntasInactivas}
                                </span>

                                <span className="badge badge-ghost">
                                    Inactivas
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm">
                            <p className="text-sm font-medium text-base-content/60">
                                Comunas con juntas
                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="text-3xl font-bold">
                                    {comunasConJuntas}
                                </span>

                                <span className="badge badge-info badge-outline">
                                    Comunas
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form
                    onSubmit={(event) => {
                        event.preventDefault()

                        if (juntaEditando) {
                            void actualizarJunta()
                        } else {
                            void crearJunta(event)
                        }
                    }}
                    className={`apt-juntas-formulario mb-7 overflow-hidden rounded-3xl border bg-base-100 shadow-lg ${
                        juntaEditando
                            ? 'border-amber-500/40'
                            : 'border-emerald-500/30'
                    }`}
                >
                    <div className="border-b border-base-300 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold">
                                        {juntaEditando
                                            ? 'Editar Junta de Vecinos'
                                            : 'Nueva Junta de Vecinos'}
                                    </h2>

                                    <span
                                        className={
                                            juntaEditando
                                                ? 'badge badge-warning badge-outline'
                                                : 'badge badge-success badge-outline'
                                        }
                                    >
                                        {juntaEditando
                                            ? `Editando #${juntaEditando.id}`
                                            : 'Nuevo registro'}
                                    </span>
                                </div>

                                <p className="text-base-content/60">
                                    {juntaEditando
                                        ? 'Actualiza la información de la junta seleccionada.'
                                        : 'Registra una nueva Junta de Vecinos en la plataforma.'}
                                </p>
                            </div>

                            {juntaEditando && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
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
                                    placeholder="Ej: Junta de Vecinos Villa Esperanza"
                                    required
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Comuna
                                    </span>

                                    <span className="label-text-alt text-error">
                                        Obligatorio
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered w-full"
                                    value={comuna}
                                    onChange={(event) =>
                                        setComuna(event.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Seleccione una comuna
                                    </option>

                                    {COMUNAS_RM.map((nombreComuna) => (
                                        <option
                                            key={nombreComuna}
                                            value={nombreComuna}
                                        >
                                            {nombreComuna}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="form-control md:col-span-2">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Descripción
                                    </span>

                                    <span className="label-text-alt">
                                        Opcional
                                    </span>
                                </div>

                                <textarea
                                    className="textarea textarea-bordered min-h-28 w-full resize-y"
                                    value={descripcion}
                                    onChange={(event) =>
                                        setDescripcion(event.target.value)
                                    }
                                    placeholder="Agrega una breve descripción de la Junta de Vecinos..."
                                />

                                <div className="mt-2 flex justify-end">
                                    <span className="text-xs text-base-content/40">
                                        {descripcion.length} caracteres
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">
                            {juntaEditando && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    disabled={guardando}
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${juntaEditando ? 'apt-btn-editar' : 'apt-btn-crear'}`}
                                disabled={guardando}
                            >
                                {guardando && (
                                    <span className="loading loading-spinner loading-sm" />
                                )}

                                {guardando
                                    ? 'Guardando...'
                                    : juntaEditando
                                        ? 'Guardar Cambios'
                                        : 'Crear Junta'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Cargando */}
                {cargando && (
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                        <span className="loading loading-spinner loading-lg" />

                        <p className="mt-4 text-base-content/60">
                            Cargando juntas de vecinos...
                        </p>
                    </div>
                )}

                {!cargando && (
                    <div className="apt-juntas-listado mb-7">
                        {/* Título listado */}
                        <div className="apt-juntas-filtros mb-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Juntas registradas
                                </h2>

                                <p className="mt-1 text-base-content/60">
                                    Revisa y edita la información de las juntas
                                    existentes.
                                </p>
                            </div>

                            {juntas.length > 0 && (
                                <span className="badge badge-outline badge-lg">
                                    {juntas.length}{' '}
                                    {juntas.length === 1
                                        ? 'junta'
                                        : 'juntas'}
                                </span>
                            )}
                        </div>

                        {juntas.length === 0 ? (
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                                <div className="mx-auto max-w-md">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-700">
                                        J
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        No existen juntas registradas
                                    </h3>

                                    <p className="mt-2 text-base-content/60">
                                        Crea la primera Junta de Vecinos
                                        utilizando el formulario superior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="apt-juntas-tabla overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead className="bg-base-200/70">
                                            <tr>
                                                <th>Junta</th>
                                                <th>Comuna</th>
                                                <th>Descripción</th>
                                                <th>Estado</th>
                                                <th>Creación</th>
                                                <th className="text-right">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {juntas.map((junta) => (
                                                <tr
                                                    key={junta.id}
                                                    className={
                                                        juntaEditando?.id === junta.id
                                                            ? 'bg-warning/5'
                                                            : 'hover'
                                                    }
                                                >
                                                    <td>
                                                        <div className="flex min-w-[220px] items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-700">
                                                                {junta.nombre
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold">
                                                                    {junta.nombre}
                                                                </p>

                                                                <p className="mt-1 text-xs text-base-content/45">
                                                                    Junta #{junta.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="badge badge-info badge-outline whitespace-nowrap">
                                                            {junta.comuna}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="block max-w-xs text-sm text-base-content/70">
                                                            {junta.descripcion ||
                                                                'Sin descripción'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                junta.activa
                                                                    ? 'badge badge-success badge-outline'
                                                                    : 'badge badge-ghost'
                                                            }
                                                        >
                                                            {junta.activa
                                                                ? 'Activa'
                                                                : 'Inactiva'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap text-sm text-base-content/60">
                                                        {formatearFecha(
                                                            junta.fecha_creacion
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    juntaEditando?.id === junta.id
                                                                        ? 'btn btn-sm btn-warning'
                                                                        : 'btn btn-sm btn-outline'
                                                                }
                                                                disabled={guardando}
                                                                onClick={() =>
                                                                    comenzarEdicion(junta)
                                                                }
                                                            >
                                                                {juntaEditando?.id === junta.id
                                                                    ? 'Editando'
                                                                    : 'Editar'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}

export default JuntasVecinosPage
