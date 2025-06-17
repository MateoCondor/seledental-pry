import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import CompletarPerfilModal from './modals/CompletarPerfilModal';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

/**
 * Wrapper que verifica si el cliente necesita completar su perfil
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
const PerfilCompletoWrapper = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingPerfil, setIsLoadingPerfil] = useState(false);

  useEffect(() => {
    const checkPerfil = async () => {
      if (!isAuthenticated || loading || user?.rol !== 'cliente') {
        setChecking(false);
        return;
      }

      try {
        const response = await authService.obtenerPerfil();
        if (response.datos?.usuario) {
          const completo = response.datos.usuario.perfilCompleto;
          setPerfilCompleto(completo);
          
          // Si el perfil no está completo, mostrar el modal
          if (!completo) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error al verificar perfil:', error);
        setPerfilCompleto(true); // En caso de error, asumimos que está completo
      } finally {
        setChecking(false);
      }
    };

    checkPerfil();
  }, [user, isAuthenticated, loading]);

  /**
   * Manejar la finalización del perfil
   */
  const handleCompletarPerfil = async (data) => {
    setIsLoadingPerfil(true);
    
    try {
      const response = await authService.completarPerfil(data);
      
      if (response.success) {
        toast.success('Perfil completado exitosamente');
        setPerfilCompleto(true);
        setShowModal(false);
      } else {
        toast.error(response.message || 'Error al completar el perfil');
      }
    } catch (error) {
      console.error('Error al completar perfil:', error);
      if (error.response?.data?.mensaje) {
        toast.error(error.response.data.mensaje);
      } else if (error.response?.data?.errores) {
        // Mostrar errores de validación
        const errores = error.response.data.errores;
        errores.forEach(err => {
          toast.error(`${err.campo}: ${err.mensaje}`);
        });
      } else {
        toast.error('Error al completar el perfil. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoadingPerfil(false);
    }
  };

  // Si aún estamos verificando o cargando
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Verificando perfil...</span>
        </div>
      </div>
    );
  }

  // Si no es cliente o el perfil está completo, mostrar los children normalmente
  if (user?.rol !== 'cliente' || perfilCompleto) {
    return children;
  }

  // Si es cliente y el perfil no está completo, mostrar children con modal
  return (
    <>
      {children}
      <CompletarPerfilModal
        isOpen={showModal}
        onClose={() => {}} // No permitimos cerrar el modal
        onSave={handleCompletarPerfil}
        user={user}
        isLoading={isLoadingPerfil}
      />
    </>
  );
};

PerfilCompletoWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PerfilCompletoWrapper;