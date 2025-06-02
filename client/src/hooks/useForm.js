import { useState } from 'react';

/**
 * Hook personalizado para manejar formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} validate - Función para validar los campos (opcional)
 * @returns {Object} Objeto con funciones y estado del formulario
 */
const useForm = (initialValues, onSubmit, validate) => {
  // Estado para almacenar los valores del formulario
  const [values, setValues] = useState(initialValues);
  // Estado para almacenar los errores de validación
  const [errors, setErrors] = useState({});
  // Estado para indicar si el formulario ha sido enviado
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja los cambios en los campos del formulario
   * @param {Event} e - Evento de cambio
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Maneja diferentes tipos de input
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /**
   * Establece un valor específico en el formulario
   * @param {string} name - Nombre del campo
   * @param {*} value - Valor a establecer
   */
  const setValue = (name, value) => {
    setValues({
      ...values,
      [name]: value
    });
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento de envío
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si hay una función de validación, la ejecutamos
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Si hay errores, no continuamos
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    // Marcamos que el formulario está siendo enviado
    setIsSubmitting(true);
    
    try {
      // Ejecutamos la función de envío
      await onSubmit(values);
      
      // Reiniciamos los errores
      setErrors({});
    } catch (err) {
      // Si hay un error, lo manejamos
      console.error('Error al enviar el formulario:', err);
      
      // Si el error tiene un formato específico (errores de validación del backend)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      // Marcamos que el formulario ya no está siendo enviado
      setIsSubmitting(false);
    }
  };

  /**
   * Reinicia el formulario a sus valores iniciales
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValue,
    resetForm
  };
};

export default useForm;
