import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * Modal para cancelar citas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar la cancelación
 * @param {Object} props.cita - Cita a cancelar
 * @returns {JSX.Element} Componente modal
 */
const CancelarCitaModal = ({ isOpen, onClose, onConfirm, cita }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onConfirm(data.motivo);
      reset();
    } catch (error) {
      console.error('Error al cancelar cita:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar modal y limpiar formulario
   */
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !cita) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Cancelar Cita
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-3">
                  ¿Estás seguro de que deseas cancelar la siguiente cita?
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {cita.tipoConsulta?.replace('_', ' ')} - {cita.categoria?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} a las {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de cancelación (opcional)
                  </label>
                  <textarea
                    id="motivo"
                    rows={3}
                    className="input resize-none"
                    placeholder="Describe brevemente el motivo de la cancelación..."
                    {...register('motivo')}
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Nota:</strong> Las citas deben cancelarse con al menos 24 horas de anticipación. 
                        Cancelaciones tardías pueden estar sujetas a restricciones.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="btn btn-secondary"
                  >
                    Mantener Cita
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-danger"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <FiX className="mr-2 h-4 w-4" />
                        Cancelar Cita
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

CancelarCitaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cita: PropTypes.object
};

export default CancelarCitaModal;