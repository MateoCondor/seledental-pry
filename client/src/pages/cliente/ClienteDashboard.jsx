import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ClienteLayout from '../../components/layouts/ClienteLayout';
import usuarioService from '../../services/usuarioService';
import { toast } from 'react-hot-toast';

/**
 * Página de Dashboard del Cliente
 * @returns {JSX.Element} Componente de panel de cliente
 */
const ClienteDashboard = () => {
  // Obtenemos la información del usuario actual
  const { user: authUser } = useAuth();
  // Estado para almacenar los datos del perfil
  const [perfil, setPerfil] = useState(null);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  // Función para cargar los datos del perfil
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
        error.response?.data?.error || 
        'Error al cargar los datos del perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar el perfil al montar el componente
  useEffect(() => {
    loadPerfil();
  }, [authUser]);

  return (
    <ClienteLayout >
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, {perfil?.nombre || ''}
          </h1>
          <p>Esta es tu área personal donde podrás gestionar tus citas y ver tu historial.</p>
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
            {/* Tarjeta de próximas citas */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Citas</h2>
              <div className="text-center py-8 text-gray-500">
                <p>No tienes citas programadas</p>
              <Link to="/cliente/agendar-cita" className="text-primary underline">
                <button className="btn btn-primary mt-4">
                  Solicitar Cita
                </button>
              </Link>
              </div>
            </div>
            
            {/* Tarjeta de historial */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Visitas</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Aún no tienes visitas registradas</p>
              </div>
            </div>
            
            {/* Mensaje de funcionalidad en desarrollo */}
            <div className="card col-span-1 md:col-span-2 bg-yellow-50 border border-yellow-200">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-700">
                  El módulo de gestión de clientes está en desarrollo. Pronto tendrás acceso a más funcionalidades.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
};

export default ClienteDashboard;
