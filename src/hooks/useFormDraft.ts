// hooks/useFormDraft.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";

interface DraftData {
  data: Record<string, string | number | boolean | null>;
  timestamp: number;
  formId: string;
}

export function useFormDraft<
  T extends Record<string, string | number | boolean | null>
>(
  formId: string,
  initialData: T,
  options: {
    autoSaveDelay?: number; // milliseconds
    showToasts?: boolean;
  } = {}
) {
  const { autoSaveDelay = 3000, showToasts = true } = options;
  const [draftKey] = useState(`form-draft-${formId}`);
  const [savedDrafts, setSavedDrafts] = useLocalStorage<
    Record<string, DraftData>
  >("form-drafts", {});
  const [formData, setFormData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = savedDrafts[draftKey];
    if (draft && draft.data) {
      const draftAge = Date.now() - draft.timestamp;
      const hoursSinceSave = draftAge / (1000 * 60 * 60);

      if (hoursSinceSave < 24) {
        // Only load drafts less than 24 hours old
        setFormData(draft.data as T);
        setLastSaved(new Date(draft.timestamp));
        if (showToasts) {
          toast.info("Draft restored", {
            description: `Last saved ${formatTimestamp(draft.timestamp)}`,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      saveDraft();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isDirty, autoSaveDelay]);

  const saveDraft = useCallback(() => {
    const draftData: DraftData = {
      data: formData,
      timestamp: Date.now(),
      formId,
    };

    setSavedDrafts({
      ...savedDrafts,
      [draftKey]: draftData,
    });

    setLastSaved(new Date());
    setIsDirty(false);

    if (showToasts) {
      toast.success("Draft saved", {
        description: "Your progress has been saved",
      });
    }
  }, [formData, formId, draftKey, savedDrafts, setSavedDrafts, showToasts]);

  const clearDraft = useCallback(() => {
    const updatedDrafts = { ...savedDrafts };
    delete updatedDrafts[draftKey];
    setSavedDrafts(updatedDrafts);
    setFormData(initialData);
    setLastSaved(null);
    setIsDirty(false);
  }, [draftKey, savedDrafts, setSavedDrafts, initialData]);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setIsDirty(false);
  }, [initialData]);

  return {
    formData,
    updateFormData,
    setFormData,
    saveDraft,
    clearDraft,
    resetForm,
    isDirty,
    lastSaved,
    hasDraft: !!savedDrafts[draftKey],
  };
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
