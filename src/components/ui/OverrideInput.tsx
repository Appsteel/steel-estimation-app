import React from 'react';
import FormInput from './FormInput';

interface OverrideInputProps {
  actualValue: number;
  overriddenValue?: number;
  onOverride: (value: number | undefined) => void;
  label: string;
}

const OverrideInput: React.FC<OverrideInputProps> = ({
  actualValue,
  overriddenValue,
  onOverride,
  label
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {overriddenValue !== undefined && (
          <button
            onClick={() => onOverride(undefined)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Reset Override
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Actual Value</div>
          <div className="text-lg font-semibold">
            ${actualValue.toLocaleString()}
          </div>
        </div>
        <FormInput
          id={`override-${label.toLowerCase().replace(/\s+/g, '-')}`}
          type="number"
          value={overriddenValue || ''}
          onChange={(e) => onOverride(e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Override value..."
          className={overriddenValue !== undefined ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        />
      </div>
    </div>
  );
};

export default OverrideInput;