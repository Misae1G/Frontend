import storeProfile from "../../context/storeProfile.jsx"

export const CardProfile = () => {
    const { user } = storeProfile()

    const profileFields = [
        { 
            label: "Nombre", 
            value: user?.nombre || "No especificado", 
            icon: "👤"
        },
        { 
            label: "Correo", 
            value: user?.correo || "No especificado", 
            icon: "📧"
        },
        { 
            label: "Teléfono", 
            value: user?.telefono || "No especificado", 
            icon: "📱"
        },
        { 
            label: "Rol", 
            value: user?.rol || "Usuario", 
            icon: "🏷️"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Sección de Avatar */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                    <div className="bg-gradient-to-br from-blue-400 to-green-400 p-1 rounded-full shadow-lg">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" 
                            alt="Avatar del usuario" 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>
                    
                    {/* Botón de cambiar foto */}
                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-green-400 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group">
                        <span className="text-sm">📷</span>
                        <input type="file" accept="image/*" className="hidden" />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-gray-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap">
                                Cambiar foto
                            </div>
                        </div>
                    </label>
                    
                    {/* Indicador de estado online */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Nombre principal y badges */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">
                        {user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Usuario TaskAI'}
                    </h3>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                            🦸‍♂️ Héroe TaskAI
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                            ✨ Activo
                        </span>
                    </div>
                </div>
            </div>

            {/* Información del perfil */}
            <div className="space-y-4">
                {profileFields.map((field, index) => (
                    <div 
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <span className="text-xl">{field.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-600 mb-1">
                                    {field.label}
                                </p>
                                <p className="text-gray-700 font-medium">
                                    {field.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ...Estadísticas Rápidas eliminadas... */}

            {/* ...Botón de configuración avanzada eliminado... */}
        </div>
    )
}

export const CardProfileOwner = () => {
    return (
        <div className="space-y-6">
            {/* Sección de Avatar */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="bg-gradient-to-br from-blue-400 to-green-400 p-1 rounded-full shadow-lg">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" 
                            alt="Avatar del propietario" 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg" 
                        />
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs">👑</span>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">Propietario</h3>
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                        👑 Owner
                    </span>
                </div>
            </div>

            {/* Campos del propietario */}
            <div className="space-y-4">
                {[
                    { label: "Nombre", icon: "👤", value: "No especificado" },
                    { label: "Cédula", icon: "🆔", value: "No especificado" },
                    { label: "Email", icon: "📧", value: "No especificado" },
                    { label: "Celular", icon: "📱", value: "No especificado" },
                    { label: "Nombre de la mascota", icon: "🐕", value: "No especificado" }
                ].map((field, index) => (
                    <div 
                        key={index}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-orange-200/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <span className="text-xl">{field.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-orange-600 mb-1">
                                    {field.label}
                                </p>
                                <p className="text-gray-500 italic">
                                    {field.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}