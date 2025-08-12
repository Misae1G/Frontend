import PropTypes from "prop-types";
import { useState } from "react";
import useFetch from "../../hooks/useFetch.js";

const TareasEmpleado = ({ tareas: tareasProp }) => {
  const [tareas, setTareas] = useState(tareasProp || []);
  const { fetchDataBackend } = useFetch();
  const [loadingId, setLoadingId] = useState(null);

  const marcarComoCompletada = async (tareaId) => {
    setLoadingId(tareaId);
    try {
      // ✅ Cambié "tarea" por "tareas" para que coincida con app.use('/api/tareas')
      const res = await fetchDataBackend(
        `http://localhost:8080/api/tareas/${tareaId}/completar`,
        { texto: "Tarea completada desde el sistema" },
        "POST"
      );
      
      if (res && res.msg) {
        setTareas((prev) =>
          prev.map((t) =>
            t._id === tareaId ? { ...t, estado: "en_revision" } : t
          )
        );
        window.toast && window.toast.success(res.msg);
      } else {
        window.toast && window.toast.error(res && res.msg ? res.msg : "Error al marcar como completada");
      }
    } catch (error) {
      console.error("Error al marcar como completada:", error);
      window.toast && window.toast.error("Error al marcar como completada");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔧 Función para obtener las tareas del empleado
  const cargarMisTareas = async () => {
    try {
      const res = await fetchDataBackend(
        `http://localhost:8080/api/tareas/mis-tareas`,
        null,
        "GET"
      );
      
      if (res && Array.isArray(res)) {
        setTareas(res);
      }
    } catch (error) {
      console.error("Error al cargar mis tareas:", error);
      window.toast && window.toast.error("Error al cargar las tareas");
    }
  };

  if (!tareas || tareas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">No tienes tareas asignadas.</div>
        <button 
          onClick={cargarMisTareas}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔄 Recargar Tareas
        </button>
      </div>
    );
  }

  // 🎨 Función para obtener el estilo del estado
  const getEstadoEstilo = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'en_revision':
        return 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'completada':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
    }
  };

  // 🎨 Función para obtener el estilo de la dificultad
  const getDificultadEstilo = (dificultad) => {
    switch (dificultad) {
      case 'baja':
        return '🟢 Baja';
      case 'media':
        return '🟡 Media';
      case 'alta':
        return '🔴 Alta';
      default:
        return dificultad;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-[#B9F6CA] px-6 py-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-[#1976D2] font-bold text-lg">📋 Mis Tareas Asignadas</h3>
        <button 
          onClick={cargarMisTareas}
          className="bg-white text-[#1976D2] px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recompensas</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tareas.map((tarea) => (
              <tr key={tarea._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-semibold text-gray-900">{tarea.nombre}</div>
                  {tarea.creadoPor?.nombre && (
                    <div className="text-xs text-gray-500">Por: {tarea.creadoPor.nombre}</div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate" title={tarea.descripcion}>
                    {tarea.descripcion}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-medium">
                    {getDificultadEstilo(tarea.dificultad)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={getEstadoEstilo(tarea.estado)}>
                    {tarea.estado === 'en_revision' ? 'En Revisión' : 
                     tarea.estado === 'en_progreso' ? 'En Progreso' :
                     tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {tarea.fechaLimite ? (
                    <div>
                      {new Date(tarea.fechaLimite).toLocaleDateString()}
                      {new Date(tarea.fechaLimite) < new Date() && tarea.estado !== 'completada' && (
                        <div className="text-red-500 text-xs font-semibold">⚠️ Vencida</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin límite</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="text-sm text-blue-600">⭐ {tarea.recompensaXP} XP</div>
                    <div className="text-sm text-yellow-600">🪙 {tarea.recompensaMonedas} monedas</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {(tarea.estado === "pendiente" || tarea.estado === "en_progreso") ? (
                    <button
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => marcarComoCompletada(tarea._id)}
                      disabled={loadingId === tarea._id}
                    >
                      {loadingId === tarea._id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </span>
                      ) : (
                        "✅ Completar"
                      )}
                    </button>
                  ) : tarea.estado === "en_revision" ? (
                    <div className="flex items-center text-orange-600 text-sm font-semibold">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      En Revisión
                    </div>
                  ) : tarea.estado === "completada" ? (
                    <div className="flex items-center text-green-700 text-sm font-semibold">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completada
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con resumen */}
      <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total de tareas: <strong>{tareas.length}</strong></span>
          <div className="space-x-4">
            <span>Pendientes: <strong className="text-yellow-600">{tareas.filter(t => t.estado === 'pendiente').length}</strong></span>
            <span>En revisión: <strong className="text-orange-600">{tareas.filter(t => t.estado === 'en_revision').length}</strong></span>
            <span>Completadas: <strong className="text-green-600">{tareas.filter(t => t.estado === 'completada').length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

TareasEmpleado.propTypes = {
  tareas: PropTypes.array.isRequired,
};

export default TareasEmpleado;