import { Form, Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Masuk Akun" />

            {/* Notifikasi Status (misal: sukses reset password) */}
            {status && (
                <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Input Email */}
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
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl bg-background/50 font-medium transition-colors focus:bg-background"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Input Kata Sandi */}
                            <div className="grid gap-2.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-[10px] font-bold text-primary transition-colors hover:text-primary/80"
                                            tabIndex={5}
                                        >
                                            Lupa sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi..."
                                    className="h-11 rounded-xl bg-background/50 font-medium transition-colors focus:bg-background"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Ingat Sesi */}
                            <div className="flex items-center space-x-3 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-[4px]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Ingat sesi saya
                                </Label>
                            </div>

                            {/* Tombol Submit */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-primary font-bold shadow-md transition-all active:scale-95"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <KeyRound className="mr-2 h-4 w-4" />
                                )}
                                {processing
                                    ? 'Memverifikasi...'
                                    : 'Masuk ke Dasbor'}
                            </Button>
                        </div>

                        {/* Tautan Daftar */}
                        {canRegister && (
                            <div className="mt-2 text-center text-xs font-medium text-muted-foreground">
                                Belum memiliki akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="font-bold text-foreground transition-colors hover:text-primary"
                                >
                                    Daftar sekarang
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

// Terjemahan teks yang dirender oleh AuthLayout
Login.layout = {
    title: 'Masuk ke Akun Anda',
    description:
        'Masukkan email dan kata sandi Anda untuk melanjutkan ke dasbor finansial.',
};
