import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import PropTypes from 'prop-types';

// Creamos el contexto de autenticación
export const AuthContext = createContext();

/**
 * Proveedor de autenticación que maneja el estado global del usuario
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Proveedor de contexto
 */
export const AuthProvider = ({ children }) => {
  // Estado para almacenar los datos del usuario
  const [user, setUser] = useState(null);
  // Estado para almacenar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para indicar si aún estamos cargando
  const [loading, setLoading] = useState(true);
  // Hook para la navegación
  const navigate = useNavigate();

  // Efecto para verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = authService.getUserData();
        const token = authService.getToken();

        if (userData && token) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  /**
   * Función para iniciar sesión
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   */  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
        // Si el servicio devuelve un error, simplemente lo retornamos
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Error al iniciar sesión',
          errorType: data.errorType || 'unknown'
        };
      }
      
      // Guardamos los datos en localStorage
      authService.setUserData(data.usuario, data.token);
      
      // Actualizamos el estado
      setUser(data.usuario);
      setIsAuthenticated(true);
      
      // Redireccionamos según el rol (con verificación adicional)
      if (data.usuario.rol) {
        redirectByRole(data.usuario.rol);
      } else {
        console.error('Usuario sin rol definido:', data.usuario);
        return {
          success: false,
          message: 'El usuario no tiene un rol asignado'
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      return { 
        success: false, 
        message: error.response?.data?.mensaje || 'Error al iniciar sesión'
      };
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  /**
   * Función para redirigir al usuario según su rol
   * @param {string} rol - Rol del usuario
   */
  const redirectByRole = (rol) => {
    switch (rol) {
      case 'administrador':
        navigate('/admin/dashboard');
        break;
      case 'recepcionista':
        navigate('/recepcionista/dashboard');
        break;
      case 'cliente':
        navigate('/cliente/dashboard');
        break;
      case 'odontologo':
        navigate('/odontologo/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  // Valor del contexto que se proporcionará
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  // Si aún estamos cargando, mostramos un indicador
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
