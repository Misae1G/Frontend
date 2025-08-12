import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";
import storeProfile from "../../context/storeProfile.jsx";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL.replace(/\/api\/auth$/, "");

// ✅ FUNCIÓN HELPER PARA OBTENER EL TOKEN CORRECTO
const getToken = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    return storedUser?.state?.token;
  } catch {
    return null;
  }
};

const ChatGlobal = ({ empresaId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [usuariosOnline, setUsuariosOnline] = useState([]);
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState([]);
  
  const { user: usuarioActual, profile } = storeProfile();
  
  const socketRef = useRef(null);
  const mensajesEndRef = useRef(null);
  const escribiendoTimeoutRef = useRef(null);

  // ✅ CARGAR PERFIL SOLO SI NO EXISTE
  useEffect(() => {
    if (!usuarioActual) {
      profile();
    }
  }, [usuarioActual, profile]);

  useEffect(() => {
    // Obtener historial de mensajes grupales
    const obtenerHistorial = async () => {
      try {
        const token = getToken();
        
        const response = await fetch(`${ENDPOINT}/api/chat/grupal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setMensajes(Array.isArray(data) ? data : []);
        } else {
          console.error("❌ Error al obtener historial:", response.statusText);
          setMensajes([]);
        }
      } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        setMensajes([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorial();
  }, [empresaId]);

  useEffect(() => {
    // Conectar socket solo si tenemos usuario
    if (!usuarioActual?._id) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("No hay token disponible");
      setCargando(false);
      return;
    }

    const socket = io(ENDPOINT, {
      auth: { token },
      transports: ["websocket"],
    });
    
    socketRef.current = socket;

    // Eventos de conexión
    socket.on("connect", () => {
      console.log("✅ Conectado al chat global");
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del chat global");
    });

    // Escuchar nuevos mensajes grupales
    socket.on("nuevo-mensaje-grupal", (msg) => {
      setMensajes((prev) => [...prev, msg]);
    });

    // Gestión de usuarios online
    socket.on("lista-usuarios-online", (userIds) => {
      setUsuariosOnline(userIds);
    });

    socket.on("usuario-online", ({ userId }) => {
      setUsuariosOnline((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("usuario-offline", ({ userId }) => {
      setUsuariosOnline((prev) => prev.filter(id => id !== userId));
    });

    // Indicadores de escritura
    socket.on("display-typing", ({ chatId, user: typingUser }) => {
      if (typingUser && typingUser._id !== usuarioActual?._id) {
        setUsuariosEscribiendo((prev) => {
          const yaEstaEscribiendo = prev.find(u => u._id === typingUser._id);
          if (!yaEstaEscribiendo) {
            return [...prev, typingUser];
          }
          return prev;
        });
      }
    });

    socket.on("hide-typing", ({ chatId, user: typingUser }) => {
      if (typingUser) {
        setUsuariosEscribiendo((prev) => prev.filter(u => u._id !== typingUser._id));
      }
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
    };
  }, [empresaId, usuarioActual?._id]);

  useEffect(() => {
    // Auto-scroll al final cuando hay nuevos mensajes
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Emitir evento de "está escribiendo"
    if (socketRef.current && e.target.value.trim()) {
      socketRef.current.emit("typing-start", { 
        chatId: empresaId, 
        chatType: "grupal" 
      });
      
      // Limpiar timeout anterior
      if (escribiendoTimeoutRef.current) {
        clearTimeout(escribiendoTimeoutRef.current);
      }
      
      // Establecer nuevo timeout para dejar de escribir
      escribiendoTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("typing-stop", { 
            chatId: empresaId, 
            chatType: "grupal" 
          });
        }
      }, 2000);
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!input.trim() || enviando || !socketRef.current) return;

    setEnviando(true);
    
    // Detener indicador de escritura
    if (escribiendoTimeoutRef.current) {
      clearTimeout(escribiendoTimeoutRef.current);
    }
    socketRef.current.emit("typing-stop", { 
      chatId: empresaId, 
      chatType: "grupal" 
    });

    try {
      // Emitir mensaje
      socketRef.current.emit("mensaje-grupal", { 
        contenido: input.trim() 
      });
      
      setInput("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setEnviando(false);
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

  const esMiMensaje = (mensaje) => {
    const remitenteId = mensaje.de?._id;
    const miId = usuarioActual?._id;
    
    // Conversión a string para comparar ObjectId correctamente
    const remitenteIdStr = remitenteId?.toString();
    const miIdStr = miId?.toString();
    
    return remitenteIdStr === miIdStr;
  };

  // Mostrar loading si no tenemos usuario aún
  if (cargando || !usuarioActual?._id) {
    return (
      <div className="flex flex-col h-80">
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded border">
          <div className="text-gray-400 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2] mx-auto mb-2"></div>
            <p>Cargando usuario y chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-80">
      {/* Header del chat con usuarios online */}
      {usuariosOnline.length > 0 && (
        <div className="bg-[#1976D2]/10 rounded-t border-x border-t p-2 text-sm">
          <span className="text-[#1976D2] font-medium">
            👥 {usuariosOnline.length} usuario{usuariosOnline.length !== 1 ? 's' : ''} conectado{usuariosOnline.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Área de mensajes tipo chat */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b border-x border-b p-3 flex flex-col space-y-2">
        {mensajes.length === 0 ? (
          <div className="text-gray-400 text-center py-8 flex flex-col items-center">
            <div className="text-4xl mb-2">💬</div>
            <p className="font-medium">¡Inicia la conversación!</p>
            <p className="text-sm">Sé el primero en escribir un mensaje en el chat grupal.</p>
          </div>
        ) : (
          mensajes.map((msg, idx) => {
            const soyYo = esMiMensaje(msg);
            return (
              <div
                key={msg._id || idx}
                className={`flex w-full ${soyYo ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg px-4 py-2 max-w-[70%] break-words shadow-md flex flex-col ${
                  soyYo 
                    ? 'bg-blue-600 text-white items-end' 
                    : 'bg-gray-200 text-gray-900 items-start'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${soyYo ? 'text-blue-100' : 'text-[#1976D2]'}`}>
                    {soyYo ? 'Tú' : (msg.de?.nombre || 'Usuario')}
                  </div>
                  <div className="text-base">{msg.contenido}</div>
                  <div className={`text-xs mt-1 opacity-60 ${soyYo ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatearFecha(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Indicador de usuarios escribiendo */}
        {usuariosEscribiendo.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="ml-2">
                  {usuariosEscribiendo.map(u => u.nombre).join(", ")} está{usuariosEscribiendo.length > 1 ? 'n' : ''} escribiendo...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={mensajesEndRef} />
      </div>

      {/* Formulario de envío */}
      <form onSubmit={handleEnviar} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={handleInputChange}
          disabled={enviando}
        />
        <button
          type="submit"
          disabled={!input.trim() || enviando}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !input.trim() || enviando
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#1976D2] text-white hover:bg-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:ring-offset-2'
          }`}
        >
          {enviando ? (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            "Enviar"
          )}
        </button>
      </form>
    </div>
  );
};

ChatGlobal.propTypes = {
  empresaId: PropTypes.string.isRequired,
};

export default ChatGlobal;