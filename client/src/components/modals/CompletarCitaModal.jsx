import { useState } from 'react';
import { FiX, FiSave, FiFileText } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * Modal para completar una cita con notas del odontólogo
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de apertura del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onComplete - Función para completar la cita
 * @param {Object} props.cita - Datos de la cita
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Modal para completar cita
 */
const CompletarCitaModal = ({ isOpen, onClose, onComplete, cita, loading = false }) => {
  const [notasOdontologo, setNotasOdontologo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(notasOdontologo);
    setNotasOdontologo(''); // Limpiar el campo después de enviar
  };

  const handleClose = () => {
    if (!loading) {
      setNotasOdontologo('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiFileText className="h-5 w-5 mr-2 text-green-600" />
            Completar Cita
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Información de la cita */}
        {cita && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Información de la Cita</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Paciente:</strong> {cita.cliente?.nombre} {cita.cliente?.apellido}
              </div>
              <div>
                <strong>Tipo:</strong> {cita.tipoConsulta} - {cita.categoria?.replace(/_/g, ' ')}
              </div>
              <div>
                <strong>Fecha/Hora:</strong> {new Date(cita.fechaHora).toLocaleString('es-PE')}
              </div>
              {cita.detalles && (
                <div>
                  <strong>Síntomas/Detalles:</strong> {cita.detalles}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="notasOdontologo" className="block text-sm font-medium text-gray-700 mb-2">
              Notas del Tratamiento
              <span className="text-gray-500 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              id="notasOdontologo"
              value={notasOdontologo}
              onChange={(e) => setNotasOdontologo(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Describe el tratamiento realizado, observaciones importantes, recomendaciones para el paciente, etc."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Estas notas serán visibles para el paciente y el equipo médico.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completando...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Completar Cita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CompletarCitaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  cita: PropTypes.object,
  loading: PropTypes.bool
};

export default CompletarCitaModal;
