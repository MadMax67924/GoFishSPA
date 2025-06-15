# GoFish SpA - Distribuidora de Productos Marinos

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/maxigarin06-6106s-projects/v0-agregar-mongodb-a-pagina)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/iKqwVPnxoBY)

## Overview

Aplicación web para la distribuidora de productos marinos GoFish SpA. Permite a los usuarios navegar, buscar y comprar productos marinos frescos con un sistema completo de carrito de compras y gestión de pedidos.

## Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de datos**: MySQL
- **Autenticación**: JWT con bcryptjs
- **Deployment**: Vercel

## Características

-  Búsqueda global de productos
- Carrito de compras completo
- Sistema de autenticación y registro
- Diseño responsive
- Recuperación de contraseñas
- Verificación por email
- Seguridad con bloqueo de cuentas
- Gestión de pedidos
- Filtros y ordenamiento de productos

## Configuración

### Variables de Entorno Requeridas

\`\`\`env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gofish

# Autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro
\`\`\`

### Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno
4. Ejecuta el script de configuración: `node scripts/setup-mysql.js`
5. Inicia el servidor de desarrollo: `npm run dev`

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `node scripts/setup-mysql.js` - Configurar base de datos

## Estructura del Proyecto

\`\`\`
├── app/                    # App Router de Next.js
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuraciones
├── scripts/               # Scripts de configuración
└── public/                # Archivos estáticos
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/maxigarin06-6106s-projects/v0-agregar-mongodb-a-pagina](https://vercel.com/maxigarin06-6106s-projects/v0-agregar-mongodb-a-pagina)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/iKqwVPnxoBY](https://v0.dev/chat/projects/iKqwVPnxoBY)**

