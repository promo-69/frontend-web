import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../RegisterForm'

describe('RegisterForm', () => {
  it('debe mostrar error si el teléfono es muy corto y aceptar datos válidos', async () => {
    render(<RegisterForm />)

    const nameInput = screen.getByPlaceholderText(/Nombre/i)
    const lastnameInput = screen.getByPlaceholderText(/Apellido/i)
    const emailInput = screen.getByPlaceholderText(/Correo/i)
    const phoneInput = screen.getByPlaceholderText(/Teléfono/i)
    const submitButton = screen.getByRole('button', { name: /Siguiente/i })

    await userEvent.type(nameInput, 'Juan')
    await userEvent.type(lastnameInput, 'Pérez')
    await userEvent.type(emailInput, 'juan@dominio.com')
    await userEvent.type(phoneInput, '123')

    await userEvent.click(submitButton)
    expect(
      screen.getByText(/Teléfono debe tener entre 7 y 15 dígitos/i),
    ).toBeInTheDocument()

    await userEvent.clear(phoneInput)
    await userEvent.type(phoneInput, '04141234567')
    await userEvent.click(submitButton)

    expect(
      screen.queryByText(/Teléfono debe tener entre 7 y 15 dígitos/i),
    ).not.toBeInTheDocument()
  })
})
