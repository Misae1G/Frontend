import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import useFetch from "../../hooks/useFetch.js"
import storeAuth from '../../context/storeAuth.jsx'
import { toast } from 'react-toastify'

const CardAreas = ({ areas, onSelect, onChange, isEmployee = false }) => {
    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    const [codigoGenerado, setCodigoGenerado] = useState({})
    const [menuAbierto, setMenuAbierto] = useState(null)
    const [empresaAEliminar, setEmpresaAEliminar] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [empresaAEditar, setEmpresaAEditar] = useState(null)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [formUpdate, setFormUpdate] = useState({ nombre: '', descripcion: '', direccion: '', telefono: '' })
    const [showSalirModal, setShowSalirModal] = useState(false)
    const [empresaASalir, setEmpresaASalir] = useState(null)
    const [isLoading, setIsLoading] = useState({})

    // Helper para obtener el rol del usuario desde el token
    const getUserRole = () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token found')
                return null
            }
            
            const tokenParts = token.split('.')
            if (tokenParts.length !== 3) {
                console.log('Invalid token format')
                return null
            }
            
            const payload = JSON.parse(atob(tokenParts[1]))
            console.log('Token payload:', payload)
            return payload.rol
        } catch (error) {
            console.error('Error decoding token:', error)
            return null
        }
    }

    if (!areas || areas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-full p-8 mb-6">
                    <span className="text-6xl">🏢</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mb-2">No hay áreas disponibles</h3>
                <p className="text-gray-500 text-center max-w-md">
                    {isEmployee 
                        ? "No tienes acceso a ningún área de trabajo. Solicita acceso a tu administrador."
                        : "Aún no has creado ningún área de trabajo. ¡Crea tu primera área para comenzar!"
                    }
                </p>
            </div>
        )
    }

    const handleGenerarCodigo = async (id) => {
        setIsLoading(prev => ({ ...prev, [id]: true }))
        try {
            const data = await fetchDataBackend(
                "http://localhost:8080/api/empresa/seleccionar/" + id,
                null,
                "POST"
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            const res = await fetchDataBackend(
                "http://localhost:8080/api/empresa/generar-invitacion",
                null,
                "PUT"
            )
            setCodigoGenerado(prev => ({ ...prev, [id]: res.codigo }))
            setMenuAbierto(null)
            
            if (res.codigo) {
                toast.success(`✅ Código generado: ${res.codigo}`)
            }
            
            if (onChange) {
                await onChange()
            }
        } catch (error) {
            toast.error('❌ Error al generar código de invitación')
            console.error('Error al generar código:', error)
        } finally {
            setIsLoading(prev => ({ ...prev, [id]: false }))
        }
    }

    const handleMenuClick = (e, id) => {
        e.stopPropagation()
        setMenuAbierto(menuAbierto === id ? null : id)
    }

    const handleUpdate = (e, area) => {
        e.stopPropagation()
        setEmpresaAEditar(area)
        setFormUpdate({
            nombre: area.nombre || '',
            descripcion: area.descripcion || '',
            direccion: area.direccion || '',
            telefono: area.telefono || ''
        })
        setShowUpdateModal(true)
        setMenuAbierto(null)
    }

    const handleUpdateChange = (e) => {
        setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value })
    }

    const confirmarActualizar = async () => {
        if (!empresaAEditar) return
        const updatePayload = {
            nombre: formUpdate.nombre || empresaAEditar.nombre || '',
            descripcion: formUpdate.descripcion || empresaAEditar.descripcion || '',
            direccion: formUpdate.direccion || empresaAEditar.direccion || '',
            telefono: formUpdate.telefono || empresaAEditar.telefono || ''
        }
        try {
            const data = await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${empresaAEditar._id}`,
                null,
                'POST'
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            const result = await fetchDataBackend(
                `http://localhost:8080/api/empresa/actualizar`,
                updatePayload,
                'PUT'
            )
            
            if (result?.msg) {
                toast.success(`✅ ${result.msg}`)
            } else {
                toast.success('✅ Empresa actualizada exitosamente')
            }
            
            setShowUpdateModal(false)
            setEmpresaAEditar(null)
            setFormUpdate({ nombre: '', descripcion: '', direccion: '', telefono: '' })
            
            if (onChange) {
                await onChange()
            }
        } catch (error) {
            toast.error('❌ Error al actualizar empresa')
            console.error('Error al actualizar empresa:', error)
        }
    }

    const handleDelete = (e, area) => {
        e.stopPropagation()
        setEmpresaAEliminar(area)
        setShowModal(true)
        setMenuAbierto(null)
    }

    const confirmarEliminar = async () => {
        if (!empresaAEliminar) return
        try {
            const data = await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${empresaAEliminar._id}`,
                null,
                'POST'
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            const res = await fetchDataBackend(
                `http://localhost:8080/api/empresa/eliminar/${empresaAEliminar._id}`,
                null,
                'DELETE'
            )
            
            if (res && res.msg) {
                toast.success(`✅ ${res.msg}`)
            } else {
                toast.success('✅ Empresa eliminada exitosamente')
            }
            
            setCodigoGenerado(prev => {
                const newCodigos = { ...prev }
                delete newCodigos[empresaAEliminar._id]
                return newCodigos
            })
            
            setShowModal(false)
            setEmpresaAEliminar(null)
            
            if (onChange) {
                await onChange()
            }
        } catch (error) {
            setShowModal(false)
            setEmpresaAEliminar(null)
            toast.error('❌ Error al eliminar empresa')
            console.error('Error al eliminar empresa:', error)
        }
    }

    const handleSalirEmpresa = (e, area) => {
        e.stopPropagation()
        setEmpresaASalir(area)
        setShowSalirModal(true)
        setMenuAbierto(null)
    }

    const confirmarSalirEmpresa = async () => {
        if (!empresaASalir) return
        try {
            const res = await fetchDataBackend(
                `http://localhost:8080/api/auth/salir-empresa/${empresaASalir._id}`,
                null,
                'DELETE'
            )
            
            if (res && res.msg) {
                toast.success(`✅ ${res.msg}`)
            } else {
                toast.success('✅ Has salido de la empresa exitosamente')
            }
            
            setShowSalirModal(false)
            setEmpresaASalir(null)
            
            if (onChange) {
                await onChange()
            } else {
                navigate('/dashboard')
            }
            
        } catch (error) {
            setShowSalirModal(false)
            setEmpresaASalir(null)
            
            let errorMessage = 'Error al salir de la empresa'
            
            if (error.message) {
                if (error.message.includes('No estás asociado a ninguna empresa')) {
                    errorMessage = 'No estás asociado a ninguna empresa o no eres empleado'
                } else {
                    errorMessage = error.message
                }
            }
            
            toast.error(`❌ ${errorMessage}`)
            console.error('Error al salir de la empresa:', error)
        }
    }

    const handleClickOutside = () => {
        setMenuAbierto(null)
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" onClick={handleClickOutside}>
                {areas.map((area, index) => (
                    <div
                        key={area._id}
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 cursor-pointer hover:shadow-2xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1"
                        onClick={(e) => {
                            e.stopPropagation()
                            
                            if (onSelect) {
                                onSelect(area._id)
                                return
                            }
                            
                            const userRole = getUserRole()
                            console.log('User role detected:', userRole)
                            
                            if (userRole === 'jefe') {
                                console.log(`Navigating to: /dashboard/bienvenida-area/${area._id}`)
                                navigate(`/dashboard/bienvenida-area/${area._id}`)
                            } else {
                                console.log(`Navigating to: /dashboard/bienvenida-area-empleado/${area._id}`)
                                navigate(`/dashboard/bienvenida-area-empleado/${area._id}`)
                            }
                        }}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Gradiente decorativo en la parte superior */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-green-400 to-blue-600"></div>
                        
                        {/* Efecto de brillo al hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Menú de 3 puntos mejorado */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 group-hover:scale-110"
                                onClick={e => handleMenuClick(e, area._id)}
                            >
                                <span className="text-blue-600 text-xl font-bold">⋮</span>
                            </button>
                            
                            {menuAbierto === area._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-green-200 rounded-xl shadow-2xl py-2 z-20 animate-in">
                                    {isEmployee ? (
                                        <button
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                            onClick={e => handleSalirEmpresa(e, area)}
                                        >
                                            <span>🚪</span>
                                            Salir de la empresa
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                                onClick={e => handleUpdate(e, area)}
                                            >
                                                <span>✏️</span>
                                                Actualizar
                                            </button>
                                            <button
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                onClick={e => handleDelete(e, area)}
                                            >
                                                <span>🗑️</span>
                                                Eliminar
                                            </button>
                                            <div className="h-px bg-gray-200 my-1"></div>
                                            <button
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleGenerarCodigo(area._id)
                                                }}
                                                disabled={isLoading[area._id]}
                                            >
                                                {isLoading[area._id] ? (
                                                    <>
                                                        <span className="animate-spin">⏳</span>
                                                        Generando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🔗</span>
                                                        Generar código
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Mostrar código generado mejorado */}
                        {!isEmployee && codigoGenerado[area._id] && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg z-20 animate-in">
                                <div className="flex items-center gap-2">
                                    <span>🔑</span>
                                    <span>Código: {codigoGenerado[area._id]}</span>
                                </div>
                            </div>
                        )}

                        {/* Contenido principal de la card */}
                        <div className="p-6 pt-8 relative">
                            {/* Icono decorativo */}
                            <div className="mb-4">
                                <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
                                    <span className="text-2xl">{isEmployee ? '👥' : '🏢'}</span>
                                </div>
                            </div>

                            {/* Título y descripción */}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                                    {area.nombre}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
                                    {area.descripcion || 'Sin descripción disponible'}
                                </p>
                            </div>

                            {/* Información adicional */}
                            <div className="space-y-2 mb-4">
                                {area.direccion && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📍</span>
                                        <span className="truncate">{area.direccion}</span>
                                    </div>
                                )}
                                {area.telefono && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📞</span>
                                        <span>{area.telefono}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer de la card */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600 font-semibold">
                                        {isEmployee ? 'Miembro' : 'Administrador'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                                    ID: {area._id.slice(-6)}
                                </div>
                            </div>

                            {/* Efecto hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de confirmación para salir de la empresa (mejorado) */}
            {isEmployee && showSalirModal && empresaASalir && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 rounded-full p-3">
                                        <span className="text-2xl">🚪</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-red-600">Salir de la empresa</h3>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-red-500 text-2xl transition-colors duration-200 hover:scale-110"
                                    onClick={() => { setShowSalirModal(false); setEmpresaASalir(null) }}
                                >✕</button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    ¿Estás seguro de que deseas salir de <span className="font-bold text-blue-600">{empresaASalir.nombre}</span>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-700 text-sm">
                                        ⚠️ Perderás acceso a todas las áreas de esta empresa y no podrás recuperar tu progreso.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowSalirModal(false); setEmpresaASalir(null) }}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarSalirEmpresa}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                                >
                                    Sí, salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de actualización de empresa (mejorado) */}
            {!isEmployee && showUpdateModal && empresaAEditar && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform animate-in max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-full p-3">
                                        <span className="text-2xl">✏️</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-600">Actualizar empresa</h3>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-blue-500 text-2xl transition-colors duration-200 hover:scale-110"
                                    onClick={() => { setShowUpdateModal(false); setEmpresaAEditar(null) }}
                                >✕</button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                                        Nombre de la empresa *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formUpdate.nombre}
                                        onChange={handleUpdateChange}
                                        className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Ingresa el nombre de la empresa"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formUpdate.descripcion}
                                        onChange={handleUpdateChange}
                                        rows="3"
                                        className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                        placeholder="Describe brevemente la empresa..."
                                    ></textarea>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formUpdate.direccion}
                                            onChange={handleUpdateChange}
                                            className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Dirección física"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formUpdate.telefono}
                                            onChange={handleUpdateChange}
                                            className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Número de contacto"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => { setShowUpdateModal(false); setEmpresaAEditar(null) }}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarActualizar}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                                >
                                    <span>💾</span>
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar empresa (mejorado) */}
            {!isEmployee && showModal && empresaAEliminar && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 rounded-full p-3">
                                        <span className="text-2xl">🗑️</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-red-600">Eliminar empresa</h3>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-red-500 text-2xl transition-colors duration-200 hover:scale-110"
                                    onClick={() => { setShowModal(false); setEmpresaAEliminar(null) }}
                                >✕</button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    ¿Estás seguro de que deseas eliminar <span className="font-bold text-blue-600">{empresaAEliminar.nombre}</span>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-700 text-sm">
                                        ⚠️ Esta acción no se puede deshacer. Se perderán todos los datos asociados a esta empresa.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowModal(false); setEmpresaAEliminar(null) }}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarEliminar}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                                >
                                    Sí, eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

CardAreas.propTypes = {
    areas: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
    isEmployee: PropTypes.bool
}

export default CardAreas