// Cache utilities for debugging and clearing

export const clearBrowserCache = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload without cache
  window.location.reload(true);
};

export const debugOrderItems = (orders, products) => {
  console.group('🔍 DEBUG: Order Items Analysis');
  
  orders.forEach((order, orderIndex) => {
    console.log(`\n📋 Order ${orderIndex + 1} (${order.id}):`);
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item, itemIndex) => {
        console.log(`  📦 Item ${itemIndex + 1}:`, {
          name: item.name,
          productName: item.productName,
          productId: item.productId,
          id: item.id,
          quantity: item.quantity,
          price: item.price
        });
        
        // Try to find product by ID
        const productId = item.productId || item.id;
        if (productId) {
          const foundProduct = products.find(p => p.id === productId);
          console.log(`    🔍 Found product:`, foundProduct?.name || 'NOT FOUND');
        }
      });
    } else {
      console.log('  ❌ No items or items is not an array');
    }
  });
  
  console.groupEnd();
};

export const fixOrderItemNames = (orders, products) => {
  console.log('🔧 Attempting to fix order item names...');
  
  return orders.map(order => {
    if (order.items && Array.isArray(order.items)) {
      const fixedItems = order.items.map(item => {
        let productName = item.name || item.productName;
        
        if (!productName && (item.productId || item.id)) {
          const productId = item.productId || item.id;
          const product = products.find(p => p.id === productId);
          productName = product?.name;
        }
        
        return {
          ...item,
          name: productName || item.name || 'Produto'
        };
      });
      
      return {
        ...order,
        items: fixedItems
      };
    }
    
    return order;
  });
};