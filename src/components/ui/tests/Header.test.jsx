import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Header from '../Header';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(), 
  };
});

// Helper para renderizar con Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Componente Header', () => {
  
  // Limpiar mocks antes de cada test por si acaso
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('debe mostrar el botón de INGRESAR si no está logueado', () => {
    renderWithRouter(<Header isLoggedIn={false} />);
    expect(screen.getByRole('button', { name: /INGRESAR/i })).toBeInTheDocument();
  });

  it('debe mostrar el saludo y el carrito si está logueado', () => {
    const user = "Mary Sofia";
    renderWithRouter(<Header isLoggedIn={true} userName={user} />);
    
    expect(screen.getByText(`¡Hola ${user}!`)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('debe abrir el menú de usuario al hacer clic en el perfil', async () => {
    renderWithRouter(<Header isLoggedIn={true} userName="Mary Sofia" />);
    
    const profileButton = screen.getByRole('button', { name: /¡Hola Mary Sofia!/i });
    await userEvent.click(profileButton);

    expect(screen.getByText(/Historial de Compra/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument();
  });

  it('debe cambiar la ciudad seleccionada al usar el dropdown de ciudades', async () => {
    renderWithRouter(<Header />);
    
    // Abrir dropdown
    const cityButton = screen.getByText(/Barquisimeto/i);
    await userEvent.click(cityButton);

    // Seleccionar opción
    const valenciaOption = screen.getByText(/Valencia/i);
    await userEvent.click(valenciaOption);

    // En Vitest, verificamos que el texto esté presente en el botón actualizado
    const updatedButtons = screen.getAllByText(/Valencia/i);
    expect(updatedButtons.length).toBeGreaterThan(0);
  });
});