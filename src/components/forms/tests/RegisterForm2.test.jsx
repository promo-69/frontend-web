import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterContext } from '../../../context/RegisterContext'
import RegisterForm2 from '../RegisterForm2'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

describe('RegisterForm2', () => {
  it('debe validar cédula, fecha, contraseña y confirmación', async () => {
    const user = userEvent.setup()

    const mockRegisterCustomer = vi.fn().mockResolvedValue({ success: true })

    render(
      <MemoryRouter>
        <RegisterContext.Provider
          value={{
            registerCustomer: mockRegisterCustomer,
            step1Data: {
              name: 'Juan',
              lastname: 'Pérez',
              email: 'juan@test.com',
              phone: '04141234567',
            },
          }}
        >
          <RegisterForm2 />
        </RegisterContext.Provider>
      </MemoryRouter>,
    )

    const idPrefix = screen.getByText(/V/i)
    const idInput = screen.getByLabelText(/Cédula/i)
    const birthdateInput = screen.getByLabelText(/Fecha de nacimiento/i)
    const passwordInput = screen.getByLabelText(/Contraseña/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.clear(idInput)
    await user.type(idInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Formato inválido/i)).toBeInTheDocument()
    })

    await user.selectOptions(idPrefix, 'V')
    await user.clear(idInput)
    await user.type(idInput, '12345678')
    await user.type(birthdateInput, '2000-01-01')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password1234')

    await user.click(submitButton)

    expect(
      screen.getByText(/Las contraseñas no coinciden/i),
    ).toBeInTheDocument()

    await user.clear(confirmInput)
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    expect(
      screen.queryByText(/Las contraseñas no coinciden/i),
    ).not.toBeInTheDocument()

    expect(mockRegisterCustomer).toHaveBeenCalled()
  })
})
