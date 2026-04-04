import React from 'react'
import {
  validateName,
  validateEmail,
  validatePhone,
  validateID,
  validateBirthdate,
  validatePassword,
} from './authValidators'

describe('authValidators', () => {
  test('validateName', () => {
    expect(validateName('')).toBe('El nombre es requerido')
    expect(validateName('A')).toBe('Muy corto')
    expect(validateName('Ana')).toBe(true)
  })

  test('validateEmail', () => {
    expect(validateEmail('')).toBe('El correo es requerido')
    expect(validateEmail('abc')).toBe('El correo debe tener al menos @ y .')
    expect(validateEmail('a@b.com')).toBe(true)
  })

  test('validatePhone', () => {
    expect(validatePhone('')).toBe('El teléfono es requerido')
    expect(validatePhone('abc123')).toBe('Solo números')
    expect(validatePhone('04141234567')).toBe(true)
  })

  test('validateID', () => {
    expect(validateID('')).toBe('La cédula es requerida')
    expect(validateID('X1234567')).toBe('Formato inválido (V/E + 7-9 dígitos)')
    expect(validateID('V12345678')).toBe(true)
  })

  test('validateBirthdate', () => {
    expect(validateBirthdate('')).toBe('Fecha de nacimiento requerida')
    const old = new Date()
    old.setFullYear(old.getFullYear() - 20)
    expect(validateBirthdate(old.toISOString().slice(0, 10))).toBe(true)

    const young = new Date()
    young.setFullYear(young.getFullYear() - 16)
    expect(validateBirthdate(young.toISOString().slice(0, 10))).toBe(
      'Debes ser mayor de 18 años',
    )
  })

  test('validatePassword', () => {
    expect(validatePassword('')).toBe('Contraseña requerida')
    expect(validatePassword('abc123')).toBe('Mínimo 8 caracteres')
    expect(validatePassword('abcdefgh')).toBe(
      'Debe incluir mayúscula, minúscula y número',
    )
    expect(validatePassword('Abcdef12')).toBe(true)
  })
})
