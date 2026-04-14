import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest'; 
import FormEditProfile from '../FormEditProfile';

const mockUserData = {
  name: 'Mary Sofia',
  lastname: 'Perez',
  id: '26.123.456',
  birth: '2001-05-15',
  email: 'mary@ucla.edu.ve',
  password: 'Password123!',
  cellphone: '+584141234567'
};

describe('FormEditProfile Component', () => {
  const mockSetStep = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar los datos del usuario correctamente en modo vista', () => {
    render(
      <FormEditProfile 
        userData={mockUserData} 
        step="view" 
        setStep={mockSetStep} 
        onSave={mockOnSave} 
      />
    );
    
    expect(screen.getByText(mockUserData.name)).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue(mockUserData.email);
    expect(emailInput).toHaveAttribute('readOnly');
  });

  it('debe mostrar errores de validación con datos inválidos en modo edición', async () => {
    const user = userEvent.setup();
    render(<FormEditProfile userData={mockUserData} step="editing" setStep={mockSetStep} onSave={mockOnSave} />);

    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const saveButton = screen.getByRole('button', { name: /Guardar/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'correo-no-valido');
    await user.clear(passwordInput);
    await user.type(passwordInput, '123');

    await user.click(saveButton);

    expect(screen.getByText(/Correo inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/Clave no cumple requisitos/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('debe llamar a onSave con los datos correctos cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    render(<FormEditProfile userData={mockUserData} step="editing" setStep={mockSetStep} onSave={mockOnSave} />);

    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const saveButton = screen.getByRole('button', { name: /Guardar/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'nuevo@dominio.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'NuevaClave2026*');

    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      email: 'nuevo@dominio.com',
      password: 'NuevaClave2026*',
    }));
  });

  it('debe permitir cambiar el prefijo del teléfono', async () => {
    const user = userEvent.setup();
    render(<FormEditProfile userData={mockUserData} step="editing" setStep={mockSetStep} onSave={mockOnSave} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '+57');

    const saveButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        cellphone: expect.stringContaining('+57')
      })
    );
  });
});