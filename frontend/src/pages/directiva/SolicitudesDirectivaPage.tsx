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
    cargarSolicitudes();
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
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Solicitudes de Vecinos
                </h1>

                <span className="badge badge-primary badge-lg">
                  Gestión
                </span>
              </div>

              <p className="max-w-2xl text-base-content/70">
                Revisa y responde las consultas, reclamos y solicitudes
                enviadas por los vecinos de tu junta.
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


        {/* Cargando */}
        {cargando && (
          <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">
            <span className="loading loading-spinner loading-sm" />

            <span>
              Cargando solicitudes de vecinos...
            </span>
          </div>
        )}


        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}


        {!cargando && (
          <>
            {/* Resumen */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-amber-500/30 bg-base-100 p-5 shadow-sm">
                <p className="text-sm font-medium text-base-content/60">
                  Pendientes
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold">
                    {pendientes}
                  </span>

                  <span className="badge badge-warning badge-outline">
                    Pendientes
                  </span>
                </div>
              </div>


              <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">
                <p className="text-sm font-medium text-base-content/60">
                  En proceso
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold">
                    {enProceso}
                  </span>

                  <span className="badge badge-info badge-outline">
                    Gestionando
                  </span>
                </div>
              </div>


              <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">
                <p className="text-sm font-medium text-base-content/60">
                  Respondidas
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold">
                    {respondidas}
                  </span>

                  <span className="badge badge-success badge-outline">
                    Respondidas
                  </span>
                </div>
              </div>


              <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                <p className="text-sm font-medium text-base-content/60">
                  Cerradas
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold">
                    {cerradas}
                  </span>

                  <span className="badge badge-ghost">
                    Finalizadas
                  </span>
                </div>
              </div>
            </div>


            {/* Título sección */}
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  Solicitudes recibidas
                </h2>

                <p className="mt-1 text-base-content/60">
                  Gestiona el estado y la respuesta de cada solicitud.
                </p>
              </div>

              {solicitudes.length > 0 && (
                <span className="badge badge-outline badge-lg">
                  {solicitudes.length}{" "}
                  {solicitudes.length === 1
                    ? "registro"
                    : "registros"}
                </span>
              )}
            </div>


            {/* Sin solicitudes */}
            {solicitudes.length === 0 ? (
              <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">
                    ✓
                  </div>

                  <h3 className="text-xl font-bold">
                    No hay solicitudes por gestionar
                  </h3>

                  <p className="mt-2 text-base-content/60">
                    Actualmente no existen consultas, reclamos o solicitudes
                    enviadas por los vecinos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {solicitudes.map((solicitud) => (
                  <article
                    key={solicitud.id}
                    className={`overflow-hidden rounded-2xl border bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md ${bordeTipo(
                      solicitud.tipo
                    )}`}
                  >
                    {/* Cabecera solicitud */}
                    <div className="border-b border-base-300 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0 flex-1">

                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className={claseTipo(solicitud.tipo)}>
                              {nombreTipo(solicitud.tipo)}
                            </span>

                            <span className={claseEstado(solicitud.estado)}>
                              {nombreEstado(solicitud.estado)}
                            </span>

                            <span className="badge badge-ghost">
                              #{solicitud.id}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold">
                            {solicitud.asunto}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-base-content/60">
                            <span>
                              Vecino:{" "}
                              <strong className="font-semibold text-base-content/80">
                                {solicitud.vecino_username}
                              </strong>
                            </span>

                            <span>
                              Junta:{" "}
                              <strong className="font-semibold text-base-content/80">
                                {solicitud.junta_nombre}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
                            Recibida
                          </p>

                          <p className="mt-1 text-sm text-base-content/60">
                            {formatearFecha(
                              solicitud.fecha_creacion
                            )}
                          </p>
                        </div>
                      </div>
                    </div>


                    <div className="p-6">

                      {/* Mensaje del vecino */}
                      <div className="mb-6">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                          Mensaje del vecino
                        </p>

                        <div className="rounded-xl bg-base-200/70 p-5">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {solicitud.descripcion}
                          </p>
                        </div>
                      </div>


                      {/* Gestión */}
                      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">

                        {/* Estado */}
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text font-semibold">
                              Estado
                            </span>
                          </div>

                          <select
                            className="select select-bordered w-full"
                            value={solicitud.estado}
                            onChange={(event) =>
                              actualizarCampo(
                                solicitud.id,
                                "estado",
                                event.target.value
                              )
                            }
                          >
                            <option value="PENDIENTE">
                              Pendiente
                            </option>

                            <option value="EN_PROCESO">
                              En proceso
                            </option>

                            <option value="RESPONDIDA">
                              Respondida
                            </option>

                            <option value="CERRADA">
                              Cerrada
                            </option>
                          </select>

                          <span className="mt-2 text-xs text-base-content/50">
                            Actualiza el avance de la gestión.
                          </span>
                        </label>


                        {/* Respuesta */}
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text font-semibold">
                              Respuesta al vecino
                            </span>
                          </div>

                          <textarea
                            className="textarea textarea-bordered min-h-32 w-full resize-y"
                            placeholder="Escribe la respuesta para el vecino..."
                            value={solicitud.respuesta}
                            onChange={(event) =>
                              actualizarCampo(
                                solicitud.id,
                                "respuesta",
                                event.target.value
                              )
                            }
                          />

                          <div className="mt-2 flex justify-end">
                            <span className="text-xs text-base-content/40">
                              {solicitud.respuesta.length} caracteres
                            </span>
                          </div>
                        </label>
                      </div>


                      {/* Información respuesta previa */}
                      {solicitud.respondido_por_username && (
                        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="badge badge-success badge-outline">
                              Respondida
                            </span>

                            <span className="text-base-content/60">
                              por
                            </span>

                            <strong>
                              {solicitud.respondido_por_username}
                            </strong>

                            {solicitud.fecha_respuesta && (
                              <>
                                <span className="text-base-content/60">
                                  el
                                </span>

                                <span className="font-medium">
                                  {formatearFecha(
                                    solicitud.fecha_respuesta
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}


                      {/* Acciones */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-5">

                        <p className="text-xs text-base-content/40">
                          Última actualización:{" "}
                          {formatearFecha(
                            solicitud.fecha_actualizacion
                          )}
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={
                            guardandoId === solicitud.id
                          }
                          onClick={() =>
                            guardarSolicitud(solicitud)
                          }
                        >
                          {guardandoId === solicitud.id ? (
                            <>
                              <span className="loading loading-spinner loading-sm" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar cambios"
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}


export default SolicitudesDirectivaPage;