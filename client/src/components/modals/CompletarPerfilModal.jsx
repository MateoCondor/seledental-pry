import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { FiUser, FiCalendar, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';
import PropTypes from 'prop-types';
/**
 * Modal para completar perfil de cliente
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal (deshabilitada)
 * @param {Function} props.onSave - Función para guardar los datos
 * @param {Object} props.user - Datos del usuario
 * @param {boolean} props.isLoading - Estado de carga
 * @returns {JSX.Element} Componente de modal
 */
const CompletarPerfilModal = ({ isOpen, onClose, onSave, user, isLoading = false }) => {
  // Hook para manejar el formulario
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({
        cedula: '',
        fechaNacimiento: '',
        celular: '',
        direccion: ''
      });
    }
  }, [isOpen, reset]);

  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header del modal */}
                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-white flex items-center">
                    <FiUser className="mr-2" />
                    Completa tu perfil
                  </Dialog.Title>
                  <p className="text-sm text-white/90 mt-1">
                    Hola {user?.nombre}, necesitamos algunos datos adicionales
                  </p>
                </div>

                {/* Información importante */}
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">
                        Para completar tu registro
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Estos datos nos ayudan a brindarte un mejor servicio y contactarte para confirmar tus citas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  <div className="space-y-4">
                    {/* Cédula */}
                    <div>
                      <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula de identidad *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="cedula"
                          name="cedula"
                          type="text"
                          required
                          className="input pl-10"
                          pattern="[0-9]*" 
                          title="Solo se permiten números (sin letras ni símbolos)" 
                          placeholder="Ej: 1234567890"
                          {...register('cedula', { 
                            required: 'La cédula es requerida',
                            minLength: {
                              value: 8,
                              message: 'La cédula debe tener al menos 8 caracteres'
                            },
                            maxLength: {
                              value: 20,
                              message: 'La cédula no puede tener más de 20 caracteres'
                            }
                          })}
                        />
                      </div>
                      {errors.cedula && (
                        <p className="mt-1 text-sm text-red-600">{errors.cedula.message}</p>
                      )}
                    </div>

                    {/* Fecha de nacimiento */}
                    <div>
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de nacimiento *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          type="date"
                          required
                          className="input pl-10"
                          {...register('fechaNacimiento', { 
                            required: 'La fecha de nacimiento es requerida',
                            validate: value => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0); // Ignora la hora
                              const birthDate = new Date(value);
                              if (birthDate > today) {
                                return 'La fecha de nacimiento no puede ser posterior a hoy';
                              }
                              const age = today.getFullYear() - birthDate.getFullYear();
                              if (age < 0.5 || age > 120) {
                                return 'Por favor, ingresa una fecha de nacimiento válida';
                              }
                              return true;
                            }
                          })}
                        />
                      </div>
                      {errors.fechaNacimiento && (
                        <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>
                      )}
                    </div>

                    {/* Celular */}
                    <div>
                      <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de celular *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="celular"
                          name="celular"
                          type="tel"
                          required
                          className="input pl-10"
                          placeholder="Ej: 0987654321"
                          pattern="[0-9]*" 
                          title="Solo se permiten números (sin letras ni símbolos.)"
                          {...register('celular', { 
                            required: 'El número de celular es requerido',
                            minLength: {
                              value: 8,
                              message: 'El número debe tener al menos 8 dígitos'
                            },
                            maxLength: {
                              value: 15,
                              message: 'El número no puede tener más de 15 dígitos'
                            }
                          })}
                        />
                      </div>
                      {errors.celular && (
                        <p className="mt-1 text-sm text-red-600">{errors.celular.message}</p>
                      )}
                    </div>

                    {/* Dirección */}
                    <div>
                      <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección domiciliaria *
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                          <FiMapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          id="direccion"
                          name="direccion"
                          rows={3}
                          required
                          className="input pl-10 resize-none"
                          placeholder="Ingresa tu dirección completa (calle, número, ciudad, etc.)"
                          {...register('direccion', { 
                            required: 'La dirección es requerida',
                            minLength: {
                              value: 10,
                              message: 'La dirección debe tener al menos 10 caracteres'
                            }
                          })}
                        />
                      </div>
                      {errors.direccion && (
                        <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="mt-8 flex flex-col space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary w-full flex justify-center items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2 h-5 w-5" />
                          Completar perfil
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      * Todos los campos son obligatorios
                    </p>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

CompletarPerfilModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  user: PropTypes.shape({
    nombre: PropTypes.string,
    apellido: PropTypes.string,
    email: PropTypes.string,
    // Agrega más propiedades si las usas en el modal
  }),
  isLoading: PropTypes.bool,
};

export default CompletarPerfilModal;