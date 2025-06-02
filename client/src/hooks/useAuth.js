import { useContext } from 'react';
import { AuthContext } from '../contexts/auth/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} - Objeto con los valores y funciones del contexto de autenticación
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default useAuth;
