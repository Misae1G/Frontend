import { useState } from "react"

const TextoImagen = () => {
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setImageUrl("")
    
    try {
      const res = await fetch(`http://localhost:8080/api/auth/texto-imagen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.msg || "Error generando imagen")
      }
      
      setImageUrl(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 rounded-2xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
              <span className="text-5xl animate-pulse">🎨</span>
            </div>
            <div>
              <h1 className="font-black text-4xl lg:text-5xl text-white drop-shadow-lg mb-2">
                Texto a Imagen IA
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Convierte tus ideas en imágenes increíbles con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador IA</h2>
                <p className="text-blue-100">Describe tu imagen ideal</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de texto mejorado */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-bold text-blue-600">
                  <span className="text-lg">💭</span>
                  Descripción de la imagen
                </label>
                
                <div className="relative">
                  <textarea
                    className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="Describe la imagen que quieres generar..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Botón de generar */}
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-green-500 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    Generando...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🎨</span>
                    Generar Imagen
                  </>
                )}
              </button>
            </form>

            {/* Error mejorado */}
            {error && (
              <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="text-xl">❌</span>
                <div>
                  <p className="font-semibold">Error en la generación</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Estado de carga mejorado */}
            {loading && (
              <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">🎨</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600 mb-2">Creando tu imagen...</p>
                  <p className="text-gray-600">La IA está trabajando en tu solicitud</p>
                </div>
              </div>
            )}
            
            {/* Imagen generada mejorada */}
            {imageUrl && !loading && (
              <div className="mt-8 space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                    <span className="text-xl">🖼️</span>
                    Imagen Generada
                  </h3>
                  
                  <div className="flex justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Generada por IA" 
                      className="rounded-xl shadow-xl border-4 border-white max-w-full max-h-96 hover:shadow-2xl transition-shadow duration-300" 
                    />
                  </div>
                  
                  {/* Info del prompt */}
                  <div className="mt-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-600 mb-1">Prompt utilizado:</p>
                    <p className="text-gray-700 text-sm italic">"{prompt}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Estado inicial cuando no hay imagen */}
            {!imageUrl && !loading && (
              <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-6">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 p-8 rounded-full shadow-lg">
                  <span className="text-6xl">🎭</span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">¡Da vida a tus ideas!</h3>
                  <p className="text-gray-600 max-w-md">
                    Describe cualquier imagen que puedas imaginar y nuestra IA la creará para ti.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextoImagen