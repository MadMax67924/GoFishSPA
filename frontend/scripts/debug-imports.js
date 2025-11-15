const fs = require('fs');

console.log('Verificando componentes UI...');
const components = ['button', 'input', 'label', 'card', 'use-toast', 'toast', 'toaster'];

components.forEach(comp => {
  const path = `./components/ui/${comp}.tsx`;
  const tsPath = `./components/ui/${comp}.ts`;
  if (fs.existsSync(path)) {
    console.log(`✅ ${comp}.tsx existe`);
  } else if (fs.existsSync(tsPath)) {
    console.log(`✅ ${comp}.ts existe`);
  } else {
    console.log(`❌ ${comp} NO existe`);
  }
});