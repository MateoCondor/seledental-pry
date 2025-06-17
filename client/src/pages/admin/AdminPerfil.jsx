import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiSave, FiKey } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import usuarioService from '../../services/usuarioService';
import AdminLayout from '../../components/layouts/AdminLayout';

/**
 * Página de perfil del administrador
 * @returns {JSX.Element} Componente de perfil de administrador
 */
const AdminPerfil = () => {
  const { user: authUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

  // Función para cargar los datos del perfil
  const loadPerfil = async () => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const data = await usuarioService.getUsuario(authUser.id);
      
      if (data && data.success && data.datos && data.datos.usuario) {
        const usuario = data.datos.usuario;
        setPerfil(usuario);
        
        // Cargar datos en el formulario
        setValue('nombre', usuario.nombre);
        setValue('apellido', usuario.apellido);
        setValue('email', usuario.email);
      } else {
        console.error('Estructura de respuesta inválida:', data);
        toast.error('Error al cargar los datos del perfil');
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, [authUser]);

  // Función para actualizar el perfil
  const onSubmit = async (data) => {
    setIsUpdating(true);
    
    try {
      // Preparar datos para enviar
      const updateData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email
      };

      // Solo incluir contraseña si se proporcionó
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
      }

      const response = await usuarioService.updateUsuario(authUser.id, updateData);
      
      if (response && response.success) {
        toast.success('Perfil actualizado correctamente');
        // Recargar los datos
        loadPerfil();
        // Ocultar campos de contraseña y limpiarlos
        setShowPasswordFields(false);
        setValue('password', '');
        setValue('confirmarPassword', '');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      toast.error(
        error.response?.data?.mensaje || 
        'Error al actualizar el perfil'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const watchPassword = watch('password');

  if (loading) {
    return (
      <AdminLayout >
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Cargando perfil...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            <p className="text-sm text-gray-600">Actualiza tu información personal y contraseña</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
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

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <div className="relative">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="input pl-10"
                  {...register('email', { 
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Dirección de correo inválida'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Rol (solo lectura) */}
            <div>
              <label 
              htmlFor='rol'
              className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <input
                type="text"
                className="input bg-gray-100 cursor-not-allowed capitalize"
                value={perfil?.rol || ''}
                disabled
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                El rol no se puede modificar
              </p>
            </div>

            {/* Sección de contraseña */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-sm text-primary hover:text-primaryDark"
                >
                  {showPasswordFields ? 'Cancelar' : 'Cambiar contraseña'}
                </button>
              </div>

              {showPasswordFields && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiKey className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        className="input pl-10"
                        {...register('password', { 
                          minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres'
                          }
                        })}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiKey className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmarPassword"
                        className="input pl-10"
                        {...register('confirmarPassword', { 
                          validate: value => 
                            !watchPassword || value === watchPassword || 'Las contraseñas no coinciden'
                        })}
                      />
                    </div>
                    {errors.confirmarPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmarPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary flex items-center"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-5 w-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPerfil;