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
  beforeEach(() => {
    mockNavigate.mockClear()
    window.localStorage.clear()
  })

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

    fireEvent.click(screen.getByRole('button', { name: /Seleccionar/i }))
    fireEvent.click(screen.getByRole('button', { name: /Masculino/i }))

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/register2',
        expect.objectContaining({
          state: expect.objectContaining({
            gender: '1',
            countryCode: '+58',
          }),
        }),
      )
    })
  })

  test('muestra errores cuando faltan campos obligatorios', async () => {
    const { container } = render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    fireEvent.submit(form)

    const nameErrors = await screen.findAllByText(/El nombre es requerido/i)
    expect(nameErrors).toHaveLength(2)
    expect(await screen.findByText(/El correo es requerido/i)).toBeInTheDocument()
    expect(await screen.findByText(/Teléfono es requerido/i)).toBeInTheDocument()

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
