import PDFDocument from 'pdfkit'

// Datos de la empresa (actualiza con los datos reales de GoFish SpA)
const COMPANY_INFO = {
  name: "GoFish SpA",
  rut: "77.777.777-7", // ← ACTUALIZAR CON RUT REAL
  address: "Av. Principal 123, Valparaíso", // ← ACTUALIZAR CON DIRECCIÓN REAL
  city: "Valparaíso", // ← ACTUALIZAR CIUDAD REAL
  phone: "+56 9 1234 5678", // ← ACTUALIZAR TELÉFONO REAL
  email: "ventas@gofishspa.cl", // ← ACTUALIZAR EMAIL REAL
  giro: "VENTA AL POR MENOR DE PESCADOS Y MARISCOS"
}

export async function generateInvoicePDF(orderData: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      // Encabezado de la factura
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('FACTURA ELECTRÓNICA', { align: 'center' })
        .moveDown(0.5)

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`N°: ${orderData[0].order_number}`, { align: 'center' })
        .text(`Fecha: ${new Date(orderData[0].created_at).toLocaleDateString('es-CL')}`, { align: 'center' })
        .moveDown(1)

      // Información de la empresa
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('EMISOR:')
        .font('Helvetica')
        .fontSize(10)
        .text(COMPANY_INFO.name)
        .text(`RUT: ${COMPANY_INFO.rut}`)
        .text(`Dirección: ${COMPANY_INFO.address}`)
        .text(`Giro: ${COMPANY_INFO.giro}`)
        .text(`Teléfono: ${COMPANY_INFO.phone}`)
        .text(`Email: ${COMPANY_INFO.email}`)
        .moveDown(1)

      // Información del cliente
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('CLIENTE:')
        .font('Helvetica')
        .fontSize(10)
        .text(`${orderData[0].first_name} ${orderData[0].last_name}`)
        .text(`Email: ${orderData[0].email}`)
        .text(`Teléfono: ${orderData[0].phone}`)
        .text(`Dirección: ${orderData[0].address}, ${orderData[0].city}, ${orderData[0].region}`)
        .moveDown(1)

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1)

      // Tabla de productos
      const tableTop = doc.y
      const itemHeaderTop = tableTop + 5

      // Encabezados de la tabla
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Producto', 50, itemHeaderTop)
        .text('Cantidad', 300, itemHeaderTop, { width: 60, align: 'center' })
        .text('Precio Unit.', 370, itemHeaderTop, { width: 70, align: 'right' })
        .text('Subtotal', 450, itemHeaderTop, { width: 70, align: 'right' })

      // Línea bajo encabezados
      doc
        .moveTo(50, itemHeaderTop + 15)
        .lineTo(550, itemHeaderTop + 15)
        .stroke()

      let yPosition = itemHeaderTop + 25

      // Items de la orden
      orderData.forEach((item, index) => {
        if (yPosition > 700) { // Salto de página si es necesario
          doc.addPage()
          yPosition = 50
        }

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(item.product_name, 50, yPosition, { width: 240 })
          .text(`${item.quantity} kg`, 300, yPosition, { width: 60, align: 'center' })
          .text(`$${item.product_price.toLocaleString('es-CL')}`, 370, yPosition, { width: 70, align: 'right' })
          .text(`$${item.item_subtotal.toLocaleString('es-CL')}`, 450, yPosition, { width: 70, align: 'right' })

        yPosition += 20
      })

      // Línea antes de totales
      doc
        .moveTo(50, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .stroke()

      yPosition += 25

      // Totales
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('SUBTOTAL:', 370, yPosition, { width: 70, align: 'right' })
        .text(`$${orderData[0].subtotal.toLocaleString('es-CL')}`, 450, yPosition, { width: 70, align: 'right' })

      yPosition += 20

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('ENVÍO:', 370, yPosition, { width: 70, align: 'right' })
        .text(`$${orderData[0].shipping.toLocaleString('es-CL')}`, 450, yPosition, { width: 70, align: 'right' })

      yPosition += 25

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('TOTAL:', 370, yPosition, { width: 70, align: 'right' })
        .text(`$${orderData[0].total.toLocaleString('es-CL')}`, 450, yPosition, { width: 70, align: 'right' })

      yPosition += 40

      // Método de pago
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('MÉTODO DE PAGO:', 50, yPosition)
        .font('Helvetica')
        .text(orderData[0].payment_method.toUpperCase(), 150, yPosition)

      yPosition += 15

      // Estado
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('ESTADO:', 50, yPosition)
        .font('Helvetica')
        .text(orderData[0].status.toUpperCase(), 150, yPosition)

      // Pie de página
      doc
        .fontSize(8)
        .text('Gracias por su compra - GoFish SpA - Productos del mar de la más alta calidad', 
          { align: 'center', width: 500, lineGap: 2 })

      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}