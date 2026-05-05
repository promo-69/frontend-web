import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import NewPasswordForm from '../NewPasswordForm'
import { AuthContext } from '../../../../context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

const mockResetPassword = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NewPasswordForm', () => {
  const setup = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ resetPassword: mockResetPassword }}>
          <NewPasswordForm email="test@email.com" code="1234" />
        </AuthContext.Provider>
      </BrowserRouter>,
    )
  }

  it('debe mostrar error si contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    setup()

    const passwordInput = screen.getByLabelText(/^Contraseña$/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password999')
    await user.click(submitButton)

    expect(await screen.findByText(/No coinciden/i)).toBeInTheDocument()
  })

  it('debe enviar correctamente y mostrar éxito', async () => {
    const user = userEvent.setup()

    mockResetPassword.mockResolvedValue({ success: true })

    setup()

    const passwordInput = screen.getByLabelText(/^Contraseña$/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    expect(
      await screen.findByText(/Contraseña actualizada exitosamente/i),
    ).toBeInTheDocument()
  })

  it('debe redirigir al login después de cerrar modal de éxito', async () => {
    const user = userEvent.setup()

    mockResetPassword.mockResolvedValue({ success: true })

    setup()

    const passwordInput = screen.getByLabelText(/^Contraseña$/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    const closeButton = await screen.findByRole('button', { name: /Cerrar/i })
    await user.click(closeButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('debe mostrar error si backend responde fallo', async () => {
    const user = userEvent.setup()

    mockResetPassword.mockResolvedValue({
      success: false,
      message: 'Error backend',
    })

    setup()

    const passwordInput = screen.getByLabelText(/^Contraseña$/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    expect(await screen.findByText(/Error backend/i)).toBeInTheDocument()
  })

  it('debe manejar error de servidor (catch)', async () => {
    const user = userEvent.setup()

    mockResetPassword.mockRejectedValue(new Error('Server error'))

    setup()

    const passwordInput = screen.getByLabelText(/^Contraseña$/i)
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    expect(
      await screen.findByText(/Error al conectar con el servidor/i),
    ).toBeInTheDocument()
  })
})
