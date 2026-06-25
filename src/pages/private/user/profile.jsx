import { useState, useContext } from 'react'
import profileImage  from '../../../assets/images/profile.png'
import Edit from '../../../components/ui/Edit'
import FormEditProfile from '../../../components/forms/FormEditProfile'
import SuccessModal from '../../../components/ui/SuccessModal'
import { AuthContext } from '../../../context/AuthContext'
import { 
  updateProfileRequest, 
  verifySecurityIdentityRequest, 
  changeSecurityDataRequest 
} from '../../../services/auth.service'

function Profile() {
  const { user, updateProfileState } = useContext(AuthContext)
  console.log('¿Qué tiene el estado USER en Profile?:', user)
  
  const [step, setStep] = useState('view')
  const [showSuccess, setShowSuccess] = useState(false)
  const [securityToken, setSecurityToken] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  // MAPEO SINCRONIZADO CON EL JSON DEL GET
  const profileData = {
    name: user?.firstName || 'No asignado',
    lastname: user?.lastName || 'No asignado',
    id: user?.documentNumber || 'No asignado',
    birth: '28/05/2006',
    email: user?.email || user?._People?.personal_email || '',
    cellphone: user?.phoneNumber || 'Sin número registrado',
    password: '••••••••',
  }

  // VERIFICAR CONTRASEÑA EN BACKEND Y TRAER TOKEN DE SEGURIDAD
  const handleVerifyIdentity = async (passwordInput) => {
    setLoadingAction(true)
    try {
      const response = await verifySecurityIdentityRequest({ password: passwordInput })
      const token = response?.data?.securityChangeToken || response?.securityChangeToken

      if (token) {
        setSecurityToken(token)
        setStep('editing')
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Error al verificar identidad:', error)
      throw error;
    } finally {
      setLoadingAction(false)
    }
  }

  // ENVIAR CAMBIOS JUNTO AL TOKEN DE SEGURIDAD
  const handleUpdate = async (updatedData) => {
    if (!securityToken) {
      alert('El token de seguridad ha expirado o no es válido. Por favor, vuelve a verificar tu contraseña.')
      setStep('view')
      return
    }

    const currentEmail = (user?.email || user?._People?.personal_email || '').trim().toLowerCase();
    const targetEmail = updatedData.email.trim().toLowerCase();
    
    const hasEmailChanged = targetEmail !== currentEmail;
    const hasPasswordChanged = !!updatedData.password;

    const payload = {
      securityChangeToken: securityToken
    }

    if (hasEmailChanged) payload.newEmail = updatedData.email.trim();
    if (hasPasswordChanged) payload.newPassword = updatedData.password;

    setLoadingAction(true)
    try {
      if (hasEmailChanged || hasPasswordChanged) {
        const response = await changeSecurityDataRequest(payload)
        
        if (!(response?.success || response?.status === 200 || response?.data)) {
          alert(response?.message || 'No se pudo procesar el cambio de seguridad.')
          setLoadingAction(false)
          return
        }
      }

      const currentPhone = (user?.phoneNumber || '').trim();
      const targetPhone = updatedData.cellphone.trim();
      const hasPhoneChanged = targetPhone !== currentPhone;

      if (hasEmailChanged || hasPhoneChanged) {
        const profilePayload = {};
        if (hasEmailChanged) profilePayload.personal_email = updatedData.email.trim();
        if (hasPhoneChanged) profilePayload.phoneNumber = updatedData.cellphone.trim();

        await updateProfileRequest(profilePayload).catch((err) => {
          console.error('Error no crítico al actualizar metadatos del perfil:', err)
        })
      }

      updateProfileState(updatedData.email.trim())
      setSecurityToken(null)
      setStep('view')
      setShowSuccess(true)
      
    } catch (error) {
      console.error('Error al guardar cambios de seguridad de perfil:', error)
      alert(error.response?.data?.message || 'Error inesperado o token expirado (límite 15 min).')
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white flex flex-col justify-between font-montserrat overflow-x-hidden">
      
      {/* Contenedor Principal de la Vista */}
      <main className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Sección Izquierda: Imagen */}
        <div className="hidden md:block md:w-1/2">
          <img
            src={profileImage}
            className="w-full h-full object-cover object-left-top min-h-[calc(100vh-80px)]"
            alt="perfil"
          />
        </div>

        {/* Sección Derecha: Formulario (Se corrigió min-h y se ajustó pt para pantallas grandes) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start pt-10 md:pt-16 lg:pt-24 p-6 md:p-12 z-10 bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center w-full max-w-sm lg:max-w-md pt-0">
            <div className="text-center mb-6">
              <h1 className="text-[#D9982F] text-3xl md:text-5xl font-bold tracking-tight">
                Perfil
              </h1>
              <p className="text-white text-sm font-bold mt-1">
                Gestiona tu información personal
              </p>
            </div>

            <FormEditProfile
              userData={profileData}
              step={step}
              setStep={setStep}
              onSave={handleUpdate}
              loading={loadingAction}
            />
          </div>
        </div>
      </main>

      {/* Modales Interactivos */}
      {step === 'confirming' && (
        <Edit
          onConfirm={handleVerifyIdentity}
          onCancel={() => setStep('view')}
          loading={loadingAction}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Tu información de perfil y seguridad ha sido actualizada con éxito."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default Profile