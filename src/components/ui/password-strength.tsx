// components/ui/password-strength.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthPercent = (strength / 5) * 100;

  const getStrengthLabel = () => {
    if (strength === 0) return { label: "", color: "" };
    if (strength <= 2) return { label: "Weak", color: "text-red-600" };
    if (strength <= 3) return { label: "Fair", color: "text-amber-600" };
    if (strength <= 4) return { label: "Good", color: "text-blue-600" };
    return { label: "Strong", color: "text-green-600" };
  };

  const { label, color } = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={cn("font-medium", color)}>{label}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            strength <= 2 && "bg-red-500",
            strength === 3 && "bg-amber-500",
            strength === 4 && "bg-blue-500",
            strength === 5 && "bg-green-500"
          )}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          {checks.length ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <X className="w-3 h-3 text-gray-400" />
          )}
          <span className={checks.length ? "text-green-600" : "text-gray-500"}>
            8+ characters
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.uppercase ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <X className="w-3 h-3 text-gray-400" />
          )}
          <span
            className={checks.uppercase ? "text-green-600" : "text-gray-500"}
          >
            Uppercase
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.number ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <X className="w-3 h-3 text-gray-400" />
          )}
          <span className={checks.number ? "text-green-600" : "text-gray-500"}>
            Number
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.special ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <X className="w-3 h-3 text-gray-400" />
          )}
          <span className={checks.special ? "text-green-600" : "text-gray-500"}>
            Special char
          </span>
        </div>
      </div>
    </div>
  );
}
