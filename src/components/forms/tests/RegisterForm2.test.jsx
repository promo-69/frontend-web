import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import RegisterForm2 from '../RegisterForm2'
import { MemoryRouter } from 'react-router-dom'

// 1. MOCKEAMOS EL SERVICIO DIRECTO EN LUGAR DEL CONTEXTO
vi.mock('../../../services/auth.service', () => ({
  registerRequest: vi.fn(),
}))

// Importamos la función mockeada para poder controlar sus respuestas y espionajes
import { registerRequest } from '../../../services/auth.service'

describe('RegisterForm2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/register2',
            state: {
              name: 'Juan',
              lastname: 'Perez',
              email: 'test@test.com',
              countryCode: '+58',
              phone: '1234567',
              gender: '1',
            },
          },
        ]}
      >
        <RegisterForm2 />
      </MemoryRouter>,
    )

  test('renderiza correctamente', () => {
    renderComponent()

    expect(screen.getByText(/Cédula/i)).toBeInTheDocument()
    expect(screen.getByText(/Fecha de nacimiento/i)).toBeInTheDocument()
  })

  test('envía formulario correctamente', async () => {
    // Simulamos que el servicio responde exitosamente
    vi.mocked(registerRequest).mockResolvedValue({ success: true })

    const user = userEvent.setup()
    renderComponent()

    // Llenamos los campos usando sus respectivos labels
    await user.type(screen.getByLabelText('Cédula'), '12345678')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '2000-01-01')

    // Si tienes múltiples inputs de tipo contraseña, los buscamos de manera segura
    const passwordInput = screen.getByLabelText('Contraseña')
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña')

    await user.type(passwordInput, 'abc123*')
    await user.type(confirmPasswordInput, 'abc123*')

    // Enviamos el formulario
    await user.click(screen.getByRole('button', { name: /Guardar/i }))

    // Esperamos a que la microtarea asíncrona del submit se complete y verifique el servicio
    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalled()
    })

    // Opcional: Verificamos que el payload se construya con la combinación del Paso 1 y Paso 2
    expect(registerRequest).toHaveBeenCalledWith({
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'test@test.com',
      phoneNumber: '+581234567',
      documentNumber: 'V12345678',
      birthDate: '2000-01-01',
      password: 'abc123*',
      gender: 1,
    })
  })

  test('muestra errores cuando hay datos inválidos', async () => {
    vi.mocked(registerRequest).mockResolvedValue({ success: true })

    renderComponent()

    fireEvent.change(screen.getByLabelText('Cédula'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), {
      target: { value: '2010-01-01' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'abc123*' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'different*' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }))

    expect(await screen.findByText(/Formato: V\/E \+ 7-9 dígitos sin espacios en blanco/i)).toBeInTheDocument()
    expect(await screen.findByText('Debes ser mayor de 18 años')).toBeInTheDocument()
    expect(await screen.findByText(/No coinciden/i)).toBeInTheDocument()
    expect(registerRequest).not.toHaveBeenCalled()
  })
})
