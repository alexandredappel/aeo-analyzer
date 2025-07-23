import React from 'react';
import { PerformanceStatus } from '@/types/analysis-architecture';

interface StatusIconProps {
  status: PerformanceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<PerformanceStatus, { icon: string; color: string }> = {
  excellent: { icon: '✅', color: 'text-green-400' },
  good: { icon: 'ℹ️', color: 'text-blue-400' },
  warning: { icon: '⚠️', color: 'text-orange-400' },
  error: { icon: '❌', color: 'text-red-400' }
};

const SIZE_CONFIG = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  size = 'md', 
  className = '' 
}) => {
  const config = STATUS_CONFIG[status];
  const sizeClass = SIZE_CONFIG[size];
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${config.color} ${sizeClass} ${className}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
      role="img"
      aria-label={`Statut: ${status}`}
    >
      {config.icon}
    </span>
  );
}; 