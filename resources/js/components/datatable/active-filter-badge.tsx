import { XIcon } from 'lucide-react';

type Props = {
    label: string;
    onRemove: () => void;
};

export function ActiveFilterBadge({ label, onRemove }: Props) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="ml-0.5 rounded-full hover:text-red-500"
            >
                <XIcon className="size-3" />
            </button>
        </span>
    );
}
