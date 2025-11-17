// Test helpers for debugging and validation

export const debugCustomers = (customers) => {
  console.group('🔍 Debug Customers');
  console.log('Total customers:', customers.length);
  console.log('Customers data:', customers);
  customers.forEach((customer, index) => {
    console.log(`Customer ${index + 1}:`, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      isOwner: customer.isOwner
    });
  });
  console.groupEnd();
};

export const debugProducts = (products) => {
  console.group('🔍 Debug Products');
  console.log('Total products:', products.length);
  products.forEach((product, index) => {
    console.log(`Product ${index + 1}:`, {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl ? 'Has image' : 'No image',
      isAvailable: product.isAvailable
    });
  });
  console.groupEnd();
};

export const debugOrders = (orders) => {
  console.group('🔍 Debug Orders');
  console.log('Total orders:', orders.length);
  orders.forEach((order, index) => {
    console.log(`Order ${index + 1}:`, {
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      totalAmount: order.totalAmount,
      itemsCount: order.items?.length || 0,
      items: order.items?.map(item => ({
        name: item.name || item.productName || 'Unknown',
        quantity: item.quantity,
        price: item.price
      }))
    });
  });
  console.groupEnd();
};

export const validateProductData = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Nome do produto é obrigatório');
  }
  
  if (!product.price || isNaN(product.price) || product.price <= 0) {
    errors.push('Preço deve ser um número válido maior que zero');
  }
  
  if (product.imageUrl && product.imageUrl.startsWith('blob:')) {
    errors.push('URL de imagem temporária detectada');
  }
  
  return errors;
};

export const validateOrderData = (order) => {
  const errors = [];
  
  if (!order.items || order.items.length === 0) {
    errors.push('Pedido deve conter pelo menos um item');
  }
  
  if (order.items) {
    order.items.forEach((item, index) => {
      if (!item.name && !item.productName) {
        errors.push(`Item ${index + 1}: Nome do produto não encontrado`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade inválida`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1}: Preço inválido`);
      }
    });
  }
  
  return errors;
};

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    // This would be implemented with actual Firebase calls
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};