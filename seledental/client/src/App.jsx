import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Páginas de autenticación
import LoginPage from './pages/LoginPage';

// Páginas del administrador
import AdminDashboard from './pages/admin/AdminDashboard';

// Páginas del recepcionista
import RecepcionistaDashboard from './pages/recepcionista/RecepcionistaDashboard';

// Páginas del cliente
import ClienteDashboard from './pages/cliente/ClienteDashboard';

/**
 * Componente principal de la aplicación
 * Contiene las rutas y la lógica de autenticación
 * @returns {JSX.Element} Componente principal
 */
function App() {
  return (
    <Router>
      {/* Proveedor de autenticación para toda la aplicación */}
      <AuthProvider>
        <Routes>
          {/* Ruta por defecto - Redirecciona al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Ruta de inicio de sesión */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas para administrador */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRoles="administrador">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  {/* Aquí se pueden agregar más rutas de administrador */}
                  <Route path="usuarios" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          } />
          
          {/* Rutas para recepcionista */}
          <Route path="/recepcionista/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRoles="recepcionista">
                <Routes>
                  <Route path="dashboard" element={<RecepcionistaDashboard />} />
                  {/* Aquí se pueden agregar más rutas de recepcionista */}
                  <Route path="calendario" element={<RecepcionistaDashboard />} />
                  <Route path="*" element={<Navigate to="/recepcionista/dashboard" replace />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          } />
          
          {/* Rutas para cliente */}
          <Route path="/cliente/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRoles="cliente">
                <Routes>
                  <Route path="dashboard" element={<ClienteDashboard />} />
                  {/* Aquí se pueden agregar más rutas de cliente */}
                  <Route path="citas" element={<ClienteDashboard />} />
                  <Route path="historial" element={<ClienteDashboard />} />
                  <Route path="*" element={<Navigate to="/cliente/dashboard" replace />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          } />
          
          {/* Ruta 404 - Redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* Componente para mostrar notificaciones toast */}
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
