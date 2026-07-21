import React from 'react'

export default function PageHeader({ 
  titlePrefix, 
  titleHighlight, 
  subtitle, 
  rightContent, 
  className = "" 
}) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      <div className="border-l-4 border-yellow-500 pl-4 text-left w-full md:w-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white break-words">
          {titlePrefix} {titleHighlight && <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">{titleHighlight}</span>}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-300 mt-2 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {rightContent && (
        <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-col md:flex-row gap-3 [&>*]:w-full md:[&>*]:w-auto [&>*]:justify-center">
          {rightContent}
        </div>
      )}
    </div>
  )
}
