import { useState } from 'react';
import profileImage from '../../../assets/images/Profile.png';
import Edit from '../../../components/ui/Edit'; 
import FormEditProfile from '../../../components/forms/FormEditProfile';

function Profile() {
  const [step, setStep] = useState('view'); 

  const userData = {
    name: "Yessea",
    lastname: "Parra",
    id: "12345678",
    birth: "12/03/2000",
    email: "yessea.parra.ucla@gmail.com",
    cellphone: "4241234567",
    password: "helloworld"
  };

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] h-screen w-full flex pt-20 overflow-hidden font-montserrat relative">
      
      {/* Imagen (Lado Izquierdo) */}
      <div className="w-1/2 h-full flex items-start justify-center">
        <img src={profileImage} className="w-full h-full object-cover" alt="perfil" />
      </div>

      {/* Área del Formulario (Lado Derecho) */}
      <div className="w-1/2 flex items-center justify-center p-4">
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="text-center mb-2">
            <h1 className="text-[#D9982F] text-3xl font-bold">Perfil</h1>
            <p className="text-white text-sm opacity-90">Tu espacio, tu identidad.</p>
          </div>
          
          <FormEditProfile 
            userData={userData} 
            step={step} 
            setStep={setStep} 
            onSave={() => setStep('view')} 
          />
        </div>
      </div>

      {/* Modal de Validación */}
      {step === 'confirming' && (
        <Edit 
          onConfirm={() => setStep('editing')} 
          onCancel={() => setStep('view')} 
        />
      )}
    </div>
  );
}

export default Profile;