import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import SendMailForm from '../SendMailForm'
import { AuthContext } from '../../../context/AuthContext'

describe('SendMailForm', () => {
  test('envía el correo correctamente', async () => {
    const mockSendRecoveryEmail = vi.fn()
    const mockOnNext = vi.fn()

    render(
      <AuthContext.Provider
        value={{ sendRecoveryEmail: mockSendRecoveryEmail }}
      >
        <SendMailForm onNext={mockOnNext} />
      </AuthContext.Provider>,
    )

    const input = screen.getByLabelText(/correo/i)
    const button = screen.getByText(/enviar correo/i)

    fireEvent.change(input, { target: { value: 'test@mail.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSendRecoveryEmail).toHaveBeenCalledWith('test@mail.com')
      expect(mockOnNext).toHaveBeenCalledWith('test@mail.com')
    })
  })
})
