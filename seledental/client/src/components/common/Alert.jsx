import { useEffect, useState } from 'react';
import { 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Tipos de alerta
 */
export const ALERT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Componente de alerta para mostrar mensajes
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de alerta (info, success, warning, error)
 * @param {string} props.message - Mensaje a mostrar
 * @param {boolean} props.isDismissible - Indica si la alerta se puede cerrar
 * @param {number} props.autoClose - Tiempo en ms para cerrar la alerta automáticamente (0 para desactivar)
 * @param {Function} props.onClose - Función a ejecutar al cerrar la alerta
 * @returns {JSX.Element} Componente de alerta
 */
const Alert = ({
  type = ALERT_TYPES.INFO,
  message,
  isDismissible = true,
  autoClose = 0,
  onClose = () => {},
}) => {
  // Estado para controlar si la alerta está visible
  const [isVisible, setIsVisible] = useState(true);

  // Efecto para el cierre automático
  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  /**
   * Maneja el cierre de la alerta
   */
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Si no es visible, no renderizamos nada
  if (!isVisible) return null;

  // Configuración según el tipo de alerta
  const alertConfig = {
    [ALERT_TYPES.INFO]: {
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-400',
    },
    [ALERT_TYPES.SUCCESS]: {
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-400',
    },
    [ALERT_TYPES.WARNING]: {
      icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-400',
    },
    [ALERT_TYPES.ERROR]: {
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-400',
    },
  };

  const { icon, bgColor, textColor, borderColor } = alertConfig[type] || alertConfig[ALERT_TYPES.INFO];

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-md my-2`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        {isDismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 ${textColor} hover:${bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${bgColor} focus:ring-${borderColor}`}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
