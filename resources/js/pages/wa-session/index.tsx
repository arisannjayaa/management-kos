import { Head, useForm, router } from '@inertiajs/react';
import {
    RefreshCcw,
    Smartphone,
    MessageSquare,
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    QrCode,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Pastikan file route ini ada atau gunakan helper bawaan Anda
import waGatewayRoute from '@/routes/wa-session';

type Props = {
    initialStatus: string;
    lastConnected: string | null;
    sessionId: string;
    socketUrl: string;
};

// 🌟 PERBAIKAN 1: Deklarasikan socket di LUAR komponen agar bersifat persisten / tidak mati saat pindah menu
let socket: Socket | null = null;

export default function WaGatewayIndex({
    initialStatus,
    lastConnected,
    sessionId,
    socketUrl,
}: Props) {
    const [status, setStatus] = useState<string>(initialStatus);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState<string>(
        'Menunggu respon sistem...',
    );

    // ─── INTEGRASI SOCKET.IO ──────────────────────────────────────────────────
    useEffect(() => {
        // 🌟 PERBAIKAN 2: Inisialisasi socket hanya jika belum ada
        if (!socket) {
            socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                path: '/socket.io',
            });
        }

        // Definisikan handler dalam variabel agar bisa di-cleanup secara spesifik
        const onConnect = () => {
            console.log('Terhubung ke Socket Server Node.js');
            socket?.emit('join-session', sessionId);
        };

        const onStatus = (data: { status: string }) => {
            console.log('Status Realtime dari Server:', data.status);

            if (data.status !== 'REQUIRES_SCAN') {
                setStatus(data.status);
            }
        };

        const onQr = (data: { src: string }) => {
            console.log('Menerima pancaran QR Code!');
            setQrCode(data.src);
            setStatus('REQUIRES_SCAN');
            toast.info('QR Code baru tersedia, silakan scan!');
        };

        const onMessage = (data: { text: string }) => {
            setLoadingText(data.text);
        };

        const onReady = () => {
            setStatus('CONNECTED');
            setQrCode(null);
            toast.success('WhatsApp Gateway berhasil terhubung!');
            router.reload({ only: ['lastConnected'] });
        };

        const onDisconnected = (data: { reason: string }) => {
            setStatus('DISCONNECTED');
            setQrCode(null);
            toast.error(`WhatsApp terputus: ${data.reason}`);
        };

        // Pasang pendengar event (listeners)
        socket.on('connect', onConnect);
        socket.on('status', onStatus);
        socket.on('qr', onQr);
        socket.on('message', onMessage);
        socket.on('ready', onReady);
        socket.on('disconnected', onDisconnected);

        // 🌟 PERBAIKAN 3: Jika socket sudah terhubung dari kunjungan menu sebelumnya, langsung minta status terbaru
        if (socket.connected) {
            socket.emit('join-session', sessionId);
        }

        return () => {
            // 🌟 PERBAIKAN 4: JANGAN gunakan socket.disconnect().
            // Cukup lepas pendengar event agar tidak terjadi duplikasi (memory leak) saat komponen dimuat ulang.
            if (socket) {
                socket.off('connect', onConnect);
                socket.off('status', onStatus);
                socket.off('qr', onQr);
                socket.off('message', onMessage);
                socket.off('ready', onReady);
                socket.off('disconnected', onDisconnected);
            }
        };
    }, [socketUrl, sessionId]);

    // ─── FORM UJI COBA KIRIM PESAN ────────────────────────────────────────────
    const { data, setData, post, processing, reset, errors } = useForm({
        phone_number: '',
        message: '',
    });

    const handleTestSend = (e: React.FormEvent) => {
        e.preventDefault();
        post(waGatewayRoute.testSend().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
            },
        });
    };

    // ─── ACTION HANDLERS ──────────────────────────────────────────────────────
    const handleInitSession = () => {
        setStatus('INITIALIZING');
        router.post(
            waGatewayRoute.init().url,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        'Meminta server menyalakan mesin WhatsApp...',
                    ),
            },
        );
    };

    // ─── RENDER HELPER ────────────────────────────────────────────────────────
    const renderStatusBadge = () => {
        switch (status) {
            case 'CONNECTED':
            case 'AUTHENTICATED':
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> Terhubung
                    </span>
                );
            case 'REQUIRES_SCAN':
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                        <QrCode size={14} /> Menunggu Scan
                    </span>
                );
            case 'INITIALIZING':
            case 'LOADING':
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        <Loader2 size={14} className="animate-spin" /> Memuat...
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-400">
                        <XCircle size={14} /> Terputus
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="WhatsApp Gateway" />

            <div className="mx-auto w-full max-w-5xl animate-in space-y-6 p-6 duration-300 fade-in md:p-8">
                {/* ── Page Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground">
                            WhatsApp Gateway
                            {renderStatusBadge()}
                        </h1>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Kelola koneksi perangkat WhatsApp Anda untuk
                            pengiriman notifikasi tagihan dan pesan otomatis.
                        </p>
                    </div>

                    <Button
                        onClick={handleInitSession}
                        disabled={
                            status === 'CONNECTED' || status === 'INITIALIZING'
                        }
                        variant={
                            status === 'CONNECTED' ? 'secondary' : 'default'
                        }
                        className="h-11 rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <RefreshCcw
                            className={`mr-2 size-4 ${status === 'INITIALIZING' ? 'animate-spin' : ''}`}
                        />
                        {status === 'CONNECTED'
                            ? 'Koneksi Aktif'
                            : 'Mulai Ulang Koneksi'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* ── KARTU KIRI: STATUS & SCANNER ── */}
                    <div className="col-span-1 flex flex-col gap-6 md:col-span-5">
                        <div className="overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-3 border-b border-border/50 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        Perangkat Taut
                                    </h3>
                                    <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                        ID: {sessionId}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-6">
                                {status === 'CONNECTED' ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <CheckCircle2
                                                size={48}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <h4 className="text-lg font-bold">
                                            Terhubung Sempurna
                                        </h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Sistem siap mengirim pesan
                                            notifikasi secara otomatis.
                                        </p>
                                    </div>
                                ) : status === 'REQUIRES_SCAN' && qrCode ? (
                                    <div className="flex flex-col items-center">
                                        <div className="overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
                                            <img
                                                src={qrCode}
                                                alt="WhatsApp QR Code"
                                                className="h-56 w-56 object-contain"
                                            />
                                        </div>
                                        <p className="mt-6 animate-pulse text-center text-sm font-semibold text-muted-foreground">
                                            Buka WhatsApp di HP Anda &gt;
                                            Perangkat Tertaut &gt; Tautkan
                                            Perangkat.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                            {status === 'INITIALIZING' ? (
                                                <Loader2
                                                    size={40}
                                                    className="animate-spin text-primary"
                                                />
                                            ) : (
                                                <QrCode size={40} />
                                            )}
                                        </div>
                                        <h4 className="text-lg font-bold">
                                            {status === 'INITIALIZING'
                                                ? 'Memuat Sistem...'
                                                : 'Koneksi Terputus'}
                                        </h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {status === 'INITIALIZING'
                                                ? loadingText
                                                : 'Klik "Mulai Ulang Koneksi" di pojok kanan atas.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── KARTU KANAN: UJI COBA KIRIM PESAN ── */}
                    <div className="col-span-1 md:col-span-7">
                        <div className="h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        Uji Coba Pengiriman
                                    </h3>
                                    <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Tes Koneksi API
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleTestSend}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Nomor WhatsApp Tujuan
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="Cth: 081234567890 atau 628123..."
                                        value={data.phone_number}
                                        onChange={(e) =>
                                            setData(
                                                'phone_number',
                                                e.target.value,
                                            )
                                        }
                                        className="h-12 rounded-xl font-mono"
                                        disabled={
                                            status !== 'CONNECTED' || processing
                                        }
                                    />
                                    {errors.phone_number && (
                                        <p className="text-xs text-red-500">
                                            {errors.phone_number}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="msg"
                                        className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Isi Pesan
                                    </Label>
                                    <textarea
                                        id="msg"
                                        rows={4}
                                        placeholder="Halo, ini adalah pesan uji coba dari sistem lokal..."
                                        value={data.message}
                                        onChange={(e) =>
                                            setData('message', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
                                        disabled={
                                            status !== 'CONNECTED' || processing
                                        }
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-red-500">
                                            {errors.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        status !== 'CONNECTED' || processing
                                    }
                                    className="h-12 w-full rounded-xl font-bold tracking-wider uppercase transition-transform active:scale-[0.98]"
                                >
                                    {processing ? (
                                        <Loader2 className="mr-2 size-5 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 size-5" />
                                    )}
                                    {processing
                                        ? 'Mengirim...'
                                        : 'Kirim Pesan Tes'}
                                </Button>

                                {status !== 'CONNECTED' && (
                                    <p className="text-center text-xs font-medium text-red-500">
                                        * Fitur pengiriman dinonaktifkan karena
                                        WA belum terhubung.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

WaGatewayIndex.layout = {
    breadcrumbs: [
        {
            title: 'WhatsApp Gateway',
            href: waGatewayRoute.index(),
        },
    ],
};
