import logoReset from '../assets/crearcontra.png'
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Reset = () => {
    const { fetchDataBackend } = useFetch();
    const { token } = useParams();
    const navigate = useNavigate();
    const [tokenback, setTokenBack] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const password = watch("password", "");

    // Verifica el token al cargar la página
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/recuperar-password/${token}`;
                const response = await fetchDataBackend(url, null, 'GET');
                if (response && response.msg) {
                    setTokenBack(true);
                } else {
                    setTokenBack(false);
                }
            } catch {
                setTokenBack(false);
            }
        };
        verifyToken();
        // eslint-disable-next-line
    }, [token]);

    const changePassword = async (data) => {
        if (data.password !== data.confirmpassword) return;
        const url = `${import.meta.env.VITE_BACKEND_URL}/recuperar-password/${token}`;
        await fetchDataBackend(url, data, 'POST');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-2 text-center text-[#1976D2]">Bienvenido nuevamente</h1>
            <small className="text-[#00C853] block my-4 text-center text-base">
                Por favor, ingresa los siguientes datos
            </small>
            <img
                className="object-cover h-40 w-40 md:h-60 md:w-60 rounded-full border-4 border-[#00C853] shadow-lg mt-4"
                src={logoReset}
                alt="image description"
            />
            {tokenback && (
                <form className="w-80 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#B9F6CA] mt-8" onSubmit={handleSubmit(changePassword)}>
                    <div className="mb-4">
                        <label className="mb-2 block text-base font-semibold text-[#1976D2]">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="block w-full rounded-lg border border-[#B9F6CA] focus:border-[#00C853] focus:outline-none focus:ring-2 focus:ring-[#00C853] py-2 px-3 text-[#1976D2] bg-white/90 shadow-sm"
                            {...register("password", { required: "La contraseña es obligatoria" })}
                        />
                        {errors.password && <p className="text-[#E57373]">{errors.password.message}</p>}

                        <label className="mb-2 block text-base font-semibold text-[#1976D2] mt-4">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            className="block w-full rounded-lg border border-[#B9F6CA] focus:border-[#00C853] focus:outline-none focus:ring-2 focus:ring-[#00C853] py-2 px-3 text-[#1976D2] bg-white/90 shadow-sm"
                            {...register("confirmpassword", {
                                required: "Debes confirmar la contraseña",
                                validate: value =>
                                    value === password || "Las contraseñas no coinciden"
                            })}
                        />
                        {errors.confirmpassword && <p className="text-[#E57373]">{errors.confirmpassword.message}</p>}
                    </div>
                    <div className="mb-3">
                        <button className="bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold py-2 w-full rounded-full shadow-lg hover:scale-105 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide mt-2">
                            Enviar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;
