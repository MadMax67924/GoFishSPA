import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

//Guarda los datos recibidos en la base de datos
export async function POST(req: NextRequest) {
  const { texto, imagen } = await req.json()
  const id = `sugerencia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const orderSql = `
        INSERT INTO sugerencias (
          id,
          texto,
          imagen
        ) VALUES (?, ?, ?)
      `
  
  await executeQuery(orderSql, [
    id,
    texto,
    imagen,
      ])
  return NextResponse.json({
    id,
    texto,
    imagen
  })
}