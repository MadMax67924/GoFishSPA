"use client"

import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";


//Funciona similar a las reviews,si se sube una imagen la procesa en reviews y despues manda los datos a /api/sugerencia
export default function FormSugerencias() {
  const [texto, setTexto] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!texto.trim()) {
      setError("Por favor, escribe tu sugerencia");
      return;
    }
    
    setSubiendo(true);
    setError("");
    setSuccess("");
    
    try {
        let imagenUrl = ""

        if (imagen) {
        const formData = new FormData()
        formData.append("file", imagen)
        const res = await fetch("/api/reviews", { method: "POST", body: formData })
        
        if (!res.ok) throw new Error("Error subiendo imagen")
        
        const data = await res.json()
        imagenUrl = data.url
        }
        const reviewRes = await fetch("/api/sugerencia", {
        method: "POST",
        body: JSON.stringify({ 
          texto, 
          imagen: imagenUrl
        }),
        headers: { "Content-Type": "application/json" },
      })
      
      if (!reviewRes.ok) throw new Error("Error creando sugerencia")
      
    
      
        setSuccess("¡Sugerencia enviada correctamente!");
        setTexto("");
        setImagen(null);
    } catch (err) {
      setError("Error al enviar la sugerencia. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear sugerencia</h1>
          <p className="text-gray-600 mb-8">
            Comentanos que productos te gustaria que agregaramos
          </p>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {error && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-green-500 mb-4 p-3 bg-green-50 rounded border border-green-200">
                {success}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-2">
                Tu sugerencia
              </label>
              <textarea
                id="texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Comentanos que productos te gustaria que agregaramos..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                rows={6}
                required
                disabled={subiendo}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
                disabled={subiendo}
              />
              {imagen && (
                <p className="mt-2 text-sm text-gray-500">
                  Imagen seleccionada: {imagen.name}
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center" 
              disabled={subiendo}
            >
              {subiendo ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                "Enviar sugerencia"
              )}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}