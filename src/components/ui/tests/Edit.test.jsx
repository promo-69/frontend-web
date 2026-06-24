import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; 
import Edit from '../Edit';

describe('Componente Edit (Confirmación de Contraseña)', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const correctPassword = 'password123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar error si la contraseña es incorrecta', async () => {
    render(
      <Edit 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
        correctPassword={correctPassword} 
      />
    );

    const input = screen.getByPlaceholderText(/Contraseña/i);
    const validateButton = screen.getByRole('button', { name: /Validar/i });

    await userEvent.type(input, 'clave-erronea');
    await userEvent.click(validateButton);

    // 🌟 CORRECCIÓN CRÍTICA: Usar await + findByText para esperar que React renderice el error
    expect(await screen.findByText(/La contraseña es inválida/i)).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('debe llamar a onConfirm cuando la contraseña es correcta', async () => {
    render(
      <Edit 
        onConfirm={mockOnConfirm} 
        onCancel={mockOnCancel} 
        correctPassword={correctPassword} 
      />
    );

    const input = screen.getByPlaceholderText(/Contraseña/i);
    const validateButton = screen.getByRole('button', { name: /Validar/i });

    await userEvent.type(input, correctPassword);
    await userEvent.click(validateButton);

    // 🌟 PROTECCIÓN EXTRA: Esperamos a que la función mock sea llamada asíncronamente
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText(/La contraseña es inválida/i)).not.toBeInTheDocument();
  });

  it('debe llamar a onCancel al hacer clic en cancelar', async () => {
    render(<Edit onConfirm={mockOnConfirm} onCancel={mockOnCancel} correctPassword={correctPassword} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});