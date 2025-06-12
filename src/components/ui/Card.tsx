import React from "react";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, children, className, footer }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-3 sm:px-6 bg-gray-50 dark:bg-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
