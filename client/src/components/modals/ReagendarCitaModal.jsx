import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiCalendar, FiClock, FiRefreshCw } from 'react-icons/fi';
import PropTypes from 'prop-types';
import citaService from '../../services/citaService';
import { toast } from 'react-hot-toast';
import useWebSocket from '../../hooks/useWebSocket';

/**
 * Modal para reagendar citas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar el reagendamiento
 * @param {Object} props.cita - Cita a reagendar
 * @returns {JSX.Element} Componente modal
 */
const ReagendarCitaModal = ({ isOpen, onClose, onConfirm, cita }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // WebSocket para actualizaciones en tiempo real
  const { joinDateRoom, leaveDateRoom, onHorariosUpdated, offHorariosUpdated } = useWebSocket();

  // Observar el campo fecha
  const fechaSeleccionada = watch('fecha');

  /**
   * Cargar horarios disponibles cuando se selecciona una fecha
   */
  useEffect(() => {
    if (fechaSeleccionada) {
      loadHorariosDisponibles(fechaSeleccionada);
      // Unirse a la sala de WebSocket para esta fecha
      joinDateRoom(fechaSeleccionada);

      // Escuchar actualizaciones de horarios
      onHorariosUpdated((data) => {
        if (data.fecha === fechaSeleccionada) {
          loadHorariosDisponibles(fechaSeleccionada);
        }
      });
    }

    return () => {
      if (fechaSeleccionada) {
        leaveDateRoom(fechaSeleccionada);
        offHorariosUpdated();
      }
    };
  }, [fechaSeleccionada]);

  /**
   * Cargar horarios disponibles para una fecha
   * @param {string} fecha - Fecha seleccionada
   */
  const loadHorariosDisponibles = async (fecha) => {
    setLoadingHorarios(true);
    try {
      const response = await citaService.getHorariosDisponibles(fecha);
      if (response.success) {
        setHorariosDisponibles(response.datos.horariosDisponibles);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast.error('Error al cargar los horarios disponibles');
    } finally {
      setLoadingHorarios(false);
    }
  };

  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = async (data) => {
    if (!data.fecha || !data.hora) {
      toast.error('Selecciona fecha y hora');
      return;
    }

    setIsLoading(true);
    try {
      const fechaHoraCompleta = `${data.fecha}T${data.hora}:00`;
      await onConfirm(fechaHoraCompleta, data.motivo);
      reset();
    } catch (error) {
      console.error('Error al reagendar cita:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar modal y limpiar formulario
   */
  const handleClose = () => {
    reset();
    setHorariosDisponibles([]);
    onClose();
  };

  /**
   * Obtener fecha mínima (mañana)
   */
  const getFechaMinima = () => {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    return mañana.toISOString().split('T')[0];
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
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <FiRefreshCw className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Reagendar Cita
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-3">
                  Selecciona una nueva fecha y hora para tu cita:
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {cita.tipoConsulta?.replace('_', ' ')} - {cita.categoria?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Fecha actual:</strong> {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selector de fecha */}
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva fecha *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="fecha"
                      min={getFechaMinima()}
                      className="input pl-10"
                      {...register('fecha', { required: 'Selecciona una fecha' })}
                    />
                  </div>
                  {errors.fecha && (
                    <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                  )}
                </div>

                {/* Selector de hora */}
                {fechaSeleccionada && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horarios disponibles *
                    </label>

                    {loadingHorarios ? (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-600 text-sm">Cargando horarios...</span>
                        </div>
                      </div>
                    ) : horariosDisponibles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {horariosDisponibles.map((horario) => (
                          <label key={horario} className="relative">
                            <input
                              type="radio"
                              value={horario}
                              className="sr-only peer"
                              {...register('hora', { required: 'Selecciona una hora' })}
                            />
                            <div className="p-2 text-center border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 transition-all">
                              <FiClock className="h-3 w-3 mx-auto mb-1" />
                              <span className="text-xs font-medium">{horario}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FiCalendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No hay horarios disponibles</p>
                      </div>
                    )}

                    {errors.hora && (
                      <p className="mt-1 text-sm text-red-600">{errors.hora.message}</p>
                    )}
                  </div>
                )}

                {/* Motivo del reagendamiento */}
                <div>
                  <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del reagendamiento (opcional)
                  </label>
                  <textarea
                    id="motivo"
                    rows={3}
                    className="input resize-none"
                    placeholder="Describe brevemente el motivo del reagendamiento..."
                    {...register('motivo')}
                  />
                </div>

                {/* Nota informativa */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> Las citas deben reagendarse con al menos 24 horas de anticipación. 
                        Tu cita quedará como "pendiente" hasta ser confirmada nuevamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3">
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
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Reagendando...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="mr-2 h-4 w-4" />
                        Reagendar Cita
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

ReagendarCitaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cita: PropTypes.object
};

export default ReagendarCitaModal;