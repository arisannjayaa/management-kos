// resources/js/components/datatable/DataTablePerPage.tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    value: number;
    onChange: (value: number) => void;
    options?: number[];
};

export function DataTablePerPage({
    value,
    onChange,
    options = [10, 25, 50, 100],
}: Props) {
    return (
        <Select
            value={String(value)}
            onValueChange={(v) => onChange(Number(v))}
        >
            <SelectTrigger className="h-9 w-24 text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                        {n}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
