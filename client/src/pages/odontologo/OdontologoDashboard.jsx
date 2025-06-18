import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import OdontologoLayout from '../../components/layouts/OdontologoLayout';
import useAuth from '../../hooks/useAuth';

/**
 * Página de Dashboard del Odontólogo
 * @returns {JSX.Element} Componente de panel de odontólogo
 */
const OdontologoDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Datos simulados para estadísticas (se reemplazarán con datos reales cuando se implemente el módulo de citas)
  const estadisticas = {
    citasHoy: 0,
    citasSemana: 0,
    citasMes: 0,
    pacientesAtendidos: 0
  };

  return (
    <OdontologoLayout>
      <div className="space-y-8">
        {/* Mensaje de bienvenida */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, Dr. {user?.nombre} {user?.apellido}
          </h1>
          <p>Gestiona tus citas y consulta tu agenda desde este panel.</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasHoy}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasSemana}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.citasMes}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 flex-shrink-0">
                <FiUser className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Pacientes Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pacientesAtendidos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas citas (placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
            <p className="text-sm text-gray-600">Tus citas programadas para hoy</p>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Funcionalidad en desarrollo</p>
              <p className="text-gray-400 text-sm">Pronto podrás ver y gestionar tus citas aquí</p>
            </div>
          </div>
        </div>
      </div>
    </OdontologoLayout>
  );
};

export default OdontologoDashboard;