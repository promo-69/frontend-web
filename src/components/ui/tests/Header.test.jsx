import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Header from '../Header'
import { AuthContext } from '../../../context/AuthContext' // Ajusta la ruta según tu carpeta

// Mock de AuthContext
const mockAuthContext = {
  user: { name: 'Mary Sofia', role: 'ADMIN' },
  isLoggedIn: true,
  logout: vi.fn(),
}

describe('Componente Header', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const renderHeader = (ui, authValue = mockAuthContext) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthContext.Provider>,
    )
  }

  it('debe mostrar el botón de INGRESAR si no está logueado', () => {
    renderHeader(<Header isLoggedIn={false} />, {
      ...mockAuthContext,
      isLoggedIn: false,
      user: null,
    })
    expect(
      screen.getByRole('button', { name: /INGRESAR/i }),
    ).toBeInTheDocument()
  })

  it('debe mostrar el saludo y el carrito si está logueado', () => {
    const user = 'Mary Sofia'
    renderHeader(<Header isLoggedIn={true} userName={user} />)

    expect(
      screen.getByText(new RegExp(`¡Hola ${user}!`, 'i')),
    ).toBeInTheDocument()
    // Verifica el badge del carrito (asumiendo que el "2" es el texto del badge)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('debe abrir el menú de usuario al hacer clic en el perfil', async () => {
    renderHeader(<Header isLoggedIn={true} userName="Mary Sofia" />)

    const profileButton = screen.getByRole('button', {
      name: /¡Hola Mary Sofia!/i,
    })
    await userEvent.click(profileButton)

    expect(screen.getByText(/Historial de Compra/i)).toBeInTheDocument()
    expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument()
  })

  it('debe cambiar la ciudad seleccionada al usar el dropdown de ciudades', async () => {
    renderHeader(<Header />)

    const cityButton = screen.getByText(/Barquisimeto/i)
    await userEvent.click(cityButton)

    const valenciaOption = screen.getByText(/Valencia/i)
    await userEvent.click(valenciaOption)

    const updatedButtons = screen.getAllByText(/Valencia/i)
    expect(updatedButtons.length).toBeGreaterThan(0)
  })
})
