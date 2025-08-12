import logoConfirm from '../assets/confirmconfiirmar.png'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import useFetch from '../hooks/useFetch.js'

export const Confirm = () => {
    const { token } = useParams()
    const { fetchDataBackend } = useFetch()

    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirmar/${token}`
            await fetchDataBackend(url, null, 'GET')
        } catch (error) {
            // El error ya se maneja en el hook useFetch
            console.error('Error al verificar token:', error.message)
        }
    }

    useEffect(() => {
        verifyToken()
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <ToastContainer/>
            <img className="object-cover h-40 w-40 md:h-60 md:w-60 rounded-full border-4 border-[#00C853] shadow-lg mt-8" src={logoConfirm} alt="image description"/>
            <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#B9F6CA] mt-8">
                <p className="text-3xl md:text-4xl lg:text-5xl text-[#1976D2] font-bold drop-shadow mb-4">¡Muchas Gracias!</p>
                <p className="md:text-lg lg:text-xl text-[#1976D2] mb-6">Tu cuenta ha sido confirmada.<br/>Ya puedes iniciar sesión y comenzar tu progreso.</p>
                <Link
                    to="/login"
                    className="py-2 px-8 w-full text-center bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold rounded-full shadow-lg hover:scale-110 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide"
                >
                    Iniciar sesión
                </Link>
            </div>
        </div>
    )
}