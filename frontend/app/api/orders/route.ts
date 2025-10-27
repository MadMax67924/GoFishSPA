import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeQuery } from "@/lib/mysql"
import jwt from "jsonwebtoken"
import { generateDocumentPDF, generateDocumentNumber } from "@/lib/document-generator"
import { sendDocumentEmail } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      city, 
      region, 
      postalCode, 
      paymentMethod, 
      notes, 
      cartItems,
      documentType, // Nuevo campo
      rut, // Nuevo campo
      businessName // Nuevo campo
    } = orderData

    if (!firstName || !lastName || !email || !phone || !address || !city || !region || !paymentMethod) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser completados" }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    const cartId = cookieStore.get("cartId")?.value
    const token = cookieStore.get("authToken")?.value

    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
        userId = decoded.userId
      } catch (error) {
        console.error("Token inválido, continuando como usuario no autenticado:", error)
      }
    }

    if (!cartId) {
      return NextResponse.json({ error: "No hay carrito activo" }, { status: 400 })
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    const shipping = subtotal > 30000 ? 0 : 5000
    const total = subtotal + shipping
    let status: string
    if (total < 20000 && region !== "Valparaíso") {
      status = "cancelled"
    } else {
      status = "confirmed"
    }
    
    const orderNumber = `GF-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // SQL actualizado con nuevos campos
    const orderSql = `
      INSERT INTO orders (
        order_number, user_id, first_name, last_name, email, phone, address, city, region, 
        postal_code, payment_method, notes, subtotal, shipping, total, status,
        document_type, rut, business_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const orderResult = await executeQuery(orderSql, [
      orderNumber,
      userId, 
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      region,
      postalCode,
      paymentMethod,
      notes,
      subtotal,
      shipping,
      total,
      status,
      documentType || 'boleta',
      rut || null,
      businessName || null
    ])

    const orderId = (orderResult as any).insertId
    
    // Insertar items de la orden
    for (const item of cartItems as any[]) {
      const orderItemSql = `
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      await executeQuery(orderItemSql, [
        orderId,
        item.product_id,
        item.name,
        item.price,
        item.quantity,
        item.price * item.quantity,
      ])
    }

    // Generar documento PDF
    try {
      const documentData = {
        orderNumber,
        orderDate: new Date().toLocaleDateString('es-CL'),
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerAddress: address,
        customerCity: city,
        customerRegion: region,
        customerPhone: phone,
        items: cartItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity
        })),
        subtotal,
        shipping,
        total,
        documentType: documentType || 'boleta',
        rut: rut || undefined,
        businessName: businessName || undefined
      }

      // Generar PDF
      const pdfBuffer = await generateDocumentPDF(documentData)
      
      // Guardar PDF en sistema de archivos (en producción usarías S3 o similar)
      const fileName = `${orderNumber}-${documentType || 'boleta'}.pdf`
      const filePath = `./public/documents/${fileName}`
      
      // En un entorno real, aquí guardarías el archivo
      // Por ahora simulamos la URL
      const documentUrl = `/documents/${fileName}`
      const documentNumber = generateDocumentNumber(orderNumber, documentType || 'boleta')

      // Actualizar orden con información del documento
      await executeQuery(
        `UPDATE orders SET document_generated = TRUE, document_url = ? WHERE id = ?`,
        [documentUrl, orderId]
      )

      // Registrar en document_logs
      await executeQuery(
        `INSERT INTO document_logs (order_id, document_type, document_number, download_url) 
         VALUES (?, ?, ?, ?)`,
        [orderId, documentType || 'boleta', documentNumber, documentUrl]
      )

      // Enviar email con el documento (opcional)
      try {
        await sendDocumentEmail(email, `${firstName} ${lastName}`, documentType || 'boleta', orderNumber, pdfBuffer)
        
        // Marcar como enviado
        await executeQuery(
          `UPDATE document_logs SET sent_via_email = TRUE WHERE order_id = ?`,
          [orderId]
        )
      } catch (emailError) {
        console.error("Error enviando email con documento:", emailError)
        // No fallar la orden si el email falla
      }

    } catch (documentError) {
      console.error("Error generando documento:", documentError)
      // No fallar la orden si la generación del documento falla
    }

    // Limpiar carrito
    cookieStore.set("cartId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      total,
      documentType: documentType || 'boleta',
      documentGenerated: true
    })
  } catch (error) {
    console.error("Error al crear pedido:", error)
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = `
      SELECT 
        id, order_number, first_name, last_name, email, total, status, created_at,
        document_type, document_generated, document_url
      FROM orders 
      ORDER BY created_at DESC
    `

    const orders = await executeQuery(sql)

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}