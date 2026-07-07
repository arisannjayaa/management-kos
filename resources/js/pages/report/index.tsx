import { Head, router } from '@inertiajs/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Building, Calendar, DollarSign, Wallet, Printer } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FinancialData, ReportFilters } from '@/types/report/report-type';
import { Button } from '@/components/ui/button';

type Props = {
    filters: ReportFilters;
    properties: any;
    financialData: FinancialData;
};

export default function ReportIndex({ filters, properties, financialData }: Props) {
    const propsArray = properties?.data ?? properties ?? [];

    const [propId, setPropId] = useState<string>(filters.property_id ?? 'all');
    const [year, setYear] = useState<string>(String(filters.year));

    // Handle Filter Global
    const handleFilterChange = (key: string, value: string) => {
        const payload: Record<string, string> = {
            property_id: key === 'property_id' ? (value === 'all' ? '' : value) : (propId === 'all' ? '' : propId),
            year: key === 'year' ? value : year
        };

        router.get('/reports', payload, { preserveState: true, preserveScroll: true });

        if (key === 'property_id') setPropId(value);
        if (key === 'year') setYear(value);
    };

    const handleExportPdf = () => {
        // Rangkai parameter kueri dari filter aktif
        const params = new URLSearchParams();
        if (propId !== 'all') params.append('property_id', propId);
        if (year) params.append('year', year);

        // Buka rute ekspor PDF di tab browser baru
        window.open(`/reports/export-pdf?${params.toString()}`, '_blank');
    };

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
                    <p className="mb-2 text-xs font-extrabold text-foreground">{label} {year}</p>
                    <div className="flex flex-col gap-1.5">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-[11px] font-semibold">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground uppercase">{entry.name}</span>
                                </div>
                                <span className="font-mono font-bold text-foreground">
                                    {formatRp(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Komponen Widget Ringkasan
    const SummaryWidget = ({ title, amount, lastAmount, icon: Icon, colorClass }: any) => {
        const diff = amount - lastAmount;
        const percent = lastAmount === 0 ? 100 : (diff / lastAmount) * 100;
        const isUp = diff >= 0;

        return (
            <Card className="rounded-3xl shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground">{title}</CardTitle>
                    <div className={cn('p-2 rounded-xl', colorClass.bg, colorClass.text)}><Icon size={16} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black font-mono tracking-tight">{formatRp(amount)}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                        <span className={cn('flex items-center', isUp ? 'text-emerald-500' : 'text-red-500')}>
                            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(percent).toFixed(1)}%
                        </span>
                        vs bulan lalu
                    </p>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">

                {/* 1. Header & Filter Bar */}
                <div
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-3xl border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                            <DollarSign size={24} className="text-primary" /> Analitik Keuangan Kos
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">Pemantauan arus kas bersih (Net Profit)
                            operasional kos.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={propId} onValueChange={(v) => handleFilterChange('property_id', v)}>
                            <SelectTrigger className="w-[160px] rounded-xl font-semibold"><Building
                                className="w-4 h-4 mr-2 text-slate-400" /><SelectValue
                                placeholder="Semua Gedung" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Gedung</SelectItem>
                                {propsArray.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={year} onValueChange={(v) => handleFilterChange('year', v)}>
                            <SelectTrigger className="w-[120px] rounded-xl font-semibold"><Calendar
                                className="w-4 h-4 mr-2 text-slate-400" /><SelectValue
                                placeholder="Tahun" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleExportPdf} variant="outline" className="rounded-xl font-bold border-primary text-primary hover:bg-primary/10">
                            <Printer size={16} className="mr-2" /> Cetak PDF
                        </Button>
                    </div>
                </div>

                {/* 2. Top Widgets (Summary Bulan Ini) */}
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryWidget
                        title="Pemasukan (Invoices Paid)"
                        amount={financialData.summary.current_income}
                        lastAmount={financialData.summary.last_income}
                        icon={ArrowDownRight}
                        colorClass={{ bg: 'bg-emerald-500/10', text: 'text-emerald-500' }}
                    />
                    <SummaryWidget
                        title="Pengeluaran (Expenses)"
                        amount={financialData.summary.current_expense}
                        lastAmount={financialData.summary.last_expense}
                        icon={ArrowUpRight}
                        colorClass={{ bg: 'bg-red-500/10', text: 'text-red-500' }}
                    />
                    <SummaryWidget
                        title="Laba Bersih (Net Profit)"
                        amount={financialData.summary.current_profit}
                        lastAmount={financialData.summary.last_profit}
                        icon={Wallet}
                        colorClass={{ bg: 'bg-primary/10', text: 'text-primary' }}
                    />
                </div>

                {/* 3. Main Chart Area */}
                <Card className="rounded-[2rem] shadow-sm border-border pt-6">
                    <CardHeader className="pb-8">
                        <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                            Grafik Arus Kas Tahunan <span className="text-primary">({year})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financialData.chart}
                                           margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                                           tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false}
                                           tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                                           tickFormatter={(val) => `Rp${val / 1000000}M`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '3 3' }} />
                                    <Area type="monotone" name="Pemasukan" dataKey="income" stroke="#10b981"
                                          strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" name="Pengeluaran" dataKey="expense" stroke="#ef4444"
                                          strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportIndex.layout = {
    breadcrumbs: [{ title: 'Dasbor & Laporan', href: '#' }, {
        title: 'Analitik Keuangan',
        href: '/reports'
    }]
};
