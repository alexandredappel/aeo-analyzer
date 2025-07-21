"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useImperativeHandle, forwardRef } from "react";
import { trackAnalysisStart } from "@/utils/analytics";

// URL validation schema
const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .regex(
      /^https?:\/\/.+/,
      "URL must start with http:// or https://"
    )
    .url("Please enter a valid URL"),
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
    } = useForm<UrlFormData>({
      resolver: zodResolver(urlSchema),
    });

    const handleFormSubmit = async (data: UrlFormData) => {
      setIsSubmitting(true);
      try {
        // Track the analysis start event
        trackAnalysisStart(data.url);
        
        onSubmit(data.url);
      } catch (error) {
        console.error("Error submitting form:", error);
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
            placeholder="Enter website URL to analyze..."
            className="w-full px-4 py-4 text-lg bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            disabled={isSubmitting}
          />
          {errors.url && (
            <p className="text-red-400 text-sm text-left">
              {errors.url.message}
            </p>
          )}
        </div>

        <button
          id="analyze-website-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors duration-200"
        >
          {isSubmitting ? "Starting Analysis..." : "Analyze Website"}
        </button>
      </form>
    );
  }
);

// Add displayName for ESLint
UrlForm.displayName = "UrlForm"; 