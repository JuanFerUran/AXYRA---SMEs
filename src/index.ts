// ============================================
// MAIN EXPORTS - BIA Platform
// ============================================

// Animation Components
export * from '@/components/animations';

// Client Features
export { ClientService } from '@/features/clients/services/client.service';
export { useClients } from '@/features/clients/hooks/useClients';
export { ClientCard, ClientList } from '@/features/clients/ui';
export * from '@/features/clients/types/client';

// Repository
export { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';

// Utils
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';

// Framer Motion
export { motion } from 'framer-motion';

// Icons
export * from 'lucide-react';

// Recharts
export {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Utilities
export { cn } from '@/lib/utils';
export { supabase } from '@/lib/supabaseClient';
