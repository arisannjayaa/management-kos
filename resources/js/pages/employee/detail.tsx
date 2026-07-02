import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    BriefcaseIcon,
    CalendarIcon,
    FingerprintIcon,
    MailIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    DIVISION_OPTIONS,
    STATUS_OPTIONS,
    STATUS_BADGE,
    LEVEL_BADGE,
    labelOf,
} from '@/pages/employee/columns';

import employeeRoute from '@/routes/employee';

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/**
 * Shared Indonesian date formatter.
 *
 * Menggunakan instance tunggal untuk menghindari
 * re-instantiation setiap component render.
 */
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

/* -------------------------------------------------------------------------- */
/*                              Employee Detail                               */
/* -------------------------------------------------------------------------- */

/**
 * Employee detail page.
 *
 * Menampilkan:
 * - profil singkat pegawai
 * - informasi personal
 * - informasi penugasan / kepegawaian
 */
export default function EmployeeDetail({ employee }: any) {
    /**
     * Defensive fallback.
     *
     * Mencegah runtime error ketika data belum tersedia
     * atau response backend tidak lengkap.
     */
    const emp = employee || {};
    const user = emp.user || {};

    /**
     * Generate avatar initials dari nama user.
     *
     * Contoh:
     * "John Doe" → "JD"
     */
    const initials =
        user.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'AG';

    return (
        <>
            {/* Dynamic page title */}
            <Head title={`Detail Pegawai - ${user.name || 'Profil'}`} />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
                {/* ------------------------------------------------------------------ */}
                {/* Header Actions                                                      */}
                {/* ------------------------------------------------------------------ */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Back navigation */}
                    <Button
                        variant="ghost"
                        asChild
                        className="-ml-4 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        <Link href={employeeRoute.index().url}>
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Kembali ke Data Karyawan
                        </Link>
                    </Button>

                    {/* Edit employee action */}
                    <Button
                        asChild
                        className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        <Link href={employeeRoute.form(emp.id).url}>
                            <PencilIcon className="mr-2 size-4" />
                            Edit Data Pegawai
                        </Link>
                    </Button>
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* Main Layout Grid                                                    */}
                {/* ------------------------------------------------------------------ */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* ================================================================ */}
                    {/* Left Sidebar - Employee Summary                                 */}
                    {/* ================================================================ */}

                    <div className="space-y-6 md:col-span-1">
                        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <CardContent className="flex flex-col items-center p-6 text-center">
                                {/* Avatar initials */}
                                <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {initials}
                                </div>

                                {/* Employee name */}
                                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                    {user.name || '—'}
                                </h2>

                                {/* Employee email */}
                                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                    {user.email || '—'}
                                </p>

                                {/* Status & level badges */}
                                <div className="flex w-full flex-col gap-2">
                                    {/* Employment status */}
                                    <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                                        <span className="text-slate-500">
                                            Status
                                        </span>

                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[emp.status || ''] ?? ''}`}
                                        >
                                            {labelOf(
                                                STATUS_OPTIONS,
                                                emp.status,
                                            )}
                                        </span>
                                    </div>

                                    {/* Employee level */}
                                    <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                                        <span className="text-slate-500">
                                            Level
                                        </span>

                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_BADGE[emp.level || ''] ?? ''}`}
                                        >
                                            {emp.level}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ================================================================ */}
                    {/* Main Content                                                     */}
                    {/* ================================================================ */}

                    <div className="space-y-6 md:col-span-2">
                        {/* ------------------------------------------------------------------ */}
                        {/* Personal Information                                                */}
                        {/* ------------------------------------------------------------------ */}

                        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                                <CardTitle className="flex items-center text-base font-semibold text-slate-800 dark:text-slate-200">
                                    <UserIcon className="mr-2 size-5 text-slate-400" />
                                    Informasi Personal
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                <dl className="grid grid-cols-1 sm:grid-cols-2">
                                    {/* National ID */}
                                    <div className="flex items-start gap-3 border-b border-slate-100 p-4 sm:border-r dark:border-slate-800">
                                        <FingerprintIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                NIK (Nomor KTP)
                                            </dt>

                                            <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                                                {emp.id_card_number || '—'}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Phone number */}
                                    <div className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                                        <PhoneIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                Nomor WhatsApp
                                            </dt>

                                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                                {emp.telephone || '—'}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-3 p-4 sm:col-span-2">
                                        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                Alamat Domisili
                                            </dt>

                                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                                {emp.address ||
                                                    'Belum ada alamat yang didaftarkan.'}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* ------------------------------------------------------------------ */}
                        {/* Employment Information                                              */}
                        {/* ------------------------------------------------------------------ */}

                        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                                <CardTitle className="flex items-center text-base font-semibold text-slate-800 dark:text-slate-200">
                                    <BriefcaseIcon className="mr-2 size-5 text-slate-400" />
                                    Penugasan & Kepegawaian
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                <dl className="grid grid-cols-1 sm:grid-cols-2">
                                    {/* Employee code */}
                                    <div className="flex items-start gap-3 border-b border-slate-100 p-4 sm:border-r dark:border-slate-800">
                                        <FingerprintIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                ID Karyawan
                                            </dt>

                                            <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                                                {emp.employee_code || '—'}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Division */}
                                    <div className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                                        <BriefcaseIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                Divisi / Posisi
                                            </dt>

                                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                                {labelOf(
                                                    DIVISION_OPTIONS,
                                                    emp.division,
                                                )}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* System email */}
                                    <div className="flex items-start gap-3 border-b border-slate-100 p-4 sm:border-r sm:border-b-0 dark:border-slate-800">
                                        <MailIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                Email Sistem
                                            </dt>

                                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                                {user.email || '—'}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Join date */}
                                    <div className="flex items-start gap-3 p-4">
                                        <CalendarIcon className="mt-0.5 size-4 text-slate-400" />

                                        <div>
                                            <dt className="text-xs font-medium text-slate-500 uppercase">
                                                Tanggal Bergabung
                                            </dt>

                                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                                {emp.joined_at
                                                    ? dateFormatter.format(
                                                          new Date(
                                                              emp.joined_at,
                                                          ),
                                                      )
                                                    : '—'}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
