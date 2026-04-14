import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterContext } from '../../../context/RegisterContext'
import RegisterForm from '../RegisterForm'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

describe('RegisterForm', () => {
  it('debe mostrar error si el teléfono es muy corto y aceptar datos válidos', async () => {
    const mockSaveStep1 = vi.fn()
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterContext.Provider value={{ saveStep1: mockSaveStep1 }}>
          <RegisterForm />
        </RegisterContext.Provider>
      </MemoryRouter>,
    )

    const nameInput = screen.getByPlaceholderText(/nombre/i)
    const lastnameInput = screen.getByPlaceholderText(/apellido/i)
    const emailInput = screen.getByPlaceholderText(/correo/i)
    const phoneInput = screen.getByPlaceholderText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'Juan')
    await user.type(lastnameInput, 'Pérez')
    await user.type(emailInput, 'juan@dominio.com')
    await user.type(phoneInput, '123')

    await user.click(submitButton)

    expect(
      screen.getByText(/teléfono debe tener entre 7 y 15 dígitos/i),
    ).toBeInTheDocument()

    await user.clear(phoneInput)
    await user.type(phoneInput, '04141234567')
    await user.click(submitButton)

    expect(
      screen.queryByText(/teléfono debe tener entre 7 y 15 dígitos/i),
    ).not.toBeInTheDocument()

    expect(mockSaveStep1).toHaveBeenCalled()
  })
})
