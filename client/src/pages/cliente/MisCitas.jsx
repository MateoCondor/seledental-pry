import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiFileText, FiX, FiPlus, FiRefreshCw, FiEdit3, FiEye, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ClienteLayout from '../../components/layouts/ClienteLayout';
import citaService from '../../services/citaService';
import CancelarCitaModal from '../../components/modals/CancelarCitaModal';
import ReagendarCitaModal from '../../components/modals/ReagendarCitaModal';

/**
 * Página para ver mis citas (clientes)
 * @returns {JSX.Element} Componente de mis citas
 */
const MisCitas = () => {
  const navigate = useNavigate(); 
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Estados para modal de cancelación
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [isModalCancelarOpen, setIsModalCancelarOpen] = useState(false);

  // Estados para modal de reagendamiento
  const [citaAReagendar, setCitaAReagendar] = useState(null);
  const [isModalReagendarOpen, setIsModalReagendarOpen] = useState(false);

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
    setIsModalCancelarOpen(true);
  };

  /**
   * Manejar reagendamiento de cita
   * @param {Object} cita - Cita a reagendar
   */
  const handleReagendarCita = (cita) => {
    setCitaAReagendar(cita);
    setIsModalReagendarOpen(true);
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
      setIsModalCancelarOpen(false);
      setCitaACancelar(null);
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      toast.error(error.response?.data?.mensaje || 'Error al cancelar la cita');
    }
  };

  /**
   * Confirmar reagendamiento de cita
   * @param {string} fechaHora - Nueva fecha y hora
   * @param {string} motivo - Motivo del reagendamiento
   */
  const confirmarReagendamiento = async (fechaHora, motivo) => {
    try {
      await citaService.reagendarCita(citaAReagendar.id, fechaHora, motivo);
      toast.success('Cita reagendada exitosamente');
      loadCitas(); // Recargar citas
      setIsModalReagendarOpen(false);
      setCitaAReagendar(null);
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      toast.error(error.response?.data?.mensaje || 'Error al reagendar la cita');
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
  const puedeCancelar = (cita) => {
    const estadosNoCancelables = ['completada', 'cancelada', 'no_asistio'];
    if (estadosNoCancelables.includes(cita.estado)) return false;

    // Verificar que falten más de 24 horas
    const fechaCita = new Date(cita.fechaHora);
    const ahora = new Date();
    const horasRestantes = (fechaCita - ahora) / (1000 * 60 * 60);

    return horasRestantes > 24;
  };

  /**
   * Verificar si una cita se puede reagendar
   * @param {Object} cita - Cita a verificar
   * @returns {boolean} - Si se puede reagendar
   */
  const puedeReagendar = (cita) => {
    const estadosNoReagendables = ['completada', 'cancelada', 'no_asistio'];
    if (estadosNoReagendables.includes(cita.estado)) return false;

    // Verificar que falten más de 24 horas
    const fechaCita = new Date(cita.fechaHora);
    const ahora = new Date();
    const horasRestantes = (fechaCita - ahora) / (1000 * 60 * 60);

    return horasRestantes > 24;
  };

  return (
    <ClienteLayout>
      <div className="space-y-8">
        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/cliente/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="mr-2 h-5 w-5" />
          Volver al inicio
        </button>
        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              Gestiona tus citas médicas
            </p>
          </div>

          <div className="flex gap-3">
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

        {/* Tarjetas de filtros */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'todas', label: 'Todas', icon: FiEye, color: 'bg-gray-100 text-gray-800' },
            { key: 'pendiente', label: 'Pendientes', icon: FiClock, color: 'bg-yellow-100 text-yellow-800' },
            { key: 'confirmada', label: 'Confirmadas', icon: FiCalendar, color: 'bg-blue-100 text-blue-800' },
            { key: 'completada', label: 'Completadas', icon: FiUser, color: 'bg-green-100 text-green-800' },
            { key: 'cancelada', label: 'Canceladas', icon: FiX, color: 'bg-red-100 text-red-800' }
          ].map((filtro) => {
            const Icon = filtro.icon;
            const isActive = filtroEstado === filtro.key;

            return (
              <button
                key={filtro.key}
                onClick={() => setFiltroEstado(filtro.key)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${isActive
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {filtro.label}
                  </span>
                </div>
              </button>
            );
          })}
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
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas</h3>
              <p className="text-gray-500 mb-6">
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
                Agendar Primera Cita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {citas.map((cita) => (
                <div key={cita.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Header de la cita */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                          {getEstadoTexto(cita.estado)}
                        </span>

                        {cita.odontologo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <FiUser className="h-3 w-3 text-green-600" />
                            </div>
                            Dr. {cita.odontologo.nombre} {cita.odontologo.apellido}
                          </div>
                        )}
                      </div>

                      {/* Información principal */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Tipo de consulta</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {cita.tipoConsulta.replace('_', ' ')} - {cita.categoria.replace(/_/g, ' ')}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                              <FiCalendar className="mr-1 h-4 w-4" />
                              Fecha y Hora
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <FiClock className="mr-1 h-4 w-4" />
                              {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {cita.detalles && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                              <FiFileText className="mr-1 h-4 w-4" />
                              Detalles
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">{cita.detalles}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Información adicional */}
                      {(cita.motivoCancelacion || cita.fechaAnterior || cita.notasOdontologo) && (
                        <div className="space-y-3 pt-3 border-t border-gray-200">
                          {cita.motivoCancelacion && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                              <p className="text-sm text-red-700">
                                <strong>Motivo de cancelación:</strong> {cita.motivoCancelacion}
                              </p>
                            </div>
                          )}

                          {cita.fechaAnterior && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                              <p className="text-sm text-blue-700">
                                <strong>Reagendada desde:</strong> {new Date(cita.fechaAnterior).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {cita.motivoReagendamiento && (
                                <p className="text-sm text-blue-700 mt-1">
                                  <strong>Motivo:</strong> {cita.motivoReagendamiento}
                                </p>
                              )}
                            </div>
                          )}

                          {cita.notasOdontologo && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                              <p className="text-sm text-green-700">
                                <strong>Notas del odontólogo:</strong> {cita.notasOdontologo}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex lg:flex-col gap-2">
                      {puedeReagendar(cita) && (
                        <button
                          onClick={() => handleReagendarCita(cita)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="mr-1 h-4 w-4" />
                          Reagendar
                        </button>
                      )}

                      {puedeCancelar(cita) && (
                        <button
                          onClick={() => handleCancelarCita(cita)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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
        isOpen={isModalCancelarOpen}
        onClose={() => setIsModalCancelarOpen(false)}
        onConfirm={confirmarCancelacion}
        cita={citaACancelar}
      />

      {/* Modal de reagendamiento */}
      <ReagendarCitaModal
        isOpen={isModalReagendarOpen}
        onClose={() => setIsModalReagendarOpen(false)}
        onConfirm={confirmarReagendamiento}
        cita={citaAReagendar}
      />
    </ClienteLayout>
  );
};

export default MisCitas;