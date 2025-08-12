import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";

export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();

    const onSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/recuperar-password`;
        await fetchDataBackend(url, data, "POST");
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <ToastContainer />
            <div className="w-full sm:w-1/2 h-screen flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#B9F6CA]">
                    <h1 className="text-3xl font-bold mb-2 text-center uppercase text-[#1976D2]">¡Olvidaste tu contraseña!</h1>
                    <small className="text-[#00C853] block my-4 text-center text-base">No te preocupes</small>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-5">
                            <label className="mb-2 block text-base font-semibold text-[#1976D2]">Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="Ingresa un correo electrónico válido"
                                className="block w-full rounded-lg border border-[#B9F6CA] focus:border-[#00C853] focus:outline-none focus:ring-2 focus:ring-[#00C853] py-2 px-3 text-[#1976D2] bg-white/90 shadow-sm transition"
                                {...register("correo", { required: "El correo es obligatorio" })}
                            />
                            {errors.correo && <p className="text-[#E57373]">{errors.correo.message}</p>}
                        </div>
                        <div className="mb-6">
                            <button className="bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold py-2 w-full rounded-full shadow-lg hover:scale-105 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide">
                                Enviar correo
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
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/images/forgotcontra.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden"></div>
        </div>
    );
};