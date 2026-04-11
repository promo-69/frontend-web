import { useState } from 'react';
import profileImage from '../../../assets/images/Profile.png';
import Edit from '../../../components/ui/Edit'; 
import { EditIcon } from '../../../components/ui/icons'; 

function Profile() {
  const [step, setStep] = useState('view'); 

  const userData = {
    name: "Yessea",
    lastname: "Parra",
    id: "12.345.678",
    birth: "12/03/2000",
    email: "yessea.parra.ucla@gmail.com",
    cellphone: "424 123 4567",
    password: "helloworld"
  };

  const handleValidationSuccess = (passwordIntroduced) => {
    console.log("Validando clave...", passwordIntroduced);
    setStep('editing');
  };

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] h-screen w-full flex pt-20 overflow-hidden font-montserrat relative">
      
      {/* Lado Izquierdo */}
      <div className="w-1/2 h-full flex items-start justify-center">
        <img src={profileImage} className="w-full h-full object-cover" alt="perfil" />
      </div>

      {/* Lado Derecho */}
      <div className="w-1/2 flex items-center justify-center p-4">
        <div className="flex flex-col items-center w-full max-w-sm">
          
          <div className="text-center mb-2">
            <h1 className="text-[#D9982F] text-3xl font-bold">Perfil</h1>
            <p className="text-white text-sm opacity-90">Tu espacio, tu identidad.</p>
          </div>
          
          <div className="w-full bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
             <form className="space-y-3 text-white">
                
                {/* Nombre y Apellido (Siempre lectura) */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="border-b border-gray-400 pb-0.5 opacity-80">
                      <label className="block text-[10px] font-bold text-gray-300 uppercase">Nombre:</label>
                      <p className="text-sm">{userData.name}</p>
                   </div>
                   <div className="border-b border-gray-400 pb-0.5 opacity-80">
                      <label className="block text-[10px] font-bold text-gray-300 uppercase">Apellido:</label>
                      <p className="text-sm">{userData.lastname}</p>
                   </div>
                </div>

                {/* Cédula y Fecha de Nacimiento (Siempre lectura) */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="border-b border-gray-400 pb-0.5 opacity-80">
                      <label className="block text-[10px] font-bold text-gray-300 uppercase">Cédula:</label>
                      <p className="text-sm">{userData.id}</p>
                   </div>
                   <div className="border-b border-gray-400 pb-0.5 opacity-80">
                      <label className="block text-[10px] font-bold text-gray-300 uppercase">Fecha de Nacimiento:</label>
                      <p className="text-sm">{userData.birth}</p>
                   </div>
                </div>

                {/* Correo (Editable) */}
                <div className={`border-b border-gray-400 pb-0.5 flex flex-col transition-all ${step === 'editing' ? 'border-[#D9982F]' : ''}`}>
                   <label className="block text-[10px] font-bold text-gray-300 uppercase">Correo:</label>
                   <div className="flex items-center gap-2">
                      {step === 'editing' && <EditIcon className="w-5 h-5 text-[#fff]" />}
                      <input 
                        readOnly={step !== 'editing'}
                        defaultValue={userData.email} 
                        className={`bg-transparent w-full outline-none text-sm py-0.5 transition-all ${step === 'editing' ? 'text-[#D9982F]' : ''}`}
                      />
                   </div>
                </div>

                {/* Teléfono (Editable) */}
                <div className={`border-b border-gray-400 pb-0.5 flex flex-col transition-all ${step === 'editing' ? 'border-[#D9982F]' : ''}`}>
                   <label className="block text-[10px] font-bold text-gray-300 uppercase">Teléfono:</label>
                   <div className="flex items-center gap-2">
                      {step === 'editing' && <EditIcon className="w-5 h-5 text-[#fff]" />}
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-gray-300">+58 ▾</span>
                      <input 
                        type="text" 
                        readOnly={step !== 'editing'}
                        defaultValue={userData.cellphone} 
                        className={`bg-transparent w-full outline-none text-sm py-0.5 ${step === 'editing' ? 'text-[#D9982F]' : ''}`}
                      />
                   </div>
                </div>

                {/* Contraseña (Editable) */}
                <div className={`border-b border-gray-400 pb-0.5 flex flex-col transition-all ${step === 'editing' ? 'border-[#D9982F]' : ''}`}>
                   <label className="block text-[10px] font-bold text-gray-300 uppercase">Contraseña:</label>
                   <div className="flex items-center gap-2">
                      {step === 'editing' && <EditIcon className="w-5 h-5 text-[#fff]" />}
                      <input 
                        type="password" 
                        readOnly={step !== 'editing'}
                        defaultValue={userData.password} 
                        className={`bg-transparent w-full outline-none text-sm py-0.5 ${step === 'editing' ? 'text-[#D9982F]' : ''}`}
                      />
                   </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-3">
                   <button type="button" className="flex-1 border-2 border-white rounded-full py-1.5 font-bold text-sm uppercase hover:bg-white/10 transition-all">
                      Volver
                   </button>
                   
                   {step === 'editing' ? (
                      <button type="submit" className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-1.5 text-sm uppercase hover:bg-[#D9982F]/80 shadow-lg transition-all">
                         Guardar
                      </button>
                   ) : (
                      <button 
                        type="button" 
                        onClick={() => setStep('confirming')}
                        className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-1.5 text-sm uppercase hover:brightness-110 shadow-lg transition-all"
                      >
                         Editar
                      </button>
                   )}
                </div>
             </form>
          </div>

          <footer className="text-white/60 text-[9px] text-center mt-4 leading-tight">
            ©2026. Todos los derechos reservados. Compañía Anónima<br/>Empresa Cineflix
          </footer>
        </div>
      </div>

      {step === 'confirming' && (
        <Edit 
          onConfirm={handleValidationSuccess} 
          onCancel={() => setStep('view')} 
        />
      )}
    </div>
  );
}

export default Profile;