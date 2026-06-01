import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SendCode from '../SendCode'
import { AuthContext } from '../../../../context/AuthContext'

const mockVerifyCode = vi.fn()
const mockOnNext = vi.fn()

describe('SendCode', () => {
  const setup = () => {
    return render(
      <AuthContext.Provider value={{ verifyRecoveryCode: mockVerifyCode }}>
        <SendCode email="test@email.com" onNext={mockOnNext} />
      </AuthContext.Provider>,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar error si el código está vacío', async () => {
    const user = userEvent.setup()
    setup()

    const submitButton = screen.getByRole('button', { name: /Validar/i })
    await user.click(submitButton)

    expect(
      await screen.findByText(/El código es obligatorio/i),
    ).toBeInTheDocument()
  })

  it('debe mostrar error si código es incorrecto', async () => {
    const user = userEvent.setup()

    mockVerifyCode.mockResolvedValue({
      success: false,
      message: 'Código inválido',
    })

    setup()

    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')

    const submitButton = screen.getByRole('button', { name: /Validar/i })
    await user.click(submitButton)

    expect(await screen.findByText(/Código inválido/i)).toBeInTheDocument()
  })

  it('debe avanzar si código es correcto', async () => {
    const user = userEvent.setup()

    // simular la estructura del AuthContext (res.data.data.resetToken)
    mockVerifyCode.mockResolvedValue({
      success: true,
      data: {
        data: { resetToken: 'TOKEN-1234' },
      },
    })

    setup()

    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')

    const submitButton = screen.getByRole('button', { name: /Validar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('test@email.com', '1234')
      expect(mockOnNext).toHaveBeenCalledWith('TOKEN-1234')
    })
  })
})
