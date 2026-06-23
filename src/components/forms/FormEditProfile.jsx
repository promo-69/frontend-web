import React from 'react';
import { useState, useEffect } from 'react';
import { EditIcon, EyeIcon, EyeOffIcon } from '../ui/IconosProyect';

function FormEditProfile({ userData, step, setStep, onSave, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState('');
  const [phoneBody, setPhoneBody] = useState(""); 
  const [prefix, setPrefix] = useState("+58"); 
  const [errors, setErrors] = useState({ email: '', password: '' });

  const isEditing = step === 'editing';

  useEffect(() => {
    setEmail(userData.email);
    // Al editar se deja en blanco para que defina una nueva contraseña o mantenga consistencia
    setPassword(isEditing ? '' : userData.password);
    
    if (userData.cellphone?.startsWith('+')) {
      setPrefix(userData.cellphone.substring(0, 3));
      setPhoneBody(userData.cellphone.substring(3));
    } else {
      setPhoneBody(userData.cellphone || "");
    }
    setShowPassword(false);
    setErrors({ email: '', password: '' });
  }, [userData, step, isEditing]);

  const validate = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;
    
    if (!email.includes('@')) {
      newErrors.email = 'Correo inválido';
      isValid = false;
    }
    
    // Solo validamos la estructura de la clave si el usuario escribió algo nuevo para cambiarla
    if (password.length > 0) {
      const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
      if (!passRegex.test(password)) {
        newErrors.password = 'La clave no cumple requisitos (8-20 chars, letras, números y símbolos)';
        isValid = false;
      }
    }

    // Validación preventiva local: Validar si al menos se modificó el teléfono, el correo o la clave
    const originalPhone = userData.cellphone || "";
    const currentPhone = `${prefix}${phoneBody}`;
    
    const hasEmailChanged = email.trim().toLowerCase() !== userData.email.trim().toLowerCase();
    const hasPasswordChanged = password.length > 0;
    const hasPhoneChanged = currentPhone.trim() !== originalPhone.trim();

    if (!hasEmailChanged && !hasPasswordChanged && !hasPhoneChanged) {
      newErrors.email = 'No has realizado ninguna modificación en tus datos.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (isEditing && validate()) {
      onSave({ 
        email, 
        password: password.length > 0 ? password : undefined, // Si no se cambió, no se sobreescribe la existente
        cellphone: `${prefix}${phoneBody}` 
      });
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

        {/* Correo */}
        <div className={containerClass('email')}>
          <label htmlFor="email-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            Correo
          </label>
          <div className="flex items-center justify-between gap-2">
            <input
              id="email-field"
              type="text"
              readOnly={!isEditing || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full outline-none text-sm py-1"
            />
            {isEditing && <EditIcon className="w-4 h-4 opacity-70" />}
          </div>
          {isEditing && errors.email && <span className="text-[9px] text-red-400 italic">{errors.email}</span>}
        </div>

        {/* Teléfono*/}
        <div className={`border-b flex flex-col ${isEditing ? 'border-[#D9982F]' : 'border-gray-500'}`}>
          <label htmlFor="phone-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            Teléfono
          </label>
          <div className="flex items-center gap-2 py-1">
            <select
              aria-label="Prefijo de teléfono"
              disabled={!isEditing || loading}
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
              readOnly={!isEditing || loading}
              value={phoneBody}
              onChange={(e) => setPhoneBody(e.target.value)}
              className="bg-transparent w-full outline-none text-sm"
            />
            {isEditing && <EditIcon className="w-6 h-6 opacity-70" />}
          </div>
        </div>

        {/* Contraseña */}
        <div className={containerClass('password')}>
          <label htmlFor="password-field" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">
            {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
          </label>
          <div className="flex items-center justify-between gap-2 py-1">
            <input
              id="password-field"
              type={isEditing && showPassword ? "text" : "password"}
              readOnly={!isEditing || loading}
              placeholder={isEditing ? "Escribe para cambiar tu clave..." : ""}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-sm placeholder-white/30"
            />

            {isEditing && (
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                  className="hover:text-[#D9982F] transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <EditIcon className="w-4 h-4 opacity-70" />
              </div>
            )}
          </div>

          {isEditing && errors.password && (
            <span className="text-[9px] text-red-400 italic leading-tight">
              {errors.password}
            </span>
          )}
        </div>

        {/* Botones de Control */}
        <div className="flex gap-4 pt-3">
          <button 
            type="button" 
            disabled={loading}
            onClick={() => setStep('view')}
            className="flex-1 border-2 border-white rounded-full py-2 font-bold text-[12px] uppercase hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Volver
          </button>
          <button 
            type={isEditing ? "submit" : "button"}
            disabled={loading}
            onClick={() => !isEditing && setStep('confirming')}
            className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-2 text-[13px] uppercase transition-all active:scale-95 shadow-lg flex items-center justify-center gap-1 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#231640] border-t-transparent rounded-full animate-spin"></div>
            ) : isEditing ? (
              'Guardar'
            ) : (
              'Editar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormEditProfile;