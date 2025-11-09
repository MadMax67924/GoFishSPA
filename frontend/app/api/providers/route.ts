import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company,
      representative,
      rut,
      address,
      products,
      email,
      phone,
      capacity,
      certifications,
      website,
      notes
    } = body

    // Validar campos requeridos
    if (!company || !representative || !rut || !address || !products || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el RUT ya existe
    const [existingProvider] = await (await connection).execute(
      'SELECT id FROM providers WHERE rut = ?',
      [rut]
    )

    if (Array.isArray(existingProvider) && existingProvider.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El RUT ya está registrado' },
        { status: 409 }
      )
    }

    // Insertar nuevo proveedor
    const [result] = await (await connection).execute(
      `INSERT INTO providers 
       (company, representative, rut, address, products, email, phone, capacity, certifications, website, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [company, representative, rut, address, products, email, phone, capacity, certifications, website, notes]
    )

    return NextResponse.json({
      success: true,
      message: 'Proveedor registrado exitosamente',
      id: (result as any).insertId
    })
  } catch (error) {
    console.error('Error registering provider:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const [rows] = await (await connection).execute(
      'SELECT * FROM providers ORDER BY created_at DESC'
    )
    
    return NextResponse.json({
      success: true,
      providers: rows
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}