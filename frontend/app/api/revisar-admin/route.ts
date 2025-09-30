import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

//Extrae los datos review de la base de datos y los devuelve como json
export async function GET() {
  try {

    const reviews = await executeQuery(
      `SELECT id, productId, texto, imagen, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, aprovado 
       FROM reviews 
       WHERE aprovado = false
       ORDER BY fecha DESC`,
    )
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

//Si le dan el state 0 (false), borra la review de la base de datos 
//y si le dan el state 1 (true) cambia el valor aprovado de la review a true para que se muestre en el detalle
export async function POST(req: NextRequest) {
    const { id ,state } = await req.json()
    if(state == "0") {
        const delSQL = await executeQuery(`
            DELETE FROM reviews
            WHERE id = ?
            `, [id])
        if (!delSQL) throw new Error("Error borrando review")
        return NextResponse.json("Borrado")
    }
    if(state == "1") {
        const apSQL = await executeQuery(`
            UPDATE reviews
            SET aprovado = ?
            WHERE id = ?
            `, [true, id])
        if (!apSQL) throw new Error("Error aprovando review")
        return NextResponse.json("Aprovado")
    }
    else {
        console.log(state)
        return NextResponse.json("error")
    }
}