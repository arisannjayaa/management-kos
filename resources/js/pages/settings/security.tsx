import { Form, Head } from '@inertiajs/react';
import { ShieldCheck, LockKeyhole, SmartphoneNfc } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Keamanan Akun" />

            <div className="space-y-8">
                {/* ─── HEADER SECTION MODERN ─── */}
                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20 ring-inset">
                        <ShieldCheck size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground">
                            Keamanan Akun
                        </h2>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            Kelola kata sandi dan lindungi akun dengan
                            otentikasi ganda.
                        </p>
                    </div>
                </div>

                {/* ─── BENTO CARD 1: KATA SANDI ─── */}
                <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-6 shadow-sm ring-1 ring-border/50 backdrop-blur-sm ring-inset sm:p-8">
                    <div className="mb-6 flex items-center gap-2">
                        <LockKeyhole
                            size={18}
                            className="text-muted-foreground"
                        />
                        <h3 className="text-sm font-bold tracking-tight text-foreground">
                            Perbarui Kata Sandi
                        </h3>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="current_password"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Kata Sandi Saat Ini
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="h-11 rounded-xl bg-background/50 font-medium"
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi lama Anda..."
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="password"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Kata Sandi Baru
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="h-11 rounded-xl bg-background/50 font-medium"
                                        autoComplete="new-password"
                                        placeholder="Buat kata sandi yang kuat..."
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Konfirmasi Kata Sandi
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="h-11 rounded-xl bg-background/50 font-medium"
                                        autoComplete="new-password"
                                        placeholder="Ketik ulang kata sandi baru..."
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="h-11 rounded-xl bg-primary px-8 font-bold shadow-md transition-all active:scale-95"
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Perbarui Kata Sandi'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* ─── BENTO CARD 2: OTENTIKASI DUA FAKTOR (2FA) ─── */}
                {canManageTwoFactor && (
                    <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-6 shadow-sm ring-1 ring-border/50 backdrop-blur-sm ring-inset sm:p-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SmartphoneNfc
                                    size={18}
                                    className="text-muted-foreground"
                                />
                                <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    Otentikasi Dua Faktor (2FA)
                                </h3>
                            </div>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase',
                                    twoFactorEnabled
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>

                        {twoFactorEnabled ? (
                            <div className="space-y-6">
                                <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                                    Otentikasi Dua Faktor saat ini aktif. Anda
                                    akan diminta memasukkan PIN acak yang aman
                                    selama proses login, yang dapat Anda peroleh
                                    dari aplikasi OTP (seperti Google
                                    Authenticator) di ponsel Anda.
                                </p>

                                <div className="rounded-2xl border border-border/40 bg-background/50 p-4">
                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </div>

                                <div>
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="h-10 rounded-xl px-6 text-xs font-bold transition-all active:scale-95"
                                            >
                                                {processing
                                                    ? 'Memproses...'
                                                    : 'Nonaktifkan 2FA'}
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                                    Tambahkan lapisan keamanan ekstra ke akun
                                    Anda. Saat Anda mengaktifkan otentikasi dua
                                    faktor, Anda akan diminta memasukkan PIN
                                    unik setiap kali masuk.
                                </p>

                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            className="h-11 rounded-xl bg-primary px-6 font-bold shadow-md transition-all active:scale-95"
                                        >
                                            <ShieldCheck
                                                className="mr-2"
                                                size={16}
                                            />
                                            Lanjutkan Pengaturan
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-11 rounded-xl bg-foreground px-6 font-bold text-background shadow-md transition-all hover:bg-foreground/90 active:scale-95"
                                                >
                                                    {processing
                                                        ? 'Memproses...'
                                                        : 'Aktifkan 2FA Sekarang'}
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Modal Setup 2FA */}
                        <TwoFactorSetupModal
                            isOpen={showSetupModal}
                            onClose={() => setShowSetupModal(false)}
                            requiresConfirmation={requiresConfirmation}
                            twoFactorEnabled={twoFactorEnabled}
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            clearSetupData={clearSetupData}
                            fetchSetupData={fetchSetupData}
                            errors={errors}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan Akun',
            href: edit(),
        },
    ],
};
