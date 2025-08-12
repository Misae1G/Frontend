import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer } from 'react-toastify';
import useFetch from '../hooks/useFetch.js';

export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { fetchDataBackend } = useFetch();

    const registro = async (data) => {
        try {
            const datosBackend = {
                nombre: data.nombre,
                correo: data.correo,
                contrasena: data.contrasena
            };
            const url = `${import.meta.env.VITE_BACKEND_URL}/register`;
            await fetchDataBackend(url, datosBackend);
        } catch (error) {
            console.error('Error en registro:', error.message);
        }
    }

    // Para comparar contraseñas
    const contrasena = watch("contrasena", "");

    return (
        <div className="flex flex-col sm:flex-row h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <ToastContainer />
            {/* Formulario */}
            <div className="w-full sm:w-1/2 h-screen flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#B9F6CA]">
                    <h1 className="text-4xl font-bold mb-2 text-center uppercase text-[#1976D2] drop-shadow">¡Crea tu cuenta!</h1>
                    <small className="text-[#00C853] block my-4 text-center text-base">Únete y comienza tu progreso</small>
                    <form onSubmit={handleSubmit(registro)}>
                        <div className="mb-5">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Nombre</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu nombre"
                                className="block w-full rounded-lg border border-[#90CAF9] focus:border-[#FFB300] focus:outline-none focus:ring-2 focus:ring-[#FFB300] py-2 px-3 text-gray-700 bg-white/90 shadow-sm transition"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-[#E57373]">{errors.nombre.message}</p>}
                        </div>
                        <div className="mb-5">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="Ingresa tu correo electrónico"
                                className="block w-full rounded-lg border border-[#90CAF9] focus:border-[#FFB300] focus:outline-none focus:ring-2 focus:ring-[#FFB300] py-2 px-3 text-gray-700 bg-white/90 shadow-sm transition"
                                {...register("correo", { required: "El correo electrónico es obligatorio" })}
                            />
                            {errors.correo && <p className="text-[#E57373]">{errors.correo.message}</p>}
                        </div>
                        <div className="mb-5 relative">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-lg border border-[#90CAF9] focus:border-[#FFB300] focus:outline-none focus:ring-2 focus:ring-[#FFB300] py-2 px-3 text-gray-700 bg-white/90 shadow-sm pr-10 transition"
                                    {...register("contrasena", { required: "La contraseña es obligatoria" })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-[#FFB300] hover:text-[#FF7043]"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.contrasena && <p className="text-[#E57373]">{errors.contrasena.message}</p>}
                        </div>
                        {/* Confirmar contraseña */}
                        <div className="mb-5 relative">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Confirmar contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********************"
                                className="block w-full rounded-lg border border-[#90CAF9] focus:border-[#FFB300] focus:outline-none focus:ring-2 focus:ring-[#FFB300] py-2 px-3 text-gray-700 bg-white/90 shadow-sm pr-10 transition"
                                {...register("confirmarContrasena", {
                                    required: "Debes confirmar la contraseña",
                                    validate: value =>
                                        value === contrasena || "Las contraseñas no coinciden"
                                })}
                            />
                            {errors.confirmarContrasena && <p className="text-[#E57373]">{errors.confirmarContrasena.message}</p>}
                        </div>
                        <div className="mb-6">
                            <button className="bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold py-2 w-full rounded-full shadow-lg hover:scale-105 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide">
                                Registrarse
                            </button>
                        </div>
                    </form>
                    <div className="mt-5 text-xs border-b-2 border-[#B9F6CA] py-4"></div>
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p className="text-[#1976D2]">¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-gradient-to-r from-[#00C853] to-[#1976D2] text-white font-bold rounded-full shadow hover:scale-110 duration-200 hover:from-[#1976D2] hover:to-[#00C853]">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
            {/* Imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/images/Register_registro.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden"></div>
        </div>
    );
};