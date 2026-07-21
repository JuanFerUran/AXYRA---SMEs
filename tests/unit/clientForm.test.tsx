import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@/features/clients/hooks/useClientStatuses', () => ({
  useClientStatuses: () => ({ statuses: [{ id: 's1', name: 'Activo' }], isLoading: false }),
}));

const createMock = jest.fn(() => Promise.resolve());
jest.mock('@/features/clients/hooks/useClients', () => ({
  useClients: () => ({ createClient: createMock }),
}));

import { ClientForm } from '@/app/dashboard/clients/client-form';

test('renders form and submits', async () => {
  render(<ClientForm companyId="c1" />);
  // check that select option is rendered
  expect(screen.getByText('Selecciona un estado')).toBeInTheDocument();
  expect(screen.getByText('Activo')).toBeInTheDocument();

  // fill required name and select status
  const textboxes = screen.getAllByRole('textbox');
  // first textbox corresponds to Nombre
  fireEvent.change(textboxes[0], { target: { value: 'Juan' } });

  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: 's1' } });

  fireEvent.click(screen.getByText('Crear cliente'));

  await screen.findByText('Cliente creado correctamente.');
  expect(createMock).toHaveBeenCalled();
});
