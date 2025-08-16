'use client';
import React from 'react';
import clsx from 'clsx';
import { Slot } from '@radix-ui/react-slot';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  asChild?: boolean;
};

export function Button({
  className,
  size = 'md',
  variant = 'primary',
  asChild = false,
  ...props
}: ButtonProps) {
  const sizeClasses =
    size === 'sm'
      ? 'h-9 px-3 text-sm rounded-[var(--radius)]'
      : size === 'lg'
      ? 'h-12 px-6 text-base rounded-[var(--radius)]'
      : 'h-10 px-4 text-sm rounded-[var(--radius)]';

  const variantClasses =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground border border-accent-1 hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed'
      : variant === 'outline'
      ? 'bg-transparent text-app border border-accent-1 hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed'
      : variant === 'ghost'
      ? 'bg-transparent text-app hover:bg-surface border border-transparent'
      : 'bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed';

  const Component: any = asChild ? Slot : 'button';

  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
        sizeClasses,
        variantClasses,
        className,
      )}
      {...props}
    />
  );
}

export default Button;

 