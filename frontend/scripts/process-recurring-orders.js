const { processPendingRecurringOrders } = require('../lib/recurring-orders');

async function main() {
  try {
    console.log('Procesando órdenes recurrentes...');
    const results = await processPendingRecurringOrders();
    console.log(`Procesadas: ${results.filter(r => r.success).length}, Fallidas: ${results.filter(r => !r.success).length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();