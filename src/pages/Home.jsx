import { useState, useEffect } from 'react';
import logoDarkMode from '../assets/dark.png';
import logoTaskMain from '../assets/taksmain.png';
import AppStoreImage from '../assets/appstore.png';
import GooglePlayImage from '../assets/googleplay.png';
import logoMain from '../assets/LOGO.png';
import NosotrosMain from '../assets/Nostrosmain.png';
import { BsCashCoin } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { GiMedicines } from "react-icons/gi";
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { LuNotebook } from "react-icons/lu"; // Nuevo icono de cuaderno
import { useNavigate } from 'react-router';

export const Home = () => {
    const [, setActiveSection] = useState('inicio');
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#B9F6CA] to-[#64B5F6]">
            {/* Header */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-[#B9F6CA]' 
                    : 'bg-white/90'
            }`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div
                            className="flex items-center gap-3 cursor-pointer select-none group"
                            onClick={() => scrollToSection('inicio')}
                            title="Ir a la página principal"
                        >
                            <div className="relative">
                                <img src={logoMain} alt="Logo" className="w-14 h-14 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00C853] rounded-full animate-pulse"></div>
                            </div>
                            <h1 className='font-bold text-2xl text-[#1976D2] drop-shadow-lg tracking-wide transition-all duration-300 group-hover:scale-105'>
                                Task<span className='text-[#00C853]'>AI</span>
                            </h1>
                        </div>
                        
                        <nav className='hidden md:flex'>
                            <ul className='flex gap-8'>
                                {[
                                    { id: 'inicio', label: 'Inicio' },
                                    { id: 'sobre-nosotros', label: 'Sobre nosotros' },
                                    { id: 'servicios', label: 'Servicios' },
                                    { id: 'contacto', label: 'Contacto' }
                                ].map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => scrollToSection(item.id)}
                                            className={`font-semibold transition-all duration-300 hover:scale-110 relative group
                                                text-[#1976D2] hover:text-[#00C853]
                                            `}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        
                        <div className='flex items-center gap-4'>
                            <img src={logoDarkMode} alt="logo" width={35} height={35} className="cursor-pointer hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="inicio" className='pt-24 pb-16 relative overflow-hidden'>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2]/90 via-[#00C853]/90 to-[#64B5F6]/90"></div>
                <div className='container mx-auto px-8 relative z-10'>
                    <div className='flex flex-col lg:flex-row items-center gap-12 min-h-[70vh]'>
                        <div className='flex-1 text-center lg:text-left space-y-8'>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                                    <span className="bg-white px-4 py-1 rounded-full text-[#1976D2] font-semibold tracking-wide shadow-lg">
                                        REVOLUCIONA TU GESTIÓN
                                    </span>
                                </div>
                                <h1 className='font-extrabold text-[#1976D2] uppercase text-4xl lg:text-6xl drop-shadow-2xl font-sans leading-tight'>
                                    ¡Bienvenido a TaskAI!
                                </h1>
                                <p className="font-normal text-white text-xl lg:text-3xl leading-relaxed">
                                    Tu plataforma para gestionar tareas de forma inteligente.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    className='
                                        bg-white text-[#1976D2] border-2 border-[#00C853]
                                        px-8 py-4 rounded-full font-bold shadow-2xl
                                        hover:bg-[#00C853] hover:text-white hover:border-[#1976D2]
                                        transition-all duration-300 tracking-wide text-lg
                                    '
                                    onClick={() => navigate('/login')}
                                >
                                    <span className="flex items-center gap-2">
                                        Empieza ahora
                                    </span>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <p className='flex items-center justify-center lg:justify-start gap-2'>
                                    <span className="bg-white px-4 py-1 rounded-full text-[#1976D2] font-bold shadow-lg">
                                        <span>📱</span> Encuéntranos
                                    </span>
                                </p>
                                <div className="flex justify-center lg:justify-start gap-4">
                                    <a href="#" className="hover:scale-110 transition-transform duration-300">
                                        <img src={AppStoreImage} alt="App Store" className="rounded-lg shadow-lg" />
                                    </a>
                                    <a href="#" className="hover:scale-110 transition-transform duration-300">
                                        <img src={GooglePlayImage} alt="Google Play" className="rounded-lg shadow-lg" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex-1 relative'>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#1976D2] to-[#00C853] rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <img
                                    src={logoTaskMain}
                                    alt="TaskAI Dashboard"
                                    className="relative rounded-3xl shadow-2xl border-4 border-[#00C853] max-w-2xl w-full h-auto object-contain mx-auto transform hover:scale-105 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sobre Nosotros */}
            <section id="sobre-nosotros" className='py-20 relative'>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B9F6CA] to-[#64B5F6]"></div>
                <div className='container mx-auto px-4 relative z-10'>
                    <div className='text-center mb-16'>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg mb-4">
                            <span className="text-[#1976D2] font-semibold">Conoce nuestro equipo</span>
                        </div>
                        <h2 className='font-bold text-4xl lg:text-5xl text-[#1976D2] mb-4'>
                            SOBRE NOSOTROS
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#1976D2] to-[#00C853] mx-auto rounded-full"></div>
                    </div>
                    
                    <div className='flex flex-col lg:flex-row items-center gap-16'>
                        <div className='lg:w-1/2 relative group'>
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#64B5F6] to-[#00C853] rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <img
                                src={NosotrosMain}
                                alt="Sobre nosotros"
                                className='relative w-full max-w-xl h-auto object-cover rounded-3xl shadow-2xl border-4 border-[#64B5F6] transform hover:scale-105 transition-all duration-300'
                            />
                        </div>
                        
                        <div className='lg:w-1/2 space-y-8'>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#B9F6CA]">
                                <p className='text-[#1976D2] font-semibold text-lg leading-relaxed'>
                                    TaskAI está dedicada a revolucionar la gestión de tareas para emprendimientos y pequeñas empresas. Nuestra misión es optimizar las operaciones diarias, fomentar la colaboración en equipo y potenciar la productividad mediante inteligencia artificial de vanguardia.
                                </p>
                            </div>
                            
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#B9F6CA]">
                                <p className='text-[#1976D2] font-semibold text-lg leading-relaxed'>
                                    Contamos con un equipo de expertos en desarrollo de software y gestión de proyectos, asegurando que nuestras soluciones se adapten perfectamente a tus necesidades empresariales.
                                </p>
                            </div>
                            
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#B9F6CA]">
                                <div className="flex items-center gap-2 mb-6">
                                    <span role="img" aria-label="cohete" className="text-2xl">🚀</span>
                                    <p className="text-xl font-bold text-[#1976D2]">Con TaskAI podrás:</p>
                                </div>
                                <ul className="space-y-3 list-disc ml-8">
                                    <li className="text-[#1976D2] font-medium">Gestionar proyectos y tareas con eficiencia.</li>
                                    <li className="text-[#1976D2] font-medium">Automatizar flujos de trabajo con inteligencia artificial.</li>
                                    <li className="text-[#1976D2] font-medium">Supervisar el progreso del equipo en tiempo real.</li>
                                    <li className="text-[#1976D2] font-medium">Mejorar la comunicación y organización de tu negocio.</li>
                                </ul>
                            </div>
                            
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#B9F6CA]">
                                <p className='text-[#1976D2] font-semibold text-lg leading-relaxed'>
                                    👉 Estamos aquí para ayudarte a alcanzar el máximo potencial de tu emprendimiento con tecnología moderna y soluciones inteligentes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servicios */}
            <section id="servicios" className='py-20 relative overflow-hidden'>
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FA] to-[#B9F6CA]"></div>
                <div className='container mx-auto px-4 relative z-10'>
                    <div className='text-center mb-16'>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg mb-4">
                            <span className="text-[#1976D2] font-semibold">Nuestras soluciones</span>
                        </div>
                        <h2 className='font-bold text-4xl lg:text-5xl text-[#1976D2] mb-4'>SERVICIOS</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#1976D2] to-[#00C853] mx-auto rounded-full"></div>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {[
                            {
                                icon: <LuNotebook className='text-6xl text-[#64B5F6]' />, // Icono de cuaderno
                                title: "Gestión de tareas",
                                description: "Organiza y controla tus tareas con ayuda de inteligencia artificial.",
                                borderColor: "border-[#64B5F6]"
                            },
                            {
                                icon: <FaCommentSms className='text-6xl text-[#1976D2]' />,
                                title: "Comunicación en tiempo real",
                                description: "Chatea con tu equipo al instante y de forma segura.",
                                borderColor: "border-[#1976D2]"
                            },
                            {
                                icon: <GiMedicines className='text-6xl text-[#00C853]' />,
                                title: "Monitoreo emocional",
                                description: "Registra y haz seguimiento del bienestar emocional del equipo.",
                                borderColor: "border-[#00C853]"
                            },
                            {
                                icon: <BsCashCoin className='text-6xl text-[#1976D2]' />,
                                title: "Sistema de recompensas",
                                description: "Motiva a tu equipo con recompensas personalizadas.",
                                borderColor: "border-[#1976D2]"
                            }
                        ].map((service, index) => (
                            <div key={index} className={`group relative`}>
                                <div className="absolute -inset-2 bg-gradient-to-r from-[#1976D2] to-[#00C853] rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                                <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border ${service.borderColor} hover:scale-105 transform`}>
                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            {service.icon}
                                        </div>
                                        <h4 className="text-xl font-bold text-[#1976D2] group-hover:text-[#00C853] transition-colors duration-300">
                                            {service.title}
                                        </h4>
                                        <p className="text-[#1976D2] leading-relaxed font-medium">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contacto" className='relative -mt-10'>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2] via-[#64B5F6] to-[#00C853] z-0"></div>
                
                <div className="relative z-10 pt-16 pb-8 px-6 lg:px-20 text-white">
                    <div className="container mx-auto space-y-12">
                        <div className='flex flex-col lg:flex-row justify-between items-center gap-8'>
                            <div className='text-center lg:text-left'>
                                <h3 className='text-4xl font-extrabold text-white mb-2'>Contáctanos</h3>
                                <p className="text-white font-semibold">¿Listo para revolucionar tu gestión?</p>
                            </div>
                            <div className='flex gap-6'>
                                {[
                                    { icon: <FaFacebook className='text-3xl text-white' />, hover: 'hover:text-[#00C853]' },
                                    { icon: <FaSquareInstagram className='text-3xl text-white' />, hover: 'hover:text-[#00C853]' },
                                    { icon: <FaXTwitter className='text-3xl text-white' />, hover: 'hover:text-[#00C853]' }
                                ].map((social, index) => (
                                    <div
                                        key={index}
                                        className={`bg-white/10 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 cursor-pointer hover:bg-white/20 ${social.hover}`}
                                    >
                                        {social.icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                            <div className='space-y-6'>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-[#B9F6CA]">
                                    <p className='font-bold text-lg mb-4'>¿Tienes preguntas o necesitas soporte? ¡Contáctanos hoy!</p>
                                    <div className="space-y-3">
                                        <p className='flex items-center gap-3'>
                                            <span className="bg-[#00C853] rounded-full p-2">📧</span>
                                            <span className="font-semibold">Correo:</span>
                                            <span>support@taskai.com</span>
                                        </p>
                                        <p className='flex items-center gap-3'>
                                            <span className="bg-[#00C853] rounded-full p-2">📞</span>
                                            <span className="font-semibold">Teléfono:</span>
                                            <span>+1 (555) 123-4567</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-[#B9F6CA]'>
                                <h4 className='text-[#1976D2] font-bold text-xl mb-4 text-center'>Suscríbete a nuestro boletín</h4>
                                <div className='space-y-4'>
                                    <input
                                        type="email"
                                        placeholder="Ingresa tu correo electrónico"
                                        className="w-full border-2 border-[#00C853]/50 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none px-4 py-3 text-white placeholder-white/70 focus:border-[#00C853] transition-colors duration-300"
                                    />
                                    <button className='w-full bg-gradient-to-r from-[#1976D2] to-[#00C853] py-3 rounded-xl text-white font-bold hover:scale-105 transition-transform duration-300 shadow-lg'>
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-[#B9F6CA] pt-8">
                            <p className='text-center font-semibold text-white/80'>
                                Copyright © TASKAI - Todos los derechos reservados
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};