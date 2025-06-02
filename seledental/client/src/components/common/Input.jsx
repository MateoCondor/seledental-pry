import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Componente de entrada de texto reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de entrada (text, password, email, etc.)
 * @param {string} props.id - ID del campo
 * @param {string} props.name - Nombre del campo
 * @param {string} props.value - Valor del campo
 * @param {Function} props.onChange - Función a ejecutar al cambiar el valor
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.placeholder - Texto de marcador de posición
 * @param {string} props.error - Mensaje de error
 * @param {string} props.helperText - Texto de ayuda
 * @param {boolean} props.required - Indica si el campo es requerido
 * @param {boolean} props.disabled - Indica si el campo está deshabilitado
 * @param {JSX.Element} props.leftIcon - Icono a mostrar a la izquierda
 * @param {JSX.Element} props.rightIcon - Icono a mostrar a la derecha
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element} Componente de entrada de texto
 */
const Input = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  className = '',
  ...restProps
}) => {
  // Estado para manejar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // Tipo efectivo (para contraseñas)
  const effectiveType = type === 'password' && showPassword ? 'text' : type;
  
  // Clases base para el input
  const baseInputClasses = `block w-full rounded-md border ${
    error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:border-primary focus:ring-primary'
  } px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${readOnly ? 'bg-gray-50' : ''}
    ${className}`;
  
  // Clases adicionales si hay íconos
  const withIconClasses = {
    left: leftIcon ? 'pl-10' : '',
    right: rightIcon || type === 'password' ? 'pr-10' : '',
  };

  return (
    <div className="mb-4">
      {/* Etiqueta */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Contenedor del input (para los íconos) */}
      <div className="relative">
        {/* Icono izquierdo */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        {/* Input */}
        <input
          type={effectiveType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`${baseInputClasses} ${withIconClasses.left} ${withIconClasses.right}`}
          {...restProps}
        />
        
        {/* Icono derecho o botón para mostrar/ocultar contraseña */}
        {(rightIcon || type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {type === 'password' ? (
              <button
                type="button"
                className="focus:outline-none hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error o texto de ayuda */}
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
