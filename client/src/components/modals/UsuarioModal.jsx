import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';

/**
 * Modal para crear o editar usuarios
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onSave - Función para guardar el usuario
 * @param {object} usuario - Usuario a editar (null para crear nuevo)
 * @param {object} currentUser - Usuario actualmente logueado
 */
const UsuarioModal = ({ isOpen, onClose, onSave, usuario, currentUser }) => {
  // Hook para manejar el formulario
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  
  // Efecto para cargar los datos del usuario cuando se edita
  useEffect(() => {
    if (usuario) {
      setValue('nombre', usuario.nombre);
      setValue('apellido', usuario.apellido);
      setValue('email', usuario.email);
      setValue('rol', usuario.rol);
      // No establecemos la contraseña para edición
    } else {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        rol: 'cliente',
        password: ''
      });
    }
  }, [usuario, setValue, reset]);
  
  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = (data) => {
    // Si estamos editando y no se proporcionó contraseña, la eliminamos
    if (usuario && !data.password) {
      const { password, ...restData } = data;
      onSave(restData);
    } else {
      onSave(data);
    }
  };

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        rol: 'cliente',
        password: ''
      });
    }
  }, [isOpen, reset]);
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        className="input mt-1"
                        {...register('nombre', { 
                          required: 'El nombre es requerido',
                          minLength: {
                            value: 2,
                            message: 'El nombre debe tener al menos 2 caracteres'
                          }
                        })}
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="apellido"
                        className="input mt-1"
                        {...register('apellido', { 
                          required: 'El apellido es requerido',
                          minLength: {
                            value: 2,
                            message: 'El apellido debe tener al menos 2 caracteres'
                          }
                        })}
                      />
                      {errors.apellido && (
                        <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="input mt-1"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Dirección de email inválida'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <select
                        id="rol"
                        className="input mt-1"
                        {...register('rol', { required: 'El rol es requerido' })}
                        disabled={usuario && usuario.id === currentUser?.id && currentUser?.rol === 'administrador'}
                      >
                        <option value="administrador">Administrador</option>
                        <option value="recepcionista">Recepcionista</option>
                        <option value="odontologo">Odontólogo</option>
                        <option value="cliente">Cliente</option>
                      </select>
                      {errors.rol && (
                        <p className="mt-1 text-sm text-red-600">{errors.rol.message}</p>
                      )}
                      {usuario && usuario.id === currentUser?.id && currentUser?.rol === 'administrador' && (
                        <p className="mt-1 text-sm text-yellow-600">
                          No puedes cambiar tu propio rol de administrador
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {usuario ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="input mt-1"
                        {...register('password', { 
                          required: usuario ? false : 'La contraseña es requerida',
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
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {usuario ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
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

UsuarioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  usuario: PropTypes.shape({
    nombre: PropTypes.string,
    apellido: PropTypes.string,
    email: PropTypes.string,
    rol: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // Agrega más propiedades si las usas
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    apellido: PropTypes.string,
    rol: PropTypes.string,
    email: PropTypes.string,
    // Agrega más propiedades si las usas
  }),
};
export default UsuarioModal;
