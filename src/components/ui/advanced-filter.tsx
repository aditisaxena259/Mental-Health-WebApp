// components/ui/advanced-filter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Save,
  Star,
  Calendar,
  Search,
  RotateCcw,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  id: string;
  name: string;
  filters: Record<string, any>;
  isDefault?: boolean;
}

interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
  currentFilters?: Record<string, any>;
  filterOptions?: {
    status?: { value: string; label: string }[];
    category?: { value: string; label: string }[];
    priority?: { value: string; label: string }[];
    dateRange?: boolean;
  };
  storageKey?: string;
}

export function AdvancedFilter({
  onFilterChange,
  currentFilters = {},
  filterOptions = {},
  storageKey = "filter-presets",
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useLocalStorage<FilterConfig[]>(
    storageKey,
    []
  );
  const [localFilters, setLocalFilters] = useState(currentFilters || {});

  useEffect(() => {
    setLocalFilters(currentFilters || {});
  }, [currentFilters]);

  const activeFilterCount = Object.values(localFilters || {}).filter(
    (v) => v && v !== "all" && v !== ""
  ).length;

  const handleApplyFilters = () => {
    onFilterChange(localFilters || {});
    setIsOpen(false);
    if (activeFilterCount > 0) {
      toast.success(
        `Applied ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`
      );
    }
  };

  const handleResetFilters = () => {
    const resetFilters = Object.keys(localFilters || {}).reduce(
      (acc, key) => ({ ...acc, [key]: "all" }),
      {}
    );
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    toast.info("Filters reset");
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    const newPreset: FilterConfig = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: localFilters || {},
    };

    setSavedPresets([...savedPresets, newPreset]);
    setIsSaveDialogOpen(false);
    setPresetName("");
    toast.success(`Saved filter preset: ${newPreset.name}`);
  };

  const handleLoadPreset = (preset: FilterConfig) => {
    setLocalFilters(preset.filters);
    onFilterChange(preset.filters);
    setIsOpen(false);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = savedPresets.find((p) => p.id === presetId);
    setSavedPresets(savedPresets.filter((p) => p.id !== presetId));
    toast.success(`Deleted preset: ${preset?.name}`);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 relative",
              activeFilterCount > 0 && "border-primary text-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 sm:w-96" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Saved Presets */}
            {savedPresets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Saved Presets
                </Label>
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="group relative inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      <button
                        onClick={() => handleLoadPreset(preset)}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        <span>{preset.name}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(preset.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter */}
            {filterOptions.status && (
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={(localFilters || {}).status || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({ ...(localFilters || {}), status: value })
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions.status.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category Filter */}
            {filterOptions.category && (
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={(localFilters || {}).category || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...(localFilters || {}),
                      category: value,
                    })
                  }
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.category.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority Filter */}
            {filterOptions.priority && (
              <div className="space-y-2">
                <Label htmlFor="priority-filter">Priority</Label>
                <Select
                  value={(localFilters || {}).priority || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...(localFilters || {}),
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger id="priority-filter">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {filterOptions.priority.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            {filterOptions.dateRange && (
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date-from" className="text-xs">
                      From
                    </Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={(localFilters || {}).dateFrom || ""}
                      onChange={(e) =>
                        setLocalFilters({
                          ...(localFilters || {}),
                          dateFrom: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs">
                      To
                    </Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={(localFilters || {}).dateTo || ""}
                      onChange={(e) =>
                        setLocalFilters({
                          ...(localFilters || {}),
                          dateTo: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaveDialogOpen(true)}
                className="flex-1 gap-2"
                disabled={activeFilterCount === 0}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="flex-1 gap-2"
              >
                <Search className="h-4 w-4" />
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Save Preset Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give your filter configuration a name so you can quickly apply it
              later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., High Priority Open Issues"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSavePreset();
                  }
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Current filters:</p>
              <ul className="space-y-1">
                {Object.entries(localFilters)
                  .filter(([_, value]) => value && value !== "all")
                  .map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setPresetName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>Save Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
