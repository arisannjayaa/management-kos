// resources/js/components/async-combobox.tsx

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface Option {
    value: string;
    label: string;
}

interface AsyncComboboxProps {
    value?: string;
    onValueChange: (value: string) => void;
    fetcher: (search: string) => Promise<Option[]>;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    defaultLabel?: string; // Digunakan jika edit data, untuk menampilkan nama sebelum fetch
    className?: string;
    disabled?: boolean;
}

export function AsyncCombobox({
    value,
    onValueChange,
    fetcher,
    placeholder = 'Pilih data...',
    searchPlaceholder = 'Ketik min 3 huruf...',
    emptyText = 'Data tidak ditemukan.',
    defaultLabel,
    className,
    disabled = false,
}: AsyncComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [options, setOptions] = React.useState<Option[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Simpan label dari data yang terpilih (termasuk default label saat edit)
    const [selectedLabel, setSelectedLabel] = React.useState<string>(
        defaultLabel || '',
    );

    // Logika Debounce & Fetch API
    React.useEffect(() => {
        // Jika pencarian kurang dari 3 karakter, kosongkan opsi
        if (search.length < 3) {
            setOptions([]);

            return;
        }

        let isMounted = true;
        setLoading(true);

        const timer = setTimeout(async () => {
            try {
                const results = await fetcher(search);

                if (isMounted) {
                    setOptions(results);
                }
            } catch (error) {
                console.error('Failed to fetch options', error);

                if (isMounted) {
setOptions([]);
}
            } finally {
                if (isMounted) {
setLoading(false);
}
            }
        }, 400); // Jeda 400ms setelah user berhenti mengetik

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [search, fetcher]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        className,
                        !value && 'text-slate-500',
                    )}
                >
                    <span className="truncate">
                        {value ? selectedLabel : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0" align="start">
                {/* shouldFilter={false} SANGAT PENTING agar Shadcn tidak me-replace hasil dari server */}
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading && (
                            <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Mencari data...
                            </div>
                        )}

                        {!loading &&
                            search.length >= 3 &&
                            options.length === 0 && (
                                <CommandEmpty>{emptyText}</CommandEmpty>
                            )}

                        {!loading && search.length < 3 && (
                            <div className="py-6 text-center text-xs text-slate-500">
                                Ketik minimal 3 karakter untuk mencari.
                            </div>
                        )}

                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        onValueChange(option.value);
                                        setSelectedLabel(option.label);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 size-4',
                                            value === option.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
