// test-pdf.js - VERSIÓN CORREGIDA
const http = require('http');

function testPDF() {
  const orderId = 1; // ← CAMBIA por un ID real de tu base de datos
  
  const data = JSON.stringify({ orderId });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-pdf',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  console.log('🟡 Probando generación de PDF...');
  console.log(`📦 Enviando orderId: ${orderId}`);

  const req = http.request(options, (res) => {
    let responseData = '';
    
    console.log('📊 Status Code:', res.statusCode);
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('📦 Respuesta:', result);
        
        if (res.statusCode === 200) {
          console.log('✅ PDF generado exitosamente!');
          console.log('📁 Ruta del archivo:', result.filePath);
          console.log('🔗 URL para verlo: http://localhost:3000' + result.filePath);
        } else {
          console.log('❌ Error:', result.error);
        }
      } catch (error) {
        console.error('💥 Error parseando respuesta:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('💥 Error de conexión:', error.message);
  });

  req.write(data);
  req.end();
}

testPDF();