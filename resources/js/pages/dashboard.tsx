// resources/js/pages/dashboard/index.tsx

import { Head } from '@inertiajs/react';
import {
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    AlertTriangle,
    Calendar,
    TrendingUp,
    Activity,
    FolderKanban,
    Package,
    Sparkles,
    Target,
} from 'lucide-react';
import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardIndex({ dashboard, stats }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const historyData = stats?.history_charts?.data ?? [];
    const latestSnapshot = historyData[historyData.length - 1] ?? null;

    return (
        <>
            <Head title="Dashboard" />

            {/* 🌟 AMBIENT BACKGROUND GLOW 🌟 */}
            <div className="pointer-events-none fixed inset-0 z-0 flex justify-center">
                <div className="absolute -top-[20%] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 opacity-50 blur-[120px] dark:bg-primary/20" />
            </div>
        </>
    );
}
