import { useState } from 'react';
import profileImage from '../../../assets/images/Profile.png'; 
import Edit from '../../../components/ui/Edit'; 
import FormEditProfile from '../../../components/forms/FormEditProfile';

function Profile() {
  const [step, setStep] = useState('view'); 
  const [user, setUser] = useState({
    name: "Yessea",
    lastname: "Parra",
    id: "12345678",
    birth: "12/03/2000",
    email: "yessea.parra.ucla@gmail.com",
    cellphone: "+584241234567",
    password: "helloworld"
  });

  const handleUpdate = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    setStep('view');
    alert("¡Perfil actualizado con éxito!");
  };

  return (
    <div className="bg-[#231640] h-[calc(100vh-80px)] w-full flex flex-col md:flex-row font-montserrat relative mt-[80px] overflow-hidden">
      
      {/* Imagen pegada al header y al borde izquierdo */}
      <div className="hidden md:block md:w-1/2 h-full">
        <img 
          src={profileImage} 
          className="w-full h-full object-cover object-left-top" 
          alt="perfil" 
        />
      </div>

      {/* Formulario con el título desplazado hacia abajo */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-12 z-10 bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)]">
        <div className="flex flex-col items-center w-full max-w-sm lg:max-w-md pt-8">
          <div className="text-center mb-4">
            <h1 className="text-[#D9982F] text-3xl md:text-5xl font-bold tracking-tight">Perfil</h1>
            <p className="text-white text-s font-bold">Gestiona tu información personal</p>
          </div>
          
          <FormEditProfile 
            userData={user} 
            step={step} 
            setStep={setStep} 
            onSave={handleUpdate} 
          />
        </div>
      </div>

      {step === 'confirming' && (
        <Edit 
          correctPassword={user.password} 
          onConfirm={() => setStep('editing')} 
          onCancel={() => setStep('view')} 
        />
      )}
    </div>
  );
}

export default Profile;