import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiFileText, FiArrowLeft, FiCheck, FiArrowRight } from 'react-icons/fi';
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
    const fechaForm = watch('fecha');
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
            setFechaSeleccionada(fechaForm);
            loadHorariosDisponibles(fechaForm);
            joinDateRoom(fechaForm);

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
    }, [fechaForm]);

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
        setValue('hora', '');
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
            if (!data.fecha || !data.hora) {
                toast.error('Faltan datos de fecha u hora');
                return;
            }

            const fechaHoraCompleta = `${data.fecha}T${data.hora}:00`;

            const citaData = {
                tipoConsulta: data.tipoConsulta,
                categoria: data.categoria,
                fechaHora: fechaHoraCompleta,
                detalles: data.detalles || ''
            };

            const response = await citaService.crearCita(citaData);

            if (response.success) {
                toast.success('¡Cita agendada exitosamente!');
                reset();
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

    const pasos = [
        { numero: 1, titulo: 'Tipo de Consulta', icono: FiUser },
        { numero: 2, titulo: 'Fecha y Hora', icono: FiCalendar },
        { numero: 3, titulo: 'Detalles', icono: FiFileText },
        { numero: 4, titulo: 'Confirmación', icono: FiCheck }
    ];

    return (
        <ClienteLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Botón de regreso */}
                <button
                    onClick={() => navigate('/cliente/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <FiArrowLeft className="mr-2 h-5 w-5" />
                    Volver al inicio
                </button>

                {/* Indicador de pasos mejorado */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        {pasos.map((item, index) => {
                            const Icono = item.icono;
                            const isActive = paso === item.numero;
                            const isCompleted = paso > item.numero;
                            
                            return (
                                <div key={item.numero} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                            isCompleted
                                                ? 'bg-green-100 text-green-600'
                                                : isActive
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {isCompleted ? (
                                                <FiCheck className="h-6 w-6" />
                                            ) : (
                                                <Icono className="h-6 w-6" />
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium text-center ${
                                            isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                            {item.titulo}
                                        </span>
                                    </div>
                                    {index < pasos.length - 1 && (
                                        <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-200 ${
                                            paso > item.numero ? 'bg-green-200' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-8">
                        {/* Paso 1: Tipo de Consulta y Categoría */}
                        {paso === 1 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="h-8 w-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona el tipo de consulta</h2>
                                    <p className="text-gray-600">Elige la opción que mejor describa tu necesidad</p>
                                </div>

                                {/* Tipo de consulta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Tipo de consulta *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.keys(categorias).map((tipo) => (
                                            <label key={tipo} className="relative group cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={tipo}
                                                    className="sr-only peer"
                                                    {...register('tipoConsulta', { required: 'Selecciona un tipo de consulta' })}
                                                />
                                                <div className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 hover:shadow-md transition-all duration-200 group-hover:scale-105">
                                                    <div className="w-12 h-12 bg-gray-100 peer-checked:bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <FiUser className="h-6 w-6 text-gray-600 peer-checked:text-white" />
                                                    </div>
                                                    <h3 className="font-semibold text-center capitalize mb-2">
                                                        {tipo.replace('_', ' ')}
                                                    </h3>
                                                    <p className="text-sm text-center opacity-75">
                                                        {tipo === 'general' && 'Consultas básicas y diagnósticos'}
                                                        {tipo === 'control' && 'Seguimiento de tratamientos'}
                                                        {tipo === 'urgencia' && 'Atención inmediata'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.tipoConsulta && (
                                        <p className="mt-3 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.tipoConsulta.message}
                                        </p>
                                    )}
                                </div>

                                {/* Categoría */}
                                {tipoConsulta && categorias[tipoConsulta] && (
                                    <div className="pt-6 border-t border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-4">
                                            Categoría específica *
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categorias[tipoConsulta].map((cat) => (
                                                <label key={cat.value} className="relative group cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value={cat.value}
                                                        className="sr-only peer"
                                                        {...register('categoria', { required: 'Selecciona una categoría' })}
                                                    />
                                                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                                        <span className="font-medium">{cat.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.categoria && (
                                            <p className="mt-3 text-sm text-red-600 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.categoria.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 2: Fecha y Hora */}
                        {paso === 2 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCalendar className="h-8 w-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona fecha y hora</h2>
                                    <p className="text-gray-600">Elige el día y horario que mejor se adapte a ti</p>
                                </div>

                                {/* Selector de fecha */}
                                <div className="max-w-md mx-auto">
                                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de la cita *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiCalendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            id="fecha"
                                            min={getFechaMinima()}
                                            className="input pl-10"
                                            onChange={handleFechaChange}
                                            {...register('fecha', { required: 'Selecciona una fecha' })}
                                        />
                                    </div>
                                    {errors.fecha && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.fecha.message}
                                        </p>
                                    )}
                                </div>

                                {/* Selector de hora */}
                                {fechaForm && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                            Horarios disponibles para {new Date(fechaForm + 'T00:00:00').toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </h3>

                                        {loadingHorarios ? (
                                            <div className="flex justify-center py-12">
                                                <div className="flex items-center space-x-3">
                                                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-gray-600">Cargando horarios disponibles...</span>
                                                </div>
                                            </div>
                                        ) : horariosDisponibles.length > 0 ? (
                                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {horariosDisponibles.map((horario) => (
                                                    <label key={horario} className="relative group cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            value={horario}
                                                            className="sr-only peer"
                                                            {...register('hora', { required: 'Selecciona una hora' })}
                                                        />
                                                        <div className="p-4 text-center border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 group-hover:scale-105">
                                                            <FiClock className="h-5 w-5 mx-auto mb-2" />
                                                            <span className="text-sm font-medium">{horario}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FiCalendar className="h-10 w-10 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios disponibles</h3>
                                                <p className="text-gray-500">Selecciona otra fecha para ver los horarios disponibles</p>
                                            </div>
                                        )}

                                        {errors.hora && (
                                            <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.hora.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 3: Detalles */}
                        {paso === 3 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiFileText className="h-8 w-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles adicionales</h2>
                                    <p className="text-gray-600">Comparte información que pueda ser útil para tu consulta</p>
                                </div>

                                <div className="max-w-2xl mx-auto">
                                    <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-2">
                                        Síntomas o detalles (opcional)
                                    </label>
                                    <textarea
                                        id="detalles"
                                        rows={6}
                                        className="input resize-none"
                                        placeholder="Describe tus síntomas, molestias o cualquier información adicional que consideres importante para tu consulta..."
                                        {...register('detalles')}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Esta información ayudará al odontólogo a prepararse mejor para tu consulta
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Paso 4: Confirmación */}
                        {paso === 4 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmar cita</h2>
                                    <p className="text-gray-600">Revisa los detalles de tu cita antes de confirmar</p>
                                </div>

                                <div className="max-w-2xl mx-auto">
                                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
                                        <h3 className="font-semibold text-gray-900 mb-6 text-center text-lg">Resumen de tu cita</h3>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <span className="text-gray-600 font-medium">Tipo de consulta:</span>
                                                <span className="font-semibold text-gray-900 capitalize">
                                                    {tipoConsulta?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <span className="text-gray-600 font-medium">Categoría:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {categorias[tipoConsulta]?.find(cat => cat.value === categoria)?.label}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <span className="text-gray-600 font-medium">Fecha:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {fechaForm && new Date(fechaForm + 'T00:00:00').toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <span className="text-gray-600 font-medium">Hora:</span>
                                                <span className="font-semibold text-gray-900 flex items-center">
                                                    <FiClock className="mr-2 h-4 w-4" />
                                                    {horaForm}
                                                </span>
                                            </div>

                                            {watch('detalles') && (
                                                <div className="py-3">
                                                    <span className="text-gray-600 font-medium block mb-2">Detalles:</span>
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <p className="text-sm text-gray-700">{watch('detalles')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Importante:</strong> Tu cita quedará como "pendiente" hasta que sea confirmada por nuestro personal.
                                                    Te contactaremos para confirmar los detalles y enviarte recordatorios.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botones de navegación */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={pasoAnterior}
                            disabled={paso === 1}
                            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                paso === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                            }`}
                        >
                            <FiArrowLeft className="mr-2 h-4 w-4" />
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
                                className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primaryDark disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                Siguiente
                                <FiArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Agendando cita...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck className="mr-2 h-4 w-4" />
                                        Agendar Cita
                                    </>
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