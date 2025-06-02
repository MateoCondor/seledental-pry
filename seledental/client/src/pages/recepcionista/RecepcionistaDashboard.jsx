import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';
import usuarioService from '../../services/usuarioService';
import useAuth from '../../hooks/useAuth';
import RecepcionistaLayout from '../../components/layouts/RecepcionistaLayout';
import PerfilModal from '../../components/modals/PerfilModal';

/**
 * Página de Dashboard del Recepcionista
 * @returns {JSX.Element} Componente de panel de recepcionista
 */
const RecepcionistaDashboard = () => {
  // Obtenemos la información del usuario actual
  const { user: authUser } = useAuth();
  // Estado para almacenar los datos del perfil
  const [perfil, setPerfil] = useState(null);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  // Estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);  // Función para cargar los datos del perfil
  const loadPerfil = async () => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const data = await usuarioService.getUsuario(authUser.id);
      
      if (data && data.success && data.datos && data.datos.usuario) {
        setPerfil(data.datos.usuario);
      } else {
        console.error('Estructura de respuesta inválida:', data);
        toast.error('Error en el formato de respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      toast.error(
        error.response?.data?.mensaje || 
        'Error al cargar los datos del perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar el perfil al montar el componente
  useEffect(() => {
    loadPerfil();
  }, [authUser]);  // Función para actualizar el perfil
  const handleUpdatePerfil = async (userData) => {
    try {
      const response = await usuarioService.updateUsuario(authUser.id, userData);
      
      if (response && response.success) {
        toast.success('Perfil actualizado correctamente');
        // Recargamos los datos del perfil
        loadPerfil();
        // Cerramos el modal
        setIsModalOpen(false);
      } else {
        console.error('Respuesta inesperada al actualizar perfil:', response);
        toast.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      toast.error(
        error.response?.data?.mensaje || 
        error.response?.data?.error || 
        'Error al actualizar el perfil'
      );
    }
  };

  return (
    <RecepcionistaLayout title="Panel de Recepción">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Bienvenido, {perfil?.nombre || ''}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta de perfil */}
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Mi Perfil</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 text-blue-600 hover:text-blue-800 rounded"
                  title="Editar Perfil"
                >
                  <FiEdit2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{perfil?.nombre} {perfil?.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{perfil?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium capitalize">{perfil?.rol}</p>
                </div>
              </div>
            </div>
            
            {/* Aquí puedes agregar más tarjetas para otras funcionalidades */}
            <div className="card bg-gray-50 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Más funcionalidades para recepcionistas estarán disponibles próximamente
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para editar perfil */}
      <PerfilModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdatePerfil}
        perfil={perfil}
      />
    </RecepcionistaLayout>
  );
};

export default RecepcionistaDashboard;
