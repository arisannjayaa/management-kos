import { Form, Head, Link, usePage } from '@inertiajs/react';
import { UserCircle, ShieldAlert } from 'lucide-react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profil Akun" />

            <div className="space-y-8">
                {/* ─── HEADER SECTION MODERN ─── */}
                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shadow-sm ring-1 ring-blue-500/20 ring-inset">
                        <UserCircle size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground">
                            Profil Akun
                        </h2>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            Perbarui informasi pribadi dan alamat kontak Anda.
                        </p>
                    </div>
                </div>

                {/* ─── BENTO CARD: FORM PROFIL ─── */}
                <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-6 shadow-sm ring-1 ring-border/50 backdrop-blur-sm ring-inset sm:p-8">
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="name"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="name"
                                        className="h-11 rounded-xl bg-background/50 font-medium"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Ketik nama lengkap Anda..."
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="email"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Alamat Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-11 rounded-xl bg-background/50 font-medium"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="email@contoh.com"
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={errors.email}
                                    />
                                </div>

                                {/* Peringatan Verifikasi Email Modern */}
                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="mt-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400">
                                            <div className="flex items-start gap-3">
                                                <ShieldAlert
                                                    size={18}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                <div>
                                                    <p className="text-xs leading-relaxed font-medium">
                                                        Alamat email Anda belum
                                                        diverifikasi.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="font-bold underline decoration-amber-500/30 underline-offset-4 transition-colors hover:decoration-amber-500"
                                                        >
                                                            Klik di sini untuk
                                                            mengirim ulang
                                                            tautan.
                                                        </Link>
                                                    </p>
                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-3 inline-block rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-emerald-600 uppercase">
                                                            Tautan baru telah
                                                            dikirim!
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                <div className="pt-2">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="h-11 rounded-xl bg-primary px-8 font-bold shadow-md transition-all active:scale-95"
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* ─── DANGER ZONE BENTO WRAPPER ─── */}
                <div className="overflow-hidden rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6 shadow-sm ring-1 ring-red-500/10 backdrop-blur-sm ring-inset sm:p-8">
                    {/* Komponen DeleteUser bawaan Anda */}
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profil Akun',
            href: edit(),
        },
    ],
};
