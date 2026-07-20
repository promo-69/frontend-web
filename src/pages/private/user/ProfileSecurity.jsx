import { useState, useContext, useEffect } from 'react'
import profileImage  from '../../../assets/images/profile.png'
import SuccessModal from '../../../components/ui/SuccessModal'
import ModalMessage from '../../../components/ui/ModalMessage'
import InputText from '../../../components/ui/InputText'
import InputPassword from '../../../components/ui/InputPassword'
import InputPhone from '../../../components/ui/InputPhone'
import InputSelect from '../../../components/ui/InputSelect'
import Button from '../../../components/ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { FiEdit2, FiX } from 'react-icons/fi'
import {
  getCurrentUserRequest,
  updateProfileRequest,
  verifySecurityIdentityRequest,
  changeSecurityDataRequest
} from '../../../services/auth.service'

export default function ProfileSecurity() {
  const { user, updateUserState, updateProfileState } = useContext(AuthContext)

  const [currentUserLoaded, setCurrentUserLoaded] = useState(false)
  const [showProfileSuccess, setShowProfileSuccess] = useState(false)
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // -- Profile Form States --
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [phonePrefix, setPhonePrefix] = useState('+58')
  const [phoneBody, setPhoneBody] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)

  // -- Security Form States --
  const [email, setEmail] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [loadingSecurity, setLoadingSecurity] = useState(false)

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  const formatBirthForInput = (value) => {
    if (!value) return ''
    const raw = typeof value === 'string' ? value.split('T')[0] : value
    if (raw.match(/^\d{4}-\d{2}-\d{2}$/)) return raw
    
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toISOString().split('T')[0]
  }

  const fetchCurrentUser = async (force = false) => {
    if (!force && (!user || currentUserLoaded)) return

    try {
      const response = await getCurrentUserRequest()
      let payload = response?.data?.data || response?.data
      if (payload?.person && typeof payload.person === 'object') {
        payload = payload.person
      }

      if (!payload) return

      const nextUserPatch = {}
      const birthDateValue = payload.birth_date || payload?._People?.birth_date || payload?.birthday || payload?.dateOfBirth || payload?.dob
      const profileEmail = payload.personal_email || payload?._People?.personal_email || payload.email
      const profilePhone = payload.phone_number || payload?._People?.phone_number
      const profileFirstName = payload.first_name || payload?._People?.first_name
      const profileLastName = payload.last_name || payload?._People?.last_name
      const profileGender = payload.gender || payload.gender_id || payload?._People?.gender || payload?._People?.gender_id

      if (birthDateValue) nextUserPatch.birth_date = birthDateValue
      if (profileEmail) nextUserPatch.personal_email = profileEmail
      if (profilePhone) nextUserPatch.phoneNumber = profilePhone
      if (profileFirstName) nextUserPatch.firstName = profileFirstName
      if (profileLastName) nextUserPatch.lastName = profileLastName
      if (profileGender) nextUserPatch.gender_id = profileGender
      if (payload._People) nextUserPatch._People = payload._People

      if (Object.keys(nextUserPatch).length > 0) {
        updateUserState(nextUserPatch)
      }
    } catch (error) {
      console.error('Error al obtener /users/me:', error)
    } finally {
      if (!force) setCurrentUserLoaded(true)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [user, currentUserLoaded, updateUserState])

  useEffect(() => {
    setName(user?.firstName || '')
    setLastname(user?.lastName || '')
    setEmail(user?.email || user?.personal_email || user?._People?.personal_email || '')
    setDocumentId(user?.documentNumber || 'No asignado')
    
    setBirthDate(formatBirthForInput(
      user?.birth_date ||
      user?.birthDate ||
      user?.birthday ||
      user?.dateOfBirth ||
      user?.dob ||
      user?._People?.birth_date ||
      user?._People?.birthDate ||
      null
    ))
    
    setGender(String(user?.gender_id || user?.gender || user?._People?.gender_id || user?._People?.gender || ''))

    const phone = user?.phoneNumber || ''
    if (phone.startsWith('+')) {
      setPhonePrefix(phone.substring(0, 3))
      setPhoneBody(phone.substring(3))
    } else {
      setPhoneBody(phone)
    }
  }, [user])

  const handleProfileUpdate = async () => {
    const currentPhone = (user?.phoneNumber || '').trim()
    const targetPhone = `${phonePrefix}${phoneBody}`.trim()
    const currentName = (user?.firstName || user?.name || '').trim()
    const targetName = name.trim()
    const currentLastname = (user?.lastName || user?.lastname || '').trim()
    const targetLastname = lastname.trim()
    
    const currentBirth = formatBirthForInput(user?.birth_date || user?.birthDate || user?.birthday || user?.dateOfBirth || user?.dob || user?._People?.birth_date || user?._People?.birthDate || null)
    const targetBirth = birthDate.trim()
    const currentGender = String(user?.gender_id || user?.gender || user?._People?.gender_id || user?._People?.gender || '')
    const targetGender = gender.trim()

    const hasNameChanged = targetName !== currentName
    const hasLastnameChanged = targetLastname !== currentLastname
    const hasPhoneChanged = targetPhone !== currentPhone
    const hasBirthChanged = targetBirth !== currentBirth
    const hasGenderChanged = targetGender !== currentGender

    if (!hasNameChanged && !hasLastnameChanged && !hasPhoneChanged && !hasBirthChanged && !hasGenderChanged) {
      setErrorMessage('No has realizado ningún cambio en tu perfil para guardar.')
      return
    }

    const profilePayload = {}
    if (hasNameChanged) profilePayload.firstName = targetName
    if (hasLastnameChanged) profilePayload.lastName = targetLastname
    if (hasPhoneChanged) profilePayload.phoneNumber = targetPhone
    if (hasBirthChanged) profilePayload.birthDate = targetBirth
    if (hasGenderChanged) profilePayload.gender = Number(targetGender)

    setLoadingProfile(true)
    try {
      await updateProfileRequest(profilePayload)
      // Force reload data from backend
      await fetchCurrentUser(true)
      setShowProfileSuccess(true)
    } catch (error) {
      console.error('Error al guardar cambios de perfil:', error)
      setErrorMessage(error.response?.data?.message || 'Error inesperado al guardar cambios del perfil.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSecurityUpdate = async (e) => {
    e.preventDefault()

    const targetEmail = email.trim().toLowerCase()
    const currentEmail = (user?.email || user?.personal_email || user?._People?.personal_email || '').trim().toLowerCase()
    const hasEmailChanged = isEditingEmail && (targetEmail !== currentEmail)
    const hasPasswordChanged = isEditingPassword && (newPasswordInput.trim().length > 0)

    if (!hasEmailChanged && !hasPasswordChanged) {
      setErrorMessage('Habilita y modifica al menos un campo (correo o contraseña) para actualizar.')
      return
    }

    if (!currentPasswordInput) {
      setErrorMessage('Debes ingresar tu contraseña actual para confirmar los cambios de seguridad.')
      return
    }

    setLoadingSecurity(true)
    try {
      const verifyRes = await verifySecurityIdentityRequest({ password: currentPasswordInput })
      const token = verifyRes?.data?.securityChangeToken || verifyRes?.securityChangeToken
      if (!token) throw new Error('No se pudo verificar tu identidad. Comprueba tu contraseña actual.')

      const payload = { securityChangeToken: token }
      if (hasEmailChanged) payload.newEmail = targetEmail
      if (hasPasswordChanged) payload.newPassword = newPasswordInput

      const changeRes = await changeSecurityDataRequest(payload)
      const success = changeRes?.success || changeRes?.status === 200 || changeRes?.status === 201 || changeRes?.status === 204 || Boolean(changeRes?.data)
      
      if (success) {
        // Force reload data from backend
        await fetchCurrentUser(true)
        if (hasEmailChanged) {
          updateProfileState(targetEmail)
          setIsEditingEmail(false)
        }
        if (hasPasswordChanged) {
          setNewPasswordInput('')
          setIsEditingPassword(false)
        }
        setShowPasswordSuccess(true)
        setCurrentPasswordInput('')
      } else {
        throw new Error(changeRes?.message || 'Error al actualizar los datos de seguridad.')
      }
    } catch (error) {
      console.error('Error en seguridad:', error)
      setErrorMessage(error?.response?.data?.message || error.message || 'Error al actualizar seguridad.')
    } finally {
      setLoadingSecurity(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white flex flex-col justify-between font-montserrat overflow-x-hidden">
      <main className="flex-grow flex flex-col lg:flex-row relative">

        <div className="hidden lg:block lg:w-[35%] xl:w-[40%] relative bg-[#1a0f30]">
          <img
            src={profileImage}
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-80"
            alt="Perfil"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#2A154B] pointer-events-none" />
        </div>

        <div className="w-full lg:w-[65%] xl:w-[60%] flex flex-col justify-start pt-10 md:pt-16 p-6 md:p-12 xl:p-20 z-10 min-h-[calc(100vh-80px)] shadow-[-20px_0_40px_rgba(35,22,64,1)]">
          <div className="w-full max-w-4xl mx-auto pb-10">
            <div className="mb-10 border-l-[4px] border-[#D9982F] pl-5 py-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase mb-3">
                <span className="text-white">MI</span> <span className="text-[#D9982F]">PERFIL</span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
                Gestiona tu información personal y preferencias de seguridad.
              </p>
            </div>

            <hr className="border-white/10 mb-10" />

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-10">
              <div className="w-full md:w-1/3 shrink-0">
                <h2 className="text-lg font-bold text-white mb-1">Mi Perfil</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Actualiza tus datos personales básicos y de contacto.
                </p>
              </div>

              <div className="w-full md:w-2/3">
                <div className="bg-[#231640] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputText
                      id="name"
                      label="Nombre"
                      value={name}
                      register={{
                        value: name,
                        onChange: (e) => setName(e.target.value)
                      }}
                    />
                    <InputText
                      id="lastname"
                      label="Apellido"
                      value={lastname}
                      register={{
                        value: lastname,
                        onChange: (e) => setLastname(e.target.value)
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputPhone
                      id="documentId"
                      label="Cédula"
                      valueSelect={documentId ? documentId.charAt(0).toUpperCase() : 'V'}
                      onChangeSelect={() => {}}
                      options={[
                        { name: 'V', desc: 'V' },
                        { name: 'E', desc: 'E' },
                        { name: 'J', desc: 'J' },
                        { name: 'P', desc: 'P' },
                        { name: 'G', desc: 'G' }
                      ]}
                      valueText={documentId ? documentId.substring(1) : ''}
                      registerText={{
                        value: documentId ? documentId.substring(1) : '',
                        disabled: true
                      }}
                    />

                    <InputText
                      id="birthDate"
                      type="date"
                      label="Fecha de Nacimiento"
                      value={birthDate}
                      register={{
                        value: birthDate,
                        onChange: (e) => setBirthDate(e.target.value)
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputPhone
                      id="phoneBody"
                      label="Teléfono Móvil"
                      valueSelect={phonePrefix}
                      onChangeSelect={(e) => setPhonePrefix(e.target.value)}
                      options={[
                        { name: 'VE +58', desc: '+58' },
                        { name: 'CO +57', desc: '+57' }
                      ]}
                      valueText={phoneBody}
                      registerText={{
                        value: phoneBody,
                        onChange: (e) => setPhoneBody(e.target.value)
                      }}
                    />

                    <InputSelect
                      id="gender"
                      label="Género"
                      value={gender}
                      options={[
                        { label: 'Masculino', value: '1' },
                        { label: 'Femenino', value: '2' },
                        { label: 'Prefiero no decirlo', value: '3' }
                      ]}
                      register={{
                        value: gender,
                        onChange: (e) => setGender(e.target.value)
                      }}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleProfileUpdate}
                      isLoading={loadingProfile}
                      text={loadingProfile ? 'Guardando...' : 'Guardar Perfil'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/10 mb-10" />

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-10">
              <div className="w-full md:w-1/3 shrink-0">
                <h2 className="text-lg font-bold text-white mb-1">Seguridad</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Actualiza tu correo electrónico o cambia tu contraseña para mantener tu cuenta protegida.
                </p>
              </div>

              <div className="w-full md:w-2/3">
                <form onSubmit={handleSecurityUpdate} className="bg-[#231640] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col gap-4">
                  <p className="text-[11px] text-[#D9982F] font-bold uppercase tracking-wider mb-2">
                    Datos a Actualizar
                  </p>

                  <div className="flex items-end gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingEmail) setEmail(user?.email || user?.personal_email || '')
                        setIsEditingEmail(!isEditingEmail)
                      }}
                      className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-300 ${isEditingEmail ? 'bg-[#D9982F] border-[#D9982F] text-[#231640]' : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}
                      title={isEditingEmail ? 'Cancelar edición' : 'Editar correo'}
                    >
                      {isEditingEmail ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 w-full min-w-0">
                      <InputText
                        id="email"
                        type="email"
                        label="Correo Electrónico"
                        value={email}
                        disabled={!isEditingEmail}
                        register={{
                          value: email,
                          onChange: (e) => setEmail(e.target.value)
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mt-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingPassword) setNewPasswordInput('')
                        setIsEditingPassword(!isEditingPassword)
                      }}
                      className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-300 ${isEditingPassword ? 'bg-[#D9982F] border-[#D9982F] text-[#231640]' : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}
                      title={isEditingPassword ? 'Cancelar edición' : 'Editar contraseña'}
                    >
                      {isEditingPassword ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 w-full min-w-0">
                      <InputPassword
                          id="newPassword"
                          label="Nueva Contraseña"
                          value={newPasswordInput}
                          disabled={!isEditingPassword}
                          register={{ 
                            name: "newPassword", 
                            value: newPasswordInput,
                            onChange: (e) => setNewPasswordInput(e.target.value)
                          }}
                      />
                    </div>
                  </div>

                  <hr className="border-white/10 my-4" />

                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-[#D9982F] font-bold uppercase tracking-wider mb-2">
                      Verificación Requerida
                    </p>
                    <InputPassword
                        id="currentPassword"
                        label="Contraseña Actual"
                        value={currentPasswordInput}
                        register={{
                          name: "currentPassword",
                          value: currentPasswordInput,
                          onChange: (e) => setCurrentPasswordInput(e.target.value),
                          required: true
                        }}
                    />
                    <p className="text-xs text-white/40 px-1">
                      Ingresa tu clave actual para autorizar los cambios en esta sección.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={!isEditingEmail && !isEditingPassword}
                      isLoading={loadingSecurity}
                      text={loadingSecurity ? 'Procesando...' : 'Actualizar Seguridad'}
                      className={(!isEditingEmail && !isEditingPassword) ? '!bg-white/10 !text-white/30 !shadow-none' : ''}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showProfileSuccess && (
        <SuccessModal
          message="Tu información de perfil ha sido actualizada con éxito."
          onClose={() => setShowProfileSuccess(false)}
        />
      )}

      {showPasswordSuccess && (
        <SuccessModal
          message="Tus datos de seguridad se actualizaron con éxito."
          onClose={() => setShowPasswordSuccess(false)}
        />
      )}
      
      {errorMessage && (
        <ModalMessage
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  )
}
