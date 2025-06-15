

## Overview

Aplicación web para la distribuidora de productos marinos GoFish SpA. Permite a los usuarios navegar, buscar y comprar productos marinos frescos con un sistema completo de carrito de compras y gestión de pedidos.

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

