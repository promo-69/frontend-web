import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SendMailForm from '../SendMailForm'
import { AuthContext } from '../../../../context/AuthContext'

const mockSendRecoveryEmail = vi.fn()
const mockOnNext = vi.fn()

describe('SendMailForm', () => {
  const setup = () => {
    return render(
      <AuthContext.Provider
        value={{ sendRecoveryEmail: mockSendRecoveryEmail }}
      >
        <SendMailForm onNext={mockOnNext} />
      </AuthContext.Provider>,
    )
  }

  it('envía el correo correctamente', async () => {
    const user = userEvent.setup()

    mockSendRecoveryEmail.mockResolvedValue({ success: true })

    setup()

    const emailInput = screen.getByLabelText(/Correo/i)
    const submitButton = screen.getByRole('button', { name: /Enviar correo/i })

    await user.type(emailInput, 'test@email.com')
    emailInput.blur()

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSendRecoveryEmail).toHaveBeenCalled()
      expect(mockOnNext).toHaveBeenCalled()
    })
  })

  it('muestra error si backend falla', async () => {
    const user = userEvent.setup()

    mockSendRecoveryEmail.mockResolvedValue({
      success: false,
      message: 'No se pudo enviar el correo de recuperación',
    })

    setup()

    const emailInput = screen.getByLabelText(/Correo/i)
    const submitButton = screen.getByRole('button', { name: /Enviar correo/i })

    await user.type(emailInput, 'test@email.com')
    emailInput.blur()

    await user.click(submitButton)

    expect(
      await screen.findByText(/No se pudo enviar el correo de recuperación/i),
    ).toBeInTheDocument()
  })
})
