import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiSearch, FiFilter, FiRefreshCw, FiUserPlus } from 'react-icons/fi';
import RecepcionistaLayout from '../../components/layouts/RecepcionistaLayout';
import citaService from '../../services/citaService';
import AsignarOdontologoModal from '../../components/modals/AsignarOdontologoModal';

/**
 * Página para asignar odontólogos a las citas pendientes
 * @returns {JSX.Element} Componente de asignación de citas
 */
const AsignarCitas = () => {
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCitas, setTotalCitas] = useState(0);

  // Estados para el modal de asignación
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Cargar citas pendientes
   */
  const loadCitasPendientes = async (pagina = 1) => {
    setLoading(true);
    try {
      const params = {
        pagina,
        limite: 10
      };

      if (filtroFecha) {
        params.fecha = filtroFecha;
      }

      const response = await citaService.getCitasPendientes(params);
      
      if (response.success) {
        setCitasPendientes(response.datos.citas);
        setTotalPaginas(response.datos.totalPaginas);
        setTotalCitas(response.datos.totalCitas);
        setPaginaActual(response.datos.paginaActual);
      }
    } catch (error) {
      console.error('Error al cargar citas pendientes:', error);
      toast.error('Error al cargar las citas pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitasPendientes();
  }, [filtroFecha]);

  /**
   * Manejar cambio de fecha del filtro
   */
  const handleFechaChange = (e) => {
    setFiltroFecha(e.target.value);
    setPaginaActual(1);
  };

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltroFecha('');
    setSearchTerm('');
    setPaginaActual(1);
  };

  /**
   * Abrir modal de asignación
   */
  const handleAsignarOdontologo = (cita) => {
    setCitaSeleccionada(cita);
    setIsModalOpen(true);
  };

  /**
   * Confirmar asignación de odontólogo
   */
  const confirmarAsignacion = async (odontologoId, observaciones) => {
    try {
      await citaService.asignarOdontologo(citaSeleccionada.id, odontologoId, observaciones);
      toast.success('Odontólogo asignado correctamente');
      
      // Recargar la lista
      loadCitasPendientes(paginaActual);
      
      // Cerrar modal
      setIsModalOpen(false);
      setCitaSeleccionada(null);
    } catch (error) {
      console.error('Error al asignar odontólogo:', error);
      toast.error(error.response?.data?.mensaje || 'Error al asignar el odontólogo');
    }
  };

  /**
   * Filtrar citas por término de búsqueda
   */
  const citasFiltradas = citasPendientes.filter(cita => {
    if (!searchTerm) return true;
    
    const termino = searchTerm.toLowerCase();
    const nombreCompleto = `${cita.cliente?.nombre} ${cita.cliente?.apellido}`.toLowerCase();
    const email = cita.cliente?.email?.toLowerCase() || '';
    const tipoConsulta = cita.tipoConsulta?.toLowerCase() || '';
    const categoria = cita.categoria?.toLowerCase() || '';
    
    return nombreCompleto.includes(termino) || 
           email.includes(termino) ||
           tipoConsulta.includes(termino) ||
           categoria.includes(termino);
  });

  /**
   * Cambiar página
   */
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      loadCitasPendientes(nuevaPagina);
    }
  };

  return (
    <RecepcionistaLayout>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asignación de Odontólogos</h1>
              <p className="text-gray-600 mt-1">
                Gestiona las citas pendientes de asignación de profesional
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <FiCalendar className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Citas Pendientes</p>
                    <p className="text-lg font-bold text-blue-600">{totalCitas}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => loadCitasPendientes(paginaActual)}
                className="btn btn-secondary flex items-center"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por cliente, email o tipo de consulta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="input pl-10"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por fecha */}
            <div className="lg:w-64">
              <label htmlFor="filtroFecha" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por fecha
              </label>
              <input
                type="date"
                id="filtroFecha"
                className="input"
                value={filtroFecha}
                onChange={handleFechaChange}
              />
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="btn btn-primary flex items-center h-10"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Limpiar
              </button>
            </div>
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
          ) : citasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas pendientes</h3>
              <p className="text-gray-500">
                {filtroFecha || searchTerm 
                  ? 'No se encontraron citas con los filtros aplicados'
                  : 'Todas las citas han sido asignadas'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {citasFiltradas.map((cita) => (
                  <div key={cita.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Información de la cita */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {cita.cliente?.nombre} {cita.cliente?.apellido}
                            </h3>
                            <p className="text-sm text-gray-600">{cita.cliente?.email}</p>
                            {cita.cliente?.celular && (
                              <p className="text-sm text-gray-600">{cita.cliente?.celular}</p>
                            )}
                          </div>
                          
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">Fecha</p>
                              <p className="text-gray-600">
                                {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FiClock className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">Hora</p>
                              <p className="text-gray-600">
                                {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">Tipo</p>
                              <p className="text-gray-600 capitalize">
                                {cita.tipoConsulta?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Categoría:</p>
                          <p className="text-gray-600 capitalize">
                            {cita.categoria?.replace(/_/g, ' ')}
                          </p>
                        </div>

                        {cita.detalles && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Detalles:</p>
                            <p className="text-sm text-gray-600">{cita.detalles}</p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="lg:pl-6">
                        <button
                          onClick={() => handleAsignarOdontologo(cita)}
                          className="btn btn-primary flex items-center w-full lg:w-auto"
                        >
                          <FiUserPlus className="mr-2 h-4 w-4" />
                          Asignar Odontólogo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((paginaActual - 1) * 10) + 1} al {Math.min(paginaActual * 10, totalCitas)} de {totalCitas} citas
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      <span className="px-3 py-2 text-sm font-medium text-gray-700">
                        Página {paginaActual} de {totalPaginas}
                      </span>
                      
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de asignación */}
      <AsignarOdontologoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCitaSeleccionada(null);
        }}
        onConfirm={confirmarAsignacion}
        cita={citaSeleccionada}
      />
    </RecepcionistaLayout>
  );
};

export default AsignarCitas;