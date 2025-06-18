import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiFileText, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ClienteLayout from '../../components/layouts/ClienteLayout';
import citaService from '../../services/citaService';
import useWebSocket from '../../hooks/useWebSocket';

/**
 * Página para agendar citas (clientes)
 * @returns {JSX.Element} Componente de agendamiento de citas
 */
const AgendarCita = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm();

    // Estados para el formulario
    const [paso, setPaso] = useState(1);
    const [categorias, setCategorias] = useState({});
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // WebSocket para actualizaciones en tiempo real
    const { joinDateRoom, leaveDateRoom, onHorariosUpdated, offHorariosUpdated } = useWebSocket();

    // Observar campos del formulario
    const tipoConsulta = watch('tipoConsulta');
    const categoria = watch('categoria');
    const fechaForm = watch('fecha'); // Obtener el valor de la fecha del formulario
    const horaForm = watch('hora');

    /**
     * Cargar categorías al montar el componente
     */
    useEffect(() => {
        const loadCategorias = async () => {
            try {
                const response = await citaService.getCategorias();
                if (response.success) {
                    setCategorias(response.datos.categorias);
                }
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                toast.error('Error al cargar las categorías de consulta');
            }
        };

        loadCategorias();
    }, []);

    /**
     * Cargar horarios disponibles cuando se selecciona una fecha
     */
    useEffect(() => {
        if (fechaForm) {
            setFechaSeleccionada(fechaForm); // Sincronizar el estado local
            loadHorariosDisponibles(fechaForm);
            // Unirse a la sala de WebSocket para esta fecha
            joinDateRoom(fechaForm);

            // Escuchar actualizaciones de horarios
            onHorariosUpdated((data) => {
                if (data.fecha === fechaForm) {
                    loadHorariosDisponibles(fechaForm);
                }
            });
        }

        return () => {
            if (fechaForm) {
                leaveDateRoom(fechaForm);
                offHorariosUpdated();
            }
        };
    }, [fechaForm]); // Usar la variable del watch

    /**
     * Cargar horarios disponibles para una fecha
     * @param {string} fecha - Fecha seleccionada
     */
    const loadHorariosDisponibles = async (fecha) => {
        setLoadingHorarios(true);
        try {
            const response = await citaService.getHorariosDisponibles(fecha);
            if (response.success) {
                setHorariosDisponibles(response.datos.horariosDisponibles);
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            toast.error('Error al cargar los horarios disponibles');
        } finally {
            setLoadingHorarios(false);
        }
    };

    /**
     * Manejar cambio de fecha
     * @param {Event} e - Evento de cambio
     */
    const handleFechaChange = (e) => {
        const nuevaFecha = e.target.value;
        setValue('fecha', nuevaFecha);
        setValue('hora', ''); // Limpiar hora seleccionada
    };

    /**
     * Avanzar al siguiente paso
     */
    const siguientePaso = () => {
        if (paso < 4) {
            setPaso(paso + 1);
        }
    };

    /**
     * Retroceder al paso anterior
     */
    const pasoAnterior = () => {
        if (paso > 1) {
            setPaso(paso - 1);
        }
    };

    /**
     * Enviar formulario para crear la cita
     * @param {Object} data - Datos del formulario
     */
    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Debug temporal - puedes eliminar esto después
            console.log('Datos del formulario:', data);

            // Validar que los datos requeridos estén presentes
            if (!data.fecha || !data.hora) {
                toast.error('Faltan datos de fecha u hora');
                return;
            }

            // Construir fecha y hora completa
            const fechaHoraCompleta = `${data.fecha}T${data.hora}:00`;

            const citaData = {
                tipoConsulta: data.tipoConsulta,
                categoria: data.categoria,
                fechaHora: fechaHoraCompleta,
                detalles: data.detalles || ''
            };

            console.log('Datos a enviar:', citaData);

            const response = await citaService.crearCita(citaData);

            if (response.success) {
                toast.success('¡Cita agendada exitosamente!');
                reset();
                // Limpiar estados locales
                setPaso(1);
                setFechaSeleccionada('');
                setHorariosDisponibles([]);
                navigate('/cliente/citas');
            }
        } catch (error) {
            console.error('Error al agendar cita:', error);
            const errorMessage = error.response?.data?.mensaje || 'Error al agendar la cita';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Obtener fecha mínima (mañana)
     */
    const getFechaMinima = () => {
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        return mañana.toISOString().split('T')[0];
    };

    return (
        <ClienteLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cliente/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="mr-2 h-5 w-5" />
                        Volver al inicio
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">Agendar Nueva Cita</h1>
                    <p className="text-gray-600 mt-2">
                        Selecciona el tipo de consulta, fecha y hora para tu cita
                    </p>
                </div>

                {/* Indicador de pasos */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {['Tipo de Consulta', 'Fecha y Hora', 'Detalles', 'Confirmación'].map((titulo, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${paso > index + 1
                                    ? 'bg-green-100 text-green-600'
                                    : paso === index + 1
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {paso > index + 1 ? <FiCheck className="h-5 w-5" /> : index + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${paso >= index + 1 ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {titulo}
                                </span>
                                {index < 3 && (
                                    <div className={`mx-4 h-1 w-16 ${paso > index + 1 ? 'bg-green-200' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        {/* Paso 1: Tipo de Consulta y Categoría */}
                        {paso === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <FiUser className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">Selecciona el tipo de consulta</h2>
                                </div>

                                {/* Tipo de consulta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Tipo de consulta *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.keys(categorias).map((tipo) => (
                                            <label key={tipo} className="relative">
                                                <input
                                                    type="radio"
                                                    value={tipo}
                                                    className="sr-only peer"
                                                    {...register('tipoConsulta', { required: 'Selecciona un tipo de consulta' })}
                                                />
                                                <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 transition-all">
                                                    <h3 className="font-medium capitalize">
                                                        {tipo.replace('_', ' ')}
                                                    </h3>
                                                    <p className="text-sm mt-1 opacity-75">
                                                        {tipo === 'general' && 'Consultas básicas y diagnósticos'}
                                                        {tipo === 'control' && 'Seguimiento de tratamientos'}
                                                        {tipo === 'urgencia' && 'Atención inmediata'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.tipoConsulta && (
                                        <p className="mt-2 text-sm text-red-600">{errors.tipoConsulta.message}</p>
                                    )}
                                </div>

                                {/* Categoría */}
                                {tipoConsulta && categorias[tipoConsulta] && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Categoría específica *
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categorias[tipoConsulta].map((cat) => (
                                                <label key={cat.value} className="relative">
                                                    <input
                                                        type="radio"
                                                        value={cat.value}
                                                        className="sr-only peer"
                                                        {...register('categoria', { required: 'Selecciona una categoría' })}
                                                    />
                                                    <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 transition-all">
                                                        <span className="font-medium">{cat.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.categoria && (
                                            <p className="mt-2 text-sm text-red-600">{errors.categoria.message}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 2: Fecha y Hora */}
                        {paso === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <FiCalendar className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">Selecciona fecha y hora</h2>
                                </div>

                                {/* Selector de fecha */}
                                <div>
                                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de la cita *
                                    </label>
                                    <input
                                        type="date"
                                        id="fecha"
                                        min={getFechaMinima()}
                                        className="input"
                                        onChange={handleFechaChange}
                                        {...register('fecha', { required: 'Selecciona una fecha' })}
                                    />
                                    {errors.fecha && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                                    )}
                                </div>

                                {/* Selector de hora */}
                                {fechaForm && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Horarios disponibles *
                                        </label>

                                        {loadingHorarios ? (
                                            <div className="flex justify-center py-8">
                                                <div className="flex items-center space-x-3">
                                                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-gray-600">Cargando horarios...</span>
                                                </div>
                                            </div>
                                        ) : horariosDisponibles.length > 0 ? (
                                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                                {horariosDisponibles.map((horario) => (
                                                    <label key={horario} className="relative">
                                                        <input
                                                            type="radio"
                                                            value={horario}
                                                            className="sr-only peer"
                                                            {...register('hora', { required: 'Selecciona una hora' })}
                                                        />
                                                        <div className="p-3 text-center border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 transition-all">
                                                            <FiClock className="h-4 w-4 mx-auto mb-1" />
                                                            <span className="text-sm font-medium">{horario}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                                                <p className="text-gray-400 text-sm">Selecciona otra fecha</p>
                                            </div>
                                        )}

                                        {errors.hora && (
                                            <p className="mt-2 text-sm text-red-600">{errors.hora.message}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 3: Detalles */}
                        {paso === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <FiFileText className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">Detalles adicionales</h2>
                                </div>

                                <div>
                                    <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-2">
                                        Síntomas o detalles (opcional)
                                    </label>
                                    <textarea
                                        id="detalles"
                                        rows={4}
                                        className="input resize-none"
                                        placeholder="Describe tus síntomas, molestias o cualquier información adicional que consideres importante..."
                                        {...register('detalles')}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Esta información ayudará al odontólogo a prepararse mejor para tu consulta
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Paso 4: Confirmación */}
                        {paso === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <FiCheck className="h-6 w-6 text-green-600 mr-3" />
                                    <h2 className="text-xl font-semibold">Confirmar cita</h2>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu cita:</h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tipo de consulta:</span>
                                            <span className="font-medium capitalize">{tipoConsulta?.replace('_', ' ')}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Categoría:</span>
                                            <span className="font-medium">
                                                {categorias[tipoConsulta]?.find(cat => cat.value === categoria)?.label}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fecha:</span>
                                            <span className="font-medium">
                                                {fechaForm && new Date(fechaForm + 'T00:00:00').toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hora:</span>
                                            <span className="font-medium">{horaForm}</span>
                                        </div>

                                        {watch('detalles') && (
                                            <div className="pt-3 border-t">
                                                <span className="text-gray-600 block mb-2">Detalles:</span>
                                                <p className="text-sm bg-white p-3 rounded border">
                                                    {watch('detalles')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                <strong>Importante:</strong> Tu cita quedará como "pendiente" hasta que sea confirmada por nuestro personal.
                                                Te contactaremos para confirmar los detalles.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botones de navegación */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                        <button
                            type="button"
                            onClick={pasoAnterior}
                            disabled={paso === 1}
                            className={`btn ${paso === 1 ? 'btn-disabled' : 'btn-secondary'}`}
                        >
                            Anterior
                        </button>

                        {paso < 4 ? (
                            <button
                                type="button"
                                onClick={siguientePaso}
                                disabled={
                                    (paso === 1 && (!tipoConsulta || !categoria)) ||
                                    (paso === 2 && (!fechaForm || !horaForm))
                                }
                                className="btn btn-primary"
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Agendando...
                                    </>
                                ) : (
                                    'Agendar Cita'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </ClienteLayout>
    );
};

export default AgendarCita;