import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface DocumentData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerRegion: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  documentType: 'boleta' | 'factura';
  rut?: string;
  businessName?: string;
}

export async function generateDocumentPDF(data: DocumentData): Promise<Buffer> {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  // Configurar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Configurar dimensiones
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;

  // Función helper para agregar texto
  const addText = (text: string, x: number, y: number, size: number = 12, isBold: boolean = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? fontBold : font,
      color: rgb(0, 0, 0),
    });
  };

  // Encabezado
  addText('GoFish SpA', margin, yPosition, 16, true);
  yPosition -= 30;
  
  addText('Distribuidora de Productos Marinos', margin, yPosition, 12);
  yPosition -= 20;
  
  addText('RUT: 76.123.456-7', margin, yPosition, 10);
  yPosition -= 15;
  
  addText('Av. del Mar 1234, Valparaíso, Chile', margin, yPosition, 10);
  yPosition -= 15;
  
  addText('Tel: +56 32 234 5678 | Email: ventas@gofish.cl', margin, yPosition, 10);
  yPosition -= 30;

  // Tipo de documento
  const docTypeText = data.documentType === 'boleta' ? 'BOLETA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';
  addText(docTypeText, width - margin - 150, yPosition + 45, 14, true);
  
  addText(`N°: ${data.orderNumber}`, width - margin - 150, yPosition + 25, 12);
  addText(`Fecha: ${data.orderDate}`, width - margin - 150, yPosition + 10, 10);
  yPosition -= 20;

  // Línea separadora
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Información del cliente
  addText('INFORMACIÓN DEL CLIENTE', margin, yPosition, 12, true);
  yPosition -= 20;

  addText(`Nombre: ${data.customerName}`, margin, yPosition, 10);
  yPosition -= 15;

  if (data.documentType === 'factura' && data.rut && data.businessName) {
    addText(`RUT: ${data.rut}`, margin, yPosition, 10);
    yPosition -= 15;
    
    addText(`Razón Social: ${data.businessName}`, margin, yPosition, 10);
    yPosition -= 15;
  }

  addText(`Email: ${data.customerEmail}`, margin, yPosition, 10);
  yPosition -= 15;
  
  addText(`Teléfono: ${data.customerPhone}`, margin, yPosition, 10);
  yPosition -= 15;
  
  addText(`Dirección: ${data.customerAddress}`, margin, yPosition, 10);
  yPosition -= 15;
  
  addText(`Ciudad: ${data.customerCity}, ${data.customerRegion}`, margin, yPosition, 10);
  yPosition -= 30;

  // Línea separadora
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Detalles de productos
  addText('DETALLES DEL PEDIDO', margin, yPosition, 12, true);
  yPosition -= 25;

  // Encabezados de la tabla
  addText('Producto', margin, yPosition, 10, true);
  addText('Cantidad', width - margin - 200, yPosition, 10, true);
  addText('P. Unitario', width - margin - 120, yPosition, 10, true);
  addText('Total', width - margin - 30, yPosition, 10, true);
  yPosition -= 20;

  // Línea de la tabla
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;

  // Items
  for (const item of data.items) {
    if (yPosition < 100) {
      // Nueva página si se acaba el espacio
      yPosition = height - margin;
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;
    }

    addText(item.name, margin, yPosition, 9);
    addText(`${item.quantity} kg`, width - margin - 200, yPosition, 9);
    addText(`$${item.unitPrice.toLocaleString()}`, width - margin - 120, yPosition, 9);
    addText(`$${item.total.toLocaleString()}`, width - margin - 30, yPosition, 9);
    yPosition -= 15;
  }

  yPosition -= 20;

  // Totales
  addText(`Subtotal: $${data.subtotal.toLocaleString()}`, width - margin - 100, yPosition, 10);
  yPosition -= 15;
  
  addText(`Envío: $${data.shipping.toLocaleString()}`, width - margin - 100, yPosition, 10);
  yPosition -= 15;
  
  addText(`TOTAL: $${data.total.toLocaleString()}`, width - margin - 100, yPosition, 12, true);
  yPosition -= 30;

  // Pie de página
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  addText('¡Gracias por su compra!', margin, yPosition, 10);
  yPosition -= 15;
  
  addText('GoFish SpA - Distribuimos pescados y mariscos frescos manteniendo siempre la cadena de frío', 
    margin, yPosition, 8);
  yPosition -= 12;
  
  addText('Documento generado electrónicamente - Este documento es válido sin firma manuscrita', 
    margin, yPosition, 8);

  // Convertir a buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Función para validar RUT chileno
export function validateRUT(rut: string): boolean {
  if (!rut) return false;
  
  // Limpiar RUT
  const cleanRUT = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRUT.length < 2) return false;
  
  const rutBody = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1).toUpperCase();
  
  // Validar formato
  if (!/^[0-9]+$/.test(rutBody)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody.charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return calculatedDV === dv;
}

// Generar número de documento único
export function generateDocumentNumber(orderNumber: string, documentType: 'boleta' | 'factura'): string {
  const prefix = documentType === 'boleta' ? 'B' : 'F';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${orderNumber}-${timestamp}`;
}