'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Home,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clients', href: '/dashboard/clients' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-card"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <span className="text-lg font-bold text-white">BIA</span>
            </div>
            <span className="text-lg font-bold">BIA Platform</span>
          </motion.div>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <motion.button
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/auth/login';
            }}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <motion.div
          className="border-b border-border bg-card p-6 md:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="hidden md:block">
              <h1 className="text-sm text-muted-foreground">Welcome back!</h1>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
              </motion.button>

              <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600" />

              <motion.button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted md:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
