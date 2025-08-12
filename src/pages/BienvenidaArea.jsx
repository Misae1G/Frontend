import { useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import useFetch from "../hooks/useFetch.js"
import AreaTabs from "../components/MisAreas/AreaTabs.jsx"
import storeAuth from '../context/storeAuth.jsx'
import storeProfile from '../context/storeProfile.jsx'

const BienvenidaArea = () => {
    const { id } = useParams()
    const { fetchDataBackend } = useFetch()
    const { profile } = storeProfile()
    
    const [codigoGenerado, setCodigoGenerado] = useState("")
    const [showCodigo, setShowCodigo] = useState(false)
    const [empleados, setEmpleados] = useState([])
    const [expulsando, setExpulsando] = useState(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("novedades")
    const [userRole, setUserRole] = useState(null)
    const [empresaData, setEmpresaData] = useState(null)
    const [misTareas, setMisTareas] = useState([])
    const [isOwnerOfThisEmpresa, setIsOwnerOfThisEmpresa] = useState(false)
    const firstLoad = useRef(true)

    useEffect(() => {
        initializeArea()
    }, [id])

    useEffect(() => {
        if (activeTab === "personas" && isOwnerOfThisEmpresa) {
            fetchEmpleados()
        }
    }, [activeTab, isOwnerOfThisEmpresa])

    const initializeArea = async () => {
        try {
            await profile()
            
            const token = localStorage.getItem('token')
            if (token) {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]))
                console.log('🔍 TOKEN PAYLOAD:', tokenPayload)
                console.log('🔍 ROL DETECTADO:', tokenPayload.rol)
                console.log('🔍 EMPRESA EN TOKEN:', tokenPayload.empresaId)
                console.log('🔍 EMPRESA EN URL:', id)
                
                setUserRole(tokenPayload.rol)
                
                const isOwner = tokenPayload.rol === 'jefe' && tokenPayload.empresaId === id
                setIsOwnerOfThisEmpresa(isOwner)
                
                console.log('🔍 ¿Es dueño de esta empresa?', isOwner)
                
                if (isOwner) {
                    console.log('✅ Es JEFE Y DUEÑO - Seleccionando empresa')
                    await selectEmpresaForJefe()
                } else {
                    console.log('✅ No es dueño - Cargando como empleado/usuario')
                    await loadEmpresaData()
                    if (tokenPayload.rol === 'empleado') {
                        console.log('📋 Cargando tareas del empleado...')
                        await fetchMisTareas()
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing area:', error)
        }
    }

    const fetchMisTareas = async () => {
        try {
            console.log('📋 Fetching mis tareas...')
            const tareas = await fetchDataBackend(
                'http://localhost:8080/api/tareas/mis-tareas',
                null,
                'GET'
            )
            console.log('📋 Tareas recibidas:', tareas)
            setMisTareas(Array.isArray(tareas) ? tareas : [])
        } catch (error) {
            console.error('Error fetching mis tareas:', error)
            setMisTareas([])
        }
    }

    const selectEmpresaForJefe = async () => {
        try {
            const data = await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${id}`,
                null,
                'POST'
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            await loadEmpresaData()
        } catch (error) {
            console.error('Error selecting empresa for jefe:', error)
            console.log('🔄 Intentando cargar como empleado...')
            setIsOwnerOfThisEmpresa(false)
            await loadEmpresaData()
            await fetchMisTareas()
        }
    }

    const loadEmpresaData = async () => {
        try {
            const empresaInfo = await fetchDataBackend(
                'http://localhost:8080/api/empresa/mi-empresa',
                null,
                'GET'
            )
            setEmpresaData(empresaInfo)
        } catch (error) {
            console.error('Error loading empresa data:', error)
        }
    }

    const fetchEmpleados = async () => {
        if (loading || !isOwnerOfThisEmpresa) return
        
        setLoading(true)
        try {
            const data = await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${id}`,
                null,
                'POST'
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            
            const res = await fetchDataBackend(
                `http://localhost:8080/api/empresa/empleados`,
                null,
                'GET'
            )
            
            console.log('Empleados recibidos:', res)
            if (Array.isArray(res) && res.length >= 0) {
                setEmpleados(res)
            } else {
                setEmpleados([])
            }
        } catch (error) {
            console.error('Error al obtener empleados:', error)
            window.toast && window.toast.error('Error al cargar los miembros del equipo')
            setEmpleados([])
        } finally {
            setLoading(false)
        }
    }

    const handleExpulsarEmpleado = async (empleadoId) => {
        if (expulsando || !isOwnerOfThisEmpresa) return
        
        setExpulsando(empleadoId)
        try {
            const data = await fetchDataBackend(
                `http://localhost:8080/api/empresa/seleccionar/${id}`,
                null,
                'POST'
            )
            if (data.token) {
                localStorage.setItem("token", data.token)
                storeAuth.getState().setToken(data.token)
            }
            
            const res = await fetchDataBackend(
                `http://localhost:8080/api/empresa/expulsar/${empleadoId}`,
                null,
                'POST'
            )
            
            if (res.msg) {
                window.toast && window.toast.success(res.msg)
            }
            
            await fetchEmpleados()
        } catch (error) {
            console.error('Error al expulsar empleado:', error)
            window.toast && window.toast.error('Error al expulsar al miembro del equipo')
        } finally {
            setExpulsando(null)
        }
    }

    const handleGenerarCodigo = async () => {
        if (!isOwnerOfThisEmpresa) {
            window.toast && window.toast.error('Solo los propietarios pueden generar códigos de invitación')
            return
        }

        try {
            const resSeleccion = await fetchDataBackend(
                "http://localhost:8080/api/empresa/seleccionar/" + id,
                null,
                "POST"
            )
            if (resSeleccion.token) {
                localStorage.setItem("token", resSeleccion.token)
                storeAuth.getState().setToken(resSeleccion.token)
            }
            
            const res = await fetchDataBackend(
                "http://localhost:8080/api/empresa/generar-invitacion",
                null,
                "PUT"
            )
            
            setCodigoGenerado(res.codigo)
            setShowCodigo(true)
            
            setTimeout(() => {
                setShowCodigo(false)
            }, 10000)
        } catch (error) {
            console.error('Error al generar código:', error)
            window.toast && window.toast.error('Error al generar código de invitación')
        }
    }

    const copiarCodigo = async () => {
        try {
            await navigator.clipboard.writeText(codigoGenerado)
            window.toast && window.toast.success('Código copiado al portapapeles')
        } catch (error) {
            const textArea = document.createElement('textarea')
            textArea.value = codigoGenerado
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            window.toast && window.toast.success('Código copiado al portapapeles')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 relative">
            {/* Partículas decorativas de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-green-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="max-w-6xl mx-auto">
                    {/* Botón generar código mejorado */}
                    {isOwnerOfThisEmpresa && (
                        <div className="flex justify-end mb-6">
                            <button
                                className="group bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 font-semibold"
                                onClick={handleGenerarCodigo}
                            >
                                <span className="text-xl group-hover:animate-bounce">🎫</span>
                                <span>Generar Código de Invitación</span>
                            </button>
                        </div>
                    )}

                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50 max-w-4xl mx-auto">
                            {/* Icono principal animado */}
                            <div className="relative mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-green-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                                    <span className="text-4xl animate-bounce">🏢</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white animate-pulse"></div>
                            </div>

                            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-4">
                                {empresaData ? `¡Bienvenido a ${empresaData.nombre}!` : '¡Bienvenido al Área!'}
                            </h1>
                            
                            {empresaData && (
                                <div className="mb-6 space-y-3">
                                    <p className="text-xl text-gray-700 leading-relaxed font-medium">{empresaData.descripcion}</p>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                                        {empresaData.direccion && (
                                            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                                                <span>📍</span>
                                                <span>{empresaData.direccion}</span>
                                            </div>
                                        )}
                                        {empresaData.telefono && (
                                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                                                <span>📞</span>
                                                <span>{empresaData.telefono}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recuadro del código generado mejorado */}
                    {showCodigo && codigoGenerado && isOwnerOfThisEmpresa && (
                        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
                            <div className="bg-white/95 backdrop-blur-md border-2 border-green-300 rounded-2xl shadow-2xl p-6 max-w-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎫</span>
                                        <span className="font-bold text-blue-600">Código Generado</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowCodigo(false)}
                                        className="text-gray-400 hover:text-red-500 text-xl transition-colors hover:scale-110"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div
                                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-3 rounded-xl cursor-pointer text-center hover:from-blue-500 hover:to-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    onClick={copiarCodigo}
                                    title="Hacer clic para copiar al portapapeles"
                                >
                                    <div className="font-mono text-lg font-bold tracking-wider">{codigoGenerado}</div>
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-600">
                                    <span>📋</span>
                                    <span>Click para copiar</span>
                                </div>
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800 text-center">
                                        ⏰ Se oculta automáticamente en 10s
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs Section */}
                    <div className="max-w-7xl mx-auto">
                        <AreaTabs 
                            isJefe={isOwnerOfThisEmpresa}
                            userRole={userRole}
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab}
                            empleados={empleados}
                            onExpulsarEmpleado={handleExpulsarEmpleado}
                            expulsando={expulsando}
                            empresaId={id}
                            onTareaCreada={loadEmpresaData}
                            tareasEmpleado={misTareas}
                        />
                    </div>

                    {/* Mensaje informativo mejorado */}
                    {/* Eliminado mensaje informativo para no propietarios */}

                    {/* Decorative elements */}
                    <div className="fixed bottom-6 left-6 opacity-20">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BienvenidaArea