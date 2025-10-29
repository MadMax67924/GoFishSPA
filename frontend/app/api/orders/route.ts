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
    console.log("📦 Datos de la orden recibidos:", orderData)
    
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
      documentType,
      rut,
      businessName
    } = orderData

    // Validaciones básicas
    if (!firstName || !lastName || !email || !phone || !address || !city || !region || !paymentMethod || !postalCode) {
      return NextResponse.json({ 
        error: "Todos los campos requeridos deben ser completados",
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          phone: !phone,
          address: !address,
          city: !city,
          region: !region,
          postalCode: !postalCode,
          paymentMethod: !paymentMethod
        }
      }, { status: 400 })
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cartId = cookieStore.get("cartId")?.value
    const token = cookieStore.get("authToken")?.value

    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
        userId = decoded.userId
        console.log("👤 Usuario autenticado:", userId)
      } catch (error) {
        console.error("Token inválido, continuando como usuario no autenticado:", error)
      }
    }

    if (!cartId) {
      return NextResponse.json({ error: "No hay carrito activo" }, { status: 400 })
    }

    // Calcular totales
    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    const shipping = subtotal > 30000 ? 0 : 5000
    const total = subtotal + shipping
    
    console.log("💰 Totales calculados:", { subtotal, shipping, total })

    let status: string
    if (paymentMethod === "webpay") {
      status = "pending"
    } else if (total < 30000 && region !== "Valparaíso") {
      status = "cancelled"
    } else {
      status = "confirmed"
    }

    const orderNumber = `GF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    console.log("📝 Creando orden:", orderNumber)

    // USAR LA ESTRUCTURA EXACTA DE LA TABLA ORDERS SEGÚN TU SCRIPT
    const orderSql = `
      INSERT INTO orders (
        order_number, user_id, first_name, last_name, email, phone, address, city, region, 
        postal_code, payment_method, notes, subtotal, shipping, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const orderParams = [
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
      notes || '',
      subtotal,
      shipping,
      total,
      status
    ]

    console.log("🛒 Insertando orden en la base de datos...")
    console.log("📋 Params:", orderParams)
    
    const orderResult = await executeQuery(orderSql, orderParams)
    const orderId = (orderResult as any).insertId
    console.log("✅ Orden creada con ID:", orderId)

    // Insertar items de la orden
    console.log("📋 Insertando items de la orden...")
    for (const item of cartItems as any[]) {
      const orderItemSql = `
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const itemTotal = item.price * item.quantity
      await executeQuery(orderItemSql, [
        orderId,
        item.product_id,
        item.name,
        item.price,
        item.quantity,
        itemTotal,
      ])
    }
    console.log("✅ Items de orden insertados")

    // Generar documento PDF (manejar errores sin detener el proceso)
    try {
      console.log("📄 Generando documento PDF...")
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

      const pdfBuffer = await generateDocumentPDF(documentData)
      console.log("✅ PDF generado:", pdfBuffer.length, "bytes")

      // Intentar actualizar con información del documento si las columnas existen
      try {
        await addDocumentColumnsIfNeeded()
        
        const documentNumber = generateDocumentNumber(orderNumber, documentType || 'boleta')
        const fileName = `${orderNumber}-${documentType || 'boleta'}.pdf`
        const documentUrl = `/documents/${fileName}`

        // Actualizar orden con información del documento si las columnas existen
        await executeQuery(
          `UPDATE orders SET document_generated = TRUE, document_url = ?, document_type = ?, rut = ?, business_name = ? WHERE id = ?`,
          [documentUrl, documentType || 'boleta', rut || null, businessName || null, orderId]
        )

        // Registrar en document_logs si la tabla existe
        try {
          await executeQuery(
            `INSERT INTO document_logs (order_id, document_type, document_number, download_url) 
             VALUES (?, ?, ?, ?)`,
            [orderId, documentType || 'boleta', documentNumber, documentUrl]
          )
        } catch (logsError) {
          console.log("⚠️ No se pudo registrar en document_logs:", logsError)
        }

        // Intentar enviar email (no crítico)
        try {
          await sendDocumentEmail(email, `${firstName} ${lastName}`, documentType || 'boleta', orderNumber, pdfBuffer)
          try {
            await executeQuery(
              `UPDATE document_logs SET sent_via_email = TRUE WHERE order_id = ?`,
              [orderId]
            )
          } catch (updateError) {
            console.log("⚠️ No se pudo actualizar estado de email:", updateError)
          }
        } catch (emailError) {
          console.error("⚠️ Error enviando email (no crítico):", emailError)
        }

      } catch (docError) {
        console.error("⚠️ Error actualizando información de documento:", docError)
      }

    } catch (documentError) {
      console.error("⚠️ Error generando documento (no crítico):", documentError)
    }

    // Limpiar carrito
    cookieStore.set("cartId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    console.log("🎉 Orden completada exitosamente")
    
    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      total,
      documentType: documentType || 'boleta',
      documentGenerated: true,
      status: status
    })

  } catch (error: any) {
    console.error("❌ Error al crear pedido:", error)
    
    return NextResponse.json({ 
      error: "Error al crear pedido",
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    }, { status: 500 })
  }
}

// Función para agregar columnas de documento si no existen (VERSIÓN MEJORADA)
async function addDocumentColumnsIfNeeded() {
  const columnsToAdd = [
    { name: 'document_type', type: "ENUM('boleta', 'factura') DEFAULT 'boleta'" },
    { name: 'rut', type: "VARCHAR(20) NULL" },
    { name: 'business_name', type: "VARCHAR(255) NULL" },
    { name: 'document_generated', type: "BOOLEAN DEFAULT FALSE" },
    { name: 'document_url', type: "VARCHAR(500) NULL" }
  ]

  for (const column of columnsToAdd) {
    try {
      await executeQuery(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.type}`)
      console.log(`✅ Columna ${column.name} agregada`)
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        // Columna ya existe, está bien - no mostrar error
        console.log(`ℹ️ Columna ${column.name} ya existe`)
      } else {
        console.log(`⚠️ No se pudo agregar columna ${column.name}:`, error.message)
      }
    }
  }

  // Crear tabla document_logs si no existe
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS document_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        document_type ENUM('boleta', 'factura') NOT NULL,
        document_number VARCHAR(100) NOT NULL,
        download_url VARCHAR(500) NULL,
        sent_via_email BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Tabla document_logs verificada/creada")
  } catch (error) {
    console.log("⚠️ No se pudo crear document_logs:", error)
  }
}
// GET method
export async function GET() {
  try {
    const sql = `
      SELECT 
        id, order_number, first_name, last_name, email, total, status, created_at
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