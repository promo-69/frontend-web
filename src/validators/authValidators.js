export const validateName = (value) => {
  if (!value) return 'El nombre es requerido'
  if (value.length < 2) return 'Muy corto'
  return true
}

export const validateEmail = (value) => {
  if (!value) return 'El correo es requerido'
  if (!/\S+@\S+\.\S+/.test(value)) return 'El correo debe tener al menos @ y .'
  return true
}

export const validatePhone = (value) => {
  if (!/^[0-9]+$/.test(value)) return 'Solo números'
  return true
}

export const validateID = (value) => {
  if (!value) return 'La cédula es requerida'
  if (!/^[VE]\d{7,9}$/.test(value)) return 'Formato inválido (V/E + 7-9 dígitos)'
  return true
}

export const validateBirthdate = (value) => {
  if (!value) return 'Fecha de nacimiento requerida'
  const birthDate = new Date(value)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  if (age < 18) return 'Debes ser mayor de 18 años'
  return true
}

export const validatePassword = (value) => {
  if (!value) return 'Contraseña requerida'
  if (value.length < 8) return 'Mínimo 8 caracteres'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Debe incluir mayúscula, minúscula y número'
  return true
}
