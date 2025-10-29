const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando sistema de backups...');

// Crear estructura de carpetas
const backupDir = path.join(process.cwd(), 'backups');
const scriptsDir = path.join(process.cwd(), 'scripts', 'backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('✅ Carpeta de backups creada');
}

if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
  console.log('✅ Carpeta de scripts de backup creada');
}

// Instalar dependencias
console.log('📦 Instalando dependencias...');
try {
  execSync('npm install node-cron check-disk-space', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias:', error);
}

console.log('\n🎉 Configuración completada!');
console.log('\n📋 Comandos disponibles:');
console.log('   npm run backup:manual    - Backup manual inmediato');
console.log('   npm run backup:start     - Iniciar scheduler automático');
console.log('   npm run backup:monitor   - Verificar estado del sistema');
console.log('   npm run backup:status    - Generar reporte de estado');