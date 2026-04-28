import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import RegisterForm2 from '../RegisterForm2'
import { AuthContext } from '../../../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'

const mockRegisterUser = vi.fn().mockResolvedValue({ success: true })

describe('RegisterForm2', () => {
  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ register: mockRegisterUser }}>
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
                gender: 'M',
              },
            },
          ]}
        >
          <RegisterForm2 />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

  test('renderiza correctamente', () => {
    renderComponent()

    expect(screen.getByText(/Cédula/i)).toBeInTheDocument()
    expect(screen.getByText(/Fecha de nacimiento/i)).toBeInTheDocument()
  })

  test('envía formulario correctamente', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Cédula'), '12345678')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '2000-01-01')
    await user.type(screen.getByLabelText('Contraseña'), 'Password123!')
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'Password123!',
    )

    await user.click(screen.getByText(/Guardar/i))

    expect(mockRegisterUser).toHaveBeenCalled()
  })
})
