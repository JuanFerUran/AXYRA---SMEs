'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { ClientWithRelations } from '@/features/clients/types/client';

export interface ClientCardProps {
  client: ClientWithRelations;
  onEdit?: (client: ClientWithRelations) => void;
  onDelete?: (clientId: string) => void;
  onClick?: (client: ClientWithRelations) => void;
  delay?: number;
}

export function ClientCard({ client, onEdit, onDelete, onClick, delay = 0 }: ClientCardProps) {
  return (
    <motion.div
      className="group cursor-pointer rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(client)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {client.first_name} {client.last_name}
          </h3>

          <div className="mt-3 space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {client.email}
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone}
              </div>
            )}

            {client.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {client.city}, {client.country}
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Purchases</p>
              <p className="text-lg font-semibold">{client.total_purchases}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lifetime Value</p>
              <p className="text-lg font-semibold">${client.lifetime_value}</p>
            </div>
          </div>
        </div>

        <div className="ml-4 flex flex-col gap-2">
          <motion.button
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(client);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-colors hover:bg-blue-500/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(client.id as string);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {client.status && (
        <div className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${client.status.color}20`,
            color: client.status.color || '#3b82f6',
          }}
        >
          {client.status.name}
        </div>
      )}
    </motion.div>
  );
}

interface ClientListProps {
  clients: ClientWithRelations[];
  isLoading?: boolean;
  onEdit?: (client: ClientWithRelations) => void;
  onDelete?: (clientId: string) => void;
  onClick?: (client: ClientWithRelations) => void;
  variant?: 'grid' | 'list';
}

export function ClientList({
  clients,
  isLoading = false,
  onEdit,
  onDelete,
  onClick,
  variant = 'grid',
}: ClientListProps) {
  if (isLoading) {
    return (
      <div className={`${variant === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-lg border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!clients.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-12 text-center">
        <p className="text-muted-foreground">No clients found</p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'grid'
          ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4'
      }
    >
      {clients.map((client, idx) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          delay={idx * 0.05}
        />
      ))}
    </div>
  );
}
