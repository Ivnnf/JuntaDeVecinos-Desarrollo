import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


type Solicitud = {
  id: number;
  vecino: number;
  vecino_username: string;
  junta_vecinos: number;
  junta_nombre: string;
  tipo: "CONSULTA" | "RECLAMO" | "SOLICITUD";
  asunto: string;
  descripcion: string;
  estado:
    | "PENDIENTE"
    | "EN_PROCESO"
    | "RESPONDIDA"
    | "CERRADA";
  respuesta: string;
  respondido_por: number | null;
  respondido_por_username: string | null;
  fecha_respuesta: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
};


function SolicitudesDirectivaPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardandoId, setGuardandoId] = useState<number | null>(null);

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch(
        "http://localhost:8000/api/solicitudes/directiva/solicitudes/",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "No fue posible cargar las solicitudes."
        );
      }

      const data = await response.json();

      setSolicitudes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar las solicitudes."
      );
    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    void cargarSolicitudes();
  }, []);


  const actualizarCampo = (
    id: number,
    campo: "estado" | "respuesta",
    valor: string
  ) => {
    setSolicitudes((actuales) =>
      actuales.map((solicitud) =>
        solicitud.id === id
          ? {
              ...solicitud,
              [campo]: valor,
            }
          : solicitud
      )
    );
  };


  const guardarSolicitud = async (solicitud: Solicitud) => {
    try {
      setGuardandoId(solicitud.id);
      setError("");

      const response = await fetch(
        `http://localhost:8000/api/solicitudes/directiva/solicitudes/${solicitud.id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: solicitud.estado,
            respuesta: solicitud.respuesta,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const mensaje =
          data.respuesta?.[0] ||
          data.detail ||
          "No fue posible guardar los cambios.";

        throw new Error(mensaje);
      }

      setSolicitudes((actuales) =>
        actuales.map((item) =>
          item.id === data.id ? data : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la solicitud."
      );
    } finally {
      setGuardandoId(null);
    }
  };


  const nombreTipo = (tipo: Solicitud["tipo"]) => {
    switch (tipo) {
      case "CONSULTA":
        return "Consulta";

      case "RECLAMO":
        return "Reclamo";

      case "SOLICITUD":
        return "Solicitud";

      default:
        return tipo;
    }
  };


  const nombreEstado = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return "Pendiente";

      case "EN_PROCESO":
        return "En proceso";

      case "RESPONDIDA":
        return "Respondida";

      case "CERRADA":
        return "Cerrada";

      default:
        return estado;
    }
  };


  const claseEstado = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return "badge badge-warning badge-outline";

      case "EN_PROCESO":
        return "badge badge-info badge-outline";

      case "RESPONDIDA":
        return "badge badge-success";

      case "CERRADA":
        return "badge badge-ghost";

      default:
        return "badge badge-outline";
    }
  };


  const claseTipo = (tipo: Solicitud["tipo"]) => {
    switch (tipo) {
      case "CONSULTA":
        return "badge badge-info badge-outline";

      case "RECLAMO":
        return "badge badge-error badge-outline";

      case "SOLICITUD":
        return "badge badge-primary badge-outline";

      default:
        return "badge badge-outline";
    }
  };


  const bordeTipo = (tipo: Solicitud["tipo"]) => {
    switch (tipo) {
      case "CONSULTA":
        return "border-blue-500/30";

      case "RECLAMO":
        return "border-red-500/30";

      case "SOLICITUD":
        return "border-indigo-500/30";

      default:
        return "border-base-300";
    }
  };


  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };


  const pendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "PENDIENTE"
  ).length;

  const enProceso = solicitudes.filter(
    (solicitud) => solicitud.estado === "EN_PROCESO"
  ).length;

  const respondidas = solicitudes.filter(
    (solicitud) => solicitud.estado === "RESPONDIDA"
  ).length;

  const cerradas = solicitudes.filter(
    (solicitud) => solicitud.estado === "CERRADA"
  ).length;


  return (
    <main className="sd-page">
      <style>{`
        .sd-page { --sd-gold:#e0be6a; --sd-cream:#f8f1de; --sd-muted:#d1dccf; position:relative; isolation:isolate; min-height:100vh; padding:34px 20px 76px; color:var(--sd-cream); font-family: 'Segoe UI', Arial, sans-serif; background:#092317; }
        .sd-page, .sd-page * { box-sizing:border-box; }
        .sd-page::before { content:''; position:fixed; inset:0; z-index:-2; background-image:linear-gradient(125deg,rgba(3,24,16,.79),rgba(6,36,27,.73)),url('/images/photo-1600596542815-ffad4c1539a9.jpg'); background-size:cover; background-position:center; pointer-events:none; }
        .sd-page::after { content:''; position:fixed; inset:0; z-index:-1; background:radial-gradient(circle at 85% 0%,rgba(218,179,93,.11),transparent 35%); pointer-events:none; }
        .sd-wrap { width:100%; max-width:1190px; margin:auto; }
        .sd-photo { position:relative; isolation:isolate; overflow:hidden; background:rgba(7,35,24,.84); border:1px solid rgba(219,184,96,.38); border-radius:22px; box-shadow:0 16px 40px rgba(0,0,0,.20); }
        .sd-photo::before { content:''; position:absolute; inset:0; z-index:-2; background-image:linear-gradient(110deg,rgba(4,29,20,.88),rgba(7,39,27,.74)),var(--sd-photo); background-size:cover; background-position:center; pointer-events:none; }
        .sd-photo::after { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(0deg,rgba(4,23,16,.16),transparent); pointer-events:none; }
        .sd-hero { padding:32px 34px; margin-bottom:25px; --sd-photo:url('/images/photo-1486406146926-c627a92ad1ab.jpg'); }
        .sd-title, .sd-heading, .sd-subtitle, .sd-cardtitle { font-family:Georgia, 'Times New Roman', serif; font-weight:700; letter-spacing:-.02em; color:var(--sd-cream); }
        .sd-title { font-size:clamp(2rem,3.7vw,2.9rem); line-height:1.12; margin:0; }
        .sd-heading { font-size:clamp(1.6rem,2.7vw,2.15rem); line-height:1.2; margin:0; }
        .sd-subtitle { font-size:1.55rem; margin:0; }
        .sd-cardtitle { font-size:1.4rem; margin:0; }
        .sd-muted { color:var(--sd-muted); line-height:1.65; }
        .sd-hero-line { display:flex; flex-wrap:wrap; align-items:center; gap:15px; }
        .sd-row { display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:22px; }
        .sd-pill { display:inline-flex; align-items:center; padding:7px 13px; border-radius:999px; border:1px solid rgba(222,188,99,.5); color:#f2d585; background:rgba(218,181,81,.13); font-size:.77rem; font-weight:700; }
        .sd-button { display:inline-flex; gap:9px; justify-content:center; align-items:center; min-height:43px; padding:11px 20px; border-radius:13px; border:1px solid #d5b664; background:linear-gradient(110deg,#f0dca1,#cba952); color:#102a1e; text-decoration:none; font-weight:800; font-size:.94rem; cursor:pointer; transition:filter .2s,transform .2s; }
        .sd-button:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
        .sd-button:disabled { opacity:.58; cursor:not-allowed; }
        .sd-button-outline { background:rgba(35,56,39,.65); color:#f7e5b8; border-color:rgba(220,180,77,.68); }
        .sd-alert { margin:0 0 22px; padding:16px 20px; border:1px solid rgba(242,145,145,.48); background:rgba(114,35,38,.88); color:#fff1ec; border-radius:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; }
        .sd-alert-loading { background:rgba(13,42,29,.85); border-color:rgba(221,188,99,.44); }
        .sd-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; margin-bottom:30px; }
        .sd-stat { padding:22px; min-height:155px; display:flex; flex-direction:column; justify-content:space-between; }
        .sd-stat:nth-child(1) { --sd-photo:url('/images/photo-1524758631624-e2822e304c36.jpg'); }
        .sd-stat:nth-child(2) { --sd-photo:url('/images/photo-1497366754035-f200968a6e72.jpg'); }
        .sd-stat:nth-child(3) { --sd-photo:url('/images/photo-1497366811353-6870744d04b2.jpg'); }
        .sd-stat:nth-child(4) { --sd-photo:url('/images/photo-1487958449943-2429e8be8625.jpg'); }
        .sd-stat-label { font-size:.9rem; font-weight:700; color:#f2dfab; }
        .sd-stat-value { font-family:Georgia,serif; font-weight:700; font-size:2.45rem; line-height:1.2; }
        .sd-stat-foot { color:#ece1bf; font-size:.77rem; }
        .sd-section-head { display:flex; flex-wrap:wrap; align-items:end; justify-content:space-between; gap:14px; margin:0 0 17px; }
        .sd-count { display:inline-flex; border:1px solid rgba(228,191,96,.4); border-radius:999px; padding:7px 12px; color:#f5df9d; background:rgba(7,34,23,.65); }
        .sd-empty { padding:57px 28px; text-align:center; --sd-photo:url('/images/photo-1449824913935-59a10b8d2000.jpg'); }
        .sd-empty-symbol { width:65px; height:65px; border-radius:999px; display:grid; place-items:center; font-size:1.7rem; color:#f4d786; background:rgba(225,184,71,.16); margin:0 auto 20px; }
        .sd-stack { display:grid; gap:22px; }
        .sd-card { --sd-photo:url('/images/photo-1497366811353-6870744d04b2.jpg'); }
        .sd-card.sd-type-RECLAMO { --sd-photo:url('/images/photo-1487958449943-2429e8be8625.jpg'); }
        .sd-card.sd-type-SOLICITUD { --sd-photo:url('/images/photo-1524758631624-e2822e304c36.jpg'); }
        .sd-card-head { padding:24px 28px; border-bottom:1px solid rgba(219,185,99,.26); }
        .sd-card-body { padding:26px 28px 28px; }
        .sd-tags { display:flex; flex-wrap:wrap; align-items:center; gap:9px; margin-bottom:12px; }
        .sd-tag { display:inline-flex; align-items:center; padding:5px 11px; border-radius:999px; border:1px solid rgba(230,200,125,.45); background:rgba(5,34,22,.7); color:#f5e0ad; font-size:.76rem; font-weight:700; }
        .sd-tag-pending { border-color:#d6ae65; color:#ffe0a2; }
        .sd-tag-process { border-color:#88b4c2; color:#c5e8f0; }
        .sd-tag-answered { border-color:#82b9a0; color:#c3f1d4; }
        .sd-tag-closed { border-color:#adbaa8; color:#e0e4da; }
        .sd-meta { display:flex; flex-wrap:wrap; gap:5px 22px; margin-top:12px; font-size:.88rem; color:#d6ddcf; }
        .sd-meta strong { color:#f6eccf; }
        .sd-label { color:#f1db9b; display:block; font-size:.86rem; font-weight:700; margin:0 0 9px; }
        .sd-inset { background:rgba(4,28,18,.65); border:1px solid rgba(222,189,98,.23); border-radius:15px; padding:19px 20px; color:#f1eee0; line-height:1.65; overflow-wrap:anywhere; }
        .sd-form-grid { display:grid; grid-template-columns:minmax(0,260px) minmax(0,1fr); gap:20px; margin-top:25px; }
        .sd-control { width:100%; display:block; border:1px solid rgba(223,188,96,.5); border-radius:12px; padding:12px 14px; font:inherit; font-size:.97rem; background:rgba(7,29,20,.91); color:var(--sd-cream); outline:none; }
        .sd-control:focus { border-color:#f3d88b; box-shadow:0 0 0 3px rgba(224,190,106,.16); }
        .sd-control option { background:#10291d; color:#f8f2e2; }
        .sd-control::placeholder { color:#b7c3b8; }
        textarea.sd-control { min-height:137px; resize:vertical; }
        .sd-helper { margin-top:8px; font-size:.77rem; color:#c5d0c1; }
        .sd-prev { margin-top:20px; padding:15px 18px; border-radius:13px; border:1px solid rgba(151,202,164,.38); background:rgba(21,73,47,.43); color:#f0ebd5; line-height:1.6; }
        .sd-actions { margin-top:26px; padding-top:20px; border-top:1px solid rgba(222,187,89,.27); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }

        /* Identidad visual por estado: la información se distingue sin depender solo del color. */
        .sd-page .sd-stat { border-top:4px solid var(--sd-accent); background-color:rgba(7,35,24,.92); }
        .sd-page .sd-stat:nth-child(1) { --sd-accent:#f1c47a; }
        .sd-page .sd-stat:nth-child(2) { --sd-accent:#80cbf4; }
        .sd-page .sd-stat:nth-child(3) { --sd-accent:#77dbad; }
        .sd-page .sd-stat:nth-child(4) { --sd-accent:#b8c4d2; }
        .sd-page .sd-stat .sd-stat-value { color:var(--sd-accent); font-family:'Segoe UI',Arial,sans-serif; font-variant-numeric:tabular-nums; }
        .sd-page .sd-stat .sd-stat-label { color:#fff7e8; }
        .sd-page .sd-stat .sd-stat-foot { color:#e1e7db; }
        .sd-page .sd-card { --sd-type-color:#87caff; border-left:5px solid var(--sd-type-color); }
        .sd-page .sd-card.sd-type-CONSULTA { --sd-type-color:#83c7f5; }
        .sd-page .sd-card.sd-type-RECLAMO { --sd-type-color:#f3a1a5; }
        .sd-page .sd-card.sd-type-SOLICITUD { --sd-type-color:#b9a3f5; }
        .sd-page .sd-tag { line-height:1.3; }
        .sd-page .sd-tag-type { border-color:var(--sd-type-color); color:var(--sd-type-color); background:rgba(9,25,22,.87); }
        .sd-page .sd-tag-pending { background:rgba(115,71,18,.42); color:#ffdc97; border-color:#eabc6b; }
        .sd-page .sd-tag-process { background:rgba(22,78,117,.43); color:#b9e8ff; border-color:#82c8f3; }
        .sd-page .sd-tag-answered { background:rgba(22,93,64,.46); color:#b9f6d6; border-color:#76d7a7; }
        .sd-page .sd-tag-closed { background:rgba(78,90,104,.42); color:#e0e8f0; border-color:#a9b9c9; }
        .sd-page .sd-card .sd-card-head { box-shadow:inset 0 2px 0 rgba(255,255,255,.025); }
        .sd-page .sd-card .sd-control { transition:border-color .18s, box-shadow .18s; }
        .sd-page .sd-card .sd-control:focus-visible { outline:2px solid #f0d28c; outline-offset:2px; }
        .sd-page .sd-card .sd-button { background:linear-gradient(110deg,#a5d8f7,#65aeda); border-color:#84c6ee; color:#102c3c; }
        .sd-page .sd-card .sd-button:hover:not(:disabled) { filter:brightness(1.12); }
        .sd-page .sd-button:focus-visible,.sd-page a:focus-visible { outline:3px solid #ffdb8e; outline-offset:3px; }
        @media (prefers-reduced-motion:reduce) { .sd-page .sd-card .sd-control {transition:none;} }

        @media (max-width:900px) { .sd-grid {grid-template-columns:repeat(2,minmax(0,1fr));} }
        @media (max-width:680px) { .sd-page { padding:17px 12px 48px; } .sd-hero {padding:24px 20px;} .sd-grid {grid-template-columns:1fr 1fr;gap:10px;} .sd-stat {min-height:130px;padding:15px;} .sd-stat-value {font-size:2rem;} .sd-card-head,.sd-card-body {padding:20px 17px;} .sd-form-grid {grid-template-columns:1fr;} .sd-button {width:100%;} .sd-actions .sd-button {width:100%;} }
        @media (prefers-reduced-motion:reduce) { .sd-button {transition:none;} }
      `}</style>
      <section className="sd-wrap">
        <header className="sd-photo sd-hero">
          <div className="sd-row">
            <div>
              <div className="sd-hero-line"><h1 className="sd-title">Solicitudes de Vecinos</h1><span className="sd-pill">Directiva</span></div>
              <p className="sd-muted" style={{maxWidth:660,margin:'14px 0 0'}}>Revisa y responde las consultas, reclamos y solicitudes enviadas por los vecinos de tu junta.</p>
            </div>
            <Link to="/directiva" className="sd-button sd-button-outline">← Volver al Panel</Link>
          </div>
        </header>
        {cargando && <div className="sd-alert sd-alert-loading"><span>Cargando solicitudes de vecinos...</span><span className="loading loading-spinner loading-sm" /></div>}
        {error && <div className="sd-alert" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')} style={{color:'inherit',background:'transparent',border:0,cursor:'pointer',fontSize:22}} aria-label="Cerrar error">×</button></div>}
        {!cargando && <>
          <div className="sd-grid" aria-label="Resumen de solicitudes">
            <div className="sd-photo sd-stat"><span className="sd-stat-label">Pendientes</span><strong className="sd-stat-value">{pendientes}</strong><span className="sd-stat-foot">A la espera de atención</span></div>
            <div className="sd-photo sd-stat"><span className="sd-stat-label">En proceso</span><strong className="sd-stat-value">{enProceso}</strong><span className="sd-stat-foot">En gestión</span></div>
            <div className="sd-photo sd-stat"><span className="sd-stat-label">Respondidas</span><strong className="sd-stat-value">{respondidas}</strong><span className="sd-stat-foot">Con respuesta registrada</span></div>
            <div className="sd-photo sd-stat"><span className="sd-stat-label">Cerradas</span><strong className="sd-stat-value">{cerradas}</strong><span className="sd-stat-foot">Gestiones finalizadas</span></div>
          </div>
          <div className="sd-section-head">
            <div><h2 className="sd-heading">Solicitudes recibidas</h2><p className="sd-muted" style={{margin:'5px 0 0'}}>Gestiona el estado y la respuesta de cada solicitud.</p></div>
            {solicitudes.length > 0 && <span className="sd-count">{solicitudes.length} {solicitudes.length === 1 ? 'registro' : 'registros'}</span>}
          </div>
          {solicitudes.length === 0 ? (
            <div className="sd-photo sd-empty">
              <div className="sd-empty-symbol">✓</div>
              <h3 className="sd-subtitle">No hay solicitudes por gestionar</h3>
              <p className="sd-muted" style={{maxWidth:480,margin:'14px auto 0'}}>Actualmente no existen consultas, reclamos o solicitudes enviadas por los vecinos.</p>
            </div>
          ) : (
            <div className="sd-stack">
              {solicitudes.map((solicitud) => (
                <article key={solicitud.id} className={`sd-photo sd-card sd-type-${solicitud.tipo} ${bordeTipo(solicitud.tipo)}`}>
                  <div className="sd-card-head">
                    <div className="sd-row">
                      <div style={{flex:'1 1 330px',minWidth:0}}>
                        <div className="sd-tags">
                          <span className="sd-tag sd-tag-type" title={claseTipo(solicitud.tipo)}>{nombreTipo(solicitud.tipo)}</span>
                          <span className={`sd-tag ${solicitud.estado === 'PENDIENTE' ? 'sd-tag-pending' : solicitud.estado === 'EN_PROCESO' ? 'sd-tag-process' : solicitud.estado === 'RESPONDIDA' ? 'sd-tag-answered' : 'sd-tag-closed'}`} title={claseEstado(solicitud.estado)}>{nombreEstado(solicitud.estado)}</span>
                          <span className="sd-tag">#{solicitud.id}</span>
                        </div>
                        <h3 className="sd-cardtitle">{solicitud.asunto}</h3>
                        <div className="sd-meta"><span>Vecino: <strong>{solicitud.vecino_username}</strong></span><span>Junta: <strong>{solicitud.junta_nombre}</strong></span></div>
                      </div>
                      <div><span className="sd-label">Recibida</span><span className="sd-muted">{formatearFecha(solicitud.fecha_creacion)}</span></div>
                    </div>
                  </div>
                  <div className="sd-card-body">
                    <label className="sd-label">Mensaje del vecino</label>
                    <div className="sd-inset" style={{whiteSpace:'pre-wrap'}}>{solicitud.descripcion}</div>
                    <div className="sd-form-grid">
                      <label><span className="sd-label">Estado</span>
                        <select className="sd-control" value={solicitud.estado} onChange={(event) => actualizarCampo(solicitud.id,'estado',event.target.value)}>
                          <option value="PENDIENTE">Pendiente</option><option value="EN_PROCESO">En proceso</option><option value="RESPONDIDA">Respondida</option><option value="CERRADA">Cerrada</option>
                        </select><span className="sd-helper">Actualiza el avance de la gestión.</span>
                      </label>
                      <label><span className="sd-label">Respuesta al vecino</span>
                        <textarea className="sd-control" placeholder="Escribe la respuesta para el vecino..." value={solicitud.respuesta ?? ''} onChange={(event) => actualizarCampo(solicitud.id,'respuesta',event.target.value)} />
                        <span className="sd-helper" style={{display:'block',textAlign:'right'}}>{(solicitud.respuesta ?? '').length} caracteres</span>
                      </label>
                    </div>
                    {solicitud.respondido_por_username && <div className="sd-prev"><span className="sd-tag sd-tag-answered">Respondida</span> por <strong>{solicitud.respondido_por_username}</strong>{solicitud.fecha_respuesta && <> el {formatearFecha(solicitud.fecha_respuesta)}</>}</div>}
                    <div className="sd-actions"><span className="sd-helper">Última actualización: {formatearFecha(solicitud.fecha_actualizacion)}</span>
                      <button type="button" className="sd-button" disabled={guardandoId === solicitud.id} onClick={() => { void guardarSolicitud(solicitud) }}>
                        {guardandoId === solicitud.id ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>}
      </section>
    </main>
  );
}

export default SolicitudesDirectivaPage;
