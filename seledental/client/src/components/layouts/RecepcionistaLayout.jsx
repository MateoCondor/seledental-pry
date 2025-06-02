import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiCalendar } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

/**
 * Layout para páginas de recepcionista
 * @param {Object} props - Propiedades del componente
 * @param {JSX.Element} props.children - Contenido de la página
 * @param {string} props.title - Título de la página
 * @returns {JSX.Element} Componente de layout
 */
const RecepcionistaLayout = ({ children, title }) => {
  // Estado para controlar la visibilidad del menú en dispositivos móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Hook de autenticación
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Enlaces del menú
  const navLinks = [
    { 
      name: 'Inicio', 
      path: '/recepcionista/dashboard', 
      icon: <FiHome className="h-5 w-5" /> 
    },
    { 
      name: 'Calendario', 
      path: '/recepcionista/calendario', 
      icon: <FiCalendar className="h-5 w-5" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">SeleDental</h1>
              </div>
            </div>
            
            {/* Botón de menú móvil */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Menú de escritorio */}
            <nav className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.nombre} {user?.apellido}
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100"
                    title="Cerrar sesión"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
        
        {/* Menú móvil */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="mr-3">{link.icon}</span>
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.nombre} {user?.apellido}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={logout}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 w-full text-left"
                >
                  <div className="flex items-center">
                    <FiLogOut className="mr-3 h-5 w-5" />
                    Cerrar sesión
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4">
            <div className="flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="mr-3 text-gray-500">{link.icon}</div>
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    Recepcionista
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 flex items-center text-sm text-red-500 hover:text-red-700"
              >
                <FiLogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>
        
        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecepcionistaLayout;
