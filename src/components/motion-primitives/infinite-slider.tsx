'use client';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

type InfiniteSliderProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number; // seconds per full loop
  speedOnHover?: number; // seconds per loop when hovering
  gap?: number; // pixels between items
};

export function InfiniteSlider({
  children,
  className,
  speed = 30,
  speedOnHover,
  gap = 64,
}: InfiniteSliderProps) {
  const [isHover, setIsHover] = useState(false);
  const duration = isHover && speedOnHover ? speedOnHover : speed;

  const items = useMemo(() => React.Children.toArray(children), [children]);
  // Duplicate items to create the seamless marquee effect
  const sequence = useMemo(() => [...items, ...items], [items]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Ensure animation restarts when duration changes
    if (containerRef.current) {
      // Force reflow
      void containerRef.current.offsetHeight;
    }
  }, [duration]);

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        // Allow parent to override via CSS var if needed
        ['--slider-gap' as any]: `${gap}px`,
        ['--slider-duration' as any]: `${duration}s`,
      }}
    >
      <div ref={containerRef} className="[animation:marquee_var(--slider-duration)_linear_infinite] flex w-max" style={{ columnGap: `var(--slider-gap)` }}>
        {sequence.map((child, index) => (
          <div key={index} className="flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default InfiniteSlider;


