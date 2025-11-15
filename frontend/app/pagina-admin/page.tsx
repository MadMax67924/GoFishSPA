"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { MailPlus, Activity } from "lucide-react"  // ← Agregar Activity icon
import Link from "next/link"
import { Button } from "@/components/ui/button"

//Maneja el funcionamiento de la pagina
export default function AdminPage() {
    return(
        <>
            <Header />
            <main className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-[#005f73]">Seleccione la tarea a realizar</h1>
                    <div className="mb-8">
                        
                        {/* Primera fila - Revisar Reviews */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 px-60 py-20">
                                <MailPlus 
                                color= "#2a9d8f"
                                className="h-20 w-20 mr-2"/>
                                <Link href="/pagina-admin/revisar-reviews">
                                    <Button
                                    variant="ghost"
                                    className="inline-flex items-center gap-2 bg-[#2a9d8f] text-white px-20 py-8 rounded-lg hover:bg-[#238f7c] transition-colors text-xl">
                                        Revisar Reviews
                                    </Button>
                                </Link>
                                <MailPlus 
                                color= "#2a9d8f" 
                                className="h-20 w-20 mr-2 "/>
                            </div>
                        </div>

                        {/* Segunda fila - Monitoreo de Despliegues */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 px-60 py-20">
                                <Activity 
                                color= "#005f73"
                                className="h-20 w-20 mr-2"/>
                                <Link href="/pagina-admin/deployments">
                                    <Button
                                    variant="ghost"
                                    className="inline-flex items-center gap-2 bg-[#005f73] text-white px-16 py-8 rounded-lg hover:bg-[#003d4a] transition-colors text-xl">
                                        Monitoreo de Despliegues
                                    </Button>
                                </Link>
                                <Activity 
                                color= "#005f73" 
                                className="h-20 w-20 mr-2 "/>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}