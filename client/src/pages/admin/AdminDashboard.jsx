import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiShield, FiUser, FiCalendar} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import usuarioService from '../../services/usuarioService';
import useAuth from '../../hooks/useAuth';
import AdminLayout from '../../components/layouts/AdminLayout';
import UsuarioModal from '../../components/modals/UsuarioModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

/**
 * Página de Dashboard del Administrador
 * @returns {JSX.Element} Componente de panel de administrador
 */
const AdminDashboard = () => {
  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el usuario seleccionado
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  // Estado para controlar la visibilidad del modal de usuario
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para controlar la visibilidad del modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Estado para almacenar el ID del usuario a eliminar
  const [userToDelete, setUserToDelete] = useState(null);
  // Obtenemos el usuario actual
  const { user } = useAuth();

  // Función para cargar los usuarios
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getUsuarios();
      console.log('Respuesta del servicio de usuarios:', data);
      if (data && data.datos && data.datos.usuarios) {
        setUsuarios(data.datos.usuarios);
      } else {
        console.error('Estructura de respuesta inválida:', data);
        setUsuarios([]);
        toast.error('Error en el formato de respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error(
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        'Error al cargar la lista de usuarios'
      );
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los usuarios al montar el componente
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Filtramos los usuarios según el término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para abrir el modal para crear un nuevo usuario
  const handleCreate = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  // Función para abrir el modal para editar un usuario
  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  // Función para abrir el modal de confirmación para eliminar
  const handleDeleteConfirm = (usuario) => {
    setUserToDelete(usuario);
    setIsConfirmModalOpen(true);
  };

  // Función para guardar un usuario (crear o actualizar)
  const handleSaveUsuario = async (userData) => {
    try {
      if (selectedUsuario) {
        // Actualizar usuario existente
        await usuarioService.updateUsuario(selectedUsuario.id, userData);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        await usuarioService.createUsuario(userData);
        toast.success('Usuario creado correctamente');
      }
      // Recargamos la lista de usuarios
      loadUsuarios();
      // Cerramos el modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error(
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        'Error al guardar el usuario'
      );
    }
  };

  // Función para eliminar un usuario
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await usuarioService.deleteUsuario(userToDelete.id);
      toast.success('Usuario eliminado correctamente');

      // Recargamos la lista de usuarios
      loadUsuarios();
      // Cerramos el modal de confirmación
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error(error.response?.data?.mensaje || 'Error al eliminar el usuario');
    }
  };

  // Calcular estadísticas
  const estadisticas = {
    total: usuarios.length,
    administradores: usuarios.filter(u => u.rol === 'administrador').length,
    recepcionistas: usuarios.filter(u => u.rol === 'recepcionista').length,
    odontologos: usuarios.filter(u => u.rol === 'odontologo').length,
    clientes: usuarios.filter(u => u.rol === 'cliente').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 flex-shrink-0">
            <FiUsers className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 flex-shrink-0">
            <FiShield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">Administradores</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.administradores}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
            <FiCalendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">Recepcionistas</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.recepcionistas}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 flex-shrink-0">
            <FiUser className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">Odontólogos</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.odontologos}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 flex-shrink-0">
            <FiUser className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.clientes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de usuarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
                <p className="text-sm text-gray-600">Administra todos los usuarios del sistema</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="input pl-10 pr-4 min-w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center px-4 py-2.5 btn btn-primary whitespace-nowrap"
                >
                  <FiPlus className="h-5 w-5 mr-2" />
                  Nuevo Usuario
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Cargando usuarios...</span>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FiUsers className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
                          <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.nombre} {usuario.apellido}
                              </div>
                              {usuario.id === user.id && (
                                <div className="text-xs text-blue-600 font-medium">
                                  (Tu cuenta)
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${usuario.rol === 'administrador'
                              ? 'bg-purple-100 text-purple-800'
                              : usuario.rol === 'recepcionista'
                                ? 'bg-blue-100 text-blue-800'
                                : usuario.rol === 'odontologo'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(usuario)}
                              className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Editar usuario"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>

                            {/* No permitir eliminar el usuario actual */}
                            {usuario.id !== user.id && (
                              <button
                                onClick={() => handleDeleteConfirm(usuario)}
                                className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Eliminar usuario"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
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

      {/* Modal para crear/editar usuario */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsuario}
        usuario={selectedUsuario}
        currentUser={user}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre} ${userToDelete?.apellido}? Esta acción no se puede deshacer.`}
        confirmButtonText="Eliminar"
      />
    </AdminLayout>
  );
};

export default AdminDashboard;