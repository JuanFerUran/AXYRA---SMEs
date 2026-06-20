'use client';

import { motion } from 'framer-motion';
import { scaleInVariants } from './motion';
import type { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hoverScale = 1.02,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${className}`}
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: hoverScale }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtext?: string;
  trend?: number;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  subtext,
  trend,
  className = '',
  delay = 0,
}: StatCardProps) {
  return (
    <AnimatedCard className={`p-6 ${className}`} delay={delay}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend !== undefined && (
              <span
                className={`text-xs font-semibold ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  gradient?: 'blue' | 'purple' | 'pink' | 'green';
}

export function GradientCard({
  children,
  className = '',
  delay = 0,
  gradient = 'blue',
}: GradientCardProps) {
  const gradientClass = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
    green: 'from-green-400 to-green-600',
  }[gradient];

  return (
    <motion.div
      className={`bg-gradient-to-r ${gradientClass} rounded-lg p-6 text-white shadow-lg ${className}`}
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}
