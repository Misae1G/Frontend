import storePlans from "../../context/storePlans";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRAPI_KEY);

const plans = [
  {
    name: "Gratis",
    price: 0,
    originalPrice: null,
    badge: null,
    gradient: "from-gray-400 to-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    buttonGradient: "from-gray-400 to-gray-500",
    features: [
      "Acceso básico",
      "Anuncios visibles",
      "Soporte limitado",
      "Funcionalidades esenciales"
    ]
  },
  {
    name: "Pro",
    price: 5,
    originalPrice: 10,
    badge: "Más Popular",
    gradient: "from-blue-500 to-green-500",
    textColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-green-50",
    borderColor: "border-blue-300",
    buttonGradient: "from-blue-500 to-green-500",
    features: [
      "Sin anuncios",
      "Soporte prioritario", 
      "Funcionalidades avanzadas",
      "Integraciones básicas"
    ]
  },
  {
    name: "Premium",
    price: 25,
    originalPrice: 50,
    badge: "Mejor Valor",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    borderColor: "border-purple-300",
    buttonGradient: "from-purple-500 to-pink-500",
    features: [
      "Todas las funcionalidades",
      "Soporte VIP 24/7",
      "Acceso anticipado a nuevas funciones",
      "API completa",
      "Análiticas avanzadas"
    ]
  }
];

function StripePaymentForm({ plan, onSuccess, onError, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Obtener el token
      const token = localStorage.getItem('token');
      
      // Crear el PaymentIntent
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL.replace(/\/api\/auth$/, '')}/api/pagos/crear-intento-pago`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: plan.price, plan: plan.name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Error al crear el intento de pago');
      }
      
      if (!data.clientSecret) {
        throw new Error("No se pudo obtener clientSecret");
      }

      // Confirmar el pago con Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Cliente',
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        console.error('Error en el pago:', result.error);
        window.toast && window.toast.error(`❌ Error en el pago: ${result.error.message}`);
        onError && onError(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        setSuccess(true);
        window.toast && window.toast.success(`🎉 ¡Pago exitoso! Plan ${plan.name} activado por $${plan.price} USD`);
        setTimeout(() => {
          onSuccess && onSuccess(result.paymentIntent);
        }, 2000);
      }
    } catch (err) {
      console.error('Error en el proceso de pago:', err);
      setError(err.message || "Error al procesar el pago");
      window.toast && window.toast.error(`❌ ${err.message || 'Error al procesar el pago'}`);
      onError && onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-center border border-green-200">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
            <span className="text-2xl">🎉</span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-green-600 mb-3">¡Pago Exitoso!</h3>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-gray-700 mb-2">Tu plan <strong>{plan.name}</strong> ha sido activado</p>
            <div className="text-3xl font-bold text-green-600">${plan.price} USD</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
            <span>Redirigiendo automáticamente...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className={`bg-gradient-to-r ${plan.buttonGradient} text-white p-3 rounded-full shadow-lg`}>
            <span className="text-2xl">💳</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mt-4">Pagar Plan {plan.name}</h3>
      </div>
      
      {/* Detalles del plan */}
      <div className={`${plan.bgColor} border-2 ${plan.borderColor} rounded-xl p-4 mb-6`}>
        <div className="text-center mb-3">
          <div className={`inline-block bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 rounded-full text-sm font-semibold mb-2`}>
            {plan.name}
          </div>
          <div className="text-4xl font-black text-gray-800">${plan.price}</div>
          <div className="text-sm text-gray-500">USD / mes</div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Incluye:</div>
          <div className="grid grid-cols-1 gap-1">
            {plan.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            💳 Información de la tarjeta
          </label>
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200">
            <CardElement 
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    fontFamily: 'system-ui, sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                }
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            className={`bg-gradient-to-r ${plan.buttonGradient} text-white rounded-xl py-4 px-6 font-bold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
            disabled={!stripe || loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Procesando pago...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>💳</span>
                <span>Pagar ${plan.price} USD</span>
              </span>
            )}
          </button>

          <button
            type="button"
            className="text-gray-500 hover:text-gray-800 py-3 font-semibold transition-colors duration-200"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Información de seguridad */}
      <div className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
        <span>🔒</span>
        <span>Pago seguro con encriptación SSL</span>
      </div>
    </div>
  );
}

function ModalPlans() {
  const { modal, toggleModal, setSelectedPlan } = storePlans();
  const [showCardModal, setShowCardModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  useEffect(() => {
    if (!modal) {
      setSelectedPlan(null);
      setShowCardModal(false);
      setPendingPlan(null);
    }
  }, [modal, setSelectedPlan]);

  const handlePayClick = (plan) => {
    setSelectedPlan(plan);
    if (plan.price === 0) {
      window.toast && window.toast.success(`✅ ¡Plan ${plan.name} activado correctamente!`);
      toggleModal();
    } else {
      setPendingPlan(plan);
      setShowCardModal(true);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Pago exitoso:', paymentIntent);
    setShowCardModal(false);
    setPendingPlan(null);
    toggleModal();
    
    setTimeout(() => {
      window.toast && window.toast.info(`🚀 ¡Bienvenido al plan ${pendingPlan?.name}! Disfruta de todas las funcionalidades.`);
    }, 1000);
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Error en el pago:', errorMessage);
  };

  return modal ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 p-6 rounded-t-2xl relative">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
              ✨ Elige tu Plan Perfecto
            </h2>
            <p className="text-blue-100 text-sm opacity-90">
              Desbloquea todo el potencial de TaskAI con nuestros planes premium
            </p>
          </div>
          
          <button
            className="absolute top-4 right-4 text-white hover:text-blue-200 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
            onClick={toggleModal}
          >
            ×
          </button>
        </div>
        
        {/* Plans Container */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={plan.name} className={`
                relative transform transition-all duration-300 hover:scale-[1.02]
                ${index === 1 ? 'lg:scale-105 lg:z-10' : ''}
              `}>
                
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse`}>
                      🏆 {plan.badge}
                    </div>
                  </div>
                )}
                
                {/* Card */}
                <div className={`
                  ${plan.bgColor} 
                  border-2 ${plan.borderColor} 
                  rounded-2xl p-6 h-full flex flex-col 
                  shadow-lg hover:shadow-2xl transition-all duration-300
                  ${index === 1 ? 'border-blue-400 shadow-blue-200/50' : ''}
                `}>
                  
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-block bg-gradient-to-r ${plan.gradient} text-white p-3 rounded-full mb-4 shadow-lg`}>
                      <span className="text-2xl">
                        {plan.name === 'Gratis' ? '🆓' : plan.name === 'Pro' ? '🚀' : '👑'}
                      </span>
                    </div>
                    
                    <h3 className={`text-2xl font-black ${plan.textColor} mb-2`}>
                      {plan.name}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-black text-gray-800">
                        {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <div className="text-left">
                          <div className="text-sm text-gray-500">USD</div>
                          <div className="text-xs text-gray-400">por mes</div>
                        </div>
                      )}
                    </div>
                    
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-gray-400 line-through">${plan.originalPrice} USD</span>
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                          {Math.round((1 - plan.price / plan.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3 group">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-green-600 font-bold text-sm">✓</span>
                          </div>
                          <span className="text-gray-700 font-medium text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-white
                      ${plan.price === 0 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600' 
                        : `bg-gradient-to-r ${plan.buttonGradient} hover:shadow-lg`
                      }
                      transform hover:scale-[1.02] transition-all duration-300
                      shadow-lg hover:shadow-xl
                      flex items-center justify-center gap-2
                    `}
                    onClick={() => handlePayClick(plan)}
                  >
                    <span className="text-lg">
                      {plan.price === 0 ? '✅' : '💳'}
                    </span>
                    <span>
                      {plan.price === 0 ? 'Usar Gratis' : `Pagar $${plan.price}`}
                    </span>
                  </button>
                  
                  {/* Popular indicator */}
                  {index === 1 && (
                    <div className="mt-3 text-center">
                      <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full">
                        🔥 La opción más popular
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Info */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Pago 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span>Cancela cuando quieras</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Stripe Elements */}
        {showCardModal && pendingPlan && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50 backdrop-blur-sm p-4">
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                plan={pendingPlan}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => {
                  setShowCardModal(false);
                  setPendingPlan(null);
                }}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

export default ModalPlans;