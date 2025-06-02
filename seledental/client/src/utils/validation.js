/**
 * Validaciones para formularios
 */

/**
 * Validación de correo electrónico
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} True si el correo es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Validación de contraseña segura
 * Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si la contraseña es segura
 */
export const isStrongPassword = (password) => {
  if (password.length < 6) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Verifica si un campo está vacío (null, undefined, cadena vacía)
 * @param {*} value - Valor a verificar
 * @returns {boolean} True si el valor está vacío
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};

/**
 * Validación de número de teléfono mexicano (10 dígitos)
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} True si el número es válido
 */
export const isValidMexicanPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};
