import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import NewPasswordForm from '../NewPasswordForm'
import { AuthContext } from '../../../context/AuthContext'

describe('NewPasswordForm', () => {
  test('resetea contraseña correctamente', async () => {
    const mockResetPassword = vi.fn()

    render(
      <AuthContext.Provider value={{ resetPassword: mockResetPassword }}>
        <NewPasswordForm email="test@mail.com" code="1234" />
      </AuthContext.Provider>,
    )

    const passwordInput = screen.getByLabelText(/contraseña/i)
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i)

    fireEvent.change(passwordInput, {
      target: { value: 'Password123!' },
    })

    fireEvent.change(confirmInput, {
      target: { value: 'Password123!' },
    })

    const button = screen.getByText(/guardar/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        email: 'test@mail.com',
        newPassword: 'Password123!',
        code: '1234',
      })
    })
  })

  test('muestra error si las contraseñas no coinciden', async () => {
    const mockResetPassword = vi.fn()

    render(
      <AuthContext.Provider value={{ resetPassword: mockResetPassword }}>
        <NewPasswordForm email="test@mail.com" code="1234" />
      </AuthContext.Provider>,
    )

    const passwordInput = screen.getByLabelText(/contraseña/i)
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i)

    fireEvent.change(passwordInput, {
      target: { value: 'Password123!' },
    })

    fireEvent.change(confirmInput, {
      target: { value: 'OtraPassword123!' },
    })

    const button = screen.getByText(/guardar/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    })
  })
})
