import { useEffect, useState } from "react";


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


  if (cargando) {
    return (
      <div className="p-6">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Solicitudes de Vecinos
        </h1>

        <p className="mt-2 text-base-content/70">
          Revisa y responde las consultas, reclamos y solicitudes
          enviadas por los vecinos de tu junta.
        </p>
      </div>


      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}


      {solicitudes.length === 0 ? (
        <div className="alert">
          <span>
            No existen solicitudes pendientes de gestión.
          </span>
        </div>
      ) : (
        <div className="space-y-5">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="card border border-base-300 bg-base-100 shadow-sm"
            >
              <div className="card-body">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="badge badge-outline">
                        {nombreTipo(solicitud.tipo)}
                      </span>

                      <span className="badge badge-primary">
                        {nombreEstado(solicitud.estado)}
                      </span>
                    </div>

                    <h2 className="card-title">
                      {solicitud.asunto}
                    </h2>

                    <p className="text-sm text-base-content/70">
                      Vecino: {solicitud.vecino_username}
                    </p>

                    <p className="text-sm text-base-content/70">
                      Junta: {solicitud.junta_nombre}
                    </p>
                  </div>

                  <span className="text-sm text-base-content/60">
                    {new Date(
                      solicitud.fecha_creacion
                    ).toLocaleString("es-CL")}
                  </span>
                </div>


                <div className="mt-4 rounded-lg bg-base-200 p-4">
                  <p className="whitespace-pre-wrap">
                    {solicitud.descripcion}
                  </p>
                </div>


                <div className="mt-4">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Estado
                    </span>
                  </label>

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
                </div>


                <div className="mt-3">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Respuesta
                    </span>
                  </label>

                  <textarea
                    className="textarea textarea-bordered min-h-28 w-full"
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
                </div>


                {solicitud.respondido_por_username && (
                  <div className="text-sm text-base-content/60">
                    Respondido por{" "}
                    <strong>
                      {solicitud.respondido_por_username}
                    </strong>

                    {solicitud.fecha_respuesta && (
                      <>
                        {" "}
                        el{" "}
                        {new Date(
                          solicitud.fecha_respuesta
                        ).toLocaleString("es-CL")}
                      </>
                    )}
                  </div>
                )}


                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={guardandoId === solicitud.id}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default SolicitudesDirectivaPage;