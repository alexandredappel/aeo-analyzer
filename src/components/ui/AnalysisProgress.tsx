import React from 'react';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';

export function AnalysisProgress() {
  const categories = [
    'Discoverability',
    'Structured Data',
    'LLM Formatting',
    'Accessibility',
    'Readability',
  ];

  // Duplicate the list to enable seamless infinite scroll
  const items = [...categories, ...categories];

  return (
    <div role="status" aria-live="polite" className="ap-viewport">
      <div className="ap-container">
        <div className="ap-header">
          <span className="ap-spinner" aria-hidden="true" />
          <h2 className="ap-title">Analysis in progress...</h2>
        </div>

        <div className="ap-scroller" aria-label="Analysis categories scrolling">
          {/* Top fade */}
          <ProgressiveBlur className="ap-fade ap-fade-top" direction="top" blurIntensity={1} />
          {/* Bottom fade */}
          <ProgressiveBlur className="ap-fade ap-fade-bottom" direction="bottom" blurIntensity={1} />

          <ul className="ap-list">
            {items.map((label, index) => (
              <li className="ap-item" key={`${label}-${index}`}>
                <h3 className="ap-item-title">{label}</h3>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        /* Fullscreen centering */
        .ap-viewport {
          min-height: 100vh;
          display: grid;
          place-items: center;
        }

        .ap-container {
          background: var(--card);
          color: var(--foreground);
          border-radius: var(--radius);
          padding: 16px;
          max-width: 640px;
          width: 100%;
          text-align: center;
        }

        .ap-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .ap-title { font-weight: 700; font-size: 2rem; line-height: 1.2; margin: 0; }

        /* Spinner built with only CSS variables */
        .ap-spinner {
          width: 22px;
          height: 22px;
          display: inline-block;
          border-radius: 9999px;
          border: 2px solid var(--primary);
          border-left-color: transparent;
          animation: ap-spin 0.9s linear infinite;
        }

        @keyframes ap-spin {
          to { transform: rotate(360deg); }
        }

        .ap-scroller {
          --ap-item-height: 56px;
          --ap-duration: 18s;
          position: relative;
          height: var(--ap-item-height);
          overflow: hidden;
          background: transparent;
        }

        .ap-fade {
          position: absolute;
          left: 0;
          right: 0;
          height: 28px;
          z-index: 1;
        }
        .ap-fade-top { top: 0; }
        .ap-fade-bottom { bottom: 0; }

        .ap-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          animation: ap-vertical-marquee var(--ap-duration) linear infinite;
        }

        .ap-item {
          height: var(--ap-item-height);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          font-weight: 600;
        }

        .ap-item-title { font-size: 1.5rem; font-weight: 700; margin: 0; }

        @keyframes ap-vertical-marquee {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-1 * var(--ap-item-height) * 5)); }
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .ap-spinner { animation: none; }
          .ap-list { animation: none; }
        }
      `}</style>
    </div>
  );
}


