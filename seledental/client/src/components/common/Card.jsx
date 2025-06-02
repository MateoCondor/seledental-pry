import React from 'react';

/**
 * Componente de tarjeta reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {JSX.Element} props.children - Contenido de la tarjeta
 * @param {string} props.title - Título de la tarjeta
 * @param {JSX.Element} props.icon - Icono para mostrar junto al título
 * @param {JSX.Element} props.actions - Botones de acción
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element} Componente de tarjeta
 */
const Card = ({ 
  children, 
  title, 
  icon, 
  actions, 
  className = '',
  footerContent,
  isLoading = false 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Encabezado con título */}
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          {title && (
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      
      {/* Contenido de la tarjeta */}
      <div className="p-6 relative">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Pie de tarjeta opcional */}
      {footerContent && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;
