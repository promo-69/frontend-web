import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SuccessModal from '../SuccessModal'; 

vi.mock('../IconosProyect', () => ({
  IconCheck: ({ className }) => (
    <span data-testid="icon-check" className={className} />
  )
}));

describe('Componente SuccessModal', () => {
  
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('debe renderizar el mensaje correctamente', () => {
    const testMessage = "Tu información ha sido actualizada.";
    render(<SuccessModal message={testMessage} onClose={() => {}} />);
    
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it('debe llamar a onClose cuando se hace clic en el botón Cerrar', async () => {
    const onCloseMock = vi.fn();
    render(<SuccessModal message="Exito" onClose={onCloseMock} />);
    
    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await userEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onClose cuando se hace clic en el fondo (overlay)', async () => {
    const onCloseMock = vi.fn();
    render(<SuccessModal message="Exito" onClose={onCloseMock} />);
    
    const overlay = screen.getByText('Exito').parentElement.parentElement;
    await userEvent.click(overlay);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('no debe llamar a onClose cuando se hace clic dentro del contenido del modal', async () => {
    const onCloseMock = vi.fn();
    render(<SuccessModal message="No cerrar" onClose={onCloseMock} />);
    
    const modalContent = screen.getByText('No cerrar');
    await userEvent.click(modalContent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('debe mostrar el icono de check', () => {
    render(<SuccessModal message="Test" onClose={() => {}} />);
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });
});