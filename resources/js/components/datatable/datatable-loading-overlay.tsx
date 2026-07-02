import { Loader2Icon } from 'lucide-react';

export function DataTableLoadingOverlay({ show }: { show: boolean }) {
    if (!show) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60 dark:bg-slate-950/60">
            <Loader2Icon className="size-6 animate-spin text-slate-400" />
        </div>
    );
}
