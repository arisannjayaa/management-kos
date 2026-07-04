<?php

namespace App\Services\WaSession;

use App\Models\WaSession;
use App\Repositories\WaSession\WaSessionRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class WaSessionServiceImplement extends ServiceApi implements WaSessionService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = '';

    protected string $baseUrl;

    protected string $apiKey;
    /**
     * uncomment this to override the default message
     * protected string $create_message = "";
     * protected string $update_message = "";
     * protected string $delete_message = "";
     */

    /**
     * don't change $this->mainRepository variable name
     * because used in extends service class
     */
    protected WaSessionRepository $mainRepository;

    public function __construct(WaSessionRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
        $this->baseUrl = env('WA_GATEWAY_URL');
        $this->apiKey = env('WA_GATEWAY_KEY');
    }

    private function getSessionId(): string
    {
        return 'user_'.auth()->id();
    }

    /**
     * 🌟 FUNGSI BARU: Normalisasi Nomor HP ke Format Internasional (628...)
     */
    private function formatPhoneNumber(string $number): string
    {
        // 1. Hapus semua karakter selain angka (spasi, strip, tanda plus, dll)
        $cleaned = preg_replace('/[^0-9]/', '', $number);

        // 2. Jika nomor diawali dengan '08', ubah menjadi '628'
        if (str_starts_with($cleaned, '08')) {
            return '628'.substr($cleaned, 2);
        }

        return $cleaned;
    }

    /**
     * Mengecek status koneksi dari Node.js
     */
    public function checkStatus(): mixed
    {
        DB::beginTransaction();
        try {
            $sessionId = $this->getSessionId();
            $response = Http::timeout(5)->withHeaders(['x-api-key' => $this->apiKey])
                ->get("{$this->baseUrl}/session/status/{$sessionId}");

            if ($response->successful()) {
                $status = $response->json('status');

                $this->syncDatabaseStatus($status);
                DB::commit();

                return $this->setStatus(true)
                    ->setCode(200)
                    ->setResult(['status' => $status])
                    ->setMessage('Status berhasil diambil.');
            }

            throw new Exception('Gagal mendapatkan respon status dari server WA Gateway.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('[WA Gateway] checkStatus error: '.$e->getMessage());

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Menyuruh Node.js untuk menyalakan sesi WA
     */
    public function initSession(): mixed
    {
        DB::beginTransaction();
        try {
            $response = Http::timeout(5)->withHeaders(['x-api-key' => $this->apiKey])
                ->post("{$this->baseUrl}/session/start", [
                    'sessionId' => $this->getSessionId(),
                ]);

            if ($response->successful()) {
                $this->syncDatabaseStatus('INITIALIZING');
                DB::commit();

                return $this->setStatus(true)
                    ->setCode(200)
                    ->setMessage('Inisialisasi sesi dimulai di background.');
            }

            throw new Exception('Gagal melakukan inisialisasi sesi di server WA Gateway.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('[WA Gateway] initSession error: '.$e->getMessage());

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengirim pesan teks tunggal
     * 🌟 Perbaikan: Tambahkan parameter $customSessionId
     */
    public function sendMessage(string $to, string $message, ?string $customSessionId = null): mixed
    {
        try {
            $formattedNumber = $this->formatPhoneNumber($to);

            // 🌟 Gunakan customSessionId dari Job, jika tidak ada baru gunakan auth()
            $sessionIdToUse = $customSessionId ?? $this->getSessionId();

            $response = Http::timeout(20)->withHeaders(['x-api-key' => $this->apiKey])
                ->post("{$this->baseUrl}/send", [
                    'sessionId' => $sessionIdToUse,
                    'number' => $formattedNumber,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                return $this->setStatus(true)
                    ->setCode(200)
                    ->setMessage('Pesan WhatsApp berhasil terkirim!');
            }

            $errorMessage = $response->json('error') ?? 'Gagal mengirim pesan dari server WA.';
            throw new Exception($errorMessage);
        } catch (Exception $e) {
            Log::error('[WA Gateway] sendMessage error: '.$e->getMessage());

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Menjalankan antrean Broadcast di background Node.js
     */
    public function broadcastMessage(array $numbers, string $message): mixed
    {
        try {
            // 🌟 Jalankan normalisasi otomatis untuk semua nomor di dalam array
            $formattedNumbers = array_map(function ($num) {
                return $this->formatPhoneNumber($num);
            }, $numbers);

            $response = Http::timeout(10)->withHeaders(['x-api-key' => $this->apiKey])
                ->post("{$this->baseUrl}/broadcast", [
                    'sessionId' => $this->getSessionId(),
                    'numbers' => $formattedNumbers,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                return $this->setStatus(true)
                    ->setCode(200)
                    ->setMessage('Tugas broadcast berhasil diserahkan ke sistem background.');
            }

            throw new Exception($response->json('error') ?? 'Gagal memicu broadcast.');
        } catch (Exception $e) {
            Log::error('[WA Gateway] broadcast error: '.$e->getMessage());

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengambil daftar grup yang diikuti oleh akun WA
     */
    public function getGroups(): mixed
    {
        try {
            $sessionId = $this->getSessionId();
            $response = Http::timeout(15)->withHeaders(['x-api-key' => $this->apiKey])
                ->get("{$this->baseUrl}/groups/{$sessionId}");

            if ($response->successful()) {
                return $this->setStatus(true)
                    ->setCode(200)
                    ->setResult($response->json('groups'))
                    ->setMessage('Daftar grup berhasil ditarik.');
            }

            throw new Exception($response->json('error') ?? 'Gagal menarik daftar grup.');
        } catch (Exception $e) {
            Log::error('[WA Gateway] getGroups error: '.$e->getMessage());

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Update tabel wa_sessions
     */
    private function syncDatabaseStatus(string $status): void
    {
        $user = auth()->user();

        $waSession = WaSession::updateOrCreate(
            ['user_id' => $user->id],
            ['status' => $status]
        );

        if (in_array($status, ['CONNECTED', 'AUTHENTICATED'])) {
            $waSession->update(['last_connected_at' => now()]);
        }
    }
}
