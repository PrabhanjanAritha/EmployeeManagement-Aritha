import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          flex w-full rounded-lg border border-gray-300 dark:border-gray-700 
          bg-white dark:bg-[#1a2632] px-4 py-3 text-sm text-gray-900 dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
};