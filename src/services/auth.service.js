import api, { performRefresh } from '../api/axios'

// Verificacion para cambiar contraseña - Mary
export const verifySecurityIdentityRequest = async (payload) => {

  const response = await api.post('/users/me/security/verify', payload, {
    withCredentials: true,
  });
  return response.data;
};

// Cambio de datos de seguridad - Mary
export const changeSecurityDataRequest = async (payload) => {
  const response = await api.post('/users/me/security/change', payload, {
    withCredentials: true,
  });
  return response.data;
};

// Editar perfil general - Mary
export const updateProfileRequest = async (data) => {
  const response = await api.patch('/users/me/profile', data, {
    withCredentials: true,
  })
  return response
}




// ---------------------------------------------------------
// LOGIN (backend envía cookies HttpOnly)
// ---------------------------------------------------------
export const loginRequest = async (data) => {
  const response = await api.post('/auth/login', data, {
    withCredentials: true,
  })
  return response
}
 
// ---------------------------------------------------------
// OBTENER USUARIO ACTUAL 
// ---------------------------------------------------------
export const refreshSessionRequest = async () => {
  try {
    const response = await performRefresh()
    return response
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('refreshSessionRequest error:', { status, data, message: error.message })
    
    throw error 
  }
}

// ---------------------------------------------------------
// LOGOUT 
// ---------------------------------------------------------
export const logoutRequest = async () => {
  const response = await api.post(
    '/auth/logout',
    {},
    {
      withCredentials: true,
    },
  )
  return response
}

export const getPermissionsRequest = async () => {
  const response = await api.get('/auth/permissions')
  return response.data.data.permissions
}

// ---------------------------------------------------------
// REGISTER
// ---------------------------------------------------------
export const registerRequest = async (data) => {
  const response = await api.post('/auth/signup', data, {
    withCredentials: true,
  })
  return response
}

// ---------------------------------------------------------
// RECOVERY: Paso 1 — Enviar correo
// ---------------------------------------------------------
export const sendRecoveryEmailRequest = async (email) => {
  const response = await api.post(
    '/auth/forgot-password/2',
    { email },
    { withCredentials: true },
  )
  return response
}

// ---------------------------------------------------------
// RECOVERY: Paso 2 — Validar código
// ---------------------------------------------------------
export const verifyRecoveryCodeRequest = async (email, code) => {
  const response = await api.post(
    '/auth/verify-reset-code/2',
    { email, code },
  )
  return response
}

// ---------------------------------------------------------
// RECOVERY: Paso 3 — Guardar nueva contraseña
// ---------------------------------------------------------
export const resetPasswordRequest = async ({ email, newPassword, resetToken }) => {
  const response = await api.post(
    '/auth/reset-password/2',
    { email, newPassword, resetToken },
  )
  return response
}

// ---------------------------------------------------------
// VERIFY ACCOUNT
// ---------------------------------------------------------
export const verifyAccountRequest = async ({ email, code }) => {
  const response = await api.post(
    '/auth/verify-signup',
    { email, code },
  )
  return response
}


// ---------------------------------------------------------
// UPDATE PROFILE
// ---------------------------------------------------------
export const updateProfileRequestddd = async (data) => {
  const response = await api.patch('/users/me/profile', data, {
    withCredentials: true,
  })
  return response
}
