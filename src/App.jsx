import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Home } from './pages/Home'
import Login from './pages/Login'
import { Register } from './pages/Register'
import { Forgot } from './pages/Forgot'
import { Confirm } from './pages/Confirm'
import { NotFound } from './pages/NotFound'
import Dashboard from './layout/Dashboard'
import Profile from './pages/Profile'
import TextoImagen from './pages/TextoImagen.jsx'
import List from './pages/List'
import Details from './pages/Details'
import Create from './pages/Create'
import Update from './pages/Update'
import Chat from './pages/Chat'
import Reset from './pages/Reset'
import PublicRoute from './routes/PublicRoute.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { useEffect } from 'react'
import storeProfile from './context/storeProfile.jsx'
import storeAuth from './context/storeAuth.jsx'
import storePlans from './context/storePlans';
import ModalPlans from './components/treatments/ModalPlans.jsx';
import MisAreas from './pages/MisAreas'
import BienvenidaArea from './pages/BienvenidaArea'
import EmpleadoProfile from './pages/EmpleadoProfile'

function App() {
  const { profile } = storeProfile()
  const { token } = storeAuth()
  const { toggleModal } = storePlans()

  useEffect(() => {
    if (token) {
      profile()
    } else {
      localStorage.removeItem('pagoModalShown');
    }
  }, [token, profile])


  // Mostrar el modal de pago solo una vez, 1 minuto después de iniciar sesión
  useEffect(() => {
    if (!token) return;
    const pagoShown = localStorage.getItem('pagoModalShown');
    if (!pagoShown) {
      const timer = setTimeout(() => {
        if (typeof toggleModal === 'function') {
          toggleModal();
          localStorage.setItem('pagoModalShown', 'true');
        }
      }, 60000); // 1 minuto
      return () => clearTimeout(timer);
    }
  }, [token]);

  // Configurar window.toast para acceso global
  useEffect(() => {
    window.toast = toast;
  }, []);

  // Lógica para manejar el pago con Stripe
  const handlePay = (plan) => {
    // Aquí puedes abrir el modal de Stripe o redirigir al checkout
    alert(`Implementa aquí la lógica de pago para el plan: ${plan.name}`);
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='forgot/:id' element={<Forgot />} />
            <Route path='confirmar/:token' element={<Confirm />} />
            <Route path='recuperarpassword/:token' element={<Reset />} />
            <Route path='*' element={<NotFound />} />
          </Route>

          {/* Rutas protegidas */}
          <Route path='/dashboard/*' element={<ProtectedRoute />}>
            <Route element={<Dashboard />}>
              <Route index element={<MisAreas />} />
              <Route path='mis-areas' element={<MisAreas />} />
              <Route path='profile' element={<Profile />} />
              <Route path='texto-imagen' element={<TextoImagen />} />
              <Route path='listar' element={<List />} />
              <Route path='visualizar/:id' element={<Details />} />
              <Route path='crear' element={<Create />} />
              <Route path='actualizar/:id' element={<Update />} />
              <Route path='chat' element={<Chat />} />
              <Route path='bienvenida-area/:id' element={<BienvenidaArea />} />
              <Route path='empleado/perfil/:id' element={<EmpleadoProfile />} />
            </Route>
          </Route>
        </Routes>
        <ModalPlans onPay={handlePay} />
      </BrowserRouter>

      {/* Contenedor de Toast - ESTO ES LO QUE FALTABA */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  )
}

export default App