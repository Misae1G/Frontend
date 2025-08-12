import { useEffect, useState } from "react"
import storeProfile from "../../context/storeProfile.jsx"
import { useForm } from "react-hook-form"

const FormProfile = () => {
    const { user, updateProfile } = storeProfile()
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()
    const [isLoading, setIsLoading] = useState(false)

    const updateUser = async (data) => {
        setIsLoading(true)
        try {
            await updateProfile(data)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre,
                apellido: user?.apellido,
                direccion: user?.direccion,
                telefono: user?.telefono,
                correo: user?.correo,
            })
        }
    }, [user, reset])

    // Campos del formulario con configuración
    const formFields = [
        {
            name: "nombre",
            label: "Nombre",
            type: "text",
            icon: "👤",
            placeholder: "Ingresa tu nombre",
            validation: {
                required: "El nombre es obligatorio",
                minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres"
                }
            }
        },
        {
            name: "apellido",
            label: "Apellido",
            type: "text",
            icon: "👥",
            placeholder: "Ingresa tu apellido",
            validation: {
                required: "El apellido es obligatorio",
                minLength: {
                    value: 2,
                    message: "El apellido debe tener al menos 2 caracteres"
                }
            }
        },
        {
            name: "direccion",
            label: "Dirección",
            type: "text",
            icon: "📍",
            placeholder: "Ingresa tu dirección completa",
            validation: {
                required: "La dirección es obligatoria"
            }
        },
        {
            name: "telefono",
            label: "Teléfono",
            type: "tel",
            icon: "📱",
            placeholder: "Ejemplo: 0987654321",
            validation: {
                required: "El teléfono es obligatorio",
                pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Ingresa un número válido de 10 dígitos"
                }
            }
        },
        {
            name: "correo",
            label: "Correo Electrónico",
            type: "email",
            icon: "📧",
            placeholder: "ejemplo@correo.com",
            validation: {
                required: "El correo es obligatorio",
                pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Ingresa un correo válido"
                }
            }
        }
    ]

    return (
        <form onSubmit={handleSubmit(updateUser)} className="space-y-6">
            {formFields.map((field, index) => (
                <div key={field.name} className="space-y-2">
                    <label className="flex items-center gap-3 text-sm font-bold text-blue-600">
                        <span className="text-lg">{field.icon}</span>
                        {field.label}
                        <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative">
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-400 ${
                                errors[field.name] 
                                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-green-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            {...register(field.name, field.validation)}
                        />
                        
                        {/* Indicador de estado del campo */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {watch(field.name) && !errors[field.name] ? (
                                <span className="text-green-500">✅</span>
                            ) : errors[field.name] ? (
                                <span className="text-red-500">❌</span>
                            ) : (
                                <span className="text-gray-300">{field.icon}</span>
                            )}
                        </div>
                    </div>
                    
                    {errors[field.name] && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                            <span>⚠️</span>
                            <p>{errors[field.name].message}</p>
                        </div>
                    )}
                </div>
            ))}

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                <h4 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Consejos para tu perfil
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        Mantén tu información actualizada para mejor experiencia
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        Tu correo será usado para notificaciones importantes
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        La dirección ayuda a personalizar tu contenido
                    </li>
                </ul>
            </div>

            {/* Progreso del formulario */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-600 font-semibold">Completitud del perfil</span>
                    <span className="text-green-600 font-bold">
                        {Math.round((Object.values(watch()).filter(value => value && value.toString().trim()).length / formFields.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-green-400 h-3 rounded-full transition-all duration-500"
                        style={{ 
                            width: `${(Object.values(watch()).filter(value => value && value.toString().trim()).length / formFields.length) * 100}%` 
                        }}
                    ></div>
                </div>
            </div>

            {/* Botón de actualizar */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin text-lg">⏳</span>
                            Actualizando...
                        </>
                    ) : (
                        <>
                            <span className="text-lg">💾</span>
                            Actualizar Perfil
                        </>
                    )}
                </button>
                
                {/* Última actualización */}
                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                        Los cambios se guardarán automáticamente
                    </p>
                </div>
            </div>

            {/* Botón de reset */}
            <button
                type="button"
                onClick={() => reset()}
                className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 font-semibold"
            >
                <span className="text-lg">🔄</span>
                Restaurar Datos Originales
            </button>
        </form>
    )
}

export default FormProfile