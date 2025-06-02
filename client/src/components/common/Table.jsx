import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import usePagination from '../../hooks/usePagination';

/**
 * Componente de tabla genérica con paginación y ordenamiento
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {number} props.itemsPerPage - Elementos por página
 * @param {Function} props.onRowClick - Función a ejecutar al hacer clic en una fila
 * @returns {JSX.Element} Componente de tabla
 */
const Table = ({ 
  columns = [], 
  data = [], 
  itemsPerPage = 10,
  onRowClick = null,
  emptyMessage = 'No hay datos disponibles'
}) => {
  // Estado para la columna de ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  // Estado para la dirección de ordenamiento
  const [sortDirection, setSortDirection] = useState('asc');

  // Ordenamos los datos según la columna y dirección
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.accessor === sortColumn);
      
      if (!column) return 0;
      
      // Si hay una función de ordenamiento personalizada, la usamos
      if (column.sortFn) {
        return column.sortFn(a, b, sortDirection);
      }
      
      // Ordenamiento por defecto
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Manejamos valores nulos o indefinidos
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Comparamos según el tipo de valor
      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Hook de paginación
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage
  } = usePagination(sortedData, itemsPerPage);

  /**
   * Maneja el clic en el encabezado de una columna para ordenar
   * @param {string} accessor - Identificador de la columna
   */
  const handleSort = (accessor) => {
    // Si es la misma columna, cambiamos la dirección
    if (sortColumn === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una columna diferente, establecemos la nueva columna y dirección ascendente
      setSortColumn(accessor);
      setSortDirection('asc');
    }
  };

  /**
   * Renderiza la flecha de ordenamiento
   * @param {string} columnAccessor - Identificador de la columna
   * @returns {JSX.Element} Ícono de flecha
   */
  const renderSortIcon = (columnAccessor) => {
    if (sortColumn !== columnAccessor) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`py-3.5 px-4 text-left text-sm font-semibold text-gray-900 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.accessor) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIcon(column.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 px-4 text-sm text-gray-500 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentItems.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={`whitespace-nowrap py-3 px-4 text-sm text-gray-500 ${
                        column.className || ''
                      }`}
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>{' '}
                de <span className="font-medium">{sortedData.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={firstPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Primera</span>
                  <FiChevronsLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculamos los números de página a mostrar
                  let pageNum;
                  if (totalPages <= 5) {
                    // Si hay 5 o menos páginas, mostramos todas
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Si estamos en las primeras páginas
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Si estamos en las últimas páginas
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Si estamos en el medio
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Verificamos que el número esté en rango
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Última</span>
                  <FiChevronsRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
