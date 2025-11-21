import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function GET() {
  try {
    const [rows] = await (await connection).execute(
      'SELECT * FROM faqs WHERE is_active = 1 ORDER BY display_order, id'
    )

    return NextResponse.json({
      success: true,
      faqs: rows
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}