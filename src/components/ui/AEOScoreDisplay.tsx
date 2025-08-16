"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircularScore } from '@/components/customized/progress/CircularScore';
import { Button } from '@/components/ui/button';

interface ScoreContribution {
  score: number;
  weight: number;
  contribution: number;
}

interface AEOScore {
  totalScore: number;
  maxScore: number;
  breakdown: {
    discoverability: ScoreContribution;
    structuredData: ScoreContribution;
    llmFormatting: ScoreContribution;
    accessibility: ScoreContribution;
    readability: ScoreContribution;
  };
  completeness: string;
  metadata: {
    totalWeight: number;
    completedAnalyses: number;
    totalAnalyses: number;
  };
}

interface AEOScoreDisplayProps {
  aeoScore?: AEOScore;
  isLoading: boolean;
  // Nouveaux champs pour afficher les données de page (garde fond blanc)
  title?: string;
  description?: string;
  url?: string; // affiché avec préfixe "URL:"
  // Nouvelles props pour la logique du bouton Run again
  isCompleted?: boolean;
  onRunAgain?: () => void;
  // Callback export PDF
  onExport?: () => void;
}

function getRingClasses(percentage: number) {
  if (percentage >= 70) return { base: 'stroke-emerald-500/25', progress: 'stroke-emerald-600', label: 'text-emerald-600' };
  if (percentage >= 50) return { base: 'stroke-amber-500/25', progress: 'stroke-amber-600', label: 'text-amber-600' };
  return { base: 'stroke-red-500/25', progress: 'stroke-red-600', label: 'text-red-600' };
}

export function AEOScoreDisplay({ 
  aeoScore, 
  isLoading, 
  title, 
  description, 
  url,
  isCompleted = false,
  onRunAgain,
  onExport
}: AEOScoreDisplayProps) {
  // Mesure de la hauteur pour dimensionner le grand cercle
  const desktopRowRef = useRef<HTMLDivElement | null>(null);
  const mobileRowRef = useRef<HTMLDivElement | null>(null);
  const [circleSizeDesktop, setCircleSizeDesktop] = useState<number>(220);
  const [circleSizeMobile, setCircleSizeMobile] = useState<number>(160);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === desktopRowRef.current) {
          const height = Math.round(entry.contentRect.height);
          setCircleSizeDesktop(Math.max(160, height));
        }
      }
    });
    if (desktopRowRef.current) observer.observe(desktopRowRef.current);

    const updateMobileSize = () => {
      if (typeof window === 'undefined') return;
      const vw = window.innerWidth;
      const proposed = Math.round(vw * 0.45); // ~45% de la largeur viewport
      setCircleSizeMobile(Math.max(120, Math.min(180, proposed))); // clamp 120–180
    };
    updateMobileSize();
    window.addEventListener('resize', updateMobileSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMobileSize);
    };
  }, []);

  // Calcul des items pour les scores (doit être avant tout return)
  const items = useMemo(() => {
    if (!aeoScore) return [];
    return ([
      { key: 'discoverability', label: 'Discoverability', value: aeoScore.breakdown.discoverability.score },
      { key: 'structuredData', label: 'Structured Data', value: aeoScore.breakdown.structuredData.score },
      { key: 'llmFormatting', label: 'LLM Formatting', value: aeoScore.breakdown.llmFormatting.score },
      { key: 'accessibility', label: 'Accessibility', value: aeoScore.breakdown.accessibility.score },
      { key: 'readability', label: 'Readability', value: aeoScore.breakdown.readability.score },
    ] as const);
  }, [aeoScore]);

  if (isLoading && !aeoScore) {
    return (
      <div className="bg-card rounded-[var(--radius)] py-4 md:py-6 px-0">
        {/* Boutons d'action (skeleton) */}
        <div className="flex gap-3 mb-4">
          <div className="h-10 bg-muted rounded w-20"></div>
          <div className="h-10 bg-muted rounded w-24"></div>
        </div>

        {/* Header (mobile skeleton) */}
        <div className="md:hidden space-y-3">
          <div className="h-7 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>

        {/* Header desktop skeleton (métadonnées + cercle) */}
        <div className="hidden md:grid grid-cols-[1fr_auto] gap-6 items-stretch" ref={desktopRowRef}>
          <div className="space-y-3">
            <div className="h-7 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-muted animate-pulse" style={{ width: circleSizeDesktop, height: circleSizeDesktop }}></div>
          </div>
        </div>

        {/* Cercle global centré en mobile */}
        <div className="md:hidden flex items-center justify-center mt-4" ref={mobileRowRef}>
          <div className="rounded-full bg-muted animate-pulse" style={{ width: circleSizeMobile, height: circleSizeMobile }}></div>
        </div>

        {/* Scores: une seule ligne toutes tailles */}
        {/* Mobile: 2 colonnes, chaque item sur 1 ligne (cercle + nom) */}
        <div className="md:hidden mt-6 divide-y divide-primary/15">
          <div className="grid grid-cols-2 divide-x divide-primary/15">
            {[0,1].map(i => (
              <div key={i} className="flex items-center justify-center gap-2 p-2">
                <div className="rounded-full bg-muted w-14 h-14"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 divide-x divide-primary/15">
            {[2,3].map(i => (
              <div key={i} className="flex items-center justify-center gap-2 p-2">
                <div className="rounded-full bg-muted w-14 h-14"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
              </div>
            ))}
          </div>
          <div className="pt-3">
            <div className="flex items-center justify-center gap-2">
              <div className="rounded-full bg-muted w-14 h-14"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Desktop: 5 colonnes avec séparateurs verticaux */}
        <div className="hidden md:grid md:grid-cols-5 md:gap-0 md:divide-x md:divide-primary/15 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square p-3 flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-muted w-20 h-20"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!aeoScore) return null;

  const { totalScore, maxScore, breakdown } = aeoScore;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const ring = getRingClasses(percentage);

  return (
    <div className="bg-card rounded-[var(--radius)] py-4 md:py-6 px-0">
      {/* Header mobile */}
      <div className="md:hidden space-y-3">
        {title && (
          <h3 className="text-xl md:text-2xl font-semibold leading-tight break-words">{title}</h3>
        )}
        {description && (
          <p className="text-sm md:text-base text-foreground/80 whitespace-pre-wrap break-words">
            {description}
          </p>
        )}
        {url && (
          <p className="text-sm md:text-base font-mono"><span className="opacity-60 pr-1">URL:</span><span className="break-all">{url}</span></p>
        )}
        
        {/* Boutons d'action */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="primary" 
            size="lg"
            className="bg-[#0068c9] text-white hover:bg-[#0068c9]/90 border-[#0068c9]"
            onClick={onExport}
            disabled={!isCompleted || !onExport}
          >
            Export
          </Button>
          
          {/* Bouton Run again conditionnel */}
          {isCompleted && onRunAgain && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={onRunAgain}
              className="bg-white !text-primary border-primary hover:bg-[#0068c9]/5"
            >
              Run again
            </Button>
          )}
        </div>
      </div>

      {/* Header desktop: métadonnées + grand cercle */}
      <div className="hidden md:grid grid-cols-[1fr_auto] gap-6 items-stretch" ref={desktopRowRef}>
        {/* Métadonnées page à gauche */}
        <div className="space-y-3">
          {title && (
            <h3 className="text-xl md:text-2xl font-semibold leading-tight break-words">{title}</h3>
          )}
          {description && (
            <p className="text-sm md:text-base text-foreground/80 whitespace-pre-wrap break-words">
              {description}
            </p>
          )}
          {url && (
            <p className="text-sm md:text-base font-mono"><span className="opacity-60 pr-1">URL:</span><span className="break-all">{url}</span></p>
          )}
          
          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="primary" 
              size="lg"
              className="bg-[#0068c9] text-white hover:bg-[#0068c9]/90 border-[#0068c9]"
              onClick={onExport}
              disabled={!isCompleted || !onExport}
            >
              Export
            </Button>
            
            {/* Bouton Run again conditionnel */}
            {isCompleted && onRunAgain && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={onRunAgain}
                className="bg-white !text-primary border-primary hover:bg-[#0068c9]/5"
              >
                Run again
              </Button>
            )}
          </div>
        </div>

        {/* Score global à droite, cercle pleine hauteur */}
        <div className="flex items-center justify-center">
          <CircularScore
            value={percentage}
            size={circleSizeDesktop}
            className={ring.base}
            progressClassName={ring.progress}
            showLabel
            labelClassName={`font-bold ${ring.label}`}
            renderLabel={(v) => Math.round(v)}
          />
        </div>
      </div>

      {/* Cercle global centré en mobile */}
      <div className="md:hidden flex items-center justify-center mt-4" ref={mobileRowRef}>
        <CircularScore
          value={percentage}
          size={circleSizeMobile}
          className={ring.base}
          progressClassName={ring.progress}
          showLabel
          labelClassName={`font-bold ${ring.label}`}
          renderLabel={(v) => Math.round(v)}
        />
      </div>

      {/* Mobile: 2 colonnes, séparateurs entre colonnes et entre lignes */}
      <div className="md:hidden mt-6 divide-y divide-primary/15">
        <div className="grid grid-cols-2 divide-x divide-primary/15">
          {[items[0], items[1]].map(({ key, label, value }) => {
            const percent = Math.max(0, Math.min(100, Math.round(value)));
            const r = getRingClasses(percent);
            return (
              <div key={key} className="flex items-center justify-center gap-2 py-2">
                <CircularScore
                  value={percent}
                  size={56}
                  className={r.base}
                  progressClassName={r.progress}
                  showLabel
                  labelClassName={`font-semibold ${r.label}`}
                  renderLabel={(v) => Math.round(v)}
                />
                <div className="text-base font-bold leading-tight">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 divide-x divide-primary/15">
          {[items[2], items[3]].map(({ key, label, value }) => {
            const percent = Math.max(0, Math.min(100, Math.round(value)));
            const r = getRingClasses(percent);
            return (
              <div key={key} className="flex items-center justify-center gap-2 py-2">
                <CircularScore
                  value={percent}
                  size={56}
                  className={r.base}
                  progressClassName={r.progress}
                  showLabel
                  labelClassName={`font-semibold ${r.label}`}
                  renderLabel={(v) => Math.round(v)}
                />
                <div className="text-base font-bold leading-tight">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="pt-3">
          {(() => {
            const { key, label, value } = items[4];
            const percent = Math.max(0, Math.min(100, Math.round(value)));
            const r = getRingClasses(percent);
            return (
              <div key={key} className="flex items-center justify-center gap-2">
                <CircularScore
                  value={percent}
                  size={56}
                  className={r.base}
                  progressClassName={r.progress}
                  showLabel
                  labelClassName={`font-semibold ${r.label}`}
                  renderLabel={(v) => Math.round(v)}
                />
                <div className="text-base font-bold leading-tight">{label}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Desktop: 5 colonnes avec séparateurs verticaux */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-0 md:divide-x md:divide-primary/15 mt-6">
        {items.map(({ key, label, value }) => {
          const percent = Math.max(0, Math.min(100, Math.round(value)));
          const r = getRingClasses(percent);
          return (
            <div key={key} className="aspect-square p-3 flex flex-col items-center justify-center">
              <CircularScore
                value={percent}
                size={88}
                className={r.base}
                progressClassName={r.progress}
                showLabel
                labelClassName={`font-semibold ${r.label}`}
                renderLabel={(v) => Math.round(v)}
              />
              <div className="mt-2 text-center text-sm font-bold leading-tight">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}