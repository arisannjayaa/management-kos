// resources/js/components/datatable/data-table-filter-chips.tsx
// Perubahan: default export → named export agar konsisten dengan komponen lain.

import React from 'react';
import { ActiveFilterBadge } from '@/components/datatable';
import type { FilterChipConfig } from '@/types/datatable';

type FilterChipsProps = {
    configs: FilterChipConfig[];
};

export function DataTableFilterChips({ configs }: FilterChipsProps) {
    const activeConfigs = configs.filter((c) => Boolean(c.value));

    if (activeConfigs.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Filter aktif:</span>
            {activeConfigs.map((config) => (
                <ActiveFilterBadge
                    key={config.key}
                    label={config.label}
                    onRemove={config.onRemove}
                />
            ))}
        </div>
    );
}
