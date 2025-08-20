import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ClienteLayout from '../../components/layouts/ClienteLayout';
import usuarioService from '../../services/usuarioService';
import citaService from '../../services/citaService';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiEye } from 'react-icons/fi';

/**
 * Página de Dashboard del Cliente
 * @returns {JSX.Element} Componente de panel de cliente
 */
const ClienteDashboard = () => {
  // Obtenemos la información del usuario actual
  const { user: authUser } = useAuth();
  // Estado para almacenar los datos del perfil
  const [perfil, setPerfil] = useState(null);
  // Estado para almacenar las próximas citas
  const [proximasCitas, setProximasCitas] = useState([]);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(true);
  // Función para cargar las próximas citas
  const loadProximasCitas = async () => {
    if (!authUser?.id) return;
    
    setLoadingCitas(true);
    try {
      // Obtener todas las citas del cliente
      const response = await citaService.getMisCitas({
        limite: 20 // Obtenemos más para filtrar las próximas
      });
      
      if (response?.success && response?.datos?.citas) {
        // Filtrar solo las citas futuras con estados pendiente y confirmada
        const ahora = new Date();
        const citasFuturas = response.datos.citas
          .filter(cita => {
            const fechaCita = new Date(cita.fechaHora);
            const estadosValidos = ['pendiente', 'confirmada'];
            return fechaCita > ahora && estadosValidos.includes(cita.estado);
          })
          .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
          .slice(0, 5); // Solo las primeras 5 próximas citas
        
        setProximasCitas(citasFuturas);
      }
    } catch (error) {
      console.error('Error al cargar próximas citas:', error);
      toast.error('Error al cargar las próximas citas');
    } finally {
      setLoadingCitas(false);
    }
  };

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
    loadProximasCitas();
  }, [authUser]);

  /**
   * Formatear fecha para mostrar
   * @param {string} fechaHora - Fecha y hora en formato ISO
   * @returns {string} - Fecha formateada
   */
  const formatearFecha = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Formatear hora para mostrar
   * @param {string} fechaHora - Fecha y hora en formato ISO
   * @returns {string} - Hora formateada
   */
  const formatearHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtener el color del estado
   * @param {string} estado - Estado de la cita
   * @returns {string} - Clases CSS para el color
   */
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-blue-100 text-blue-800',
      en_proceso: 'bg-purple-100 text-purple-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      no_asistio: 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Obtener el texto del estado
   * @param {string} estado - Estado de la cita
   * @returns {string} - Texto legible del estado
   */
  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_proceso: 'En Proceso',
      completada: 'Completada',
      cancelada: 'Cancelada',
      no_asistio: 'No Asistió'
    };
    return textos[estado] || estado;
  };

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Próximas Citas</h2>
                <Link to="/cliente/citas" className="text-primary text-sm hover:underline">
                  Ver todas
                </Link>
              </div>
              
              {loadingCitas ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : proximasCitas.length > 0 ? (
                <div className="space-y-3">
                  {proximasCitas.map((cita) => (
                    <div key={cita.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiCalendar className="text-primary" size={16} />
                            <span className="text-sm text-gray-600 capitalize">
                              {formatearFecha(cita.fechaHora)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FiClock className="text-primary" size={16} />
                            <span className="text-sm text-gray-600">
                              {formatearHora(cita.fechaHora)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {cita.categoria?.replace(/_/g, ' ') || 'Consulta general'}
                            </span>
                          </div>
                          {cita.odontologo && (
                            <div className="flex items-center space-x-2">
                              <FiUser className="text-primary" size={16} />
                              <span className="text-sm text-gray-600">
                                Dr. {cita.odontologo.nombre} {cita.odontologo.apellido}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                            {getEstadoTexto(cita.estado)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tienes citas programadas</p>
                  <Link to="/cliente/agendar-cita" className="text-primary underline">
                    <button className="btn btn-primary mt-4">
                      Solicitar Cita
                    </button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Tarjeta de historial */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Visitas</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Aún no tienes visitas registradas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
};

export default ClienteDashboard;
