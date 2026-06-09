import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Header from '../Header'
import { AuthContext } from '../../../context/AuthContext'

// 🏙️ Mock del servicio de cines
vi.mock('../../../services/info.service', () => ({
  getCinemas: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: 'Cineflix Barquisimeto', city: 'Barquisimeto' },
      { id: 2, name: 'Cineflix Valencia', city: 'Valencia' },
    ]),
  ),
}))

// 🛒 ⭐ ADAPTADO: Estructura real de objetos con tickets y products
vi.mock('../../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: {
      tickets: [{ id: 101, seat: 'A-1' }], // 1 Ticket
      products: [{ id: 201, name: 'Combo Cotufas', quantity: 1 }], // 1 Producto
    }, // 1 + 1 = 2 (Mantiene verde tu aserción del segundo test)
    setCinema: vi.fn(),
  })),
}))

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

    // Este expect buscará el "2" que resulta de sumar tickets.length + products.length
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

    // Esperar a que cargue la ciudad inicial
    const cityButton = await screen.findByText(/Barquisimeto/i)
    await userEvent.click(cityButton)

    // Seleccionar el botón correcto del dropdown
    const allButtons = screen.getAllByRole('button')
    const valenciaOption = allButtons.find((btn) =>
      btn.textContent.includes('Valencia'),
    )

    expect(valenciaOption).toBeTruthy()

    await userEvent.click(valenciaOption)

    // Verificar que ahora aparece Valencia como ciudad seleccionada
    const updatedCity = await screen.findByText(/Valencia/i)
    expect(updatedCity).toBeInTheDocument()
  })
})
