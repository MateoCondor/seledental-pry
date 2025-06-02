import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
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

  return (
    <AdminLayout title="Panel de Administración">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Gestión de Usuarios
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleCreate}
              className="btn btn-primary  flex items-center justify-center sm:justify-start"
            >
              <FiPlus className="h-5 w-5 mr-2" />
              Nuevo Usuario
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Nombre Completo</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Rol</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {usuario.nombre} {usuario.apellido}
                      </td>
                      <td className="py-3 px-4">{usuario.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.rol === 'administrador' 
                            ? 'bg-purple-100 text-purple-800' 
                            : usuario.rol === 'recepcionista'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded"
                            title="Editar"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          
                          {/* No permitir eliminar el usuario actual */}
                          {usuario.id !== user.id && (
                            <button
                              onClick={() => handleDeleteConfirm(usuario)}
                              className="p-1 text-red-600 hover:text-red-800 rounded"
                              title="Eliminar"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para crear/editar usuario */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsuario}
        usuario={selectedUsuario}
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
