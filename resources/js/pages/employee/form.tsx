import { useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import employeeRoute from '@/routes/employee';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/**
 * Form section tabs.
 *
 * personal → data identitas pegawai
 * akun    → akun sistem & penugasan kerja
 */
type Tab = 'personal' | 'akun';

/* -------------------------------------------------------------------------- */
/*                               Employee Form                                */
/* -------------------------------------------------------------------------- */

/**
 * Employee create / edit form.
 *
 * Mendukung:
 * - create employee
 * - update employee
 * - tab validation state
 * - inertia form handling
 */
export default function Form({ employee }: any) {
    /**
     * Determine form mode.
     *
     * true  → edit existing employee
     * false → create new employee
     */
    const isEdit = !!employee;

    /**
     * Active UI tab state.
     */
    const [activeTab, setActiveTab] = useState<Tab>('personal');

    /* ---------------------------------------------------------------------- */
    /* Inertia Form State                                                     */
    /* ---------------------------------------------------------------------- */

    /**
     * Main form state handled by Inertia useForm.
     *
     * Menggunakan fallback empty string agar:
     * - controlled input tetap stabil
     * - menghindari uncontrolled → controlled warning React
     */
    const { data, setData, post, put, processing, errors } = useForm({
        id: employee?.id || '',
        user_id: employee?.user_id || '',

        employee_code: employee?.employee_code || '',
        id_card_number: employee?.id_card_number || '',
        telephone: employee?.telephone || '',
        address: employee?.address || '',
        joined_at: employee?.joined_at || '',

        /**
         * User relation fields.
         *
         * Karena employee memiliki relasi ke user.
         */
        name: employee?.user?.name || '',
        email: employee?.user?.email || '',

        /**
         * Password intentionally empty on edit mode.
         *
         * Backend biasanya hanya update password
         * jika field ini diisi.
         */
        password: '',

        division: employee?.division || '',
        level: employee?.level || '',
        status: employee?.status || '',
    });

    /* ---------------------------------------------------------------------- */
    /* Form Submit Handler                                                    */
    /* ---------------------------------------------------------------------- */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        /**
         * Dynamic endpoint selection.
         *
         * create → POST
         * edit   → PUT
         */
        const url = isEdit
            ? employeeRoute.update(employee.id).url
            : employeeRoute.create().url;

        const method = isEdit ? put : post;

        method(url, {
            preserveScroll: true,

            /**
             * Display global validation feedback.
             */
            onError: () => {
                toast.error(
                    'Gagal menyimpan! Periksa kembali kolom yang bertanda merah.',
                );
            },
        });
    };

    /* ---------------------------------------------------------------------- */
    /* Tab Validation Indicators                                              */
    /* ---------------------------------------------------------------------- */

    /**
     * Detect validation errors on personal tab.
     */
    const hasPersonalErrors = [
        'id_card_number',
        'telephone',
        'address',
        'joined_at',
    ].some((key) => errors[key as keyof typeof errors]);

    /**
     * Detect validation errors on account tab.
     */
    const hasAccountErrors = [
        'name',
        'email',
        'password',
        'status',
        'division',
        'level',
    ].some((key) => errors[key as keyof typeof errors]);

    /**
     * Tab configuration.
     *
     * hasError digunakan untuk menampilkan
     * error indicator badge pada tab.
     */
    const tabs: { key: Tab; label: string; hasError: boolean }[] = [
        {
            key: 'personal',
            label: 'Identitas Personal',
            hasError: hasPersonalErrors,
        },

        {
            key: 'akun',
            label: 'Akun & Penugasan',
            hasError: hasAccountErrors,
        },
    ];

    return (
        <>
            {/* Dynamic browser title */}
            <Head title={isEdit ? 'Edit Pegawai' : 'Tambah Pegawai'} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
                {/* ================================================================ */}
                {/* Page Header                                                      */}
                {/* ================================================================ */}

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {isEdit
                            ? 'Update Data Karyawan'
                            : 'Registrasi Karyawan Baru'}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Sistem Manajemen SDM — AGS PRO BALI
                    </p>
                </div>

                {/* ================================================================ */}
                {/* Tab Navigation                                                   */}
                {/* ================================================================ */}

                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="-mb-px flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                            >
                                {tab.label}

                                {/* Validation indicator */}
                                {tab.hasError && (
                                    <span className="absolute top-2 right-1 flex size-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ================================================================ */}
                {/* Main Form                                                        */}
                {/* ================================================================ */}

                <form onSubmit={submit} className="space-y-6">
                    {/* Hidden relational identifiers */}
                    <input type="hidden" value={data.id} />
                    <input type="hidden" value={data.user_id} />

                    {/* ============================================================ */}
                    {/* TAB 1 — Personal Information                                */}
                    {/* ============================================================ */}

                    {activeTab === 'personal' && (
                        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
                                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                    Informasi Personal & Identitas
                                </CardTitle>

                                <CardDescription>
                                    Data identitas kependudukan dan kontak
                                    personil.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5 p-6">
                                {/* Identity section */}
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    {/* National ID */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                            NIK (Sesuai KTP)
                                        </Label>

                                        <Input
                                            value={data.id_card_number}
                                            onChange={(e) =>
                                                setData(
                                                    'id_card_number',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10 font-mono tracking-widest"
                                            placeholder="16 Digit NIK"
                                        />

                                        {errors.id_card_number && (
                                            <p className="text-xs text-red-500">
                                                {errors.id_card_number}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone number */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                            Nomor WhatsApp
                                        </Label>

                                        <Input
                                            value={data.telephone}
                                            onChange={(e) =>
                                                setData(
                                                    'telephone',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                            placeholder="081..."
                                        />

                                        {errors.telephone && (
                                            <p className="text-xs text-red-500">
                                                {errors.telephone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Address section */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Alamat Lengkap
                                    </Label>

                                    <Textarea
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        className="min-h-[100px] resize-none"
                                        placeholder="Masukkan alamat tinggal saat ini di Bali"
                                    />

                                    {errors.address && (
                                        <p className="text-xs text-red-500">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ============================================================ */}
                    {/* Footer Actions                                               */}
                    {/* ============================================================ */}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                        {/* Cancel navigation */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="text-slate-500"
                        >
                            Batal
                        </Button>

                        {/* Step navigation / submit */}
                        <div className="flex items-center gap-2">
                            {activeTab === 'akun' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('personal')}
                                >
                                    ← Kembali
                                </Button>
                            )}

                            {activeTab === 'personal' ? (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('akun');
                                    }}
                                    className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                >
                                    Lanjut →
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-slate-900 px-8 text-white dark:bg-slate-100 dark:text-slate-900"
                                >
                                    {processing
                                        ? 'Sedang Menyimpan...'
                                        : isEdit
                                          ? 'Simpan Perubahan'
                                          : 'Daftarkan Pegawai'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
