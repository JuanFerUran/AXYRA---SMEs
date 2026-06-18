export type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
};

export type CreateClientInput = Omit<Client, 'id' | 'created_at'>;
export type UpdateClientInput = Partial<CreateClientInput>;
