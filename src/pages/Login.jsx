import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth.jsx';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();
    const { setToken, setRol } = storeAuth();

    // --- SOCIAL LOGIN HANDLERS ---
    const handleGoogleLogin = () => {
        // CORREGIR LA URL - quitar /api/auth del final
        const backendBaseUrl = import.meta.env.VITE_BACKEND_URL.replace('/api/auth', '');
        window.location.href = `${backendBaseUrl}/api/auth/google`;
    };

    // --- CAPTURAR TOKEN DE REDIRECCIÓN SOCIAL ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const rol = params.get('rol');
        const error = params.get('error');
        
        if (error) {
            console.error('Error en autenticación:', error);
            // Aquí puedes mostrar un toast de error
            return;
        }
        
        if (token) {
            setToken(token);
            if (rol) setRol(rol);
            navigate('/dashboard');
        }
    }, [location.search, setToken, setRol, navigate]);

    const loginUser = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/login`;
        const response = await fetchDataBackend(url, data, 'POST');
        if (response && response.token) {
            setToken(response.token);
            setRol(response.rol);
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <ToastContainer />
            {/* Imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/LoginInicio.jpg')] 
            bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>

            {/* Contenedor de formulario */}
            <div className="w-full sm:w-1/2 h-screen flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#B9F6CA]">
                    <h1 className="text-4xl font-bold mb-2 text-center uppercase text-[#1976D2] drop-shadow">Bienvenido(a) de nuevo</h1>
                    <small className="text-[#00C853] block my-4 text-center text-base">¡Hoy es un gran día para avanzar!</small>

                    <form onSubmit={handleSubmit(loginUser)}>
                        {/* Correo electrónico */}
                        <div className="mb-5">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="Ingresa tu correo"
                                className="block w-full rounded-lg border border-[#B9F6CA] focus:border-[#00C853] focus:outline-none focus:ring-2 focus:ring-[#00C853] py-2 px-3 text-[#1976D2] bg-white/90 shadow-sm transition"
                                {...register("correo", { required: "El correo es obligatorio" })}
                            />
                            {errors.correo && <p className="text-red-800">{errors.correo.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="mb-5 relative">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-lg border border-[#B9F6CA] focus:border-[#00C853] focus:outline-none focus:ring-2 focus:ring-[#00C853] py-2 px-3 text-[#1976D2] bg-white/90 shadow-sm pr-10 transition"
                                    {...register("contrasena", { required: "La contraseña es obligatoria" })}
                                />
                                {errors.contrasena && <p className="text-red-800">{errors.contrasena.message}</p>}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-[#1976D2] hover:text-[#00C853]"
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
                        </div>

                        {/* Botón de iniciar sesión */}
                        <div className="my-6">
                            <button
                                type="submit"
                                className="py-2 w-full block text-center bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold rounded-full shadow-lg hover:scale-105 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide"
                            >
                                ¡Iniciar sesión y progresar!
                            </button>
                        </div>
                    </form>

                    {/* Separador con opción de "O" */}
                    <div className="mt-6 grid grid-cols-3 items-center text-[#BDBDBD]">
                        <hr className="border-[#BDBDBD]" />
                        <p className="text-center text-base font-semibold">O</p>
                        <hr className="border-[#BDBDBD]" />
                    </div>

                    {/* Botón de inicio de sesión con Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="bg-white border border-[#B9F6CA] py-2 w-full rounded-full mt-5 flex justify-center items-center text-base font-semibold shadow hover:scale-105 duration-200 hover:bg-[#B9F6CA]/30 hover:text-[#1976D2]"
                    >
                        <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google icon" />
                        Iniciar sesión con Google
                    </button>

                    {/* Olvidaste tu contraseña */}
                    <div className="mt-5 text-xs border-b-2 border-[#B9F6CA] py-4">
                        <Link to="/forgot/id" className="underline text-sm text-[#1976D2] hover:text-[#00C853]">¿Olvidaste tu contraseña?</Link>
                    </div>

                    {/* Enlaces para volver o registrarse */}
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <Link to="/" className="underline text-sm text-[#1976D2] hover:text-[#00C853]">Regresar</Link>
                        <Link
                            to="/register"
                            className="py-2 px-5 bg-gradient-to-r from-[#00C853] to-[#1976D2] text-white font-bold rounded-full shadow hover:scale-110 duration-200 hover:from-[#1976D2] hover:to-[#00C853]"
                        >
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;