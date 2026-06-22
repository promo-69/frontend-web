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
    id: user?.id || 'No asignado',
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
        // Lanza error para activar el cartel rojo en el modal Edit
        throw new Error();
      }
    } catch (error) {
      console.error('Error al verificar identidad:', error)
      throw error; // Re-lanzamos para que el modal Edit maneje el estado de error interno
    } finally {
      setLoadingAction(false)
    }
  }

  // PASO 2: ENVIAR CAMBIOS JUNTO AL TOKEN DE SEGURIDAD (VÁLIDO POR 15 MIN)
  const handleUpdate = async (updatedData) => {
    if (!securityToken) {
      alert('El token de seguridad ha expirado o no es válido. Por favor, vuelve a verificar tu contraseña.')
      setStep('view')
      return
    }

    // 1. Evaluamos qué datos de seguridad cambiaron realmente
    const currentEmail = (user?.email || user?._People?.personal_email || '').trim().toLowerCase();
    const targetEmail = updatedData.email.trim().toLowerCase();
    
    const hasEmailChanged = targetEmail !== currentEmail;
    const hasPasswordChanged = !!updatedData.password;

    // 2. Construimos el payload de seguridad con el contrato de llaves correcto del Backend (newEmail, newPassword)
    const payload = {
      securityChangeToken: securityToken
    }

    if (hasEmailChanged) payload.newEmail = updatedData.email.trim();
    if (hasPasswordChanged) payload.newPassword = updatedData.password;

    setLoadingAction(true)
    try {
      // Si cambió correo o clave, se dispara la solicitud a la ruta crítica de seguridad
      if (hasEmailChanged || hasPasswordChanged) {
        const response = await changeSecurityDataRequest(payload)
        
        if (!(response?.success || response?.status === 200 || response?.data)) {
          alert(response?.message || 'No se pudo procesar el cambio de seguridad.')
          setLoadingAction(false)
          return
        }
      }

      // 3. Actualización de campos de perfil generales (como el teléfono si fue alterado)
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

      // Sincronizamos el estado global del contexto de autenticación
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
            loading={loadingAction}
          />
        </div>
      </div>

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