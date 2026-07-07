// resources/js/config/sidebar.ts

import {
    LayoutDashboard,
    Building,
    Layers,
    BedDouble,
    Users,
    KeyRound,
    Gauge, // 🌟 TAMBAHAN: Ikon Indikator Meteran Digital
    FileText,
    Banknote,
    ReceiptText,
    MessageSquareWarning,
    PieChart,
    Tags,
    UserCog,
    ShieldCheck,
    MessageCircle,
    ClipboardList,
    Settings
} from 'lucide-react';

import type { NavGroup } from '@/types';

// Placeholder import rute - sesuaikan dengan struktur file/helper route Anda
import dashboardController from '@/actions/App/Http/Controllers/DashboardController';
import propertyRoute from '@/routes/properties';
import roomTypeRoute from '@/routes/room-types';
import roomRoute from '@/routes/rooms';
import tenantRoute from '@/routes/tenants';
import occupancyRoute from '@/routes/occupancies';
import meterReadingRoute from '@/routes/meter-readings'; // 🌟 TAMBAHAN: Rute Meteran Utilitas (Fase 4)
import invoiceRoute from '@/routes/invoices';
import paymentRoute from '@/routes/payments';
import expenseRoute from '@/routes/expenses';
import complaintRoute from '@/routes/complaints';
import reportRoute from '@/routes/reports';
import userRoute from '@/routes/users';
import roleRoute from '@/routes/roles';
import chargeTypeRoute from '@/routes/charge-types';
import waGatewayRoute from '@/routes/wa-session';
import auditLogRoute from '@/routes/audit-logs';
import expenseCategoryRoute from '@/routes/expense_categories';

export const sidebarMenus: NavGroup[] = [
    {
        title: 'Utama',
        items: [
            {
                title: 'Dashboard',
                href: dashboardController.index(),
                icon: LayoutDashboard,
                permission: 'dashboard.view',
                activePatterns: ['/dashboard'],
            },
        ],
    },
    {
        title: 'Manajemen Kos',
        items: [
            {
                title: 'Properti',
                href: propertyRoute.index(),
                icon: Building,
                permission: 'property.view',
                activePatterns: ['/properties'],
            },
            {
                title: 'Tipe Kamar',
                href: roomTypeRoute.index(),
                icon: Layers,
                permission: 'room.view',
                activePatterns: ['/room-types'],
            },
            {
                title: 'Kamar',
                href: roomRoute.index(),
                icon: BedDouble,
                permission: 'room.view',
                activePatterns: ['/rooms'],
            },
            {
                title: 'Tenant',
                href: tenantRoute.index(),
                icon: Users,
                permission: 'tenant.view',
                activePatterns: ['/tenants'],
            },
            {
                title: 'Okupansi & Check-in',
                href: occupancyRoute.index(),
                icon: KeyRound,
                permission: 'occupancy.view',
                activePatterns: ['/occupancies'],
            },
            {
                title: 'Meteran Utilitas', // 🌟 MODUL BARU: Penempatan Rapi Fase 4
                href: meterReadingRoute.index(),
                icon: Gauge,
                permission: 'meter_reading.view',
                activePatterns: ['/meter-readings'],
            },
        ],
    },
    {
        title: 'Keuangan',
        items: [
            {
                title: 'Tagihan / Billing',
                href: invoiceRoute.index(),
                icon: FileText,
                permission: 'invoice.view',
                activePatterns: ['/invoices'],
            },
            {
                title: 'Pembayaran',
                href: paymentRoute.index(),
                icon: Banknote,
                permission: 'payment.view',
                activePatterns: ['/payments'],
            },
            {
                title: 'Pengeluaran',
                href: expenseRoute.index(),
                icon: ReceiptText,
                permission: 'expense.view',
                activePatterns: ['/expenses'],
            },
        ],
    },
    {
        title: 'Operasional',
        items: [
            {
                title: 'Komplain',
                href: complaintRoute.index(),
                icon: MessageSquareWarning,
                permission: 'complaint.view',
                activePatterns: ['/complaints'],
            },
            {
                title: 'Laporan',
                href: reportRoute.index(),
                icon: PieChart,
                permission: 'report.view',
                activePatterns: ['/reports'],
            },
        ],
    },
    {
        title: 'Master Data & Pengguna',
        items: [
            {
                title: 'Master Tipe Tambahan Biaya',
                href: chargeTypeRoute.index(),
                icon: Tags,
                permission: 'charge_type.view',
                activePatterns: ['/charge-types'],
            },
            {
                title: 'Master Kategori Pengeluaran',
                href: expenseCategoryRoute.index(),
                icon: Tags,
                permission: 'expense_category.view',
                activePatterns: ['/expense-categories'],
            },
            {
                title: 'Kelola Staff',
                href: '',
                icon: UserCog,
                permission: 'staff.manage',
                activePatterns: ['/users/staff'],
            },
            {
                title: 'Owner Accounts',
                href: '',
                icon: ShieldCheck,
                permission: 'staff.manage',
                activePatterns: ['/users/owners'],
            },
        ],
    },
    {
        title: 'Sistem & Pengaturan',
        items: [
            {
                title: 'Roles & Permissions',
                href: roleRoute.index(),
                icon: KeyRound,
                permission: 'role.manage',
                activePatterns: ['/roles'],
            },
            {
                title: 'WA Gateway & Reminder',
                href: waGatewayRoute.index().url,
                icon: MessageCircle,
                permission: 'system_settings.manage',
                activePatterns: ['/wa-session'],
            },
            {
                title: 'Audit Log',
                href: auditLogRoute.index(),
                icon: ClipboardList,
                permission: 'audit_logs.view',
                activePatterns: ['/audit-logs'],
            },
        ],
    },
];
