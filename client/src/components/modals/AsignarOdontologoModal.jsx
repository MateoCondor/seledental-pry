import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiUser, FiFileText } from 'react-icons/fi';
import PropTypes from 'prop-types';
import citaService from '../../services/citaService';
import { toast } from 'react-hot-toast';

/**
 * Modal para asignar odontólogo a una cita
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar la asignación
 * @param {Object} props.cita - Cita a la que asignar odontólogo
 * @returns {JSX.Element} Componente modal
 */
const AsignarOdontologoModal = ({ isOpen, onClose, onConfirm, cita }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [odontologos, setOdontologos] = useState([]);
  const [loadingOdontologos, setLoadingOdontologos] = useState(false);

  /**
   * Cargar lista de odontólogos al abrir el modal
   */
  useEffect(() => {
    if (isOpen) {
      loadOdontologos();
    }
  }, [isOpen]);

  /**
   * Cargar odontólogos disponibles
   */
  const loadOdontologos = async () => {
    setLoadingOdontologos(true);
    try {
      const response = await citaService.getOdontologos();
      if (response.success) {
        setOdontologos(response.datos.odontologos);
      }
    } catch (error) {
      console.error('Error al cargar odontólogos:', error);
      toast.error('Error al cargar la lista de odontólogos');
    } finally {
      setLoadingOdontologos(false);
    }
  };

  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onConfirm(data.odontologoId, data.observaciones);
      reset();
    } catch (error) {
      console.error('Error al asignar odontólogo:', error);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Asignar Odontólogo
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Asigna un odontólogo para la siguiente cita:
                  </p>
                  
                  {/* Información de la cita */}
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Cliente:</span>{' '}
                        <span className="text-gray-900">
                          {cita.cliente?.nombre} {cita.cliente?.apellido}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fecha:</span>{' '}
                        <span className="text-gray-900">
                          {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Hora:</span>{' '}
                        <span className="text-gray-900">
                          {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tipo:</span>{' '}
                        <span className="text-gray-900 capitalize">
                          {cita.tipoConsulta?.replace('_', ' ')} - {cita.categoria?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
              {/* Selector de odontólogo */}
              <div className="mb-4">
                <label htmlFor="odontologoId" className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Odontólogo *
                </label>
                {loadingOdontologos ? (
                  <div className="flex items-center justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Cargando odontólogos...</span>
                  </div>
                ) : (
                  <select
                    id="odontologoId"
                    className="input"
                    {...register('odontologoId', { required: 'Debe seleccionar un odontólogo' })}
                  >
                    <option value="">Seleccione un odontólogo</option>
                    {odontologos.map((odontologo) => (
                      <option key={odontologo.id} value={odontologo.id}>
                        Dr. {odontologo.nombre} {odontologo.apellido}
                      </option>
                    ))}
                  </select>
                )}
                {errors.odontologoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.odontologoId.message}</p>
                )}
              </div>

              {/* Observaciones */}
              <div className="mb-4">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (opcional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                    <FiFileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="observaciones"
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Notas adicionales sobre la asignación..."
                    {...register('observaciones')}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || loadingOdontologos}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <FiUser className="mr-2 h-4 w-4" />
                      Asignar Odontólogo
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
  );
};

AsignarOdontologoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cita: PropTypes.object
};

export default AsignarOdontologoModal;