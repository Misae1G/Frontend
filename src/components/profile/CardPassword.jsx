import { useForm } from "react-hook-form"
import { ToastContainer } from 'react-toastify';
import storeProfile from "../../context/storeProfile.jsx";
import storeAuth from "../../context/storeAuth.jsx";

const CardPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { updatePasswordProfile } = storeProfile()
    const { clearToken } = storeAuth()

    const updatePassword = async (data) => {
        const response = await updatePasswordProfile(data)
        if (response) {
            clearToken()
        }
    }

    return (
        <>
            <ToastContainer />
            <form onSubmit={handleSubmit(updatePassword)} className="space-y-6">
                {/* Campo Contraseña Actual */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm font-bold text-blue-600">
                        <span className="text-lg">🔒</span>
                        Contraseña Actual
                    </label>
                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="••••••••••" 
                            className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-400"
                            {...register("passwordactual", { 
                                required: "La contraseña actual es obligatoria",
                                minLength: {
                                    value: 6,
                                    message: "La contraseña debe tener al menos 6 caracteres"
                                }
                            })}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔐
                        </div>
                    </div>
                    {errors.passwordactual && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                            <span>⚠️</span>
                            <p>{errors.passwordactual.message}</p>
                        </div>
                    )}
                </div>

                {/* Campo Nueva Contraseña */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm font-bold text-blue-600">
                        <span className="text-lg">🆕</span>
                        Nueva Contraseña
                    </label>
                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="••••••••••" 
                            className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-400"
                            {...register("passwordnuevo", { 
                                required: "La nueva contraseña es obligatoria",
                                minLength: {
                                    value: 8,
                                    message: "La nueva contraseña debe tener al menos 8 caracteres"
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                    message: "Debe contener al menos: 1 mayúscula, 1 minúscula y 1 número"
                                }
                            })}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔑
                        </div>
                    </div>
                    {errors.passwordnuevo && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                            <span>⚠️</span>
                            <p>{errors.passwordnuevo.message}</p>
                        </div>
                    )}
                </div>

                {/* Indicadores de Seguridad */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                        <span>🛡️</span>
                        Requerimientos de Seguridad
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-green-500">✓</span>
                            Mínimo 8 caracteres
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-green-500">✓</span>
                            Una letra mayúscula
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-green-500">✓</span>
                            Una letra minúscula
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-green-500">✓</span>
                            Al menos un número
                        </div>
                    </div>
                </div>

                {/* Botón de Actualizar */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                        <span className="text-lg">🔄</span>
                        Cambiar Contraseña
                    </button>
                    
                    {/* Nota de seguridad */}
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-xs text-yellow-700 flex items-center gap-2">
                            <span>⚠️</span>
                            <strong>Importante:</strong> Al cambiar tu contraseña, se cerrará tu sesión automáticamente por seguridad.
                        </p>
                    </div>
                </div>
            </form>
        </>
    )
}

export default CardPassword