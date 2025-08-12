// Hook para consumir Hugging Face Inference API desde el frontend
// Modelo: distilbert-base-uncased-finetuned-sst-2-english (análisis de sentimiento)

export async function analizarSentimiento(texto) {
  const apiKey = import.meta.env.VITE_HUGGING_FACE_API_KEY;
  const endpoint = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: texto })
  });

  if (!response.ok) throw new Error("Error al consultar Hugging Face");
  return await response.json();
}
