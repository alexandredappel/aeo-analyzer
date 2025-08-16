import React from 'react';
import { PerformanceStatus } from '@/types/analysis-architecture';
import {
  LiaCheckCircleSolid,
  LiaInfoCircleSolid,
  LiaExclamationCircleSolid,
  LiaTimesCircleSolid
} from 'react-icons/lia';

interface StatusIconProps {
  status: PerformanceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<PerformanceStatus, { Icon: React.ComponentType<{ className?: string }>; color: string }> = {
  excellent: { Icon: LiaCheckCircleSolid, color: 'text-emerald-600' },
  good: { Icon: LiaInfoCircleSolid, color: 'text-blue-600' },
  warning: { Icon: LiaExclamationCircleSolid, color: 'text-amber-600' },
  error: { Icon: LiaTimesCircleSolid, color: 'text-red-600' }
};

const SIZE_CONFIG: Record<NonNullable<StatusIconProps['size']>, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6'
};

export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  size = 'md', 
  className = '' 
}) => {
  const { Icon, color } = STATUS_CONFIG[status];
  const sizeClass = SIZE_CONFIG[size];
  
  return (
    <span className={`inline-flex items-center justify-center ${color} ${className}`} aria-hidden>
      <Icon className={`${sizeClass}`} />
    </span>
  );
};