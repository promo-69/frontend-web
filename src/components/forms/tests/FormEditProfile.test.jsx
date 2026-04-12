import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormEditProfile from '../FormEditProfile';

// Datos de prueba (mock)
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
  const mockSetStep = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

    // Verificar datos estáticos
    expect(screen.getByText(mockUserData.name)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.id)).toBeInTheDocument();
    
    // Verificar que los inputs sean de solo lectura
    const emailInput = screen.getByDisplayValue(mockUserData.email);
    expect(emailInput).toHaveAttribute('readOnly');
  });

  it('debe mostrar errores de validación con datos inválidos en modo edición', async () => {
    render(
      <FormEditProfile 
        userData={mockUserData} 
        step="editing" 
        setStep={mockSetStep} 
        onSave={mockOnSave} 
      />
    );

    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const saveButton = screen.getByRole('button', { name: /Guardar/i });

    // Limpiar y escribir datos inválidos
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'correo-no-valido');
    
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, '123'); // Muy corta y sin caracteres especiales

    await userEvent.click(saveButton);

    // Verificar mensajes de error según la lógica del componente
    expect(screen.getByText(/Correo inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/Clave no cumple requisitos/i)).toBeInTheDocument();
    
    // Asegurar que onSave no fue llamado
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('debe llamar a onSave con los datos correctos cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    render(
      <FormEditProfile 
        userData={mockUserData} 
        step="editing" 
        setStep={mockSetStep} 
        onSave={mockOnSave} 
      />
    );

    const emailInput = screen.getByLabelText(/Correo/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const phoneInput = screen.getByRole('textbox', { name: '' }); // El input de teléfono no tiene label explícito unido por ID, se busca por valor o rol
    const saveButton = screen.getByRole('button', { name: /Guardar/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'nuevo@dominio.com');
    
    await user.clear(passwordInput);
    await user.type(passwordInput, 'NuevaClave2026*');

    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      email: 'nuevo@dominio.com',
      password: 'NuevaClave2026*',
      cellphone: '+584141234567'
    });
  });

  it('debe permitir cambiar el prefijo del teléfono', async () => {
    render(
      <FormEditProfile 
        userData={mockUserData} 
        step="editing" 
        setStep={mockSetStep} 
        onSave={mockOnSave} 
      />
    );

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '+57');

    const saveButton = screen.getByRole('button', { name: /Guardar/i });
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        cellphone: expect.stringContaining('+57')
      })
    );
  });
});