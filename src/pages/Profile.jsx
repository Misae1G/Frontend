import CardPassword from '../components/profile/CardPassword.jsx'
import { CardProfile } from '../components/profile/CardProfile.jsx'
import FormProfile from '../components/profile/FormProfile.jsx'

const Profile = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
            {/* Hero Section Mejorada */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 rounded-2xl shadow-2xl mb-8">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative px-8 py-12">
                    <div className="flex items-center gap-6">
                        {/* Icono animado */}
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                            <span className="text-5xl animate-bounce">👤</span>
                        </div>
                        
                        {/* Texto principal */}
                        <div>
                            <h1 className="font-black text-4xl lg:text-5xl text-white drop-shadow-lg mb-2">
                                Mi Perfil
                            </h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <p className="text-blue-100 text-lg font-medium">
                                    Gestiona tu información personal y preferencias
                                </p>
                                <div className="flex items-center gap-2 bg-green-400 text-green-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse"></div>
                                    Perfil Activo
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decoración visual */}
                    <div className="absolute top-4 right-8 opacity-20">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        </div>
                    </div>
                </div>
                
                {/* Línea divisoria elegante */}
                <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-green-400 p-3 rounded-xl shadow-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">Lv.5</p>
                            <p className="text-sm text-gray-600">Nivel Usuario</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-blue-400 p-3 rounded-xl shadow-lg">
                            <span className="text-2xl">🪙</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">1,250</p>
                            <p className="text-sm text-gray-600">Puntos XP</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-green-500 p-3 rounded-xl shadow-lg">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">85</p>
                            <p className="text-sm text-gray-600">Monedas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal Mejorado */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Columna Izquierda - Formulario */}
                <div className="space-y-6">
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <span className="text-2xl">✏️</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Editar Información</h2>
                                    <p className="text-blue-100">Actualiza tus datos personales</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <FormProfile />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Cards */}
                <div className="space-y-6">
                    {/* Card Profile */}
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <span className="text-2xl">👨‍💼</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Mi Información</h2>
                                    <p className="text-green-100">Datos actuales del perfil</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <CardProfile />
                        </div>
                    </div>

                    {/* Card Password */}
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <span className="text-2xl">🔐</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Seguridad</h2>
                                    <p className="text-blue-100">Gestiona tu contraseña</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <CardPassword />
                        </div>
                    </div>
                </div>
            </div>

            {/* ...Acciones Rápidas eliminadas... */}
        </div>
    )
}

export default Profile