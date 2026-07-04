<?php

namespace App\Http\Controllers;

use App\Services\WaSession\WaSessionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaSessionController extends Controller
{
    protected WaSessionService $waService;

    public function __construct(WaSessionService $waService)
    {
        $this->waService = $waService;
    }

    /**
     * Render Halaman UI Dasbor WhatsApp
     */
    public function index()
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Dibatasi');
        }

        $dbSession = auth()->user()->waSession;
        $sessionId = 'user_'.auth()->id();

        // Memotong '/api' dari WA_GATEWAY_URL untuk mendapatkan URL dasar Socket.IO
        $socketUrl = str_replace('/api', '', env('WA_GATEWAY_URL', 'http://127.0.0.1:3000/api'));

        return Inertia::render('wa-session/index', [
            'initialStatus' => $dbSession ? $dbSession->status : 'NOT_INITIALIZED',
            'lastConnected' => $dbSession ? $dbSession->last_connected_at : null,
            'sessionId' => $sessionId,
            'socketUrl' => $socketUrl,
        ]);
    }

    /**
     * Polling HTTP (Hanya untuk sinkronisasi awal/fallback jika Socket.IO putus)
     */
    public function status()
    {
        $result = $this->waService->checkStatus();

        if ($result->getStatus()) {
            $data = $result->getResult();

            return response()->json(['status' => $data['status']]);
        }

        return response()->json(['status' => 'OFFLINE']);
    }

    /**
     * Endpoint untuk menarik daftar grup WA (Dipanggil via Axios dari React)
     */
    public function getGroups()
    {
        $result = $this->waService->getGroups();

        if ($result->getStatus()) {
            return response()->json($result->getResult());
        }

        return response()->json(['error' => $result->getMessage()], 400);
    }

    /**
     * Memaksa inisialisasi sesi via HTTP (Fallback jika gagal otomatis)
     */
    public function init()
    {
        $result = $this->waService->initSession();

        if ($result->getStatus()) {
            return redirect()->back()->with('success', $result->getMessage());
        }

        return redirect()->back()->with('error', $result->getMessage());
    }

    /**
     * Uji coba kirim pesan tunggal
     */
    public function testSend(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        $result = $this->waService->sendMessage($request->phone_number, $request->message);

        if ($result->getStatus()) {
            return redirect()->back()->with('success', $result->getMessage());
        }

        return redirect()->back()->with('error', $result->getMessage());
    }

    /**
     * Eksekusi pesan massal (Broadcast)
     */
    public function broadcast(Request $request)
    {
        $request->validate([
            'numbers' => 'required|array',
            'numbers.*' => 'string', // Memastikan isi array adalah string/nomor
            'message' => 'required|string|max:2000',
        ]);

        $result = $this->waService->broadcastMessage($request->numbers, $request->message);

        if ($result->getStatus()) {
            return redirect()->back()->with('success', $result->getMessage());
        }

        return redirect()->back()->with('error', $result->getMessage());
    }
}
