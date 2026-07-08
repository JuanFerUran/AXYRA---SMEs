'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  rowClassName?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  className = '',
  rowClassName = '',
  onRowClick,
  isLoading = false,
  emptyState,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-border animate-pulse">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-muted"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card/50 p-8 text-center">
        {emptyState || (
          <div>
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.15,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.15 },
    },
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground"
              >
                <button
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`flex items-center gap-2 ${
                    col.sortable ? 'cursor-pointer hover:text-foreground' : ''
                  }`}
                >
                  {col.label}
                  {col.sortable && (
                    <span>
                      {sortKey === col.key ? (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronUp className="h-4 w-4 opacity-0" />
                      )}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.map((row, idx) => (
            <motion.tr
              key={row.id}
              variants={rowVariants}
              className={`border-b border-border transition-colors hover:bg-muted/50 ${
                onRowClick ? 'cursor-pointer' : ''
              } ${rowClassName}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-6 py-4 text-sm ${col.width || ''}`}
                >
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : String((row as any)[col.key] || '')}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
