import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
  hideLabel?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  id,
  hideLabel = false,
  className = '',
  ...props
}) => {
  const inputStyles = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
    placeholder-gray-400
    disabled:bg-gray-100 disabled:cursor-not-allowed
    sm:text-sm
    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
  `;

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === 'tel') {
      const formattedNumber = formatPhoneNumber(e.target.value);
      const input = e.target as HTMLInputElement;
      input.value = formattedNumber;
    }
  };

  // Prevent mousewheel from changing numeric input values
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (props.type === 'number') {
      e.currentTarget.blur();
    }
  };

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
        <input 
          id={id} 
          className={inputStyles} 
          onInput={handlePhoneInput}
          onWheel={handleWheel}
          maxLength={props.type === 'tel' ? 14 : undefined}
          {...props} 
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;