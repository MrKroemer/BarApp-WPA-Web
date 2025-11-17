// Sistema de permissões para controle de acesso
export const PERMISSIONS = {
  // Permissões de proprietário
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_STOCK: 'manage_stock', 
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_REPORTS: 'view_reports',
  MANAGE_CASHBACK: 'manage_cashback',
  CLOSE_DAILY_CASH: 'close_daily_cash',
  
  // Permissões de cliente
  VIEW_MENU: 'view_menu',
  CREATE_ORDER: 'create_order',
  VIEW_MY_ORDERS: 'view_my_orders',
  MANAGE_PROFILE: 'manage_profile'
};

export const OWNER_PERMISSIONS = [
  PERMISSIONS.MANAGE_PRODUCTS,
  PERMISSIONS.MANAGE_STOCK,
  PERMISSIONS.MANAGE_ORDERS,
  PERMISSIONS.MANAGE_CUSTOMERS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.MANAGE_CASHBACK,
  PERMISSIONS.CLOSE_DAILY_CASH,
  PERMISSIONS.VIEW_MENU,
  PERMISSIONS.CREATE_ORDER,
  PERMISSIONS.VIEW_MY_ORDERS,
  PERMISSIONS.MANAGE_PROFILE
];

export const CUSTOMER_PERMISSIONS = [
  PERMISSIONS.VIEW_MENU,
  PERMISSIONS.CREATE_ORDER,
  PERMISSIONS.VIEW_MY_ORDERS,
  PERMISSIONS.MANAGE_PROFILE
];

export const hasPermission = (userProfile, permission) => {
  if (!userProfile) return false;
  
  const userPermissions = userProfile.isOwner ? OWNER_PERMISSIONS : CUSTOMER_PERMISSIONS;
  return userPermissions.includes(permission);
};

export const canAccessRoute = (userProfile, route) => {
  const routePermissions = {
    '/products': PERMISSIONS.MANAGE_PRODUCTS,
    '/stock': PERMISSIONS.MANAGE_STOCK,
    '/orders': PERMISSIONS.MANAGE_ORDERS,
    '/customers': PERMISSIONS.MANAGE_CUSTOMERS,
    '/reports': PERMISSIONS.VIEW_REPORTS,
    '/cashback': PERMISSIONS.MANAGE_CASHBACK,
    '/menu': PERMISSIONS.VIEW_MENU,
    '/my-orders': PERMISSIONS.VIEW_MY_ORDERS,
    '/profile': PERMISSIONS.MANAGE_PROFILE
  };
  
  const requiredPermission = routePermissions[route];
  return requiredPermission ? hasPermission(userProfile, requiredPermission) : true;
};