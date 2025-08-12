    import { Link, Outlet, useLocation } from 'react-router'
    import { useState, useEffect } from 'react'
    import storePlans from '../context/storePlans'
    import storeAuth from '../context/storeAuth.jsx'
    import useFetch from '../hooks/useFetch.js'
    import storeProfile from '../context/storeProfile.jsx'

    const Dashboard = () => {
        const location = useLocation()
        const urlActual = location.pathname
        const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
        const [modalType, setModalType] = useState('')
        const [currentWorkspace, setCurrentWorkspace] = useState(null)
        const [userWorkspaces] = useState([
            { id: 1, name: "Equipo Marketing", role: "Miembro", xp: 1250 },
            { id: 2, name: "Desarrollo Web", role: "Líder", xp: 2100 }
        ])
        const [workspaceName, setWorkspaceName] = useState('')
        const [workspaceDesc, setWorkspaceDesc] = useState('')
        const [workspaceDireccion, setWorkspaceDireccion] = useState('')
        const [workspaceTelefono, setWorkspaceTelefono] = useState('')
        const [codigoInvitacion, setCodigoInvitacion] = useState('')
        const [isLoading, setIsLoading] = useState(false)
        const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
        const { clearToken } = storeAuth();
        const { fetchDataBackend } = useFetch()
        const { modal, toggleModal } = storePlans();
        const { user: usuarioActual, profile } = storeProfile();

        // Cargar perfil solo si no existe
        useEffect(() => {
            if (!usuarioActual) {
                profile();
            }
        }, [usuarioActual, profile]);

        // Obtener nombre del usuario
        const obtenerNombreUsuario = () => {
            if (usuarioActual?.nombre) {
                return `${usuarioActual.nombre}`;
            }
            return 'Héroe TaskAI';
        };
        // Mostrar modal de planes automáticamente
        useEffect(() => {
            const timer = setTimeout(() => {
                if (!modal) toggleModal();
            }, 60000);
            return () => clearTimeout(timer);
        }, []);

        const handleWorkspaceAction = (type) => {
            setModalType(type)
            setShowWorkspaceModal(true)
            // Limpiar campos cuando se abre el modal
            if (type === 'join') {
                setCodigoInvitacion('')
            } else if (type === 'create') {
                setWorkspaceName('')
                setWorkspaceDesc('')
                setWorkspaceDireccion('')
                setWorkspaceTelefono('')
            }
        }

        const closeModal = () => {
            setShowWorkspaceModal(false)
            setModalType('')
            setIsLoading(false)
            // Limpiar todos los campos al cerrar
            setCodigoInvitacion('')
            setWorkspaceName('')
            setWorkspaceDesc('')
            setWorkspaceDireccion('')
            setWorkspaceTelefono('')
        }

        const handleCreateWorkspace = async () => {
            if (!workspaceName.trim()) {
                toast.error('El nombre del área de trabajo es obligatorio')
                return
            }
            
            setIsLoading(true)
            try {
                const data = await fetchDataBackend(
                    'http://localhost:8080/api/empresa/crear',
                    {
                        nombre: workspaceName,
                        descripcion: workspaceDesc,
                        direccion: workspaceDireccion,
                        telefono: workspaceTelefono
                    },
                    'POST'
                )
                
                if (data && data.empresa) {
                    setCurrentWorkspace(data.empresa.nombre)
                    closeModal()
                    // Recargar la página para actualizar la información
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000) // Pequeño delay para que el usuario vea el toast de éxito
                }
            } catch (error) {
                console.error('Error al crear área de trabajo:', error)
                // El toast de error ya se muestra en useFetch
            } finally {
                setIsLoading(false)
            }
        }

        const handleJoinWorkspace = async () => {
            if (!codigoInvitacion.trim()) {
                toast.error('Debes ingresar un código de invitación válido')
                return
            }
            
            setIsLoading(true)
            try {
                const data = await fetchDataBackend(
                    'http://localhost:8080/api/empresa/unirse',
                    { token: codigoInvitacion },
                    'POST'
                )
                
                // Si la petición fue exitosa, el toast de éxito ya se muestra en useFetch
                closeModal()
                // Recargar la página para actualizar la información del usuario
                setTimeout(() => {
                    window.location.reload()
                }, 1000) // Pequeño delay para que el usuario vea el toast de éxito
            } catch (error) {
                console.error('Error al unirse al área de trabajo:', error)
                // El error ya se maneja en useFetch con toast.error
            } finally {
                setIsLoading(false)
            }
        }

        // ...existing code...
        // Visual mejorado, sidebar colapsable, cards y modal moderno
        // Menú y herramientas
        const menuItems = [
            {
                path: "/dashboard",
                name: "Mis Áreas",
                icon: "🏢",
                active: urlActual === '/dashboard' || urlActual === '/dashboard/mis-areas'
            },
            {
                path: "/dashboard/profile",
                name: "Perfil",
                icon: "👤",
                active: urlActual === '/dashboard/profile'
            }
        ]

        const toolItems = [
            {
                path: "/dashboard/texto-imagen",
                name: "Texto a Imagen",
                icon: "🎨",
                active: urlActual === '/dashboard/texto-imagen'
            }
        ]

        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
                {/* Botón para abrir planes - Mejorado */}
                <button
                    onClick={toggleModal}
                    className="fixed bottom-6 right-6 z-50 group"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                        <span className="text-2xl group-hover:animate-bounce">💳</span>
                        <span className="font-bold text-sm hidden sm:block">Ver Planes</span>
                    </div>
                </button>

                {/* Sidebar Mejorado */}
                <aside className={`${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 bg-gradient-to-b from-blue-600 via-blue-500 to-green-500 shadow-2xl relative`}>
                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute -right-3 top-8 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>

                    <div className="p-6 flex flex-col h-full">
                        {/* Logo */}
                        <div className="text-center mb-6">
                            <h2 className={`${sidebarCollapsed ? 'text-2xl' : 'text-4xl'} font-black transition-all duration-300`}>
                                <span className="text-white drop-shadow-lg">Task</span>
                                {!sidebarCollapsed && <span className="text-green-300 drop-shadow-lg">AI</span>}
                            </h2>
                            {!sidebarCollapsed && (
                                <p className="text-xs text-blue-100 mt-1 opacity-90">Sistema Inteligente de Tareas</p>
                            )}
                        </div>

                        {/* Profile Section */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-white to-green-100 p-1 rounded-full shadow-lg">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png" 
                                        alt="Profile" 
                                        className={`${sidebarCollapsed ? 'w-12 h-12' : 'w-20 h-20'} rounded-full border-4 border-green-400 transition-all duration-300`} 
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-400 border-2 border-blue-600 rounded-full p-1">
                                    <span className="text-sm">😊</span>
                                </div>
                            </div>
                            
                            {!sidebarCollapsed && (
                                <>
                                    <div className="text-center mt-3 mb-4">
                                        <p className="text-blue-100 text-sm font-semibold flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Usuario Activo
                                        </p>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 w-full">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center">
                                                <div className="text-green-300 font-bold text-lg">Lv.5</div>
                                                <div className="text-blue-100 text-xs">Nivel</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-green-300 font-bold text-lg">85</div>
                                                <div className="text-blue-100 text-xs">Monedas</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <div className="flex justify-between text-xs text-blue-100 mb-1">
                                                <span>XP: 1,250</span>
                                                <span>50%</span>
                                            </div>
                                            <div className="w-full bg-blue-800/50 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-green-400 to-blue-300 h-2 rounded-full transition-all duration-1000" style={{ width: '50%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Workspace Section */}
                        {!sidebarCollapsed && (
                            <div className="mb-6">
                                <h3 className="text-blue-100 text-xs font-bold mb-3 uppercase tracking-wide">Área de Trabajo</h3>
                                {currentWorkspace && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
                                        <p className="text-white text-sm font-medium">{currentWorkspace}</p>
                                        <p className="text-green-300 text-xs">Miembro activo</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleWorkspaceAction('join')}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-blue-600 hover:to-green-500 text-white text-xs py-3 px-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span>🚪</span>
                                        {isLoading && modalType === 'join' ? 'Procesando...' : 'Unirse a Área'}
                                    </button>
                                    <button
                                        onClick={() => handleWorkspaceAction('create')}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white text-xs py-3 px-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span>➕</span>
                                        {isLoading && modalType === 'create' ? 'Creando...' : 'Crear Nueva Área'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Navigation Menu */}
                        <nav className="flex-1">
                            {!sidebarCollapsed && (
                                <h3 className="text-blue-100 text-xs font-bold mb-3 uppercase tracking-wide">Navegación</h3>
                            )}
                            <ul className="space-y-2">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.path}
                                            className={`$${
                                                item.active
                                                    ? 'bg-white/20 text-white shadow-lg scale-105 border-l-4 border-green-300'
                                                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                                            } ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-300 flex items-center gap-3 font-semibold group transform hover:scale-[1.02]`}
                                        >
                                            <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                            {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Tools Section */}
                            <div className="mt-8">
                                {!sidebarCollapsed && (
                                    <>
                                        <div className="h-px bg-white/20 mb-4"></div>
                                        <h3 className="text-blue-100 text-xs font-bold mb-3 uppercase tracking-wide">Herramientas</h3>
                                    </>
                                )}
                                <ul className="space-y-2">
                                    {toolItems.map((tool, index) => (
                                        <li key={index}>
                                            <Link
                                                to={tool.path}
                                                className={`$${
                                                    tool.active
                                                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg scale-105'
                                                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                                                } ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-300 flex items-center gap-3 font-semibold group transform hover:scale-[1.02]`}
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform duration-200">{tool.icon}</span>
                                                {!sidebarCollapsed && <span className="text-sm">{tool.name}</span>}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header Mejorado */}
                    <header className="bg-white/70 backdrop-blur-md border-b border-green-200/50 shadow-sm">
                        <div className="flex justify-between items-center px-6 py-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
                                <div className="hidden sm:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Sistema Activo
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-blue-600">{obtenerNombreUsuario()}</p>
                                    <p className="text-xs text-gray-500">Héroe TaskAI 🦸‍♂️</p>
                                </div>
                                <div className="relative">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" 
                                        alt="Profile" 
                                        className="w-12 h-12 border-3 border-green-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <Link 
                                    to='/' 
                                    onClick={clearToken} 
                                    className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🚪</span>
                                    <span className="hidden sm:block">Salir</span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>

                    {/* Footer Mejorado */}
                    <footer className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white">
                        <div className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium">TaskAI © 2025</p>
                                    <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-semibold">v2.1.0</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="bg-white/20 px-3 py-1 rounded-full">Sistema de Gestión Inteligente</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                        <span>Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Modal Mejorado */}
                {showWorkspaceModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform animate-in">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-blue-600 flex items-center gap-3">
                                        <span className="text-2xl">{modalType === 'join' ? '🚪' : '➕'}</span>
                                        {modalType === 'join' ? 'Unirse a Área de Trabajo' : 'Crear Nueva Área'}
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        disabled={isLoading}
                                        className="text-gray-400 hover:text-red-500 text-2xl disabled:opacity-50 transition-colors duration-200 hover:scale-110"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {modalType === 'join' ? (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-blue-600 mb-3">
                                                Código de Área de Trabajo *
                                            </label>
                                            <input
                                                type="text"
                                                value={codigoInvitacion}
                                                onChange={e => setCodigoInvitacion(e.target.value)}
                                                placeholder="Ingresa el código de invitación"
                                                disabled={isLoading}
                                                className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Solicita este código al administrador del área de trabajo
                                            </p>
                                        </div>


                                        <div className="flex gap-3">
                                            <button
                                                onClick={closeModal}
                                                disabled={isLoading}
                                                className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleJoinWorkspace}
                                                disabled={isLoading || !codigoInvitacion.trim()}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="animate-spin">⏳</span>
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🚪</span>
                                                        Unirse
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-blue-600 mb-2">
                                                    Nombre del Área de Trabajo *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={workspaceName}
                                                    onChange={e => setWorkspaceName(e.target.value)}
                                                    placeholder="Ej: Equipo de Marketing Digital"
                                                    disabled={isLoading}
                                                    className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-blue-600 mb-2">
                                                    Descripción (opcional)
                                                </label>
                                                <textarea
                                                    value={workspaceDesc}
                                                    onChange={e => setWorkspaceDesc(e.target.value)}
                                                    placeholder="Describe brevemente el propósito de esta área..."
                                                    rows="3"
                                                    disabled={isLoading}
                                                    className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 resize-none"
                                                ></textarea>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                                                        Dirección (opcional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={workspaceDireccion}
                                                        onChange={e => setWorkspaceDireccion(e.target.value)}
                                                        placeholder="Ej: Av. Siempre Viva 123"
                                                        disabled={isLoading}
                                                        className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                                                        Teléfono (opcional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={workspaceTelefono}
                                                        onChange={e => setWorkspaceTelefono(e.target.value)}
                                                        placeholder="Ej: 555-1234"
                                                        disabled={isLoading}
                                                        className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={closeModal}
                                                disabled={isLoading}
                                                className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleCreateWorkspace}
                                                disabled={isLoading || !workspaceName.trim()}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="animate-spin">⏳</span>
                                                        Creando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>➕</span>
                                                        Crear Área
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    export default Dashboard