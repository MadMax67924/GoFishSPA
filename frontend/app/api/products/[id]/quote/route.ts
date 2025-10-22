import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Crear conexión a la base de datos
async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gofish',
    port: parseInt(process.env.DB_PORT || '3306')
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  
  try {
    const productId = parseInt(params.id);
    connection = await getDbConnection();

    // Obtener información del producto
    const [productRows] = await connection.execute(
      'SELECT name, price, stock, category FROM products WHERE id = ?',
      [productId]
    );

    const products = productRows as any[];
    
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const productData = products[0];

    // Verificar si está agotado
    if (productData.stock > 0) {
      return NextResponse.json(
        { error: 'El producto está disponible' },
        { status: 400 }
      );
    }

    // Obtener historial de precios de los últimos 6 meses
    const [priceRows] = await connection.execute(`
      SELECT price, date_recorded 
      FROM price_history 
      WHERE product_id = ? 
        AND date_recorded >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      ORDER BY date_recorded DESC
      LIMIT 10
    `, [productId]);

    const prices = priceRows as any[];
    
    let estimatedPrice;
    let confidence = 'baja';
    
    if (prices.length === 0) {
      // Sin historial, usar precio actual como base
      estimatedPrice = productData.price;
      confidence = 'baja';
    } else if (prices.length === 1) {
      // Solo un precio histórico
      estimatedPrice = prices[0].price;
      confidence = 'media';
    } else {
      // Calcular precio estimado basado en tendencia
      const recentPrices = prices.slice(0, 5).map(p => parseFloat(p.price));
      const average = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const minPrice = Math.min(...recentPrices);
      const maxPrice = Math.max(...recentPrices);
      
      // Precio estimado como promedio ponderado (60% promedio reciente, 40% último precio)
      estimatedPrice = Math.round((average * 0.6 + recentPrices[0] * 0.4) / 10) * 10;
      
      // Determinar confianza basada en variabilidad
      const variation = (maxPrice - minPrice) / average;
      if (variation < 0.1) confidence = 'alta';
      else if (variation < 0.25) confidence = 'media';
      else confidence = 'baja';
    }

    // Crear rango de precio (±10%)
    const priceRange = {
      min: Math.round(estimatedPrice * 0.9 / 10) * 10,
      max: Math.round(estimatedPrice * 1.1 / 10) * 10
    };

    return NextResponse.json({
      productName: productData.name,
      estimatedPrice,
      priceRange,
      confidence,
      lastPrice: productData.price,
      historicalPrices: prices.length,
      message: `Precio estimado basado en ${prices.length} registros históricos`
    });

  } catch (error) {
    console.error('Error getting price quote:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}