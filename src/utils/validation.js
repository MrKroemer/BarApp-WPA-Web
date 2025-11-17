// Validation utilities for the bar app

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().trim().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateQuantity = (quantity) => {
  const numQuantity = parseInt(quantity);
  return !isNaN(numQuantity) && numQuantity > 0;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const validateProductData = (productData) => {
  const errors = [];
  
  if (!validateRequired(productData.name)) {
    errors.push('Nome do produto é obrigatório');
  }
  
  if (!validateMinLength(productData.name, 2)) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!validatePrice(productData.price)) {
    errors.push('Preço deve ser um número válido maior que zero');
  }
  
  if (!validateMaxLength(productData.description, 500)) {
    errors.push('Descrição não pode exceder 500 caracteres');
  }
  
  return errors;
};

export const validateOrderData = (orderData) => {
  const errors = [];
  
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Pedido deve conter pelo menos um item');
  }
  
  if (orderData.items) {
    orderData.items.forEach((item, index) => {
      if (!validateQuantity(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantidade deve ser um número válido maior que zero`);
      }
      if (!validatePrice(item.price)) {
        errors.push(`Item ${index + 1}: Preço deve ser um número válido maior que zero`);
      }
    });
  }
  
  return errors;
};