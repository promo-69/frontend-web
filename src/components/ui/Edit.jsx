import React from 'react';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './IconosProyect';

function Edit({ onConfirm, onCancel, loading }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    try {
      // Pasamos la contraseña al manejador del padre (Profile) para validar con la API
      await onConfirm(password);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#231640] border border-white/20 p-8 rounded-3xl w-full max-w-xs shadow-2xl text-center">
        <h2 className="text-[#D9982F] text-xl font-bold mb-2">Confirmar Edición</h2>
        <p className="text-white text-xs mb-6 opacity-80">Por seguridad, ingresa tu contraseña actual para continuar.</p>
        
        <form onSubmit={handleValidate}>
          <div className={`relative flex items-center border-b ${error ? 'border-red-500' : 'border-gray-400'} mb-2 focus-within:border-[#D9982F] transition-all`}>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Contraseña"
              className="bg-transparent w-full text-white outline-none py-2 text-sm disabled:opacity-50"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mensaje de error */}
          <div className="h-6 mb-4">
            {error && (
              <p className="text-red-500 text-[10px] font-bold uppercase">
                La contraseña es inválida
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-[#D9982F] text-[#231640] font-bold py-2 rounded-full uppercase text-sm active:scale-95 transition-transform flex items-center justify-center min-h-[36px] disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#231640] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Validar'
              )}
            </button>
            <button 
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="w-full border border border-white/40 text-white py-2 rounded-full uppercase text-xs opacity-70 hover:opacity-100 disabled:opacity-35"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;