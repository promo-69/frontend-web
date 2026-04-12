import React from 'react';
import { useState, useEffect } from 'react';
import { EditIcon, EyeIcon, EyeOffIcon } from '../ui/IconosProyect';

function FormEditProfile({ userData, step, setStep, onSave }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState(userData.password);
  const [phoneBody, setPhoneBody] = useState(""); 
  const [prefix, setPrefix] = useState("+58"); 
  const [errors, setErrors] = useState({ email: '', password: '' });

  const isEditing = step === 'editing';

  useEffect(() => {
    setEmail(userData.email);
    setPassword(userData.password);
    if (userData.cellphone?.startsWith('+')) {
      setPrefix(userData.cellphone.substring(0, 3));
      setPhoneBody(userData.cellphone.substring(3));
    } else {
      setPhoneBody(userData.cellphone || "");
    }
    setShowPassword(false);
  }, [userData, step]);

  const validate = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;
    if (!email.includes('@')) {
      newErrors.email = 'Correo inválido';
      isValid = false;
    }
    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    if (!passRegex.test(password)) {
      newErrors.password = 'Clave no cumple requisitos';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing && validate()) {
      onSave({ email, password, cellphone: `${prefix}${phoneBody}` });
    }
  };

  const containerClass = (field) => 
    `border-b flex flex-col ${isEditing ? (errors[field] ? 'border-red-500' : 'border-[#D9982F]') : 'border-gray-500'}`;

  return (
    <div className="w-full max-w-[360px] bg-white/5 p-5 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
      <form className="space-y-4 text-white" onSubmit={handleSubmit}>
        
        {/* Datos Fijos */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 opacity-80">
          <div className="border-b border-gray-500 pb-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Nombre</label>
            <p className="text-sm font-medium truncate">{userData.name}</p>
          </div>
          <div className="border-b border-gray-500 pb-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Apellido</label>
            <p className="text-sm font-medium truncate">{userData.lastname}</p>
          </div>
          <div className="border-b border-gray-500 pb-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Cédula</label>
            <p className="text-sm font-medium truncate">{userData.id}</p>
          </div>
          <div className="border-b border-gray-500 pb-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Nacimiento</label>
            <p className="text-sm font-medium truncate">{userData.birth}</p>
          </div>
        </div>

        {/* Correo - Conectado para Testing */}
        <div className={containerClass('email')}>
          <label htmlFor="email-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            Correo
          </label>
          <div className="flex items-center justify-between gap-2">
            <input
              id="email-field"
              type="text"
              readOnly={!isEditing}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full outline-none text-sm py-1"
            />
            {isEditing && <EditIcon className="w-4 h-4 opacity-70" />}
          </div>
          {isEditing && errors.email && <span className="text-[9px] text-red-400 italic">{errors.email}</span>}
        </div>

        {/* Teléfono - Conectado para Testing */}
        <div className={`border-b flex flex-col ${isEditing ? 'border-[#D9982F]' : 'border-gray-500'}`}>
          <label htmlFor="phone-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            Teléfono
          </label>
          <div className="flex items-center gap-2 py-1">
            <select
              aria-label="Prefijo de teléfono"
              disabled={!isEditing}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-white outline-none cursor-pointer"
            >
              <option value="+58" className="bg-[#231640]">VE +58</option>
              <option value="+57" className="bg-[#231640]">CO +57</option>
            </select>
            <input
              id="phone-field"
              type="text"
              readOnly={!isEditing}
              value={phoneBody}
              onChange={(e) => setPhoneBody(e.target.value)}
              className="bg-transparent w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* Contraseña - Conectado para Testing */}
        <div className={containerClass('password')}>
          <label htmlFor="password-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            Contraseña
          </label>
          <div className="flex items-center justify-between gap-2 py-1">
            <input
              id="password-field"
              type={isEditing && showPassword ? "text" : "password"}
              readOnly={!isEditing}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-sm"
            />
            {isEditing && (
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            )}
          </div>
          {isEditing && errors.password && (
            <span className="text-[9px] text-red-400 italic leading-tight">{errors.password}</span>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-3">
          <button 
            type="button" 
            onClick={() => setStep('view')}
            className="flex-1 border-2 border-white rounded-full py-2 font-bold text-[12px] uppercase hover:bg-white/5 transition-all"
          >
            Volver
          </button>
          <button 
            type={isEditing ? "submit" : "button"}
            onClick={() => !isEditing && setStep('confirming')}
            className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-2 text-[13px] uppercase transition-all active:scale-95 shadow-lg"
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormEditProfile;