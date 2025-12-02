import React from 'react';

interface CardProps {
  image?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ image, title, description, children, className = '' }) => {
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101922] shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform hover:scale-105 duration-500" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">{description}</p>
        {children && <div className="mt-auto pt-2">{children}</div>}
      </div>
    </div>
  );
};