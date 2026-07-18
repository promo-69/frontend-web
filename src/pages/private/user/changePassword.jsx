import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../context/AuthContext'
import { verifySecurityIdentityRequest, changeSecurityDataRequest } from '../../../services/auth.service'
import Edit from '../../../components/ui/Edit'
import SuccessModal from '../../../components/ui/SuccessModal'

function ChangePassword() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [step, setStep] = useState('verify')
  const [securityToken, setSecurityToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleVerifyIdentity = async (passwordInput) => {
    setLoading(true)
    try {
      const response = await verifySecurityIdentityRequest({ password: passwordInput })
      const token = response?.data?.securityChangeToken || response?.securityChangeToken
      if (!token) throw new Error('Token de seguridad no recibido')
      setSecurityToken(token)
      setStep('change')
    } catch (error) {
      console.error('Error al verificar identidad para cambiar contraseña:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (newPassword) => {
    if (!securityToken) {
      alert('El token de seguridad ha expirado. Verifica tu contraseña nuevamente.')
      setStep('verify')
      return
    }

    setLoading(true)
    try {
      const payload = { securityChangeToken: securityToken, newPassword }
      const response = await changeSecurityDataRequest(payload)
      const success = response?.success || response?.status === 200 || Boolean(response?.data)
      if (!success) {
        throw new Error(response?.message || 'No se pudo cambiar la contraseña')
      }
      setShowSuccess(true)
      setStep('verify')
      setSecurityToken(null)
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      alert(error?.response?.data?.message || error.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white flex flex-col justify-between font-montserrat overflow-x-hidden">
      <main className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
        <div className="hidden md:block md:w-1/2">
          <img
            src="/src/assets/images/profile.png"
            className="w-full h-full object-cover object-left-top min-h-[calc(100vh-80px)]"
            alt="perfil"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center justify-start pt-10 md:pt-16 lg:pt-24 p-6 md:p-12 z-10 bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center w-full max-w-sm lg:max-w-md pt-0">
            <div className="text-center mb-6">
              <h1 className="text-[#D9982F] text-3xl md:text-4xl font-bold tracking-tight">
                Cambiar Contraseña
              </h1>
            </div>

            {step === 'verify' && (
              <Edit
                onConfirm={handleVerifyIdentity}
                onCancel={() => navigate('/profile')}
                loading={loading}
                title="Verifica tu contraseña actual"
              />
            )}

            {step === 'change' && (
              <form
                className="w-full bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  const newPassword = e.target.elements.newPassword?.value?.trim()
                  if (!newPassword) return
                  handleChangePassword(newPassword)
                }}
              >
                <label className="text-[12px] font-bold text-gray-400 uppercase">Nueva contraseña</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="w-full mt-2 mb-6 px-3 py-2 rounded-xl bg-transparent border border-white/10 text-white outline-none text-sm"
                  placeholder="Escribe tu nueva contraseña"
                  required
                />

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('verify')}
                    disabled={loading}
                    className="flex-1 border border-white/20 text-white rounded-full py-3 text-sm uppercase transition-all hover:bg-white/10 disabled:opacity-60"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-3 text-sm uppercase transition-all hover:bg-[#c28621] disabled:opacity-60"
                  >
                    {loading ? 'Procesando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {showSuccess && (
        <SuccessModal
          message="Tu contraseña se cambió con éxito."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default ChangePassword
