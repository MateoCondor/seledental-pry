import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import usuarioService from '../../services/usuarioService';
import useAuth from '../../hooks/useAuth';
import RecepcionistaLayout from '../../components/layouts/RecepcionistaLayout';
import ClienteModal from '../../components/modals/ClienteModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

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
  // Estado para almacenar la lista de clientes
  const [clientes, setClientes] = useState([]);
  // Estado para manejar la carga de clientes
  const [loadingClientes, setLoadingClientes] = useState(true);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el cliente seleccionado
  const [selectedCliente, setSelectedCliente] = useState(null);
  // Estado para controlar la visibilidad del modal de cliente
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  // Estado para controlar la visibilidad del modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Estado para almacenar el ID del cliente a eliminar
  const [clienteToDelete, setClienteToDelete] = useState(null);

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
        'Error al cargar los datos del perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los clientes
  const loadClientes = async () => {
    setLoadingClientes(true);
    try {
      const data = await usuarioService.getUsuarios();
      if (data && data.datos && data.datos.usuarios) {
        setClientes(data.datos.usuarios);
      } else {
        console.error('Estructura de respuesta inválida:', data);
        setClientes([]);
        toast.error('Error en el formato de respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error(
        error.response?.data?.mensaje ||
        'Error al cargar la lista de clientes'
      );
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Efecto para cargar el perfil al montar el componente
  useEffect(() => {
    loadPerfil();
    loadClientes();
  }, [authUser]);

  // Filtramos los clientes según el término de búsqueda
  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.cedula && cliente.cedula.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para abrir el modal para crear un nuevo cliente
  const handleCreate = () => {
    setSelectedCliente(null);
    setIsClienteModalOpen(true);
  };

  // Función para abrir el modal para editar un cliente
  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setIsClienteModalOpen(true);
  };

  // Función para abrir el modal de confirmación para eliminar
  const handleDeleteConfirm = (cliente) => {
    setClienteToDelete(cliente);
    setIsConfirmModalOpen(true);
  };

  // Función para guardar un cliente (crear o actualizar)
  const handleSaveCliente = async (clienteData) => {
    try {
      if (selectedCliente) {
        // Actualizar cliente existente
        await usuarioService.updateUsuario(selectedCliente.id, clienteData);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Crear nuevo cliente
        await usuarioService.createUsuario(clienteData);
        toast.success('Cliente creado correctamente');
      }

      // Recargamos la lista de clientes
      loadClientes();
      // Cerramos el modal
      setIsClienteModalOpen(false);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error(
        error.response?.data?.mensaje ||
        'Error al guardar el cliente'
      );
    }
  };

  // Función para eliminar un cliente
  const handleDelete = async () => {
    if (!clienteToDelete) return;

    try {
      await usuarioService.deleteUsuario(clienteToDelete.id);
      toast.success('Cliente eliminado correctamente');

      // Recargamos la lista de clientes
      loadClientes();
      // Cerramos el modal de confirmación
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error(error.response?.data?.mensaje || 'Error al eliminar el cliente');
    }
  };

  // Calcular estadísticas
  const estadisticas = {
    total: clientes.length,
    completados: clientes.filter(c => c.perfilCompleto).length,
    pendientes: clientes.filter(c => !c.perfilCompleto).length,
  };

  return (
    <RecepcionistaLayout title="">
      <div className="space-y-8">
        {/* Encabezado del dashboard */}
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
                    <FiUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 truncate">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 flex-shrink-0">
                    <FiUser className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 truncate">Perfiles Completos</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.completados}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 flex-shrink-0">
                    <FiUser className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 truncate">Perfiles Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestión de clientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Gestión de Clientes</h2>
                    <p className="text-sm text-gray-600">Administra todos los clientes del sistema</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar clientes..."
                        className="input pl-10 pr-4 min-w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleCreate}
                      className="inline-flex items-center justify-center px-4 py-2.5 btn btn-primary whitespace-nowrap"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Nuevo Cliente
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingClientes ? (
                  <div className="flex justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-600">Cargando clientes...</span>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cédula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClientes.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FiUsers className="h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-gray-500 font-medium">No se encontraron clientes</p>
                              <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <tr key={cliente.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {cliente.nombre} {cliente.apellido}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {cliente.celular || 'Sin teléfono'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cliente.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cliente.cedula || 'Sin cédula'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${cliente.perfilCompleto
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {cliente.perfilCompleto ? 'Completo' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEdit(cliente)}
                                  className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Editar cliente"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteConfirm(cliente)}
                                  className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Eliminar cliente"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar cliente */}
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={selectedCliente}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar a ${clienteToDelete?.nombre} ${clienteToDelete?.apellido}? Esta acción no se puede deshacer.`}
        confirmButtonText="Eliminar"
      />
    </RecepcionistaLayout>
  );
};

export default RecepcionistaDashboard;