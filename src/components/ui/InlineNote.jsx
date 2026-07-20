import React from 'react';
import { FiInfo, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function InlineNote({ 
  type = 'warning', 
  title, 
  children,
  className = ''
}) {
  const types = {
    warning: {
      container: 'bg-yellow-500/10 border-yellow-500/20 text-amber-400/90',
      icon: <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
    },
    important: {
      container: 'bg-yellow-500/10 border-yellow-500/20 text-amber-400/90',
      icon: <FiInfo className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/20 text-blue-400/90',
      icon: <FiInfo className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
    },
    error: {
      container: 'bg-red-500/10 border-red-500/20 text-red-400/90',
      icon: <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
    },
    success: {
      container: 'bg-green-500/10 border-green-500/20 text-green-400/90',
      icon: <FiCheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
    }
  };

  const selectedType = types[type] || types.important;

  return (
    <div className={`flex items-start gap-3 border p-3.5 rounded-xl text-xs leading-relaxed ${selectedType.container} ${className}`}>
      {selectedType.icon}
      <div className="flex-1">
        {title && <strong>{title} </strong>}
        {children}
      </div>
    </div>
  );
}
