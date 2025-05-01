import React, { useState, useRef, useEffect } from 'react';

interface TableColumn<T> {
  header: React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: number;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  className?: string;
  onRowClick?: (row: T) => void;
  resizable?: boolean;
}

function Table<T>({
  columns,
  data,
  keyField,
  className = '',
  onRowClick,
  resizable = false,
}: TableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({});
  const [resizing, setResizing] = useState<number | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const getCellContent = (row: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    
    return row[column.accessor];
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    setResizing(index);
    setStartX(e.pageX);
    
    const currentWidth = columnWidths[index] || 
      tableRef.current?.querySelector(`th:nth-child(${index + 1})`)?.getBoundingClientRect().width ||
      100;
    
    setStartWidth(currentWidth);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing === null) return;

    const diff = e.pageX - startX;
    const newWidth = Math.max(50, startWidth + diff);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizing]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, startX, startWidth]);

  return (
    <div 
      className="overflow-x-auto"
      ref={tableRef}
      style={{ position: 'relative' }}
    >
      <table className={`w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`relative ${column.className || ''}`}
                style={{
                  width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
                  minWidth: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
                }}
              >
                <div className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                  {column.header}
                </div>
                {resizable && index < columns.length - 1 && (
                  <div
                    className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 ${
                      resizing === index ? 'bg-blue-500' : ''
                    }`}
                    onMouseDown={(e) => handleMouseDown(index, e)}
                    style={{ cursor: 'col-resize' }}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-2 text-sm text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-2 py-2 text-sm text-gray-500 truncate ${column.className || ''}`}
                    style={{
                      width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : undefined,
                      minWidth: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : undefined,
                    }}
                  >
                    {getCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;