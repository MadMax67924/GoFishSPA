import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Datos de la empresa
const COMPANY_INFO = {
  name: "GoFish SpA",
  rut: "77.777.777-7",
  address: "Av. Principal 123, Valparaíso",
  city: "Valparaíso", 
  phone: "+56 9 1234 5678",
  email: "ventas@gofishspa.cl",
  giro: "VENTA AL POR MENOR DE PESCADOS Y MARISCOS"
}

export async function generateInvoicePDF(orderData: any[]): Promise<Buffer> {
  try {
    // Validación
    if (!orderData || orderData.length === 0) {
      throw new Error("No hay datos de orden para generar el PDF")
    }

    // Crear nuevo documento PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    
    // Obtener fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let yPosition = height - 50

    // Título
    page.drawText('FACTURA ELECTRÓNICA', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= 40

    // Número de orden y fecha
    page.drawText(`N°: ${orderData[0].order_number}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
    })
    
    page.drawText(`Fecha: ${new Date(orderData[0].created_at).toLocaleDateString('es-CL')}`, {
      x: 50,
      y: yPosition - 15,
      size: 10,
      font: font,
    })
    yPosition -= 40

    // Información de la empresa
    page.drawText('EMISOR:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })
    yPosition -= 15

    const companyInfo = [
      COMPANY_INFO.name,
      `RUT: ${COMPANY_INFO.rut}`,
      `Dirección: ${COMPANY_INFO.address}`,
      `Giro: ${COMPANY_INFO.giro}`,
      `Teléfono: ${COMPANY_INFO.phone}`,
      `Email: ${COMPANY_INFO.email}`
    ]

    companyInfo.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
      })
      yPosition -= 12
    })
    yPosition -= 10

    // Información del cliente
    page.drawText('CLIENTE:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })
    yPosition -= 15

    const clientInfo = [
      `${orderData[0].first_name} ${orderData[0].last_name}`,
      `Email: ${orderData[0].email}`,
      `Teléfono: ${orderData[0].phone}`,
      `Dirección: ${orderData[0].address}, ${orderData[0].city}, ${orderData[0].region}`
    ]

    clientInfo.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
      })
      yPosition -= 12
    })
    yPosition -= 20

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 550, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })
    yPosition -= 20

    // Encabezados de tabla
    const tableHeaders = ['Producto', 'Cantidad', 'Precio', 'Subtotal']
    const columnX = [50, 300, 400, 480]
    
    tableHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: columnX[index],
        y: yPosition,
        size: 10,
        font: boldFont,
      })
    })
    yPosition -= 20

    // Items de la orden
    orderData.forEach(item => {
      if (yPosition < 100) {
        // Agregar nueva página si nos quedamos sin espacio
        const newPage = pdfDoc.addPage([600, 800])
        yPosition = 750
      }

      const itemTexts = [
        item.product_name,
        item.quantity.toString(),
        `$${item.product_price.toLocaleString('es-CL')}`,
        `$${(item.product_price * item.quantity).toLocaleString('es-CL')}`
      ]

      itemTexts.forEach((text, index) => {
        page.drawText(text, {
          x: columnX[index],
          y: yPosition,
          size: 9,
          font: font,
        })
      })
      yPosition -= 15
    })

    yPosition -= 20

    // Totales
    const totals = [
      { label: 'SUBTOTAL:', value: orderData[0].subtotal },
      { label: 'ENVÍO:', value: orderData[0].shipping },
      { label: 'TOTAL:', value: orderData[0].total }
    ]

    totals.forEach(total => {
      page.drawText(total.label, {
        x: 400,
        y: yPosition,
        size: 10,
        font: boldFont,
      })
      
      page.drawText(`$${total.value.toLocaleString('es-CL')}`, {
        x: 480,
        y: yPosition,
        size: 10,
        font: font,
      })
      yPosition -= 20
    })

    // Convertir a Buffer y retornar
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)

  } catch (error) {
    console.error('Error en generación de PDF con pdf-lib:', error)
    throw error
  }
}