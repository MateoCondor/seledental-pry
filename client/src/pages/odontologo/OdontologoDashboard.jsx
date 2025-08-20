import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiPlay, FiCheck, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import OdontologoLayout from '../../components/layouts/OdontologoLayout';
import CompletarCitaModal from '../../components/modals/CompletarCitaModal';
import useAuth from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import citaService from '../../services/citaService';

/**
 * Página de Dashboard del Odontólogo
 * @returns {JSX.Element} Componente de panel de odontólogo
 */
const OdontologoDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    citasHoy: 0,
    citasSemana: 0,
    citasMes: 0,
    pacientesAtendidos: 0
  });
  const [modalCompletarCita, setModalCompletarCita] = useState({
    isOpen: false,
    cita: null,
    loading: false
  });

  // WebSocket para notificaciones en tiempo real
  const {
    joinOdontologoRoom,
    leaveOdontologoRoom,
    onNuevaCitaAsignada,
    offNuevaCitaAsignada,
    onCitaActualizadaOdontologo,
    offCitaActualizadaOdontologo
  } = useWebSocket();

  // Cargar citas del día actual
  const cargarCitasHoy = async () => {
    try {
      setLoading(true);
      const hoy = new Date().toISOString().split('T')[0];
      const response = await citaService.getCitasOdontologo({ fecha: hoy });
      console.log('Respuesta del servidor (dashboard):', response); // Para debugging
      
      let citasData = [];
      // Verificar la estructura de la respuesta
      if (response.success && response.datos && response.datos.citas) {
        citasData = response.datos.citas;
      } else if (response.success && response.data && response.data.citas) {
        citasData = response.data.citas;
      } else if (response.data && Array.isArray(response.data)) {
        citasData = response.data;
      } else if (response.datos && Array.isArray(response.datos)) {
        citasData = response.datos;
      } else {
        console.warn('Estructura de respuesta inesperada:', response);
      }
      
      setCitas(citasData);
      
      // Calcular estadísticas
      const citasHoy = citasData.length || 0;
      setEstadisticas(prev => ({
        ...prev,
        citasHoy
      }));
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar una cita
  const manejarIniciarCita = async (citaId) => {
    try {
      await citaService.iniciarCita(citaId);
      toast.success('Cita iniciada correctamente');
      cargarCitasHoy();
    } catch (error) {
      console.error('Error al iniciar cita:', error);
      toast.error('Error al iniciar la cita');
    }
  };

  // Completar una cita
  const manejarCompletarCita = async (notasOdontologo = '') => {
    try {
      setModalCompletarCita(prev => ({ ...prev, loading: true }));
      await citaService.completarCita(modalCompletarCita.cita.id, notasOdontologo);
      toast.success('Cita completada correctamente');
      setModalCompletarCita({ isOpen: false, cita: null, loading: false });
      cargarCitasHoy();
    } catch (error) {
      console.error('Error al completar cita:', error);
      toast.error('Error al completar la cita');
      setModalCompletarCita(prev => ({ ...prev, loading: false }));
    }
  };

  // Abrir modal para completar cita
  const abrirModalCompletarCita = (cita) => {
    setModalCompletarCita({
      isOpen: true,
      cita: cita,
      loading: false
    });
  };

  // Cerrar modal
  const cerrarModalCompletarCita = () => {
    if (!modalCompletarCita.loading) {
      setModalCompletarCita({ isOpen: false, cita: null, loading: false });
    }
  };

  // Formatear fecha y hora
  const formatearFechaHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return {
      hora: fecha.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      fecha: fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };
  };

  // Obtener color del estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener etiqueta del estado
  const obtenerEtiquetaEstado = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'en_proceso':
        return 'En Proceso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Conectarse a la sala del odontólogo para recibir notificaciones
      joinOdontologoRoom(user.id);
      
      // Cargar citas del día
      cargarCitasHoy();

      // Escuchar nuevas citas asignadas
      onNuevaCitaAsignada((data) => {
        toast.success('Nueva cita asignada');
        cargarCitasHoy();
      });

      // Escuchar actualizaciones de citas
      onCitaActualizadaOdontologo((data) => {
        cargarCitasHoy();
      });

      return () => {
        leaveOdontologoRoom(user.id);
        offNuevaCitaAsignada();
        offCitaActualizadaOdontologo();
      };
    }
  }, [user?.id]);

  return (
    <OdontologoLayout>
      <div className="space-y-8">
        {/* Mensaje de bienvenida */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, Dr. {user?.nombre} {user?.apellido}
          </h1>
          <p>Gestiona tus citas y consulta tu agenda desde este panel.</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasHoy}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasSemana}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasMes}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 flex-shrink-0">
                <FiUser className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Pacientes Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pacientesAtendidos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Citas de hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Citas de Hoy</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando citas...</p>
              </div>
            ) : citas.length > 0 ? (
              <div className="space-y-4">
                {citas.map((cita) => {
                  const { hora, fecha } = formatearFechaHora(cita.fechaHora);
                  return (
                    <div key={cita.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <FiUser className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {cita.cliente?.nombre} {cita.cliente?.apellido}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {cita.tipoConsulta} - {cita.categoria?.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiClock className="h-4 w-4 mr-1" />
                              {hora}
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-1" />
                              {cita.duracion} min
                            </div>
                          </div>
                          {cita.detalles && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <FiFileText className="inline h-4 w-4 mr-1" />
                              {cita.detalles}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(cita.estado)}`}>
                            {obtenerEtiquetaEstado(cita.estado)}
                          </span>
                          <div className="flex space-x-2">
                            {cita.estado === 'confirmada' && (
                              <button
                                onClick={() => manejarIniciarCita(cita.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                title="Iniciar cita"
                              >
                                <FiPlay className="h-3 w-3 mr-1" />
                                Iniciar
                              </button>
                            )}
                            {cita.estado === 'en_proceso' && (
                              <button
                                onClick={() => abrirModalCompletarCita(cita)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors flex items-center"
                                title="Completar cita"
                              >
                                <FiCheck className="h-3 w-3 mr-1" />
                                Completar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No tienes citas programadas para hoy</p>
                <p className="text-gray-400 text-sm">Las nuevas citas asignadas aparecerán aquí automáticamente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para completar cita */}
      <CompletarCitaModal
        isOpen={modalCompletarCita.isOpen}
        onClose={cerrarModalCompletarCita}
        onComplete={manejarCompletarCita}
        cita={modalCompletarCita.cita}
        loading={modalCompletarCita.loading}
      />
    </OdontologoLayout>
  );
};

export default OdontologoDashboard;