import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import PropTypes from 'prop-types';
/**
 * Componente para proteger rutas según el rol del usuario
 * @param {Object} props - Propiedades del componente
 * @param {string|string[]} props.allowedRoles - Rol o roles permitidos para acceder a la ruta
 * @returns {JSX.Element} Componente renderizado o redirección
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Convertimos allowedRoles a un array si no lo es
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Si aún estamos cargando, mostramos un indicador
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no está permitido, redirigimos a la página correspondiente
  if (!roles.includes(user.rol)) {
    // Redireccionamos según el rol del usuario
    switch (user.rol) {
      case 'administrador':
        return <Navigate to="/admin/dashboard" replace />;
      case 'recepcionista':
        return <Navigate to="/recepcionista/dashboard" replace />;
      case 'cliente':
        return <Navigate to="/cliente/dashboard" replace />;
      case 'odontologo':
        return <Navigate to="/odontologo/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Si el rol está permitido, mostramos los children
  return children;
};

RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
   allowedRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
};

export default RoleRoute;
