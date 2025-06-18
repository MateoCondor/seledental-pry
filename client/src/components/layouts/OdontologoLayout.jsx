import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import PropTypes from 'prop-types';

/**
 * Layout para odontólogos
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del layout
 * @returns {JSX.Element} Layout de odontólogo
 */
const OdontologoLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Enlaces del menú
  const navLinks = [
    {
      name: 'Inicio',
      path: '/odontologo/dashboard',
      icon: <FiHome className="h-5 w-5" />
    },
    {
      name: 'Mis Citas',
      path: '/odontologo/citas',
      icon: <FiCalendar className="h-5 w-5" />
    },
    {
      name: 'Mi Perfil',
      path: '/odontologo/perfil',
      icon: <FiUser className="h-5 w-5" />
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barra lateral - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">SeleDental</h1>
        </div>

        {/* Navegación */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-purple-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <div className="mr-3 text-gray-500 group-hover:text-gray-900">{link.icon}</div>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Perfil de usuario - Fijo en la parte inferior */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Dr. {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500 truncate">Odontólogo</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-primary">SeleDental</h1>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-white border-b border-gray-200`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Perfil móvil */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-3 flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  Dr. {user?.nombre} {user?.apellido}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6"></h1>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

OdontologoLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OdontologoLayout;