import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import useFetch from "../hooks/useFetch.js"
import storeProfile from '../context/storeProfile.jsx'
import storeAuth from '../context/storeAuth.jsx'

const EmpleadoProfile = () => {
    const { id } = useParams() // ID del empleado
    const navigate = useNavigate()
    const location = useLocation()
    const { fetchDataBackend } = useFetch()
    const { userProfile } = storeProfile()
    
    const [empleado, setEmpleado] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [misTareas, setMisTareas] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)

    useEffect(() => {
        initializeAndLoadProfile()
    }, [id])

    // Función para extraer empresaId de la URL anterior o del token
    const getEmpresaId = () => {
        // Intentar obtener de la URL anterior (ej: /dashboard/empresa/66872...)
        const pathParts = location.pathname.split('/')
        const empresaIndex = pathParts.findIndex(part => part === 'empresa')
        if (empresaIndex !== -1 && pathParts[empresaIndex + 1]) {
            return pathParts[empresaIndex + 1]
        }

        // Si no está en la URL, intentar obtener del token
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]))
                return tokenPayload.empresaId
            } catch (error) {
                console.error('Error decodificando token:', error)
            }
        }

        // Último recurso: obtener de referrer
        if (document.referrer) {
            const referrerUrl = new URL(document.referrer)
            const referrerParts = referrerUrl.pathname.split('/')
            const refEmpresaIndex = referrerParts.findIndex(part => part === 'empresa')
            if (refEmpresaIndex !== -1 && referrerParts[refEmpresaIndex + 1]) {
                return referrerParts[refEmpresaIndex + 1]
            }
        }

        return null
    }

    const initializeAndLoadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const empresaId = getEmpresaId()
            console.log('🏢 EMPRESA ID DETECTADA:', empresaId)
            
            // Si es jefe y tenemos empresaId, seleccionar empresa primero
            if (userProfile?.rol === 'jefe' && empresaId) {
                console.log('👑 Es jefe, seleccionando empresa:', empresaId)
                try {
                    const selectionData = await fetchDataBackend(
                        `http://localhost:8080/api/empresa/seleccionar/${empresaId}`,
                        null,
                        'POST'
                    )
                    if (selectionData.token) {
                        localStorage.setItem("token", selectionData.token)
                        storeAuth.getState().setToken(selectionData.token)
                        console.log('✅ Token actualizado para la empresa')
                    }
                } catch (selectionError) {
                    console.error('Error seleccionando empresa:', selectionError)
                    // Continuar sin seleccionar empresa si falla
                }
            }

            // Ahora cargar el perfil del empleado
            await loadEmpleadoProfile()
            
        } catch (error) {
            console.error('Error en inicialización:', error)
            setError('Error al inicializar la vista del perfil')
            setLoading(false)
        }
    }

    const loadEmpleadoProfile = async () => {
        try {
            console.log('📋 Cargando perfil del empleado:', id)
            
            // Usar la nueva ruta para perfil completo
            const empleadoData = await fetchDataBackend(
                `http://localhost:8080/api/auth/empleado/${id}/perfil-completo`,
                null,
                'GET'
            )
            
            if (empleadoData.ok && empleadoData.empleado) {
                setEmpleado(empleadoData.empleado)
                
                // Cargar tareas y estadísticas (tanto para el propio empleado como para el jefe)
                await Promise.all([
                    loadTareasEmpleado(),
                    loadEstadisticasEmpleado()
                ])
            } else {
                setError(empleadoData.msg || 'No se pudo obtener la información del empleado')
            }
            
        } catch (error) {
            console.error('Error cargando perfil del empleado:', error)
            setError(error.response?.data?.msg || 'No se pudo cargar el perfil del empleado')
        } finally {
            setLoading(false)
        }
    }

    const loadTareasEmpleado = async () => {
        try {
            const response = await fetchDataBackend(
                `http://localhost:8080/api/auth/empleado/${id}/tareas`,
                null,
                'GET'
            )
            if (response.ok) {
                setMisTareas(Array.isArray(response.tareas) ? response.tareas : [])
            }
        } catch (error) {
            console.error('Error cargando tareas del empleado:', error)
            setMisTareas([])
        }
    }

    const loadEstadisticasEmpleado = async () => {
        try {
            const response = await fetchDataBackend(
                `http://localhost:8080/api/auth/empleado/${id}/estadisticas`,
                null,
                'GET'
            )
            if (response.ok) {
                setEstadisticas(response.estadisticas)
            }
        } catch (error) {
            console.error('Error cargando estadísticas del empleado:', error)
        }
    }

    const handleVolver = () => {
        navigate(-1) // Volver a la página anterior
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1976D2]"></div>
                <p className="mt-4 text-gray-600">Cargando perfil del empleado...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button 
                        onClick={handleVolver}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    if (!empleado) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">Empleado no encontrado</h2>
                    <p className="text-yellow-700 mb-4">No se encontró información del empleado solicitado.</p>
                    <button 
                        onClick={handleVolver}
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    const esPropio = userProfile && userProfile._id === id
    const esJefe = userProfile && userProfile.rol === 'jefe'
    const tareasCompletadas = misTareas.filter(tarea => tarea.estado === 'completada').length
    const tareasPendientes = misTareas.filter(tarea => tarea.estado === 'pendiente').length
    const tareasEnProceso = misTareas.filter(tarea => tarea.estado === 'en_proceso').length

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header con botón volver */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={handleVolver}
                        className="flex items-center gap-2 text-[#1976D2] hover:text-[#1565C0] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    
                    <div className="flex gap-2">
                        {esPropio && (
                            <span className="bg-[#00C853] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Mi Perfil
                            </span>
                        )}
                        {esJefe && !esPropio && (
                            <span className="bg-[#1976D2] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                👑 Vista de Jefe
                            </span>
                        )}
                    </div>
                </div>

                {/* Tarjeta principal del perfil */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 bg-gradient-to-br from-[#1976D2] to-[#00C853] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                {empleado?.nombre ? empleado.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>
                        
                        {/* Información básica */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {empleado?.nombre || 'Nombre no disponible'}
                            </h1>
                            <p className="text-lg text-gray-600 mb-2">
                                📧 {empleado?.correo || 'Correo no disponible'}
                            </p>
                            {empleado?.telefono && (
                                <p className="text-lg text-gray-600 mb-2">
                                    📞 {empleado.telefono}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                                <span className="bg-[#00C853] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    👤 {empleado.rol === 'jefe' ? 'Administrador' : 'Empleado'}
                                </span>
                                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    ID: {id}
                                </span>
                                {estadisticas?.rendimiento && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        estadisticas.rendimiento === 'Excelente' 
                                            ? 'bg-green-100 text-green-800'
                                            : estadisticas.rendimiento === 'Bueno'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        ⭐ {estadisticas.rendimiento}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas - Visible para empleado propio y para jefe */}
                {(esPropio || esJefe) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-3xl font-bold text-[#00C853] mb-2">{tareasCompletadas}</div>
                            <div className="text-gray-600">Tareas Completadas</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-3xl font-bold text-[#FF9800] mb-2">{tareasEnProceso}</div>
                            <div className="text-gray-600">En Proceso</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-3xl font-bold text-[#F44336] mb-2">{tareasPendientes}</div>
                            <div className="text-gray-600">Pendientes</div>
                        </div>
                    </div>
                )}

                {/* Lista de tareas - Visible para empleado propio y para jefe */}
                {(esPropio || esJefe) && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                📋 {esPropio ? 'Mis Tareas' : `Tareas de ${empleado?.nombre}`}
                            </h2>
                            {estadisticas?.ultimaActividad && (
                                <span className="text-sm text-gray-500">
                                    Última actividad: {new Date(estadisticas.ultimaActividad).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        
                        {misTareas.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-gray-500 text-lg">
                                    {esPropio ? 'No tienes tareas asignadas' : 'Este empleado no tiene tareas asignadas'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {misTareas.map((tarea, index) => (
                                    <div 
                                        key={tarea._id || index} 
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    {tarea.titulo || 'Sin título'}
                                                </h3>
                                                {tarea.descripcion && (
                                                    <p className="text-gray-600 mb-2">{tarea.descripcion}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                                    {tarea.fechaLimite && (
                                                        <span>📅 {new Date(tarea.fechaLimite).toLocaleDateString()}</span>
                                                    )}
                                                    {tarea.prioridad && (
                                                        <span>⭐ {tarea.prioridad}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-4 ${
                                                tarea.estado === 'completada' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : tarea.estado === 'en_proceso'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tarea.estado === 'completada' ? '✅ Completada' :
                                                 tarea.estado === 'en_proceso' ? '🔄 En Proceso' :
                                                 '⏳ Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mensaje para acceso limitado */}
                {!esPropio && !esJefe && (
                    <div className="bg-[#E3F2FD] border border-[#1976D2] rounded-lg p-6 text-center">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold text-[#1976D2] mb-2">
                            Acceso Limitado
                        </h3>
                        <p className="text-gray-700">
                            Solo puedes ver información básica de otros empleados.
                        </p>
                    </div>
                )}

                {/* Panel de administrador para jefes */}
                {esJefe && !esPropio && (
                    <div className="bg-gradient-to-r from-[#1976D2]/10 to-[#00C853]/10 border border-[#1976D2]/30 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-2xl">👑</div>
                            <h3 className="text-xl font-semibold text-[#1976D2]">
                                Panel de Administrador
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-2">📊 Rendimiento</h4>
                                <p className="text-sm text-gray-600">
                                    {estadisticas?.rendimiento || 'No evaluado'}
                                </p>
                            </div>
                            <div className="bg-white/50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-2">📈 Proyectos Activos</h4>
                                <p className="text-sm text-gray-600">
                                    {estadisticas?.proyectosActivos || 0} proyectos
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                            Como administrador, puedes ver el rendimiento completo y las tareas de {empleado?.nombre}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmpleadoProfile