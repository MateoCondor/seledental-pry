import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

/**
 * Modal para editar perfil (para recepcionistas)
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @param {Object} props.perfil - Datos del perfil a editar
 * @returns {JSX.Element} Componente de modal
 */
const PerfilModal = ({ isOpen, onClose, onSave, perfil }) => {
  // Hook para manejar el formulario
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  
  // Efecto para cargar los datos del perfil
  useEffect(() => {
    if (perfil) {
      setValue('nombre', perfil.nombre);
      setValue('apellido', perfil.apellido);
    } else {
      reset({
        nombre: '',
        apellido: ''
      });
    }
  }, [perfil, setValue, reset]);
  
  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = (data) => {
    onSave(data);
  };
  
  if (!perfil) return null;
  
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
                  Editar Perfil
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
                        className="input mt-1 bg-gray-100"
                        value={perfil.email}
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        El email no se puede modificar
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <input
                        type="text"
                        id="rol"
                        className="input mt-1 bg-gray-100 capitalize"
                        value={perfil.rol}
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        El rol no se puede modificar
                      </p>
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
                      Guardar Cambios
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

export default PerfilModal;
