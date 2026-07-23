const trimInput = (value) => String(value ?? '').trim()

export const validateName = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'El nombre es requerido'
  if (trimmed.length < 2) return 'Muy corto'
  return true
}

export const validateEmail = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'El correo es requerido'
  if (!/\S+@\S+\.\S+/.test(trimmed)) return 'El correo debe tener al menos @ y .'
  return true
}

export const validatePhone = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'Teléfono es requerido'
  if (!/^[0-9]+$/.test(trimmed)) return 'Solo números'
  if (trimmed.length < 7 || trimmed.length > 15)
    return 'Teléfono debe tener entre 7 y 15 dígitos'
  return true
}

export const validateID = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'La cédula es requerida'
  if (!/^[VE]\d{7,9}$/.test(trimmed)) return 'Formato: V/E + 7-9 dígitos sin espacios en blanco'
  return true
}

export const validateBirthdate = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'Fecha de nacimiento requerida'
  const birthDate = new Date(trimmed)
  if (Number.isNaN(birthDate.getTime())) return 'Fecha de nacimiento inválida'
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
  const trimmed = trimInput(value)
  if (!trimmed) return 'Contraseña requerida'
  if (trimmed.length < 5) return 'Mínimo 5 caracteres'

  // Exige: Al menos una letra, al menos un número, Y al menos un carácter especial
  if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{5,}$/.test(trimmed)
  ) {
    return 'Debe incluir letras, al menos un número y un carácter especial'
  }

  return true
}

export const validateLoginPassword = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'La contraseña es requerida'
  return true
}

export const validateGender = (value) => {
  const trimmed = trimInput(value)
  if (!trimmed) return 'Selecciona un género'
  if (!['1', '2', '3'].includes(trimmed)) return 'Género inválido'
  return true
}

