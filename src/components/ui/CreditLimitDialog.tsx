"use client";

import * as React from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface CreditLimitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMaybeLater?: () => void;
}

interface PricingPlan {
  id: "free" | "premium";
  name: string;
  priceMonthly: string;
  originalPriceMonthly?: string;
  description: string;
  features: string[];
  stripePriceId?: string;
}

const pricingPreview: PricingPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    priceMonthly: "0$ / mo",
    description: "5 analysis per month",
    features: [
      "Complete GEO score analysis",
      "Full analysis suite",
      "Actionable recommendations",
      "PDF export reports",
    ],
  },
  {
    id: "premium",
    name: "Early Bird Pricing",
    priceMonthly: "$14.50 / mo",
    originalPriceMonthly: "$29 / mo",
    description: "100 analysis per month",
    features: [
      "Complete GEO score analysis",
      "Full analysis suite",
      "Actionable recommendations",
      "PDF export reports",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY,
  },
];

export function CreditLimitDialog({ isOpen, onOpenChange, onMaybeLater }: CreditLimitDialogProps) {
  // Default focus on promoting Premium
  const [selectedPlanId, setSelectedPlanId] = React.useState<"free" | "premium">("premium");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const router = useRouter();

  // Intercepter les tentatives de fermeture (clic extérieur / ESC) et les ignorer
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      // On n'autorise pas la fermeture implicite depuis l'extérieur
      if (!open) return;
      onOpenChange(open);
    },
    [onOpenChange]
  );

  const handleUpgrade = React.useCallback(async () => {
    const selectedPlan = pricingPreview.find((p) => p.id === selectedPlanId);

    if (!selectedPlan || selectedPlan.id !== "premium") {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/sign-up?intent=upgrade");
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: selectedPlan.stripePriceId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({} as any));
        throw new Error(err?.message || "Failed to create checkout session");
      }

      const data: { checkoutUrl?: string } = await response.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      setErrorMessage("No checkout URL returned by the server");
    } catch (_error) {
      setErrorMessage("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlanId, router]);

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="You have reached your credit limit"
      description="Upgrade to continue analyzing websites with more credits and features."
      maxWidth="md:max-w-3xl lg:max-w-4xl"
      className="[&>button]:hidden"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              if (onMaybeLater) {
                onMaybeLater();
              } else {
                onOpenChange(false);
              }
            }}
          >
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? "Redirecting..." : "Upgrade"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-red-500/40 bg-surface p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        {/* 402 notice removed as requested */}

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Choose your plan"
        >
          {pricingPreview.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isPremium = plan.id === "premium";
            return (
              <div
                key={plan.id}
                className={
                  "rounded-(--radius) border p-4 outline-none transition-colors " +
                  (isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/30")
                }
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedPlanId(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPlanId(plan.id);
                  }
                }}
                data-testid={`plan-card-${plan.id}`}
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold">{plan.name}</h4>
                  </div>
                  <span className="text-lg font-bold">
                    {plan.originalPriceMonthly && (
                      <span className="mr-2 text-muted-foreground line-through">{plan.originalPriceMonthly}</span>
                    )}
                    {plan.priceMonthly}
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-3" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </BaseDialog>
  );
}

export default CreditLimitDialog;


