import { useState, useContext, useEffect } from 'react'
import profileImage  from '../../../assets/images/profile.png'
import Edit from '../../../components/ui/Edit'
import FormEditProfile from '../../../components/forms/FormEditProfile'
import SuccessModal from '../../../components/ui/SuccessModal'
import { AuthContext } from '../../../context/AuthContext'
import { 
  getCurrentUserRequest,
  updateProfileRequest, 
  verifySecurityIdentityRequest, 
  changeSecurityDataRequest 
} from '../../../services/auth.service'

function Profile() {
  const { user, updateUserState, updateProfileState } = useContext(AuthContext)
  console.log('¿Qué tiene el estado USER en Profile?:', user)
  
  const [step, setStep] = useState('view')
  const [showSuccess, setShowSuccess] = useState(false)
  const [securityToken, setSecurityToken] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [currentUserLoaded, setCurrentUserLoaded] = useState(false)

  useEffect(() => {
    if (step === 'view') {
      setSecurityToken(null)
    }
  }, [step])

  const formatBirthDisplay = (value) => {
    if (!value) return 'No asignado'
    const raw = typeof value === 'string' ? value.split('T')[0] : value
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return 'No asignado'
    return parsed.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user || currentUserLoaded) return

      try {
        const response = await getCurrentUserRequest()
        const payload = response?.data?.data?.person || response?.data?.person || response?.data?.data || response?.data

        console.log('DEBUG profile /users/me payload:', payload)

        if (!payload) return

        const nextUserPatch = {}
        const birthDateValue = payload.birth_date || payload?._People?.birth_date || payload?.birthday || payload?.dateOfBirth || payload?.dob
        const profileEmail = payload.personal_email || payload?._People?.personal_email || payload.email
        const profilePhone = payload.phone_number || payload?._People?.phone_number
        const profileFirstName = payload.first_name || payload?._People?.first_name
        const profileLastName = payload.last_name || payload?._People?.last_name

        if (birthDateValue) nextUserPatch.birth_date = birthDateValue
        if (profileEmail) nextUserPatch.personal_email = profileEmail
        if (profilePhone) nextUserPatch.phoneNumber = profilePhone
        if (profileFirstName) nextUserPatch.firstName = profileFirstName
        if (profileLastName) nextUserPatch.lastName = profileLastName
        if (payload._People) nextUserPatch._People = payload._People

        console.log('DEBUG profile /users/me patch:', nextUserPatch)

        if (Object.keys(nextUserPatch).length > 0) {
          updateUserState(nextUserPatch)
        }
      } catch (error) {
        console.error('Error al obtener /users/me:', error)
      } finally {
        setCurrentUserLoaded(true)
      }
    }

    fetchCurrentUser()
  }, [user, currentUserLoaded, updateUserState])

  // MAPEO SINCRONIZADO CON EL JSON DEL GET
  const profileData = {
    name: user?.firstName || 'No asignado',
    lastname: user?.lastName || 'No asignado',
    id: user?.documentNumber || 'No asignado',
    birth: formatBirthDisplay(
      user?.birth_date ||
      user?.birthDate ||
      user?.birthday ||
      user?.dateOfBirth ||
      user?.dob ||
      user?._People?.birth_date ||
      user?._People?.birthDate ||
      null,
    ),
    email: user?.email || user?.personal_email || user?._People?.personal_email || '',
    cellphone: user?.phoneNumber || 'Sin número registrado',
    password: '••••••••',
  }

  const handleVerifyIdentity = async (passwordInput) => {
    setLoadingAction(true)
    try {
      const response = await verifySecurityIdentityRequest({ password: passwordInput })
      const token = response?.data?.securityChangeToken || response?.securityChangeToken

      if (token) {
        setSecurityToken(token)
        setStep('editing')
      } else {
        throw new Error('No se recibió el token de seguridad.')
      }
    } catch (error) {
      console.error('Error al verificar identidad:', error)
      throw error
    } finally {
      setLoadingAction(false)
    }
  }

  const handleUpdate = async (updatedData) => {
    if (!securityToken) {
      alert('Debes verificar tu contraseña antes de guardar los cambios.')
      setStep('view')
      return
    }

    const currentEmail = (user?.email || user?.personal_email || user?._People?.personal_email || '').trim().toLowerCase()
    const targetEmail = updatedData.email.trim().toLowerCase()
    const currentPhone = (user?.phoneNumber || '').trim()
    const targetPhone = updatedData.cellphone.trim()
    const currentName = (user?.firstName || user?.name || '').trim()
    const targetName = updatedData.name.trim()
    const currentLastname = (user?.lastName || user?.lastname || '').trim()
    const targetLastname = updatedData.lastname.trim()

    const hasNameChanged = targetName !== currentName
    const hasLastnameChanged = targetLastname !== currentLastname
    const hasEmailChanged = targetEmail !== currentEmail
    const hasPhoneChanged = targetPhone !== currentPhone

    if (!hasNameChanged && !hasLastnameChanged && !hasEmailChanged && !hasPhoneChanged) {
      alert('No has realizado ningún cambio para guardar.')
      return
    }

    const profilePayload = {}
    if (hasNameChanged) profilePayload.firstName = targetName
    if (hasLastnameChanged) profilePayload.lastName = targetLastname
    if (hasPhoneChanged) profilePayload.phoneNumber = updatedData.cellphone.trim()

    setLoadingAction(true)
    try {
      if (hasEmailChanged) {
        const response = await changeSecurityDataRequest({ securityChangeToken: securityToken, newEmail: updatedData.email.trim() })
        if (!(response?.success || response?.status === 200 || response?.data)) {
          alert(response?.message || 'No se pudo cambiar el correo.')
          setLoadingAction(false)
          return
        }
      }

      if (Object.keys(profilePayload).length > 0) {
        await updateProfileRequest(profilePayload).catch((err) => {
          console.error('Error no crítico al actualizar metadatos del perfil:', err)
        })
      }

      if (hasEmailChanged) updateProfileState(updatedData.email.trim())
      if (hasNameChanged || hasLastnameChanged || hasPhoneChanged) {
        updateUserState({
          firstName: targetName,
          name: targetName,
          lastName: targetLastname,
          lastname: targetLastname,
          phoneNumber: profilePayload.phoneNumber || currentPhone,
        })
      }

      setSecurityToken(null)
      setStep('view')
      setShowSuccess(true)
    } catch (error) {
      console.error('Error al guardar cambios de perfil:', error)
      alert(error.response?.data?.message || 'Error inesperado al guardar cambios.')
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
