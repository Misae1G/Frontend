import logoNotFound from '../assets/pgnoencontrada.png';
import { Link } from 'react-router';

export const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen font-sans bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            <img
                className="object-cover h-80 w-80 rounded-full border-4 border-[#00C853] shadow-lg mt-8"
                src={logoNotFound}
                alt="Página no encontrada"
            />

            <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#B9F6CA] mt-12 text-center">
                <p className="text-3xl md:text-4xl lg:text-5xl text-[#1976D2] font-bold drop-shadow mb-4">Página no encontrada</p>
                <p className="md:text-lg lg:text-xl text-[#1976D2] mb-8">Lo sentimos mucho</p>
                <Link
                    to="/"
                    className="py-2 px-8 w-full text-center bg-gradient-to-r from-[#1976D2] to-[#00C853] text-white font-bold rounded-full shadow-lg hover:scale-110 duration-200 hover:from-[#00C853] hover:to-[#1976D2] tracking-wide"
                >
                    Regresar
                </Link>
            </div>
        </div>
    );
};
