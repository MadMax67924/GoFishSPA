import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET() {
  let connection
  
  try {
    // Conexión directa con credenciales fijas
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'toki1801',
      database: 'gofish'
    })

    // Test simple
    const [test] = await connection.execute('SELECT 1 as working')
    
    // Test productos
    const [products] = await connection.execute('SELECT id, name, stock FROM products WHERE id = 1')

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa",
      test: test,
      salmon: products
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })

  } finally {
    if (connection) await connection.end()
  }
}
