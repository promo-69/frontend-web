import { useState } from 'react';
import { EditIcon, EyeIcon, EyeOffIcon, ChevronDownIcon } from '../ui/IconosProyect';

function FormEditProfile({ userData, step, setStep, onSave }) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para controlar los valores y errores
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState(userData.password);
  const [phone, setPhone] = useState(userData.cellphone);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const isEditing = step === 'editing';

  const validate = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;

    // Validación de correo: debe contener @
    if (!email.includes('@')) {
      newErrors.email = 'El correo debe contener un "@"';
      isValid = false;
    }

    // Validación de contraseña: 8-20 caracteres, letras, números y especiales
    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    if (!passRegex.test(password)) {
      newErrors.password = 'Debe tener 8-20 caracteres (letras, números y caracteres especiales)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing && validate()) {
      onSave({ email, password, phone });
    }
  };

  const fieldContainerClass = (fieldName) => 
    `border-b pb-1 flex flex-col ${isEditing ? (errors[fieldName] ? 'border-red-500' : 'border-[#D9982F]') : 'border-gray-400'}`;

  return (
    <div className="w-full bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
      <form className="space-y-4 text-white" onSubmit={handleSubmit}>
        
        {/* Nombre / Apellido / Cédula / Fecha (Sin cambios) */}
        <div className="grid grid-cols-2 gap-6 opacity-80">
          <div className="border-b border-gray-400 pb-1">
            <label className="text-[11px] font-bold text-gray-300 uppercase">Nombre:</label>
            <p className="text-sm py-1">{userData.name}</p>
          </div>
          <div className="border-b border-gray-400 pb-1">
            <label className="text-[11px] font-bold text-gray-300 uppercase">Apellido:</label>
            <p className="text-sm py-1">{userData.lastname}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 opacity-80">
          <div className="border-b border-gray-400 pb-1">
            <label className="text-[11px] font-bold text-gray-300 uppercase">Cedula:</label>
            <p className="text-sm py-1">{userData.id}</p>
          </div>
          <div className="border-b border-gray-400 pb-1">
            <label className="text-[11px] font-bold text-gray-300 uppercase">Fecha de Nacimiento:</label>
            <p className="text-sm py-1">{userData.birth}</p>
          </div>
        </div>

        {/* Correo con Validación */}
        <div className={fieldContainerClass('email')}>
          <label className="text-[11px] font-bold text-gray-300 uppercase">Correo:</label>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              readOnly={!isEditing}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full outline-none text-sm py-1 text-white"
            />
            {isEditing && <EditIcon className="w-4 h-4 text-white opacity-80" />}
          </div>
          {isEditing && errors.email && <span className="text-[10px] text-red-500 mt-1">{errors.email}</span>}
        </div>

        {/* Teléfono */}
        <div className={`border-b pb-1 flex flex-col ${isEditing ? 'border-[#D9982F]' : 'border-gray-400'}`}>
          <label className="text-[11px] font-bold text-gray-300 uppercase">Teléfono:</label>
          <div className="flex items-center gap-2 py-1">
             <div className="bg-white/5 border border-white/20 rounded px-2 py-0.5 text-[11px]">
               +58
             </div>
            <input
              type="text"
              readOnly={!isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent w-full outline-none text-sm text-white"
            />
            {isEditing && <EditIcon className="w-4 h-4 text-white opacity-80" />}
          </div>
        </div>

        {/* Contraseña con Validación */}
        <div className={fieldContainerClass('password')}>
          <label className="text-[11px] font-bold text-gray-300 uppercase">Contraseña:</label>
          <div className="flex items-center justify-between gap-2 py-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              readOnly={!isEditing}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full outline-none text-sm text-white"
            />
            {isEditing && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon className="w-4 h-4 text-gray-400" /> : <EyeIcon className="w-4 h-4 text-gray-400" />}
                </button>
                <EditIcon className="w-4 h-4 text-white opacity-80" />
              </div>
            )}
          </div>
          {isEditing && errors.password && <span className="text-[10px] text-red-500 mt-1">{errors.password}</span>}
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => setStep('view')}
            className="flex-1 border-2 border-white rounded-full py-2 font-bold text-xs uppercase hover:bg-white/10 transition-colors"
          >
            Volver
          </button>
          
          <button 
            type={isEditing ? "submit" : "button"}
            onClick={() => !isEditing && setStep('confirming')}
            className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-2 text-xs uppercase hover:bg-[#c48928] transition-colors"
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormEditProfile;