import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock de useNavigate para verificar navegación
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// Helper para renderizar con Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Componente Header', () => {
  it('debe mostrar el botón de INGRESAR si no está logueado', () => {
    renderWithRouter(<Header isLoggedIn={false} />);
    expect(screen.getByRole('button', { name: /INGRESAR/i })).toBeInTheDocument();
  });

  it('debe mostrar el saludo y el carrito si está logueado', () => {
    const user = "Mary";
    renderWithRouter(<Header isLoggedIn={true} userName={user} />);
    
    expect(screen.getByText(`¡Hola ${user}!`)).toBeInTheDocument();
    // El badge del carrito con el número 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('debe abrir el menú de usuario al hacer clic en el perfil', async () => {
    renderWithRouter(<Header isLoggedIn={true} userName="Mary" />);
    
    const profileButton = screen.getByRole('button', { name: /¡Hola Mary!/i });
    await userEvent.click(profileButton);

    // Verificar que aparezcan opciones del menú desplegable
    expect(screen.getByText(/Historial de Compra/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument();
  });

  it('debe cambiar la ciudad seleccionada al usar el dropdown de ciudades', async () => {
    renderWithRouter(<Header />);
    
    // El botón inicial dice Barquisimeto por defecto
    const cityButton = screen.getByText(/Barquisimeto/i);
    await userEvent.click(cityButton);

    // Seleccionamos Valencia
    const valenciaOption = screen.getByText(/Valencia/i);
    await userEvent.click(valenciaOption);

    // Ahora el botón principal debería mostrar Valencia
    expect(screen.getAllByText(/Valencia/i)[0]).toBeInTheDocument();
  });
});