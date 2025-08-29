"use client";

import * as React from "react";
import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogDescription as ShadDialogDescription,
  DialogFooter as ShadDialogFooter,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface BaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g., "sm:max-w-lg"
  className?: string;
}

export function BaseDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth,
  className,
}: BaseDialogProps) {
  return (
    <ShadDialog open={isOpen} onOpenChange={onOpenChange}>
      <ShadDialogContent className={cn("sm:max-w-lg", maxWidth, className)}>
        <ShadDialogHeader>
          <ShadDialogTitle>{title}</ShadDialogTitle>
          {description ? (
            <ShadDialogDescription>{description}</ShadDialogDescription>
          ) : null}
        </ShadDialogHeader>
        <div>{children}</div>
        {footer ? <ShadDialogFooter>{footer}</ShadDialogFooter> : null}
      </ShadDialogContent>
    </ShadDialog>
  );
}

export default BaseDialog;


