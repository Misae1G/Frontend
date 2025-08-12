import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useFetch from "../hooks/useFetch.js"
import CardAreas from "../components/MisAreas/CardAreas.jsx"
import storeAuth from '../context/storeAuth.jsx'

const MisAreas = () => {
    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    const [empresasCreadas, setEmpresasCreadas] = useState([])
    const [empresaUnida, setEmpresaUnida] = useState([])
    const [selectedEmpresa, setSelectedEmpresa] = useState(null)
    const [codigoGenerado, setCodigoGenerado] = useState("")
    const [userRole, setUserRole] = useState(null)
    const [userId, setUserId] = useState(null) // Nuevo estado para el ID del usuario

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            // Obtener el rol del usuario desde el token
            const token = localStorage.getItem('token')
            if (token) {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]))
                setUserRole(tokenPayload.rol)
                setUserId(tokenPayload.id) // Guardar el ID del usuario
                console.log('🔍 ROL USUARIO:', tokenPayload.rol)
                console.log('🔍 ID USUARIO:', tokenPayload.id)
            }

            // Cargar empresas creadas (solo para jefes)
            try {
                const empresasData = await fetchDataBackend('http://localhost:8080/api/empresa/mis-empresas', null, 'GET')
                setEmpresasCreadas(Array.isArray(empresasData) ? empresasData : [])
                console.log('🏢 EMPRESAS CREADAS:', empresasData)
            } catch (error) {
                setEmpresasCreadas([])
            }

            // Cargar empresa donde es empleado
            try {
                const empresaData = await fetchDataBackend('http://localhost:8080/api/empresa/mi-empresa', null, 'GET')
                setEmpresaUnida(empresaData ? [empresaData] : [])
                console.log('👤 EMPRESA EMPLEADO:', empresaData)
            } catch (error) {
                setEmpresaUnida([])
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }

    // Función para seleccionar empresa y navegar (solo para jefes)
    const handleSelectJefe = async (id) => {
        try {
            const res = await fetchDataBackend(
                "http://localhost:8080/api/empresa/seleccionar/" + id,
                null,
                "POST"
            )
            // Guarda el nuevo token en localStorage y store
            if (res.token) {
                localStorage.setItem("token", res.token)
                storeAuth.getState().setToken(res.token)
            }
            navigate(`/dashboard/bienvenida-area/${id}`)
        } catch (error) {
            console.error('Error al seleccionar empresa:', error)
        }
    }

    // Función para generar código (solo para jefes)
    const handleGenerarCodigo = async (id) => {
        try {
            // Primero seleccionar la empresa
            const resSeleccion = await fetchDataBackend(
                "http://localhost:8080/api/empresa/seleccionar/" + id,
                null,
                "POST"
            )
            if (resSeleccion.token) {
                localStorage.setItem("token", resSeleccion.token)
                storeAuth.getState().setToken(resSeleccion.token)
            }

            // Luego generar el código
            const res = await fetchDataBackend(
                "http://localhost:8080/api/empresa/generar-invitacion",
                null,
                "PUT"
            )
            setCodigoGenerado(res.codigo)
        } catch (error) {
            console.error('Error al generar código:', error)
        }
    }

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Mis Áreas</h1>
            <hr className='my-4'/>
            
            {/* Mostrar empresas creadas solo si el usuario es jefe y tiene empresas */}
            {userRole === 'jefe' && empresasCreadas.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#1976D2] mb-2">Empresas que has creado</h2>
                    <CardAreas 
                        areas={empresasCreadas} 
                        onSelect={handleSelectJefe}
                        onChange={loadUserData}
                        isEmployee={false} // Los jefes no son empleados de sus propias empresas
                    />
                </div>
            )}

            {/* Mostrar empresa donde es empleado - CLAVE: Pasar isEmployee={true} */}
            {empresaUnida.length > 0 && (
                (userRole === 'empleado' || (userRole === 'jefe' && empresasCreadas.length === 0)) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#00C853] mb-2">
                            {userRole === 'empleado' ? 'Tu empresa' : 'Empresa donde eres empleado'}
                        </h2>
                        <CardAreas 
                            areas={empresaUnida} 
                            onSelect={null} // Dejar que CardAreas maneje la navegación internamente
                            onChange={loadUserData}
                            isEmployee={true} // ESTA ES LA CLAVE - Siempre true para empresa donde es empleado
                        />
                    </div>
                )
            )}

            {/* Mensaje cuando no hay empresas */}
            {empresasCreadas.length === 0 && empresaUnida.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className="text-xl font-bold text-[#1976D2] mb-2">No tienes áreas de trabajo</h3>
                    <p className="text-gray-600 mb-4">
                        {userRole === 'jefe' 
                            ? 'Puedes crear una nueva área de trabajo o unirte a una existente.'
                            : 'Únete a un área de trabajo para comenzar.'
                        }
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-[#1976D2] text-white px-6 py-2 rounded-lg hover:bg-[#00C853] transition-colors"
                        >
                            Ir al Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Modal para generar código */}
            {selectedEmpresa && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md shadow-2xl relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-[#1976D2] text-xl"
                            onClick={() => setSelectedEmpresa(null)}
                        >✕</button>
                        <h3 className="text-xl font-bold text-[#1976D2] mb-2">{selectedEmpresa.nombre}</h3>
                        <p className="text-gray-600 mb-2">{selectedEmpresa.descripcion}</p>
                        <button
                            className="bg-[#00C853] text-white px-3 py-2 rounded hover:bg-[#1976D2] transition"
                            onClick={() => handleGenerarCodigo(selectedEmpresa._id)}
                        >
                            Generar código de invitación
                        </button>
                        {codigoGenerado && (
                            <div className="mt-4 text-[#1976D2] font-bold text-center">
                                Código generado: <span className="bg-[#B9F6CA] px-2 py-1 rounded">{codigoGenerado}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MisAreas