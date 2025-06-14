@echo off
echo 🚀 Instalando GoFish SPA...
echo.

echo 📦 Limpiando cache de npm...
npm cache clean --force

echo 📦 Eliminando node_modules y package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Instalando dependencias...
npm install --legacy-peer-deps

echo 🗄️ Configurando base de datos...
node scripts/setup-gofish-db.js

echo ✅ Instalación completada!
echo.
echo 🎯 Para iniciar el servidor de desarrollo ejecuta:
echo npm run dev
echo.
pause
