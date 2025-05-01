import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  id: string;
  hideLabel?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  error,
  id,
  hideLabel = false,
  className = '',
  ...props
}) => {
  const selectStyles = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
    disabled:bg-gray-100 disabled:cursor-not-allowed
    sm:text-sm
  `;

  return (
    <div className={className}>
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div>
        <select id={id} className={selectStyles} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormSelect;