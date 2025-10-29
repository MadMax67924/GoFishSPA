import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface DocumentData {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerAddress: string
  customerCity: string
  customerRegion: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  shipping: number
  total: number
  documentType: 'boleta' | 'factura'
  rut?: string
  businessName?: string
}

// Función para validar RUT chileno
export function validateRUT(rut: string): boolean {
  // Limpiar el RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toLowerCase()
  
  if (cleanRut.length < 2) return false
  
  const rutNumber = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1)
  
  // Validar que el número sea válido
  if (!/^\d+$/.test(rutNumber)) return false
  
  // Calcular dígito verificador
  let sum = 0
  let multiplier = 2
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber.charAt(i)) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const calculatedDv = 11 - (sum % 11)
  let expectedDv: string
  
  if (calculatedDv === 11) {
    expectedDv = '0'
  } else if (calculatedDv === 10) {
    expectedDv = 'k'
  } else {
    expectedDv = calculatedDv.toString()
  }
  
  return expectedDv === dv
}

export function generateDocumentNumber(orderNumber: string, documentType: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const prefix = documentType === 'factura' ? 'F' : 'B'
  return `${prefix}-${timestamp}-${random}`
}

export async function generateDocumentPDF(data: DocumentData): Promise<Buffer> {
  try {
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Configuración
    const margin = 50
    let yPosition = height - margin

    // Función helper para agregar texto
    const addText = (text: string, x: number, y: number, size: number = 12, isBold: boolean = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      })
    }

    // Encabezado
    addText('GOFISH - PESCADERÍA FRESCA', margin, yPosition, 20, true)
    yPosition -= 30
    
    addText('Documento:', margin, yPosition, 14, true)
    addText(data.documentType.toUpperCase(), 150, yPosition, 14)
    yPosition -= 20
    
    addText('Número:', margin, yPosition, 12, true)
    addText(data.orderNumber, 150, yPosition, 12)
    yPosition -= 20
    
    addText('Fecha:', margin, yPosition, 12, true)
    addText(data.orderDate, 150, yPosition, 12)
    yPosition -= 30

    // Información del cliente
    addText('INFORMACIÓN DEL CLIENTE', margin, yPosition, 14, true)
    yPosition -= 20
    
    addText('Nombre:', margin, yPosition, 12, true)
    addText(data.customerName, 150, yPosition, 12)
    yPosition -= 15
    
    addText('Email:', margin, yPosition, 12, true)
    addText(data.customerEmail, 150, yPosition, 12)
    yPosition -= 15
    
    addText('Teléfono:', margin, yPosition, 12, true)
    addText(data.customerPhone, 150, yPosition, 12)
    yPosition -= 15
    
    addText('Dirección:', margin, yPosition, 12, true)
    addText(`${data.customerAddress}, ${data.customerCity}, ${data.customerRegion}`, 150, yPosition, 12)
    yPosition -= 30

    // Información adicional para factura
    if (data.documentType === 'factura') {
      addText('INFORMACIÓN TRIBUTARIA', margin, yPosition, 14, true)
      yPosition -= 20
      
      if (data.rut) {
        addText('RUT:', margin, yPosition, 12, true)
        addText(data.rut, 150, yPosition, 12)
        yPosition -= 15
      }
      
      if (data.businessName) {
        addText('Razón Social:', margin, yPosition, 12, true)
        addText(data.businessName, 150, yPosition, 12)
        yPosition -= 15
      }
      yPosition -= 15
    }

    // Productos
    addText('PRODUCTOS', margin, yPosition, 14, true)
    yPosition -= 25

    // Encabezado de tabla
    addText('Producto', margin, yPosition, 12, true)
    addText('Cant.', 300, yPosition, 12, true)
    addText('P.Unit.', 350, yPosition, 12, true)
    addText('Total', 450, yPosition, 12, true)
    yPosition -= 20

    // Línea separadora
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })
    yPosition -= 15

    // Items
    for (const item of data.items) {
      if (yPosition < 100) {
        // Nueva página si nos quedamos sin espacio
        yPosition = height - margin
        page.drawText('(continúa...)', { x: margin, y: yPosition, size: 10, font })
        yPosition -= 30
      }

      // Nombre del producto (puede ser multilínea)
      const productName = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name
      addText(productName, margin, yPosition, 10)
      addText(item.quantity.toString(), 300, yPosition, 10)
      addText(`$${item.unitPrice.toLocaleString()}`, 350, yPosition, 10)
      addText(`$${item.total.toLocaleString()}`, 450, yPosition, 10)
      yPosition -= 15
    }

    yPosition -= 20

    // Totales
    addText('SUBTOTAL:', 350, yPosition, 12, true)
    addText(`$${data.subtotal.toLocaleString()}`, 450, yPosition, 12)
    yPosition -= 20

    addText('ENVÍO:', 350, yPosition, 12, true)
    addText(`$${data.shipping.toLocaleString()}`, 450, yPosition, 12)
    yPosition -= 20

    addText('TOTAL:', 350, yPosition, 14, true)
    addText(`$${data.total.toLocaleString()}`, 450, yPosition, 14, true)
    yPosition -= 30

    // Pie de página
    addText('¡Gracias por su compra!', margin, 50, 12)
    addText('GoFish - Pescadería Fresca', margin, 35, 10)

    // Convertir a Buffer
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error('❌ Error generando PDF:', error)
    // Devolver un PDF vacío en caso de error
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 400])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    page.drawText('Error generando documento. Orden: ' + data.orderNumber, {
      x: 50,
      y: 350,
      size: 12,
      font,
      color: rgb(1, 0, 0),
    })
    
    page.drawText('Comuníquese con soporte.', {
      x: 50,
      y: 320,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })
    
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  }
}