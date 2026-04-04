import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

describe('LoginForm', () => {
  it('debe mostrar errores en campos inválidos y permitir submit con datos válidos', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText(/Correo/i)
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i })

    await userEvent.type(emailInput, 'correo_invalido')
    await userEvent.tab()

    expect(screen.getByText(/debe tener al menos @ y \./i)).toBeInTheDocument()

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'usuario@dominio.com')
    await userEvent.type(passwordInput, 'MiClave123')

    await userEvent.click(submitButton)

    expect(
      screen.queryByText(/debe tener al menos @ y \./i),
    ).not.toBeInTheDocument()
  })
})
