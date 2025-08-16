'use client';
import React from 'react';
import clsx from 'clsx';

type ProgressiveBlurProps = {
  className?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  blurIntensity?: number; // 0..1
};

export function ProgressiveBlur({ className, direction = 'left', blurIntensity = 1 }: ProgressiveBlurProps) {
  const toSide =
    direction === 'left' ? 'to right'
    : direction === 'right' ? 'to left'
    : direction === 'top' ? 'to bottom'
    : 'to top';
  const gradient = `linear-gradient(${toSide}, rgba(255,255,255,${blurIntensity}) 0%, rgba(255,255,255,0) 100%)`;
  return (
    <div
      className={clsx('pointer-events-none', className)}
      style={{
        WebkitMaskImage: gradient,
        maskImage: gradient,
      }}
    />
  );
}

export default ProgressiveBlur;


