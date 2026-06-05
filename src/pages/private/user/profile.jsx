import { useState, useContext } from 'react'
import profileImage from '../../../assets/images/profile.png'
import Edit from '../../../components/ui/Edit'
import FormEditProfile from '../../../components/forms/FormEditProfile'
import SuccessModal from '../../../components/ui/SuccessModal'
import { AuthContext } from '../../../context/AuthContext'
import { updateProfileRequest } from '../../../services/auth.service'

function Profile() {
  const { user, updateProfileState } = useContext(AuthContext)
  console.log('¿Qué tiene el estado USER en Profile?:', user)
  const [step, setStep] = useState('view')
  const [showSuccess, setShowSuccess] = useState(false)

  // 🔄 MAPEO SINCRONIZADO CON EL JSON DEL GET
  const profileData = {
    name: user?.firstName || 'No asignado',
    lastname: user?.lastName || 'No asignado',
    id: user?.id || 'No asignado',
    birth: '28/05/2006',
    email: user?.email || user?._People?.personal_email || '',
    cellphone: user?.phoneNumber || 'Sin número registrado',
    password: '••••••••',
  }

  // 🚀 MANEJADOR DEL PATCH
  const handleUpdate = async (updatedData) => {
    const payload = {
      personal_email: updatedData.email.trim(),
    }

    try {
      const res = await updateProfileRequest(payload)

      if (res.success) {
        updateProfileState(payload.personal_email)
        setStep('view')
        setShowSuccess(true)
      } else {
        alert(res.message || 'No se pudo procesar la actualización')
      }
    } catch (error) {
      console.error('Error al guardar cambios de perfil:', error)
      alert(error.response?.data?.message || 'Error inesperado en el servidor.')
    }
  }

  return (
    <div className="bg-[#231640] min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row font-montserrat relative overflow-hidden">
      {/* Sección Izquierda: Imagen */}
      <div className="hidden md:block md:w-1/2 h-auto">
        <img
          src={profileImage}
          className="w-full h-full object-cover object-left-top"
          alt="perfil"
        />
      </div>

      {/* Sección Derecha: Formulario */}
      <div className="w-full md:w-1/2 min-h-full flex flex-col items-center justify-center p-6 md:p-12 z-10 bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)]">
        <div className="flex flex-col items-center w-full max-w-sm lg:max-w-md pt-4">
          <div className="text-center mb-4">
            <h1 className="text-[#D9982F] text-3xl md:text-5xl font-bold tracking-tight">
              Perfil
            </h1>
            <p className="text-white text-s font-bold mt-1">
              Gestiona tu información personal
            </p>
          </div>

          <FormEditProfile
            userData={profileData}
            step={step}
            setStep={setStep}
            onSave={handleUpdate}
          />
        </div>
      </div>

      {/* Modales */}
      {step === 'confirming' && (
        <Edit
          correctPassword={user?.password}
          onConfirm={() => setStep('editing')}
          onCancel={() => setStep('view')}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Tu correo de perfil ha sido actualizado con éxito."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default Profile
