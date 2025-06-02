/**
 * Helpers para trabajar con el navegador y el DOM
 */

/**
 * Obtiene el ancho de la ventana del navegador
 * @returns {number} Ancho de la ventana
 */
export const getWindowWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

/**
 * Verifica si el dispositivo es móvil basado en el ancho de la pantalla
 * @param {number} breakpoint - Punto de quiebre para considerar móvil (por defecto 768px)
 * @returns {boolean} True si es un dispositivo móvil
 */
export const isMobile = (breakpoint = 768) => {
  return getWindowWidth() < breakpoint;
};

/**
 * Añade una clase al elemento body
 * @param {string} className - Clase a añadir
 */
export const addBodyClass = (className) => {
  document.body.classList.add(className);
};

/**
 * Elimina una clase del elemento body
 * @param {string} className - Clase a eliminar
 */
export const removeBodyClass = (className) => {
  document.body.classList.remove(className);
};

/**
 * Desplaza la página al elemento con el ID especificado
 * @param {string} elementId - ID del elemento al que desplazarse
 * @param {number} offset - Desplazamiento adicional en píxeles
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

/**
 * Añade un listener para eventos de clic fuera de un elemento
 * @param {HTMLElement} element - Elemento a monitorear
 * @param {Function} callback - Función a ejecutar cuando se haga clic fuera
 * @returns {Function} Función para remover el listener
 */
export const addClickOutsideListener = (element, callback) => {
  const listener = (event) => {
    if (!element.contains(event.target)) {
      callback(event);
    }
  };
  
  document.addEventListener('mousedown', listener);
  
  return () => {
    document.removeEventListener('mousedown', listener);
  };
};
