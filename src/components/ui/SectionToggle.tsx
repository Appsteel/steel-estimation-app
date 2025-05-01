import React from 'react';

interface SectionToggleProps {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const SectionToggle: React.FC<SectionToggleProps> = ({
  title,
  isVisible,
  toggleVisibility,
}) => {
  return (
    <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center">
        <span className="mr-3 text-sm text-gray-500">
          {isVisible ? 'Visible' : 'Hidden'}
        </span>
        <button
          type="button"
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isVisible ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          onClick={toggleVisibility}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
              isVisible ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default SectionToggle;