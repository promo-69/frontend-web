import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import SendCode from '../SendCode'
import { AuthContext } from '../../../context/AuthContext'

describe('SendCode', () => {
  test('verifica código correctamente', async () => {
    const mockVerifyCode = vi.fn()
    const mockOnNext = vi.fn()

    render(
      <AuthContext.Provider value={{ verifyRecoveryCode: mockVerifyCode }}>
        <SendCode email="test@mail.com" onNext={mockOnNext} />
      </AuthContext.Provider>,
    )

    const inputs = screen.getAllByRole('textbox')

    // Simular ingreso de código 1234
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '2' } })
    fireEvent.change(inputs[2], { target: { value: '3' } })
    fireEvent.change(inputs[3], { target: { value: '4' } })

    const button = screen.getByText(/validar/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('test@mail.com', '1234')
      expect(mockOnNext).toHaveBeenCalled()
    })
  })

  test('muestra error si el código está incompleto', async () => {
    const mockVerifyCode = vi.fn()

    render(
      <AuthContext.Provider value={{ verifyRecoveryCode: mockVerifyCode }}>
        <SendCode email="test@mail.com" onNext={() => {}} />
      </AuthContext.Provider>,
    )

    const inputs = screen.getAllByRole('textbox')

    // Solo 2 dígitos
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '2' } })

    const button = screen.getByText(/validar/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/código incompleto/i)).toBeInTheDocument()
    })
  })
})
