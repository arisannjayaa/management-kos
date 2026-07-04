// resources/js/config/sidebar.ts

import {
    LayoutDashboard,
    Building,
    BedDouble,
    Users,
    KeyRound,
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
// Jika menggunakan Ziggy, Anda bisa langsung memakai route('properties.index') di href
import dashboardController from '@/actions/App/Http/Controllers/DashboardController';
import propertyRoute from '@/routes/properties';
import roomRoute from '@/routes/rooms';
import tenantRoute from '@/routes/tenants';
import occupancyRoute from '@/routes/occupancies';
import billingRoute from '@/routes/billings';
import paymentRoute from '@/routes/payments';
import expenseRoute from '@/routes/expenses';
import complaintRoute from '@/routes/complaints';
import reportRoute from '@/routes/reports';
import userRoute from '@/routes/users';
import roleRoute from '@/routes/roles';
import chargeTypeRoute from '@/routes/charge-types';
import waGatewayRoute from '@/routes/wa-session';
import auditLogRoute from '@/routes/audit-logs';

export const sidebarMenus: NavGroup[] = [
    {
        title: 'Utama',
        items: [
            {
                title: 'Dashboard',
                href: dashboardController.index(),
                icon: LayoutDashboard,
                permission: 'dashboard.view', // Disesuaikan dengan seeder
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
                permission: 'property.view', // Disesuaikan dengan seeder
                activePatterns: ['/properties'],
            },
            {
                title: 'Kamar',
                href: roomRoute.index(),
                icon: BedDouble,
                permission: 'room.view', // Disesuaikan dengan seeder
                activePatterns: ['/rooms'],
            },
            {
                title: 'Tenant',
                href: tenantRoute.index(),
                icon: Users,
                permission: 'tenant.view', // Disesuaikan dengan seeder
                activePatterns: ['/tenants'],
            },
            {
                title: 'Okupansi & Check-in',
                href: occupancyRoute.index(),
                icon: KeyRound,
                permission: 'occupancy.view', // Disesuaikan dengan seeder
                activePatterns: ['/occupancies'],
            },
        ],
    },
    {
        title: 'Keuangan',
        items: [
            {
                title: 'Tagihan / Billing',
                href: billingRoute.index(),
                icon: FileText,
                permission: 'invoice.view', // Di seeder memakai 'invoice.view'
                activePatterns: ['/billings'],
            },
            {
                title: 'Pembayaran',
                href: paymentRoute.index(),
                icon: Banknote,
                permission: 'payment.view', // Disesuaikan dengan seeder
                activePatterns: ['/payments'],
            },
            {
                title: 'Pengeluaran',
                href: expenseRoute.index(),
                icon: ReceiptText,
                permission: 'expense.view', // Disesuaikan dengan seeder
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
                permission: 'complaint.view', // Disesuaikan dengan seeder
                activePatterns: ['/complaints'],
            },
            {
                title: 'Laporan',
                href: reportRoute.index(),
                icon: PieChart,
                permission: 'report.view', // Disesuaikan dengan seeder
                activePatterns: ['/reports'],
            },
        ],
    },
    {
        title: 'Master Data & Pengguna',
        items: [
            {
                title: 'Master Charge Types',
                href: chargeTypeRoute.index(),
                icon: Tags,
                permission: 'charge_type.view', // Disesuaikan dengan seeder
                activePatterns: ['/charge-types'],
            },
            {
                title: 'Kelola Staff',
                href: '', // Sesuai nama rute
                icon: UserCog,
                permission: 'staff.manage', // Disesuaikan dengan seeder
                activePatterns: ['/users/staff'], // Disesuaikan pola rute
            },
            {
                title: 'Owner Accounts',
                href: '', // Sesuai nama rute
                icon: ShieldCheck,
                permission: 'staff.manage', // Menggunakan permission manage staf secara general
                activePatterns: ['/users/owners'], // Disesuaikan pola rute
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
                permission: 'role.manage', // Disesuaikan dengan seeder
                activePatterns: ['/roles'],
            },
            {
                title: 'WA Gateway & Reminder',
                href: waGatewayRoute.index().url,
                icon: MessageCircle,
                permission: 'system_settings.manage', // Disesuaikan dengan seeder
                activePatterns: ['/wa-session'],
            },
            {
                title: 'Audit Log',
                href: auditLogRoute.index(),
                icon: ClipboardList,
                permission: 'audit_logs.view', // Disesuaikan dengan seeder
                activePatterns: ['/audit-logs'],
            },
        ],
    },
];
