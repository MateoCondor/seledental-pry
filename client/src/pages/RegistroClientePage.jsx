import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

/**
 * Página de registro de clientes
 * @returns {JSX.Element} Componente de página de registro
 */
const RegistroClientePage = () => {
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Hook para manejar el formulario
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  // Hook de autenticación
  const { login } = useAuth();
  // Estado para controlar la carga durante el proceso de registro
  const [isLoading, setIsLoading] = useState(false);

  // Observar el campo password para validar confirmación
  const watchPassword = watch('password');

  /**
   * Manejar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await authService.registroCliente(data);
      
      if (response.success) {
        toast.success('Registro exitoso. ¡Bienvenido!');
        // Automáticamente iniciar sesión después del registro
        const loginResult = await login(data.email, data.password);
        if (!loginResult.success) {
          toast.error('Error al iniciar sesión automáticamente');
        }
      } else {
        toast.error(response.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      if (error.response?.data?.mensaje) {
        toast.error(error.response.data.mensaje);
      } else if (error.response?.data?.errores) {
        // Mostrar errores de validación
        const errores = error.response.data.errores;
        errores.forEach(err => {
          toast.error(`${err.campo}: ${err.mensaje}`);
        });
      } else {
        toast.error('Error al registrar usuario. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-5xl font-extrabold text-primary">
            SeleDental
          </h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Únete a nosotros y comienza a gestionar tus citas dentales
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Nombre */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="given-name"
                required
                className="input pl-10"
                pattern="[^0-9]*" 
                title='El nombre no debe contener números.'
                placeholder="Nombre"
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

            {/* Apellido */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="apellido"
                name="apellido"
                type="text"
                autoComplete="family-name"
                required
                className="input pl-10"
                pattern="[^0-9]*" 
                title='El apellido no debe contener números'
                placeholder="Apellido"
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

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input pl-10"
                placeholder="Correo electrónico"
                {...register('email', { 
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Dirección de correo inválida'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            {/* Contraseña */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="input pl-10 pr-10"
                placeholder="Contraseña"
                {...register('password', { 
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="input pl-10 pr-10"
                placeholder="Confirmar contraseña"
                {...register('confirmarPassword', { 
                  required: 'Debe confirmar la contraseña',
                  validate: value => 
                    value === watchPassword || 'Las contraseñas no coinciden'
                })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmarPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmarPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex justify-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiUserPlus className="mr-2 h-5 w-5" />
                  Crear cuenta
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroClientePage;