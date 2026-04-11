/* Edit.jsx */
import { useState } from 'react';

function Edit({ onConfirm, onCancel }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() !== '') {
      onConfirm(password);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#231640] border border-white/10 p-8 rounded-3xl w-full max-w-sm flex flex-col items-center shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Escudo Dorado */}
        <div className="bg-[#D9982F]/10 p-4 rounded-full mb-4">
          <svg className="w-10 h-10 text-[#D9982F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        
        <h2 className="text-[#D9982F] text-xl font-bold text-center">Cambio de Información</h2>
        <p className="text-white text-xs text-center mt-2 opacity-80 leading-relaxed px-4">
          Por motivos de seguridad, confirma tu clave actual para realizar cambios.
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-6">
          <div className="border-b border-gray-400">
            <label className="block text-[10px] font-bold text-gray-300 uppercase">Contraseña</label>
            <input 
              autoFocus
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-white py-2 focus:border-[#D9982F] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 border border-white text-white rounded-full py-2 text-sm font-bold uppercase hover:bg-white/5 transition-all"
            >
              Volver
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-[#D9982F] text-[#231640] rounded-full py-2 text-sm font-bold uppercase shadow-lg hover:brightness-110 transition-all"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;