import React from 'react';

/**
 * Tipos de botón
 */
export const BUTTON_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  LINK: 'link',
};

/**
 * Componente de botón reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de botón (primary, secondary, success, etc.)
 * @param {string} props.size - Tamaño del botón (sm, md, lg)
 * @param {boolean} props.isLoading - Indica si el botón está en estado de carga
 * @param {boolean} props.disabled - Indica si el botón está deshabilitado
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @param {JSX.Element} props.children - Contenido del botón
 * @param {JSX.Element} props.icon - Icono a mostrar
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element} Componente de botón
 */
const Button = ({
  type = BUTTON_TYPES.PRIMARY,
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  icon,
  className = '',
  ...restProps
}) => {
  // Configuración de estilos según el tipo
  const typeClasses = {
    [BUTTON_TYPES.PRIMARY]: 'bg-primary hover:bg-indigo-700 text-white',
    [BUTTON_TYPES.SECONDARY]: 'bg-gray-600 hover:bg-gray-700 text-white',
    [BUTTON_TYPES.SUCCESS]: 'bg-green-600 hover:bg-green-700 text-white',
    [BUTTON_TYPES.DANGER]: 'bg-red-600 hover:bg-red-700 text-white',
    [BUTTON_TYPES.WARNING]: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    [BUTTON_TYPES.INFO]: 'bg-blue-500 hover:bg-blue-600 text-white',
    [BUTTON_TYPES.LIGHT]: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    [BUTTON_TYPES.DARK]: 'bg-gray-800 hover:bg-gray-900 text-white',
    [BUTTON_TYPES.LINK]: 'bg-transparent hover:underline text-primary p-0',
  };

  // Configuración de tamaño
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  // Clase base del botón
  const baseClasses = `font-medium rounded-md focus:outline-none transition 
    ${type !== BUTTON_TYPES.LINK ? 'focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50' : ''}
    ${typeClasses[type] || typeClasses[BUTTON_TYPES.PRIMARY]}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}
    ${className}`;

  // Clases específicas para el focus ring según el tipo
  const focusRingClasses = {
    [BUTTON_TYPES.PRIMARY]: 'focus:ring-primary',
    [BUTTON_TYPES.SECONDARY]: 'focus:ring-gray-600',
    [BUTTON_TYPES.SUCCESS]: 'focus:ring-green-600',
    [BUTTON_TYPES.DANGER]: 'focus:ring-red-600',
    [BUTTON_TYPES.WARNING]: 'focus:ring-yellow-500',
    [BUTTON_TYPES.INFO]: 'focus:ring-blue-500',
    [BUTTON_TYPES.LIGHT]: 'focus:ring-gray-300',
    [BUTTON_TYPES.DARK]: 'focus:ring-gray-800',
    [BUTTON_TYPES.LINK]: '',
  };

  return (
    <button
      className={`${baseClasses} ${focusRingClasses[type] || focusRingClasses[BUTTON_TYPES.PRIMARY]}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...restProps}
    >
      <span className="flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {icon && !isLoading && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default Button;
