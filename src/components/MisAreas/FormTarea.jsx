import { useState } from "react";
import PropTypes from "prop-types";
import useFetch from "../../hooks/useFetch.js";

const FormTarea = ({ empleados, empresaId, onTareaCreada }) => {
    const { fetchDataBackend } = useFetch();
    
    // Debug: Verificar que el sistema de toast esté disponible
    console.log('🔍 Toast disponible:', !!window.toast);
    console.log('🔍 Empleados recibidos:', empleados.length);
    console.log('🔍 EmpresaId:', empresaId);
    
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        dificultad: "baja",
        asignadoA: "",
        recompensaXP: 0,
        recompensaMonedas: 0,
        fechaLimite: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.nombre.trim()) {
            newErrors.nombre = "El nombre de la tarea es obligatorio";
        }
        
        if (!form.descripcion.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }
        
        if (!form.asignadoA) {
            newErrors.asignadoA = "Debes seleccionar un empleado";
        }
        
        if (form.recompensaXP < 0 || form.recompensaXP > 1000) {
            newErrors.recompensaXP = "La recompensa XP debe estar entre 0 y 1000";
        }
        
        if (form.recompensaMonedas < 0 || form.recompensaMonedas > 500) {
            newErrors.recompensaMonedas = "Las monedas deben estar entre 0 y 500";
        }

        if (form.fechaLimite && new Date(form.fechaLimite) < new Date()) {
            newErrors.fechaLimite = "La fecha límite no puede ser en el pasado";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        // Validar formulario antes de enviar
        if (!validateForm()) {
            window.toast && window.toast.error("❌ Por favor, corrige los errores en el formulario");
            return;
        }

        setLoading(true);
        
        try {
            // Selecciona la empresa para obtener el token correcto
            await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${empresaId}`,
                null,
                "POST"
            );
            
            // Envía la tarea al backend (Corregida la URL)
            const res = await fetchDataBackend(
                "http://localhost:8080/api/tareas/crear",
                {
                    ...form,
                    recompensaXP: Number(form.recompensaXP),
                    recompensaMonedas: Number(form.recompensaMonedas)
                },
                "POST"
            );
            
            // Verificar si la respuesta fue exitosa
            if (res && res.tarea) {
                // Encontrar el nombre del empleado asignado
                const empleadoAsignado = empleados.find(emp => emp._id === form.asignadoA);
                const nombreEmpleado = empleadoAsignado ? empleadoAsignado.nombre : 'empleado';
                
                // Mostrar mensaje personalizado de éxito (solo si useFetch no lo hizo)
                console.log('✅ Tarea creada exitosamente:', res.tarea);
                
                // Limpiar formulario
                setForm({
                    nombre: "",
                    descripcion: "",
                    dificultad: "baja",
                    asignadoA: "",
                    recompensaXP: 0,
                    recompensaMonedas: 0,
                    fechaLimite: ""
                });
                
                // Limpiar errores
                setErrors({});
                
                // Callback para actualizar componentes padre
                if (onTareaCreada) {
                    onTareaCreada(res.tarea);
                }
            } else {
                // Mostrar mensaje de error del servidor
                const errorMessage = res?.msg || "Error desconocido al crear la tarea";
                console.error('❌ Error del servidor:', errorMessage);
                window.toast && window.toast.error(`❌ ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            
            // Manejar diferentes tipos de errores
            let errorMessage = "Error inesperado al crear la tarea";
            
            if (error.response) {
                // Error del servidor con respuesta
                errorMessage = error.response.data?.msg || `Error ${error.response.status}: ${error.response.statusText}`;
                console.error('Error del servidor:', error.response.data);
            } else if (error.request) {
                // Error de red/conexión
                errorMessage = "Error de conexión. Verifica tu conexión a internet";
                console.error('Error de conexión:', error.request);
            } else if (error.message) {
                // Error personalizado
                errorMessage = error.message;
                console.error('Error personalizado:', error.message);
            }
            
            // Siempre mostrar el toast de error
            if (window.toast) {
                window.toast.error(`❌ ${errorMessage}`);
            } else {
                // Fallback si no hay toast disponible
                alert(`Error: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const empleadosDisponibles = empleados.filter(e => e.rol !== "jefe");

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la tarea *</label>
                <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Revisar documentos del proyecto"
                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe detalladamente la tarea a realizar..."
                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                        errors.descripcion ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dificultad *</label>
                    <select
                        name="dificultad"
                        value={form.dificultad}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2]"
                    >
                        <option value="baja">🟢 Baja (Fácil)</option>
                        <option value="media">🟡 Media (Moderada)</option>
                        <option value="alta">🔴 Alta (Difícil)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha límite (opcional)</label>
                    <input
                        type="date"
                        name="fechaLimite"
                        value={form.fechaLimite}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                            errors.fechaLimite ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.fechaLimite && <p className="mt-1 text-sm text-red-600">{errors.fechaLimite}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Asignar a empleado *</label>
                <select
                    name="asignadoA"
                    value={form.asignadoA}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                        errors.asignadoA ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="">👤 Selecciona un empleado...</option>
                    {empleadosDisponibles.map(e => (
                        <option key={e._id} value={e._id}>
                            {e.nombre} - {e.correo}
                        </option>
                    ))}
                </select>
                {errors.asignadoA && <p className="mt-1 text-sm text-red-600">{errors.asignadoA}</p>}
                {empleadosDisponibles.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                        ⚠️ No hay empleados disponibles para asignar tareas
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Recompensa XP *</label>
                    <input
                        type="number"
                        name="recompensaXP"
                        value={form.recompensaXP}
                        onChange={handleChange}
                        min={0}
                        max={1000}
                        placeholder="Ej: 50"
                        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                            errors.recompensaXP ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">⭐ Puntos de experiencia (0-1000)</p>
                    {errors.recompensaXP && <p className="mt-1 text-sm text-red-600">{errors.recompensaXP}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Recompensa Monedas *</label>
                    <input
                        type="number"
                        name="recompensaMonedas"
                        value={form.recompensaMonedas}
                        onChange={handleChange}
                        min={0}
                        max={500}
                        placeholder="Ej: 25"
                        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-[#1976D2] focus:border-[#1976D2] ${
                            errors.recompensaMonedas ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">🪙 Monedas virtuales (0-500)</p>
                    {errors.recompensaMonedas && <p className="mt-1 text-sm text-red-600">{errors.recompensaMonedas}</p>}
                </div>
            </div>
            
            {/* Preview de la tarea */}
            {form.nombre && form.asignadoA && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">📋 Vista previa de la tarea:</h4>
                    <p className="text-sm text-blue-800">
                        <strong>"{form.nombre}"</strong> será asignada a{' '}
                        <strong>{empleados.find(e => e._id === form.asignadoA)?.nombre}</strong>
                        {form.recompensaXP > 0 && ` con ${form.recompensaXP} XP`}
                        {form.recompensaMonedas > 0 && ` y ${form.recompensaMonedas} monedas`}
                        {form.fechaLimite && ` (límite: ${new Date(form.fechaLimite).toLocaleDateString()})`}
                    </p>
                </div>
            )}
            
            <button
                type="submit"
                disabled={loading || empleadosDisponibles.length === 0}
                className={`w-full py-3 px-4 font-bold rounded-lg shadow transition-all duration-200 ${
                    loading 
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                        : empleadosDisponibles.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#00C853] text-white hover:bg-[#1976D2] hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ⏳ Creando tarea...
                    </span>
                ) : empleadosDisponibles.length === 0 ? (
                    "❌ Sin empleados disponibles"
                ) : (
                    "🚀 Crear y asignar tarea"
                )}
            </button>
        </form>
    );
};

FormTarea.propTypes = {
    empleados: PropTypes.array.isRequired,
    empresaId: PropTypes.string.isRequired,
    onTareaCreada: PropTypes.func
};

export default FormTarea;