import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import FormTarea from "./FormTarea.jsx";
import TareasEmpleado from "./TareasEmpleado.jsx";
import ChatGlobal from "./ChatGlobal.jsx";
import storeProfile from "../../context/storeProfile.jsx";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL.replace(/\/api\/auth$/, "");

const getToken = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    return storedUser?.state?.token;
  } catch {
    return null;
  }
};

const AreaTabs = ({ 
    isJefe = false, 
    activeTab, 
    setActiveTab, 
    empleados = [], 
    onExpulsarEmpleado, 
    expulsando, 
    empresaId, 
    onTareaCreada, 
    tareasEmpleado = []
}) => {
    const navigate = useNavigate();
    const { user: usuarioActual, profile } = storeProfile();
    
    // Estados para chat privado (JEFE)
    const [chatPrivadoAbierto, setChatPrivadoAbierto] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [mensajesPrivados, setMensajesPrivados] = useState([]);
    const [inputPrivado, setInputPrivado] = useState("");
    const [cargandoPrivado, setCargandoPrivado] = useState(false);
    const [enviandoPrivado, setEnviandoPrivado] = useState(false);
    const [usuarioEscribiendoPrivado, setUsuarioEscribiendoPrivado] = useState(false);
    
    // Estados para mensajes del jefe (EMPLEADOS)
    const [mensajesDelJefe, setMensajesDelJefe] = useState([]);
    const [cargandoMensajesJefe, setCargandoMensajesJefe] = useState(false);
    const [hayMensajesNoLeidos, setHayMensajesNoLeidos] = useState(false);
    
    // Estados para tareas en revisión (JEFE)
    const [tareasEnRevision, setTareasEnRevision] = useState([]);
    const [cargandoTareasRevision, setCargandoTareasRevision] = useState(false);
    const [verificando, setVerificando] = useState(null);
    
    const socketPrivadoRef = useRef(null);
    const mensajesPrivadosEndRef = useRef(null);
    const escribiendoPrivadoTimeoutRef = useRef(null);

    // Todas las funciones existentes se mantienen igual...
    if (!isJefe && (activeTab === "tareas" || activeTab === "personas")) {
        setActiveTab("novedades");
    }

    const handleVerPerfilEmpleado = (empleadoId) => {
        navigate(`/dashboard/empleado/perfil/${empleadoId}`)
    }

    const cargarTareasEnRevision = async () => {
        if (!isJefe || !empresaId) return;
        
        setCargandoTareasRevision(true);
        try {
            const token = getToken();
            const response = await fetch(`${ENDPOINT}/api/tareas/en-revision`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setTareasEnRevision(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error al cargar tareas en revisión:', error);
        } finally {
            setCargandoTareasRevision(false);
        }
    };

    const handleVerificarTarea = async (tareaId) => {
        if (verificando) return;
        
        setVerificando(tareaId);
        try {
            const token = getToken();
            const response = await fetch(`${ENDPOINT}/api/tareas/verificar/${tareaId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                if (window.toast) {
                    window.toast.success(data.msg || 'Tarea aprobada y recompensas otorgadas');
                } else {
                    alert(data.msg || 'Tarea aprobada y recompensas otorgadas');
                }
                await cargarTareasEnRevision();
            } else {
                const errorData = await response.json();
                if (window.toast) {
                    window.toast.error(errorData.msg || 'Error al aprobar la tarea');
                } else {
                    alert(errorData.msg || 'Error al aprobar la tarea');
                }
            }
        } catch (error) {
            console.error('Error al verificar tarea:', error);
            if (window.toast) {
                window.toast.error('Error al aprobar la tarea');
            } else {
                alert('Error al aprobar la tarea');
            }
        } finally {
            setVerificando(null);
        }
    };

    const handleRechazarTarea = async (tarea) => {
        if (verificando) return;
        
        setVerificando(tarea._id);
        try {
            const token = getToken();
            const response = await fetch(`${ENDPOINT}/api/tareas/rechazar/${tarea._id}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    motivo: 'La tarea necesita ser revisada y reenviada. Por favor, revisa los requisitos y vuelve a enviarla.'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (window.toast) {
                    window.toast.success(data.msg || 'Tarea rechazada. El empleado debe reenviarla.');
                } else {
                    alert(data.msg || 'Tarea rechazada. El empleado debe reenviarla.');
                }
                await cargarTareasEnRevision();
            } else {
                const errorData = await response.json();
                if (window.toast) {
                    window.toast.error(errorData.msg || 'Error al rechazar la tarea');
                } else {
                    alert(errorData.msg || 'Error al rechazar la tarea');
                }
            }
        } catch (error) {
            console.error('Error al rechazar tarea:', error);
            if (window.toast) {
                window.toast.error('Error al rechazar la tarea');
            } else {
                alert('Error al rechazar la tarea');
            }
        } finally {
            setVerificando(null);
        }
    };

    const cargarMensajesDelJefe = async () => {
        if (isJefe || !usuarioActual?._id) return;
        
        setCargandoMensajesJefe(true);
        try {
            const token = getToken();
            const response = await fetch(`${ENDPOINT}/api/chat/mensajes-jefe/${usuarioActual._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.ok) {
                const data = await response.json();
                setMensajesDelJefe(Array.isArray(data) ? data : []);
                
                const noLeidos = data.some(msg => !msg.leido && msg.para === usuarioActual._id);
                setHayMensajesNoLeidos(noLeidos);
            }
        } catch (error) {
            console.error("Error al obtener mensajes del jefe:", error);
        } finally {
            setCargandoMensajesJefe(false);
        }
    };

    const marcarMensajesComoLeidos = async () => {
        if (isJefe || !usuarioActual?._id) return;
        
        try {
            const token = getToken();
            await fetch(`${ENDPOINT}/api/chat/marcar-leidos/${usuarioActual._id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            setHayMensajesNoLeidos(false);
        } catch (error) {
            console.error("Error al marcar mensajes como leídos:", error);
        }
    };

    const handleAbrirChatPrivado = async (empleado) => {
        if (!isJefe) return;
        
        setEmpleadoSeleccionado(empleado);
        setChatPrivadoAbierto(true);
        setCargandoPrivado(true);
        setMensajesPrivados([]);

        try {
            const token = getToken();
            const response = await fetch(`${ENDPOINT}/api/chat/privado/${empleado._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.ok) {
                const data = await response.json();
                setMensajesPrivados(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error al obtener historial privado:", error);
        } finally {
            setCargandoPrivado(false);
        }

        const token = getToken();
        if (token && usuarioActual?._id) {
            const socket = io(ENDPOINT, {
                auth: { token },
                transports: ["websocket"],
            });
            
            socketPrivadoRef.current = socket;

            socket.on("nuevo-mensaje-privado", (msg) => {
                if (
                    (msg.de?._id === usuarioActual._id && msg.para === empleado._id) ||
                    (msg.de?._id === empleado._id && msg.para === usuarioActual._id)
                ) {
                    setMensajesPrivados((prev) => [...prev, msg]);
                }
            });

            socket.on("display-typing-privado", ({ chatId, user: typingUser }) => {
                if (typingUser && typingUser._id === empleado._id) {
                    setUsuarioEscribiendoPrivado(true);
                }
            });

            socket.on("hide-typing-privado", ({ chatId, user: typingUser }) => {
                if (typingUser && typingUser._id === empleado._id) {
                    setUsuarioEscribiendoPrivado(false);
                }
            });
        }
    };

    const handleCerrarChatPrivado = () => {
        setChatPrivadoAbierto(false);
        setEmpleadoSeleccionado(null);
        setMensajesPrivados([]);
        setInputPrivado("");
        setUsuarioEscribiendoPrivado(false);
        
        if (socketPrivadoRef.current) {
            socketPrivadoRef.current.disconnect();
            socketPrivadoRef.current = null;
        }
    };

    const handleInputPrivadoChange = (e) => {
        if (!isJefe) return;
        
        setInputPrivado(e.target.value);
        
        if (socketPrivadoRef.current && e.target.value.trim() && empleadoSeleccionado) {
            socketPrivadoRef.current.emit("typing-start-privado", { 
                chatId: `${usuarioActual._id}-${empleadoSeleccionado._id}`,
                otroUsuarioId: empleadoSeleccionado._id
            });
            
            if (escribiendoPrivadoTimeoutRef.current) {
                clearTimeout(escribiendoPrivadoTimeoutRef.current);
            }
            
            escribiendoPrivadoTimeoutRef.current = setTimeout(() => {
                if (socketPrivadoRef.current) {
                    socketPrivadoRef.current.emit("typing-stop-privado", { 
                        chatId: `${usuarioActual._id}-${empleadoSeleccionado._id}`,
                        otroUsuarioId: empleadoSeleccionado._id
                    });
                }
            }, 2000);
        }
    };

    const handleEnviarPrivado = async (e) => {
        e.preventDefault();
        if (!isJefe || !inputPrivado.trim() || enviandoPrivado || !socketPrivadoRef.current || !empleadoSeleccionado) return;

        setEnviandoPrivado(true);
        
        if (escribiendoPrivadoTimeoutRef.current) {
            clearTimeout(escribiendoPrivadoTimeoutRef.current);
        }
        socketPrivadoRef.current.emit("typing-stop-privado", { 
            chatId: `${usuarioActual._id}-${empleadoSeleccionado._id}`,
            otroUsuarioId: empleadoSeleccionado._id
        });

        try {
            socketPrivadoRef.current.emit("mensaje-privado", { 
                contenido: inputPrivado.trim(),
                para: empleadoSeleccionado._id
            });
            
            setInputPrivado("");
        } catch (error) {
            console.error("Error al enviar mensaje privado:", error);
        } finally {
            setEnviandoPrivado(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        
        const ahora = new Date();
        const fechaMensaje = new Date(fecha);
        const esHoy = fechaMensaje.toDateString() === ahora.toDateString();
        
        if (esHoy) {
            return fechaMensaje.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return fechaMensaje.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };

    const esMiMensajePrivado = (mensaje) => {
        const remitenteId = mensaje.de?._id;
        const miId = usuarioActual?._id;
        return remitenteId?.toString() === miId?.toString();
    };

    // Socket para empleados
    useEffect(() => {
        if (!isJefe && usuarioActual?._id) {
            const token = getToken();
            if (token) {
                const socket = io(ENDPOINT, {
                    auth: { token },
                    transports: ["websocket"],
                });

                socket.on("nuevo-mensaje-del-jefe", (msg) => {
                    if (msg.para === usuarioActual._id) {
                        setMensajesDelJefe(prev => [...prev, msg]);
                        setHayMensajesNoLeidos(true);
                    }
                });

                return () => {
                    socket.disconnect();
                };
            }
        }
    }, [isJefe, usuarioActual]);

    useEffect(() => {
        if (activeTab === "novedades") {
            if (isJefe) {
                cargarTareasEnRevision();
            } else {
                cargarMensajesDelJefe();
                marcarMensajesComoLeidos();
            }
        }
    }, [activeTab, isJefe, empresaId]);

    useEffect(() => {
        if (!isJefe && activeTab === "mensajes-jefe") {
            cargarMensajesDelJefe();
            marcarMensajesComoLeidos();
        }
    }, [activeTab, isJefe]);

    useEffect(() => {
        if (chatPrivadoAbierto) {
            mensajesPrivadosEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [mensajesPrivados, chatPrivadoAbierto]);

    // Definir pestañas según rol
    const tabs = [
        { 
            key: "novedades", 
            label: "Novedades", 
            icon: "📢",
            color: "from-blue-500 to-purple-500"
        },
        { 
            key: "chat", 
            label: "Chat Global", 
            icon: "💬",
            color: "from-green-500 to-blue-500"
        },
    ];
    
    if (isJefe) {
        tabs.push(
            { 
                key: "tareas", 
                label: "Crear Tareas", 
                icon: "➕",
                color: "from-orange-500 to-red-500"
            },
            { 
                key: "personas", 
                label: `Personas (${empleados.length})`, 
                icon: "👥",
                color: "from-indigo-500 to-purple-500"
            }
        );
    } else {
        tabs.push({
            key: "mensajes-jefe",
            label: hayMensajesNoLeidos ? "📩 Mensajes del Jefe" : "Mensajes del Jefe",
            icon: hayMensajesNoLeidos ? "📩" : "💌",
            color: "from-pink-500 to-rose-500"
        });
    }

    return (
        <div className="w-full max-w-7xl mx-auto mt-8">
            {/* Barra de pestañas mejorada */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`group relative px-6 py-4 font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            activeTab === tab.key
                                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                                : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </div>
                        
                        {/* Indicador de pestaña activa */}
                        {activeTab === tab.key && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                        )}
                        
                        {/* Efecto hover */}
                        {activeTab !== tab.key && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Contenido de pestañas mejorado */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Chat Global */}
                {activeTab === "chat" && (
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">💬</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    Chat Global
                                </h2>
                                <p className="text-gray-600">Conecta con todo tu equipo en tiempo real</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200/50 rounded-2xl p-6 shadow-inner">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 font-medium">Canal activo • {empleados.length} miembros conectados</p>
                            </div>
                            <ChatGlobal empresaId={empresaId} />
                        </div>
                    </div>
                )}
                
                {/* Novedades */}
                {activeTab === "novedades" && (
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">📢</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Novedades
                                </h2>
                                <p className="text-gray-600">Mantente al día con las últimas actualizaciones</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {isJefe ? (
                                <div className="space-y-8">
                                    {/* Panel de administrador */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-2xl">💼</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-600">Panel de Administrador</h3>
                                                <p className="text-blue-500 text-sm">Gestión completa del área de trabajo</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            Como administrador, tienes acceso completo para gestionar tareas, revisar el trabajo del equipo, 
                                            administrar miembros y supervisar el progreso general del área.
                                        </p>
                                    </div>

                                    {/* Tareas en revisión mejoradas */}
                                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200/50 rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                                                    <span className="text-2xl">📋</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-orange-600">
                                                        Tareas Pendientes de Verificación
                                                    </h3>
                                                    <p className="text-orange-500 text-sm">
                                                        {tareasEnRevision.length} tareas esperando tu revisión
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={cargarTareasEnRevision}
                                                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                                                disabled={cargandoTareasRevision}
                                            >
                                                <span className={cargandoTareasRevision ? "animate-spin" : ""}>
                                                    {cargandoTareasRevision ? '🔄' : '↻'}
                                                </span>
                                                Actualizar
                                            </button>
                                        </div>

                                        {cargandoTareasRevision ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="relative">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-orange-500 text-xl">📋</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : tareasEnRevision.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                    <span className="text-white text-3xl">✅</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-700 mb-2">¡Todo al día!</h4>
                                                <p className="text-gray-500">No hay tareas pendientes de verificación</p>
                                                <p className="text-xs text-gray-400 mt-2">Las tareas completadas por empleados aparecerán aquí</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {tareasEnRevision.map((tarea) => (
                                                    <div key={tarea._id} className="bg-white border-2 border-orange-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                            <div className="flex-1 space-y-4">
                                                                {/* Header de la tarea */}
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <h4 className="text-xl font-bold text-gray-900">{tarea.titulo || tarea.nombre}</h4>
                                                                    <div className="flex gap-2">
                                                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs rounded-full font-bold shadow-md">
                                                                            📋 En Revisión
                                                                        </span>
                                                                        <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-md ${
                                                                            tarea.dificultad === 'alta' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' :
                                                                            tarea.dificultad === 'media' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                                                                            'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                                                                        }`}>
                                                                            🎯 {tarea.dificultad?.charAt(0).toUpperCase() + tarea.dificultad?.slice(1)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                                    {tarea.descripcion}
                                                                </p>
                                                                
                                                                {/* Info grid mejorada */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-sm">👤</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-blue-600 font-medium">EMPLEADO</p>
                                                                            <p className="text-sm font-bold text-blue-700">{tarea.asignadoA?.nombre || 'Empleado desconocido'}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-sm">⏰</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-green-600 font-medium">ENVIADO</p>
                                                                            <p className="text-sm font-bold text-green-700">{formatearFecha(tarea.updatedAt)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                                                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-sm">📅</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-purple-600 font-medium">FECHA LÍMITE</p>
                                                                            <p className="text-sm font-bold text-purple-700">{formatearFecha(tarea.fechaLimite)}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Recompensas */}
                                                                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                                                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-sm">🎁</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            {tarea.recompensaXP > 0 && (
                                                                                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                                                                    <span>⭐</span>
                                                                                    <span className="text-xs font-bold">{tarea.recompensaXP} XP</span>
                                                                                </div>
                                                                            )}
                                                                            {tarea.recompensaMonedas > 0 && (
                                                                                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg">
                                                                                    <span>🪙</span>
                                                                                    <span className="text-xs font-bold">{tarea.recompensaMonedas} monedas</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Informe del empleado */}
                                                                {tarea.informeCompletado?.texto && (
                                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-inner">
                                                                        <div className="flex items-center gap-3 mb-4">
                                                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                                                <span className="text-white">💬</span>
                                                                            </div>
                                                                            <h5 className="font-bold text-blue-700">Informe del empleado</h5>
                                                                        </div>
                                                                        <p className="text-blue-800 leading-relaxed italic">"{tarea.informeCompletado.texto}"</p>
                                                                    </div>
                                                                )}

                                                                {/* Imagen adjunta */}
                                                                {tarea.informeCompletado?.urlImagen && (
                                                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <span className="text-lg">📎</span>
                                                                            <p className="font-bold text-gray-700">Archivo adjunto</p>
                                                                        </div>
                                                                        <img 
                                                                            src={tarea.informeCompletado.urlImagen} 
                                                                            alt="Archivo de la tarea"
                                                                            className="max-w-full h-auto max-h-64 rounded-xl border-2 border-gray-200 shadow-lg mx-auto"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Botones de acción mejorados */}
                                                            <div className="flex flex-col gap-3 lg:ml-6">
                                                                <button
                                                                    onClick={() => handleVerificarTarea(tarea._id)}
                                                                    disabled={verificando === tarea._id}
                                                                    className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                                                        verificando === tarea._id
                                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-emerald-500 hover:to-green-500'
                                                                    }`}
                                                                >
                                                                    {verificando === tarea._id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                            <span>Aprobando...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-lg">✅</span>
                                                                            <span>Aprobar Tarea</span>
                                                                        </div>
                                                                    )}
                                                                </button>

                                                                <button
                                                                    onClick={() => handleRechazarTarea(tarea)}
                                                                    disabled={verificando === tarea._id}
                                                                    className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                                                        verificando === tarea._id
                                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-pink-500 hover:to-red-500'
                                                                    }`}
                                                                >
                                                                    {verificando === tarea._id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                            <span>Rechazando...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-lg">❌</span>
                                                                            <span>Rechazar</span>
                                                                        </div>
                                                                    )}
                                                                </button>

                                                                <div className="text-center p-3 bg-white/80 rounded-xl border border-gray-200">
                                                                    <p className="text-xs text-gray-600 leading-tight">
                                                                        💡 Aprobar otorgará las recompensas al empleado
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Panel de empleado */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-2xl">👤</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-green-600">Panel de Empleado</h3>
                                                <p className="text-green-500 text-sm">Tu espacio de trabajo personalizado</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            Bienvenido al área de trabajo. Aquí puedes ver las tareas asignadas, 
                                            colaborar con tu equipo y mantenerte al día con las novedades importantes.
                                        </p>
                                    </div>

                                    {/* Componente de tareas del empleado */}
                                    <div className="bg-white border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-2xl">📋</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-600">Mis Tareas</h3>
                                                <p className="text-blue-500 text-sm">Tareas asignadas y progreso</p>
                                            </div>
                                        </div>
                                        <TareasEmpleado tareas={tareasEmpleado} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mensajes del Jefe - Solo empleados */}
                {!isJefe && activeTab === "mensajes-jefe" && (
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">📩</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                    Mensajes del Jefe
                                </h2>
                                <p className="text-gray-600">Comunicación directa del administrador</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200/50 rounded-2xl p-6 shadow-lg mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">ℹ️</span>
                                <p className="text-gray-700 font-medium">
                                    Aquí puedes ver todos los mensajes que te ha enviado el administrador. Solo lectura.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white border-2 border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-pink-50 p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm">💌</span>
                                    </div>
                                    <h4 className="font-bold text-gray-700">Bandeja de Mensajes</h4>
                                </div>
                            </div>
                            
                            <div className="h-96 overflow-y-auto p-6 bg-gray-50/50">
                                {cargandoMensajesJefe ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-pink-500 text-xl">📩</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : mensajesDelJefe.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-pink-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <span className="text-white text-3xl">📭</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-700 mb-2">Bandeja vacía</h4>
                                        <p className="text-gray-500">No hay mensajes del jefe</p>
                                        <p className="text-sm text-gray-400 mt-2">Los mensajes aparecerán aquí cuando el administrador te escriba</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {mensajesDelJefe.map((msg, idx) => (
                                            <div
                                                key={msg._id || idx}
                                                className="bg-white border-2 border-gray-200/50 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                                        <span className="text-white font-bold">
                                                            {msg.de?.nombre?.charAt(0).toUpperCase() || 'J'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <p className="font-bold text-pink-600">
                                                                {msg.de?.nombre || 'Jefe'}
                                                            </p>
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                                {formatearFecha(msg.createdAt)}
                                                            </span>
                                                            {!msg.leido && (
                                                                <span className="px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs rounded-full font-bold shadow-md animate-pulse">
                                                                    🔥 Nuevo
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-4 rounded-xl border border-gray-200">
                                                            <p className="text-gray-900 leading-relaxed">
                                                                {msg.contenido}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm">ℹ️</span>
                                    </div>
                                    <p className="text-yellow-800 font-medium text-sm">
                                        Esta sección es solo de lectura. No puedes responder directamente a estos mensajes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Crear Tareas - Solo jefes */}
                {isJefe && activeTab === "tareas" && (
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">➕</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Gestión de Tareas
                                </h2>
                                <p className="text-gray-600">Crea y asigna nuevas tareas para tu equipo</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 rounded-2xl p-6 shadow-lg">
                            <FormTarea 
                                empleados={empleados} 
                                empresaId={empresaId} 
                                onTareaCreada={onTareaCreada} 
                            />
                        </div>
                    </div>
                )}

                {/* Personas - Solo jefes */}
                {isJefe && activeTab === "personas" && (
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">👥</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Miembros del Equipo
                                </h2>
                                <p className="text-gray-600">Gestiona y supervisa a los miembros de tu área</p>
                            </div>
                        </div>
                        
                        {empleados.length > 0 ? (
                            <div className="grid gap-4">
                                {empleados.map(emp => (
                                    <div 
                                        key={emp._id} 
                                        className="bg-white border-2 border-indigo-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                        <span className="text-white font-bold text-xl">
                                                            {emp.nombre.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900">{emp.nombre}</h4>
                                                    <p className="text-gray-600 mb-2">{emp.correo}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-xl text-xs font-bold shadow-md ${
                                                            emp.rol === 'jefe' 
                                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                                                : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                                                        }`}>
                                                            {emp.rol === 'jefe' ? '👑 Administrador' : '👤 Empleado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-medium"
                                                    onClick={() => handleVerPerfilEmpleado(emp._id)}
                                                    title="Ver perfil del empleado"
                                                >
                                                    <span>👤</span>
                                                    <span className="hidden sm:block">Ver Perfil</span>
                                                </button>
                                                
                                                {emp.rol !== 'jefe' && onExpulsarEmpleado && (
                                                    <button
                                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                                            expulsando === emp._id
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-red-400 to-pink-400 text-white hover:shadow-lg'
                                                        }`}
                                                        disabled={expulsando === emp._id}
                                                        onClick={() => onExpulsarEmpleado(emp._id)}
                                                    >
                                                        {expulsando === emp._id ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span className="hidden sm:block">Expulsando...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span>🚫</span>
                                                                <span className="hidden sm:block">Expulsar</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                )}
                                                
                                                {/* Botón chat privado */}
                                                {emp.rol !== 'jefe' && emp._id !== undefined && (
                                                    <button
                                                        className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-medium"
                                                        onClick={() => handleAbrirChatPrivado(emp)}
                                                        title={`Enviar mensaje privado a ${emp.nombre}`}
                                                    >
                                                        <span>💬</span>
                                                        <span className="hidden sm:block">Mensaje</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200/50">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-indigo-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-white text-4xl">👥</span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-700 mb-2">No hay miembros registrados</h4>
                                <p className="text-gray-500">Los empleados aparecerán aquí cuando se unan con el código de invitación</p>
                                <p className="text-sm text-gray-400 mt-2">Genera un código y compártelo para invitar a tu equipo</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Chat privado mejorado - Solo para jefe */}
            {isJefe && chatPrivadoAbierto && empleadoSeleccionado && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-blue-200/50 flex flex-col z-50 animate-in slide-in-from-bottom duration-300">
                    {/* Header del chat */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold">
                                    {empleadoSeleccionado.nombre.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold">{empleadoSeleccionado.nombre}</p>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                    Mensaje privado
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCerrarChatPrivado}
                            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-blue-50 space-y-3">
                        {cargandoPrivado ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-blue-500">💬</span>
                                    </div>
                                </div>
                            </div>
                        ) : mensajesPrivados.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <span className="text-white text-2xl">🚀</span>
                                </div>
                                <p className="text-gray-600 font-medium">¡Inicia la conversación!</p>
                                <p className="text-xs text-gray-400 mt-1">Escribe tu primer mensaje</p>
                            </div>
                        ) : (
                            mensajesPrivados.map((msg, idx) => {
                                const soyYo = esMiMensajePrivado(msg);
                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={`flex ${soyYo ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-md ${
                                            soyYo 
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                                                : 'bg-white text-gray-900 border-2 border-gray-200'
                                        }`}>
                                            <div className="font-medium">{msg.contenido}</div>
                                            <div className={`text-xs mt-2 ${
                                                soyYo ? 'text-blue-100' : 'text-gray-400'
                                            }`}>
                                                {formatearFecha(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {usuarioEscribiendoPrivado && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-2 rounded-2xl border-2 border-gray-200 shadow-md">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium">escribiendo...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={mensajesPrivadosEndRef} />
                    </div>

                    {/* Input mejorado */}
                    <div className="p-4 bg-white border-t-2 border-gray-200/50 rounded-b-2xl">
                        <form onSubmit={handleEnviarPrivado} className="flex gap-3">
                            <input
                                type="text"
                                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                placeholder="Escribe un mensaje..."
                                value={inputPrivado}
                                onChange={handleInputPrivadoChange}
                                disabled={enviandoPrivado}
                            />
                            <button
                                type="submit"
                                disabled={!inputPrivado.trim() || enviandoPrivado}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                    !inputPrivado.trim() || enviandoPrivado
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl'
                                }`}
                            >
                                {enviandoPrivado ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

AreaTabs.propTypes = {
    isJefe: PropTypes.bool,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    empleados: PropTypes.array,
    onExpulsarEmpleado: PropTypes.func,
    expulsando: PropTypes.string,
    empresaId: PropTypes.string,
    onTareaCreada: PropTypes.func,
    tareasEmpleado: PropTypes.array,
};

export default AreaTabs;