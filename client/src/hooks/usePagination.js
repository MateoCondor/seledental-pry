import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejar la paginación
 * @param {Array} items - Lista de elementos a paginar
 * @param {number} itemsPerPage - Elementos por página
 * @returns {Object} Objeto con datos y funciones de paginación
 */
const usePagination = (items = [], itemsPerPage = 10) => {
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculamos el número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);
  
  // Obtenemos los elementos de la página actual
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  /**
   * Cambia a la página especificada
   * @param {number} pageNumber - Número de página
   */
  const goToPage = (pageNumber) => {
    // Validamos que sea un número válido de página
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  /**
   * Avanza a la siguiente página
   */
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  /**
   * Retrocede a la página anterior
   */
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  /**
   * Va a la primera página
   */
  const firstPage = () => {
    setCurrentPage(1);
  };
  
  /**
   * Va a la última página
   */
  const lastPage = () => {
    setCurrentPage(totalPages);
  };
  
  // Si cambia el número total de elementos, ajustamos la página actual
  // para evitar páginas vacías
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage
  };
};

export default usePagination;
