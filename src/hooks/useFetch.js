import axios from 'axios'
import { toast } from 'react-toastify'
import storeAuth from '../context/storeAuth' // Importa el store para obtener el token

// Helper para saber si estamos en la página de Mis Áreas o Bienvenida Área
function isAreaContextPage() {
    if (typeof window !== 'undefined') {
        return window.location.pathname.includes('/mis-areas') || window.location.pathname.includes('/bienvenida-area')
    }
    return false
}

// Event emitter simple para comunicación entre componentes
const eventEmitter = {
    events: {},
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
    },
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data))
        }
    },
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback)
        }
    }
}

function useFetch() {
    const fetchDataBackend = async (url, form = null, method = 'POST') => {
        try {
            // Obtener el token fresco en cada petición
            const currentToken = storeAuth.getState().token || localStorage.getItem('token')
            
            let respuesta
            const config = {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }

            // Agregar soporte para más métodos HTTP
            switch (method.toUpperCase()) {
                case 'POST':
                    respuesta = await axios.post(url, form, config)
                    break
                case 'GET':
                    respuesta = await axios.get(url, config)
                    break
                case 'PUT':
                    respuesta = await axios.put(url, form, config)
                    break
                case 'DELETE':
                    respuesta = await axios.delete(url, config)
                    break
                case 'PATCH':
                    respuesta = await axios.patch(url, form, config)
                    break
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`)
            }

            const msg = respuesta?.data?.msg
            const data = respuesta?.data
            
            // Detectar si se creó una tarea y emitir evento
            if (url.includes('/api/tarea/crear') && method.toUpperCase() === 'POST' && data?.tarea) {
                // Emitir evento de tarea creada para que otros componentes se actualicen
                eventEmitter.emit('tareaCreada', data.tarea)
                
                // Toast especial para creación de tarea
                toast.success(`📋 Tarea "${data.tarea.nombre}" creada y asignada correctamente`)
            } else if (msg && msg.startsWith('Has seleccionado la empresa')) {
                // Solo mostrar el toast de éxito de selección de empresa en Mis Áreas o Bienvenida Área
                if (isAreaContextPage()) {
                    console.log('TOAST SUCCESS (área):', window.location.pathname, msg)
                    toast.success(msg)
                } else {
                    console.log('IGNORADO TOAST SUCCESS (fuera de área):', window.location.pathname, msg)
                }
            } else if (msg) {
                console.log('TOAST SUCCESS (otro):', window.location.pathname, msg)
                toast.success(msg)
            }
            
            return data
        } catch (error) {
            const msg = error.response?.data?.msg
            
            // Solo mostrar el toast de "Debes seleccionar una empresa..." en Mis Áreas o Bienvenida Área
            if (msg === 'Debes seleccionar una empresa para ver sus detalles. Usa el endpoint para listar tus empresas.') {
                if (isAreaContextPage()) {
                    console.log('TOAST ERROR (área):', window.location.pathname, msg)
                    toast.error(msg)
                } else {
                    console.log('IGNORADO TOAST ERROR (fuera de área):', window.location.pathname, msg)
                }
            } else if (msg) {
                console.log('TOAST ERROR (otro):', window.location.pathname, msg)
                toast.error(msg)
            }
            
            const errorMsg = msg || 'Error desconocido'
            console.error('Error en fetchDataBackend:', error)
            throw new Error(errorMsg)
        }
    }

    return { fetchDataBackend, eventEmitter }
}

export default useFetch