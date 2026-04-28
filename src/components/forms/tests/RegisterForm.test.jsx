import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import RegisterForm from '../RegisterForm'
import { BrowserRouter } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('RegisterForm', () => {
  test('renderiza correctamente el formulario', () => {
    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>,
    )

    expect(screen.getByRole('textbox', { name: /Nombre/i })).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /Apellido/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Correo/i })).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /Teléfono/i }),
    ).toBeInTheDocument()
  })

  test('envía el formulario y navega al paso 2', async () => {
    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByRole('textbox', { name: /Nombre/i }), {
      target: { value: 'Juan' },
    })

    fireEvent.change(screen.getByRole('textbox', { name: /Apellido/i }), {
      target: { value: 'Perez' },
    })

    fireEvent.change(screen.getByRole('textbox', { name: /Correo/i }), {
      target: { value: 'test@test.com' },
    })

    fireEvent.change(screen.getByRole('textbox', { name: /Teléfono/i }), {
      target: { value: '1234567' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })
})
