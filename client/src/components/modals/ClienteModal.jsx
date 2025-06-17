import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import PropTypes from 'prop-types';
/**
 * Modal para crear/editar clientes (específico para recepcionistas)
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar el cliente
 * @param {Object} props.cliente - Cliente a editar (null para crear)
 * @returns {JSX.Element} Componente modal
 */
const ClienteModal = ({ isOpen, onClose, onSave, cliente }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (cliente) {
      setValue('nombre', cliente.nombre);
      setValue('apellido', cliente.apellido);
      setValue('email', cliente.email);
      setValue('cedula', cliente.cedula || '');
      setValue('fechaNacimiento', cliente.fechaNacimiento || '');
      setValue('celular', cliente.celular || '');
      setValue('direccion', cliente.direccion || '');
    } else {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        cedula: '',
        fechaNacimiento: '',
        celular: '',
        direccion: '',
        password: ''
      });
    }
  }, [cliente, setValue, reset]);

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Para clientes, siempre establecer el rol como 'cliente'
      const clienteData = {
        ...data,
        rol: 'cliente'
      };

      // Si estamos editando y no se proporcionó contraseña, la eliminamos
      if (cliente && !data.password) {
        const { password, ...restData } = clienteData;
        await onSave(restData);
      } else {
        await onSave(clienteData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        cedula: '',
        fechaNacimiento: '',
        celular: '',
        direccion: '',
        password: ''
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;
  let buttonText;
  if (isLoading) {
    buttonText = 'Guardando...';
  } else if (cliente) {
    buttonText = 'Actualizar';
  } else {
    buttonText = 'Crear';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nombre"
                      className="input pl-10"
                      {...register('nombre', { 
                        required: 'El nombre es requerido',
                        minLength: {
                          value: 2,
                          message: 'El nombre debe tener al menos 2 caracteres'
                        }
                      })}
                    />
                  </div>
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="apellido"
                      className="input pl-10"
                      {...register('apellido', { 
                        required: 'El apellido es requerido',
                        minLength: {
                          value: 2,
                          message: 'El apellido debe tener al menos 2 caracteres'
                        }
                      })}
                    />
                  </div>
                  {errors.apellido && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="input pl-10"
                    {...register('email', { 
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Dirección de email inválida'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Cédula */}
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                  Cédula *
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cedula"
                    className="input pl-10"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de Nacimiento */}
                <div>
                  <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento *
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="fechaNacimiento"
                      className="input pl-10"
                      {...register('fechaNacimiento', { 
                        required: 'La fecha de nacimiento es requerida'
                      })}
                    />
                  </div>
                  {errors.fechaNacimiento && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>
                  )}
                </div>

                {/* Celular */}
                <div>
                  <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
                    Celular *
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="celular"
                      className="input pl-10"
                      placeholder="Ej: +593999999999"
                      {...register('celular', { 
                        required: 'El celular es requerido',
                        minLength: {
                          value: 8,
                          message: 'El celular debe tener al menos 8 caracteres'
                        },
                        maxLength: {
                          value: 15,
                          message: 'El celular no puede tener más de 15 caracteres'
                        }
                      })}
                    />
                  </div>
                  {errors.celular && (
                    <p className="mt-1 text-sm text-red-600">{errors.celular.message}</p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                  Dirección *
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="direccion"
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Dirección completa (calle, número, ciudad, etc.)"
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

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {cliente ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  id="password"
                  className="input mt-1"
                  {...register('password', { 
                    required: cliente ? false : 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buttonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

ClienteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  cliente: PropTypes.shape({
    apellido: PropTypes.string,
    nombre: PropTypes.string,
    email: PropTypes.string,
    cedula: PropTypes.string,
    fechaNacimiento: PropTypes.string,
    celular: PropTypes.string,
    direccion: PropTypes.string,
  }),
};

export default ClienteModal;