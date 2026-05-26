import React, { useState } from 'react';

// Eliminamos las interfaces de TypeScript ya que estamos en JavaScript (.jsx)

export const InfoTabs = ({ tabs = [] }) => {
  // Aseguramos que tabs exista antes de buscar el primer id
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Contenedor de los botones de las pestañas */}
      <div className="flex border-b border-white/20 relative justify-start sm:justify-around items-end overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] text-center pb-3 text-sm font-medium tracking-wide transition-all duration-300 relative focus:outline-none
                ${isActive 
                  ? 'text-[#F6AD38]' 
                  : 'text-white/80 hover:text-white'
                }`}
            >
              {tab.label}
              
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
      <div className="mt-6 text-white bg-white/5 p-6 rounded-lg backdrop-blur-sm min-h-[200px]">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};