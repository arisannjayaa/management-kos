// resources/js/components/ui/color-picker.tsx

import { Paintbrush } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export function ColorPicker({
                                value,
                                onChange,
                                className,
                                disabled = false,
                            }: ColorPickerProps) {
    // Palet warna modern bawaan yang sering dipakai untuk label/kategori
    const presets = [
        '#43B59B', // Primary Theme
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#8b5cf6', // Violet
        '#d946ef', // Fuchsia
        '#ec4899', // Pink
        '#ef4444', // Red
        '#f59e0b', // Amber
        '#eab308', // Yellow
        '#84cc16', // Lime
        '#64748b', // Slate
        '#0f172a', // Slate Dark
    ];

    return (
        // 🌟 WAJIB modal={true} agar tidak terkena bug scroll trap di dalam Dialog/Drawer
        <Popover modal={true}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'h-10.5 w-full justify-start rounded-xl text-left font-normal shadow-sm active:scale-95 transition-all',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <div className="flex w-full items-center gap-3">
                        {value ? (
                            <div
                                className="h-5 w-5 shrink-0 rounded-md border border-black/10 shadow-sm"
                                style={{ backgroundColor: value }}
                            />
                        ) : (
                            <Paintbrush className="h-4 w-4 shrink-0" />
                        )}
                        <div className="flex-1 truncate text-xs font-mono">
                            {value ? value : 'Pilih Warna'}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-64 rounded-2xl border-border bg-card p-4 shadow-xl"
                align="start"
            >
                <div className="mb-4">
                    <p className="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Palet Cepat
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                        {presets.map((color) => (
                            <button
                                key={color}
                                type="button"
                                style={{ backgroundColor: color }}
                                className={cn(
                                    'h-7 w-7 rounded-md border border-black/10 shadow-sm transition-all hover:scale-110 active:scale-95',
                                    value === color && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                )}
                                onClick={() => onChange(color)}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5 border-t border-border/40 pt-4">
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Kode Kustom (HEX)
                    </p>
                    <Input
                        id="custom-color"
                        value={value}
                        className="h-10 rounded-xl font-mono text-xs uppercase"
                        onChange={(e) => onChange(e.currentTarget.value)}
                        placeholder="#000000"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
