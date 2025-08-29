"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useImperativeHandle, forwardRef } from "react";
import { trackAnalysisStart } from "@/utils/analytics";
import { normalizeAndValidate } from "@/utils/url";

// URL validation schema: accept any non-empty string; we'll normalize & validate on submit
const urlSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

type UrlFormData = z.infer<typeof urlSchema>;

interface UrlFormProps {
  onSubmit: (url: string) => void;
}

export interface UrlFormRef {
  setExampleUrl: (url: string) => void;
}

export const UrlForm = forwardRef<UrlFormRef, UrlFormProps>(
  ({ onSubmit }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      setError,
    } = useForm<UrlFormData>({
      resolver: zodResolver(urlSchema),
    });

    const handleFormSubmit = async (data: UrlFormData) => {
      setIsSubmitting(true);
      try {
        const normalized = normalizeAndValidate(data.url);
        if (!normalized) {
          setError("url", { type: "manual", message: "Please enter a valid URL" });
          setIsSubmitting(false);
          return;
        }
        // Track the analysis start event
        trackAnalysisStart(normalized);
        onSubmit(normalized);
      } catch (_error) {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      setExampleUrl: (url: string) => {
        setValue("url", url);
      },
    }));

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <input
            {...register("url")}
            type="text"
            placeholder="Enter URL"
            className="w-full px-4 py-4 text-lg bg-surface border border-accent-1 rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-app placeholder:text-app/60"
            disabled={isSubmitting}
          />
          {errors.url && (
            <p className="text-red-600 text-sm text-left">
              {errors.url.message}
            </p>
          )}
        </div>

        <button
          id="analyze-website-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold py-4 px-6 rounded-[var(--radius-lg)] text-lg transition-colors duration-200 shadow-sm hover:shadow"
        >
          {isSubmitting ? "Analyzing..." : "Analyze"}
        </button>
      </form>
    );
  }
);

// Add displayName for ESLint
UrlForm.displayName = "UrlForm"; 