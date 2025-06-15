#!/bin/bash

echo "🚀 Instalando GoFish SPA..."
echo

echo "📦 Limpiando cache de npm..."
npm cache clean --force

echo "📦 Eliminando node_modules y package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

echo "🗄️ Configurando base de datos..."
node scripts/setup-gofish-db.js

echo "✅ Instalación completada!"
echo
echo "🎯 Para iniciar el servidor de desarrollo ejecuta:"
echo "npm run dev"
