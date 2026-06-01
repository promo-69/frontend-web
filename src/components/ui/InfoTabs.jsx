import React, { useState } from 'react';

export const InfoTabs = ({ tabs = [] }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-6">
      {/* Contenedor de los botones - Eliminamos overflow-x-auto y no-scrollbar */}
      <div className="flex border-b border-white/20 relative justify-between items-stretch w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}

              className={`flex-1 flex flex-col justify-center items-center text-center pb-3 px-1 sm:px-4 text-[10px] sm:text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-300 relative focus:outline-none min-w-0 leading-tight md:leading-normal
                ${isActive 
                  ? 'text-[#F6AD38]' 
                  : 'text-white/60 hover:text-white'
                }`}
            >
              {/* Contenedor interno para manejar la rotura de palabras si es necesario */}
              <span className="block max-w-full break-words">
                {tab.label}
              </span>
              
              {/* Línea indicadora inferior */}
              <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-300
                  ${isActive 
                    ? 'h-[3px] bg-[#F6AD38] opacity-100' 
                    : 'h-[1px] bg-transparent opacity-0'
                  }`}
              />
            </button>
          );
        })}
      </div>

      {/* Contenedor del contenido indexado */}
      <div className="mt-6 text-white bg-white/5 p-4 sm:p-6 rounded-2xl backdrop-blur-sm min-h-[200px]">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};