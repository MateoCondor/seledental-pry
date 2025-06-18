import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiFileText, FiX, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ClienteLayout from '../../components/layouts/ClienteLayout';
import citaService from '../../services/citaService';
import CancelarCitaModal from '../../components/modals/CancelarCitaModal';

/**
 * Página para ver mis citas (clientes)
 * @returns {JSX.Element} Componente de mis citas
 */
const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Cargar las citas del cliente
   */
  const loadCitas = async () => {
    setLoading(true);
    try {
      const params = filtroEstado !== 'todas' ? { estado: filtroEstado } : {};
      const response = await citaService.getMisCitas(params);
      
      if (response.success) {
        setCitas(response.datos.citas);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar tus citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, [filtroEstado]);

  /**
   * Manejar cancelación de cita
   * @param {Object} cita - Cita a cancelar
   */
  const handleCancelarCita = (cita) => {
    setCitaACancelar(cita);
    setIsModalOpen(true);
  };

  /**
   * Confirmar cancelación de cita
   * @param {string} motivo - Motivo de cancelación
   */
  const confirmarCancelacion = async (motivo) => {
    try {
      await citaService.cancelarCita(citaACancelar.id, motivo);
      toast.success('Cita cancelada exitosamente');
      loadCitas(); // Recargar citas
      setIsModalOpen(false);
      setCitaACancelar(null);
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      toast.error(error.response?.data?.mensaje || 'Error al cancelar la cita');
    }
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

  /**
   * Verificar si una cita se puede cancelar
   * @param {Object} cita - Cita a verificar
   * @returns {boolean} - Si se puede cancelar
   */
  const puedeCancel = (cita) => {
    const estadosNoCancelables = ['completada', 'cancelada', 'no_asistio'];
    if (estadosNoCancelables.includes(cita.estado)) return false;

    // Verificar que falten más de 24 horas
    const fechaCita = new Date(cita.fechaHora);
    const ahora = new Date();
    const horasRestantes = (fechaCita - ahora) / (1000 * 60 * 60);
    
    return horasRestantes > 24;
  };

  return (
    <ClienteLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas tus citas médicas
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={loadCitas}
              className="btn btn-secondary flex items-center"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </button>
            
            <Link
              to="/cliente/agendar-cita"
              className="btn btn-primary flex items-center"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center mr-3">Filtrar por estado:</span>
            
            {['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {estado === 'todas' ? 'Todas' : getEstadoTexto(estado)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Cargando citas...</span>
              </div>
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas</h3>
              <p className="text-gray-500 mb-4">
                {filtroEstado === 'todas' 
                  ? 'Aún no has agendado ninguna cita' 
                  : `No tienes citas ${getEstadoTexto(filtroEstado).toLowerCase()}`
                }
              </p>
              <Link
                to="/cliente/agendar-cita"
                className="btn btn-primary inline-flex items-center"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Agendar Cita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {citas.map((cita) => (
                <div key={cita.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                          {getEstadoTexto(cita.estado)}
                        </span>
                        
                        {cita.odontologo && (
                          <span className="ml-3 text-sm text-gray-600">
                            <FiUser className="inline h-4 w-4 mr-1" />
                            Dr. {cita.odontologo.nombre} {cita.odontologo.apellido}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {cita.tipoConsulta.replace('_', ' ')} - {cita.categoria.replace(/_/g, ' ')}
                          </p>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-2 h-4 w-4" />
                            {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <FiClock className="mr-2 h-4 w-4" />
                            {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {cita.detalles && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              <FiFileText className="inline h-4 w-4 mr-1" />
                              Detalles:
                            </p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {cita.detalles}
                            </p>
                          </div>
                        )}
                      </div>

                      {cita.motivoCancelacion && (
                        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400">
                          <p className="text-sm text-red-700">
                            <strong>Motivo de cancelación:</strong> {cita.motivoCancelacion}
                          </p>
                        </div>
                      )}

                      {cita.notasOdontologo && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400">
                          <p className="text-sm text-blue-700">
                            <strong>Notas del odontólogo:</strong> {cita.notasOdontologo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {puedeCancel(cita) && (
                        <button
                          onClick={() => handleCancelarCita(cita)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <FiX className="mr-1 h-4 w-4" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de cancelación */}
      <CancelarCitaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmarCancelacion}
        cita={citaACancelar}
      />
    </ClienteLayout>
  );
};

export default MisCitas;