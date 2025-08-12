import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRAPI_KEY);

// Estilos personalizados para CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#374151',
      '::placeholder': {
        color: '#9CA3AF',
      },
      iconColor: '#ffffff',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true, // Ocultar código postal si no lo necesitas
};

// Componente interno que maneja el pago
function StripePaymentForm({ tratamiento, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Crear el PaymentIntent en tu backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pagos/crear-intento-pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: tratamiento.precio // El precio ya debe estar en la unidad correcta
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Error al crear el intento de pago');
      }

      if (!data.clientSecret) {
        throw new Error('No se pudo obtener el clientSecret');
      }

      // 2. Confirmar el pago con Stripe
      const cardElement = elements.getElement(CardElement);
      
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Cliente', // Puedes personalizar esto
          },
        },
      });

      if (result.error) {
        // Error en el pago
        setError(result.error.message);
        console.error('Error en el pago:', result.error);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Pago exitoso
        setSuccess(true);
        window.toast && window.toast.success('¡Pago procesado exitosamente!');
        
        // Llamar callback de éxito después de un delay
        setTimeout(() => {
          onSuccess && onSuccess(result.paymentIntent);
        }, 2000);
      }
    } catch (err) {
      console.error('Error en el proceso de pago:', err);
      setError(err.message || 'Error al procesar el pago');
      window.toast && window.toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">¡Pago Exitoso!</h3>
        <p className="text-gray-300">Tu tratamiento ha sido pagado correctamente</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Detalles del tratamiento */}
      <div>
        <label className="block text-sm font-semibold text-gray-200 text-left mb-2">Detalle</label>
        <ul className="text-gray-300 bg-gray-700 p-3 rounded-md text-left space-y-1">
          <li><strong>Nombre:</strong> {tratamiento.nombre}</li>
          <li><strong>Descripción:</strong> {tratamiento.descripcion}</li>
          <li><strong>Prioridad:</strong> {tratamiento.prioridad}</li>
        </ul>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold text-gray-200 text-left mb-2">Precio</label>
        <p className="text-green-400 bg-gray-700 p-3 rounded-md font-bold text-left text-xl">
          ${tratamiento.precio} USD
        </p>
      </div>

      {/* Elemento de tarjeta de Stripe */}
      <div>
        <label className="block text-sm font-semibold text-gray-200 text-left mb-2">
          Información de la tarjeta
        </label>
        <div className="p-4 border border-gray-600 rounded-lg bg-gray-700">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <div className="mt-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!stripe || loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            `Pagar $${tratamiento.precio} USD`
          )}
        </button>

        <button
          type="button"
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-300"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>

      {/* Información de seguridad */}
      <div className="text-center text-xs text-gray-400 mt-4">
        🔒 Tu información está protegida con encriptación SSL
      </div>
    </form>
  );
}

// Componente principal del modal
function ModalPayment({ isOpen, tratamiento, onSuccess, onClose }) {
  if (!isOpen || !tratamiento) return null;

  const handleSuccess = (paymentIntent) => {
    console.log('Pago exitoso:', paymentIntent);
    onSuccess && onSuccess(paymentIntent);
    onClose && onClose();
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden max-w-lg w-full mx-4 border border-gray-700 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <h2 className="text-white font-bold text-xl text-center">
            💳 Pagar Tratamiento
          </h2>
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              tratamiento={tratamiento}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

export default ModalPayment;