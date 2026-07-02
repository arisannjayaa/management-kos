import { SearchIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export function DatatableSearch({
    value,
    onChange,
    placeholder = 'Cari...',
}: Props) {
    return (
        <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 pl-9 text-sm"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    <XIcon className="size-3.5" />
                </button>
            )}
        </div>
    );
}
