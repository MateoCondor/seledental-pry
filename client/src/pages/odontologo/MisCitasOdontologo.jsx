import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiPlay, FiCheck, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import OdontologoLayout from '../../components/layouts/OdontologoLayout';
import CompletarCitaModal from '../../components/modals/CompletarCitaModal';
import useAuth from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import citaService from '../../services/citaService';

/**
 * Página de Mis Citas para Odontólogos
 * @returns {JSX.Element} Componente de gestión de citas del odontólogo
 */
const MisCitasOdontologo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: ''
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

  // Cargar citas
  const cargarCitas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;

      const response = await citaService.getCitasOdontologo(params);
      console.log('Respuesta del servidor:', response); // Para debugging

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
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar las citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar una cita
  const manejarIniciarCita = async (citaId) => {
    try {
      await citaService.iniciarCita(citaId);
      toast.success('Cita iniciada correctamente');
      cargarCitas();
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
      cargarCitas();
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

  // Manejar cambio de filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    cargarCitas();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      estado: ''
    });
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

  // Obtener etiqueta del tipo de consulta
  const obtenerEtiquetaTipoConsulta = (tipo) => {
    switch (tipo) {
      case 'general':
        return 'General';
      case 'control':
        return 'Control';
      case 'urgencia':
        return 'Urgencia';
      default:
        return tipo;
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Conectarse a la sala del odontólogo para recibir notificaciones
      joinOdontologoRoom(user.id);

      // Cargar citas
      cargarCitas();

      // Escuchar nuevas citas asignadas
      onNuevaCitaAsignada((data) => {
        toast.success('Nueva cita asignada');
        cargarCitas();
      });

      // Escuchar actualizaciones de citas
      onCitaActualizadaOdontologo((data) => {
        cargarCitas();
      });

      return () => {
        leaveOdontologoRoom(user.id);
        offNuevaCitaAsignada();
        offCitaActualizadaOdontologo();
      };
    }
  }, [user?.id]);

  // Recargar citas cuando cambien los filtros
  useEffect(() => {
    if (user?.id) {
      cargarCitas();
    }
  }, [filtros]);

  return (
    <OdontologoLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Citas</h1>
          <p className="text-gray-600">Gestiona todas tus citas asignadas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => manejarCambioFiltro('fecha', e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => manejarCambioFiltro('estado', e.target.value)}
                className="input w-full"
              >
                <option value="">Todos los estados</option>
                <option value="confirmada">Confirmada</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center justify-center px-4 pt-2.5 btn btn-primary whitespace-nowrap"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Limpiar
              </button>
            </div>

          </div>
        </div>

        {/* Lista de Citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Citas ({citas.length})
              </h2>
              <button
                onClick={cargarCitas}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <FiRefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
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
                    <div key={cita.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="">
                        <div className="flex-1">

                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <FiUser className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {cita.cliente?.nombre} {cita.cliente?.apellido}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {obtenerEtiquetaTipoConsulta(cita.tipoConsulta)} - {cita.categoria?.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="flex justify-end flex-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(cita.estado)}`}>
                                {obtenerEtiquetaEstado(cita.estado)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-1" />
                              {fecha}
                            </div>
                            <div className="flex items-center">
                              <FiClock className="h-4 w-4 mr-1" />
                              {hora} ({cita.duracion} min)
                            </div>

                          </div>

                          {cita.detalles && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                <strong>Síntomas/Detalles:</strong> {cita.detalles}
                              </p>
                            </div>
                          )}

                          {cita.observaciones && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                <strong>Observaciones de recepción:</strong> {cita.observaciones}
                              </p>
                            </div>
                          )}

                          {cita.notasOdontologo && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                                <strong>Notas del odontólogo:</strong> {cita.notasOdontologo}
                              </p>
                            </div>
                          )}

                          {cita.cliente?.celular && (
                            <div className="text-sm text-gray-600">
                              <strong>Teléfono:</strong> {cita.cliente.celular}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                          {cita.estado === 'confirmada' && (
                            <button
                              onClick={() => manejarIniciarCita(cita.id)}
                              className="px-4 py-2 bg-secondary text-white text-sm rounded-md hover:bg-secondaryDark transition-colors flex items-center"
                              title="Iniciar cita"
                            >
                              <FiPlay className="h-4 w-4 mr-2" />
                              Iniciar
                            </button>
                          )}
                          {cita.estado === 'en_proceso' && (
                            <button
                              onClick={() => abrirModalCompletarCita(cita)}
                              className="px-4 py-2 bg-accent text-white text-sm rounded-md hover:bg-accentDark transition-colors flex items-center xs:ml-2"
                              title="Completar cita"
                            >
                              <FiCheck className="h-4 w-4 mr-2" />
                              Completar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No se encontraron citas</p>
                <p className="text-gray-400 text-sm">
                  {filtros.fecha || filtros.estado
                    ? 'Intenta ajustar los filtros o limpiarlos'
                    : 'Las nuevas citas asignadas aparecerán aquí automáticamente'
                  }
                </p>
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

export default MisCitasOdontologo;
