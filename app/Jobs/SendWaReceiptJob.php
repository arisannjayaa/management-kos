<?php

namespace App\Jobs;

use App\Services\WaSession\WaSessionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWaReceiptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $phone;

    protected $message;

    protected $sessionId; // 🌟 Properti baru

    // 🌟 Wajibkan Controller mengirim sessionId
    public function __construct(string $phone, string $message, string $sessionId)
    {
        $this->phone = $phone;
        $this->message = $message;
        $this->sessionId = $sessionId;
    }

    public function handle(WaSessionService $waSession)
    {
        try {
            // 🌟 Sisipkan sessionId saat memanggil service
            $waSession->sendMessage($this->phone, $this->message, $this->sessionId);
        } catch (\Exception $e) {
            Log::error('Background WA Gateway Error: '.$e->getMessage());
        }
    }
}
