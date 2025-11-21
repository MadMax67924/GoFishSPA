"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { MailPlus, Activity, MessageSquare } from "lucide-react"  // ← Agregar MessageSquare
import Link from "next/link"
import { Button } from "@/components/ui/button"

//Maneja el funcionamiento de la pagina
export default function AdminPage() {
    return(
        <>
            <Header />
            <main className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-[#005f73] mb-8">Seleccione la tarea a realizar</h1>
                    
                    {/* Admin Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      
                      {/* NUEVA CARD: Gestionar Sugerencias */}
                      <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="ml-3 text-lg font-semibold text-gray-900">Gestionar Sugerencias</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Revisa y gestiona las sugerencias enviadas por los usuarios del sitio web
                        </p>
                        <div className="flex justify-between items-center">
                          <Link href="/pagina-admin/gestionar-sugerencias">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Ver Sugerencias
                            </button>
                          </Link>
                          <div className="text-sm text-gray-500">
                            📝 Gestión
                          </div>
                        </div>
                      </div>
                      
                      {/* CARD: Revisar Reviews */}
                      <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center mb-4">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <MailPlus className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="ml-3 text-lg font-semibold text-gray-900">Revisar Reviews</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Modera y gestiona las reseñas de productos enviadas por los clientes
                        </p>
                        <div className="flex justify-between items-center">
                          <Link href="/pagina-admin/revisar-reviews">
                            <button className="bg-[#2a9d8f] text-white px-4 py-2 rounded-lg hover:bg-[#238f7c] transition-colors">
                              Ver Reviews
                            </button>
                          </Link>
                          <div className="text-sm text-gray-500">
                            ⭐ Moderación
                          </div>
                        </div>
                      </div>

                      {/* CARD: Monitoreo de Despliegues */}
                      <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center mb-4">
                          <div className="bg-purple-100 p-3 rounded-lg">
                            <Activity className="h-6 w-6 text-purple-600" />
                          </div>
                          <h3 className="ml-3 text-lg font-semibold text-gray-900">Monitoreo de Despliegues</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Monitorea y gestiona los despliegues automáticos del sistema
                        </p>
                        <div className="flex justify-between items-center">
                          <Link href="/pagina-admin/deployments">
                            <button className="bg-[#005f73] text-white px-4 py-2 rounded-lg hover:bg-[#003d4a] transition-colors">
                              Ver Deployments
                            </button>
                          </Link>
                          <div className="text-sm text-gray-500">
                            🚀 Automático
                          </div>
                        </div>
                      </div>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}