import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: async () => ({ data: [{ id: 's1', name: 'Activo' }], error: null }),
      }),
    }),
  },
}));

import { useClientStatuses } from '@/features/clients/hooks/useClientStatuses';

function TestComponent() {
  const { statuses, isLoading } = useClientStatuses();
  return (
    <div>
      {isLoading && <span>loading</span>}
      {statuses.map((s) => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  );
}

test('loads and displays statuses', async () => {
  render(<TestComponent />);
  await waitFor(() => expect(screen.getByText('Activo')).toBeTruthy());
});
