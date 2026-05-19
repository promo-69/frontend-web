import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContext } from '../../../context/AuthContext'
import LoginForm from '../LoginForm'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

describe('LoginForm', () => {
  it('debe mostrar errores en campos inválidos y permitir submit con datos válidos', async () => {
    const mockLogin = vi
      .fn()
      .mockResolvedValue({ success: true, user: { hasSelectedGenres: false } })

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ login: mockLogin }}>
          <LoginForm />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText(/correo/i)
    const passwordInput = screen.getByLabelText(/contraseña$/i, {
      selector: 'input',
    })
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Email inválido
    await userEvent.type(emailInput, 'correo_invalido')
    await userEvent.tab()

    expect(screen.getByText(/debe tener al menos @ y \./i)).toBeInTheDocument()

    // Email válido
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'usuario@dominio.com')

    // Password válida
    await userEvent.type(passwordInput, 'MiClave123')

    // Submit
    await userEvent.click(submitButton)

    expect(
      screen.queryByText(/debe tener al menos @ y \./i),
    ).not.toBeInTheDocument()

    expect(mockLogin).toHaveBeenCalled()
  })
})
