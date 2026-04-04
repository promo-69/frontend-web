import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm2 from '../RegisterForm2'

describe('RegisterForm2', () => {
  it('debe validar cédula, fecha, contraseña y confirmación', async () => {
    const user = userEvent.setup()
    render(<RegisterForm2 />)

    const idPrefix = screen.getByDisplayValue(/V/i)
    const idInput = screen.getByPlaceholderText(/Cédula/i)
    const birthdateInput = screen.getByLabelText(/Fecha de nacimiento/i)
    const passwordInput = screen.getByPlaceholderText(/^Contraseña$/i)
    const confirmInput = screen.getByPlaceholderText(/Confirmar contraseña/i)
    const submitButton = screen.getByRole('button', { name: /Guardar/i })

    // --- VALIDACIÓN DE CÉDULA ---
    await user.clear(idInput)
    await user.type(idInput, '123')

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Formato inválido/i)).toBeInTheDocument()
    })

    // --- VALIDACIÓN DE CONTRASEÑAS ---
    await user.selectOptions(idPrefix, 'V')
    await user.clear(idInput)
    await user.type(idInput, '12345678')
    await user.type(birthdateInput, '2000-01-01')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Password1234')

    await user.click(submitButton)

    expect(
      screen.getByText(/Las contraseñas no coinciden/i),
    ).toBeInTheDocument()

    
    await user.clear(confirmInput)
    await user.type(confirmInput, 'Password123')
    await user.click(submitButton)

    expect(
      screen.queryByText(/Las contraseñas no coinciden/i),
    ).not.toBeInTheDocument()
  })
})
