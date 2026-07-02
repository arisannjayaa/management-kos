// resources/js/components/datatable/data-table-actions.tsx
// Perubahan: default export → named export agar konsisten.

import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActionItem = {
    label: string;
    href?: string;
    onClick?: () => void;
    destructive?: boolean;
};

type Props = {
    items: ActionItem[];
};

export function DataTableActions({ items }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-500"
                >
                    •••
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
                {items.map((item, index) => {
                    const className = item.destructive
                        ? 'text-red-500 focus:text-red-600'
                        : '';

                    if (item.href) {
                        return (
                            <DropdownMenuItem
                                key={index}
                                asChild
                                className={className}
                            >
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        );
                    }

                    return (
                        <DropdownMenuItem
                            key={index}
                            className={className}
                            onClick={item.onClick}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
