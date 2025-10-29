const fs = require('fs');
const crypto = require('crypto');

const envContent = `# ============================================
# CONFIGURACIÓN BASE DE DATOS
# ============================================
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=toki1801
DB_NAME=gofish

# ============================================
# AUTENTICACIÓN JWT
# ============================================
JWT_SECRET=${crypto.randomBytes(64).toString('hex')}

# ============================================
# MERCADO PAGO (SANDBOX/TESTING)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MERCADOPAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# RESEND (EMAILS)
# ============================================
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# URL DE LA APLICACIÓN
# ============================================
APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# ============================================
# COMPRAS RECURRENTES
# ============================================
RECURRING_ORDERS_API_KEY=${crypto.randomBytes(32).toString('hex')}

# ============================================
# ENTORNO
# ============================================
NODE_ENV=development
`;

if (!fs.existsSync('.env.local')) {
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ .env.local creado exitosamente!');
  console.log('📝 Recuerda configurar:');
  console.log('   - MERCADOPAGO_ACCESS_TOKEN (obtener de Mercado Pago)');
  console.log('   - MERCADOPAGO_PUBLIC_KEY (obtener de Mercado Pago)');
  console.log('   - RESEND_API_KEY (obtener de Resend.com)');
} else {
  console.log('⚠️  .env.local ya existe');
}