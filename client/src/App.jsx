import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import PerfilCompletoWrapper from './components/PerfilCompletoWrapper';

// Páginas de autenticación
import LoginPage from './pages/LoginPage';
import RegistroClientePage from './pages/RegistroClientePage';

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
          
          {/* Ruta de registro de clientes */}
          <Route path="/registro" element={<RegistroClientePage />} />
          
          {/* Rutas para administrador */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRoles="administrador">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
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
                <PerfilCompletoWrapper>
                  <Routes>
                    <Route path="dashboard" element={<RecepcionistaDashboard />} />
                    <Route path="calendario" element={<RecepcionistaDashboard />} />
                    <Route path="*" element={<Navigate to="/recepcionista/dashboard" replace />} />
                  </Routes>
                </PerfilCompletoWrapper>
              </RoleRoute>
            </ProtectedRoute>
          } />
          
          {/* Rutas para cliente */}
          <Route path="/cliente/*" element={
            <ProtectedRoute>
              <RoleRoute allowedRoles="cliente">
                <PerfilCompletoWrapper>
                  <Routes>
                    <Route path="dashboard" element={<ClienteDashboard />} />
                    <Route path="citas" element={<ClienteDashboard />} />
                    <Route path="historial" element={<ClienteDashboard />} />
                    <Route path="*" element={<Navigate to="/cliente/dashboard" replace />} />
                  </Routes>
                </PerfilCompletoWrapper>
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