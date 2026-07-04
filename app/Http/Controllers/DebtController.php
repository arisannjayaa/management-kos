<?php

namespace App\Http\Controllers;

use App\DataTables\DebtDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionDebtRequest;
use App\Http\Requests\DebtPaymentRequest;
use App\Http\Requests\DebtRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ContactResource; // 🌟 Resource Baru
use App\Http\Resources\DebtResource;
use App\Http\Resources\TagResource;
use App\Jobs\SendWaReceiptJob;
use App\Services\Account\AccountService;
use App\Services\Category\CategoryService;
use App\Services\Contact\ContactService; // 🌟 Service Baru
use App\Services\Debt\DebtService;
use App\Services\DebtPayment\DebtPaymentService;
use App\Services\Tag\TagService;
use App\Services\WaSession\WaSessionService; // 🌟 Integrasi WA Gateway
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DebtController extends Controller
{
    protected DebtService $debtService;

    protected AccountService $accountService;

    protected CategoryService $categoryService;

    protected DebtPaymentService $debtPaymentService;

    protected TagService $tagService;

    // 🌟 Tambahan Service Baru
    protected ContactService $contactService;

    protected WaSessionService $waGatewayService;

    public function __construct(
        DebtService $debtService,
        AccountService $accountService,
        CategoryService $categoryService,
        DebtPaymentService $debtPaymentService,
        TagService $tagService,
        ContactService $contactService,
        WaSessionService $waGatewayService
    ) {
        $this->debtService = $debtService;
        $this->accountService = $accountService;
        $this->categoryService = $categoryService;
        $this->debtPaymentService = $debtPaymentService;
        $this->tagService = $tagService;
        $this->contactService = $contactService;
        $this->waGatewayService = $waGatewayService;
    }

    /**
     * @return Response
     */
    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $categories = $this->categoryService->all()->getResult();
        $accounts = $this->accountService->findAllByUserId(auth()->id())->getResult();
        $tags = $this->tagService->all()->getResult();

        // 🌟 Ambil daftar kontak untuk filter dropdown di Datatable
        $contacts = $this->contactService->all()->getResult();

        $dataTable = new DebtDataTable;

        return $dataTable->render('debt/index', 'debts', [
            'categories' => $categories ? CategoryResource::collection($categories) : null,
            'accounts' => $accounts ? AccountResource::collection($accounts) : null,
            'tags' => $tags ? TagResource::collection($tags) : null,
            'contacts' => $contacts ? ContactResource::collection($contacts) : null, // 🌟 Kirim ke React
            'summaryTotals' => $dataTable->getSummaryTotals($request),
        ]);
    }

    /**
     * @return Response
     */
    public function form($id = null)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data['debt'] = $id
            ? $this->debtService->findOrFail(Helper::decrypt($id))->getResult()
            : null;

        $data['accounts'] = $this->accountService->findAllByUserId(auth()->id())->getResult();
        $data['categories'] = $this->categoryService->all()->getResult();

        // 🌟 Ambil data kontak untuk dropdown form Select2 / Combobox
        $data['contacts'] = $this->contactService->all()->getResult();

        return Inertia::render('debt/form', [
            'debt' => $data['debt'] ? new DebtResource($data['debt']) : null,
            'accounts' => $data['accounts'] ? AccountResource::collection($data['accounts']) : null,
            'categories' => $data['categories'] ? CategoryResource::collection($data['categories']) : null,
            'contacts' => $data['contacts'] ? ContactResource::collection($data['contacts']) : null, // 🌟 Kirim ke Form
        ]);
    }

    public function create(DebtRequest $request)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Dibatasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data = $request->only([
            'contact_id',   // 🌟 Relasi Baru
            'contact_name', // Fallback lama
            'type',
            'payment_method',
            'amount',
            'tenor',
            'due_date',
            'category_id',
            'account_id',
            'description',
            'is_deposit',
            'deposit_target_name',
            'item_name',
            'reference_url',
            'is_item_financing',
            'tag_ids',
        ]);

        $result = $this->debtService->create($data)->getResult();
        $targetUrl = $result['redirect'] ?? route('debts.index');

        return redirect()->to($targetUrl)->with('success', 'Catatan transaksi baru berhasil dibuat!');
    }

    public function update(DebtRequest $request, $id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data = $request->only([
            'id',
            'contact_id',   // 🌟 Relasi Baru
            'contact_name',
            'type',
            'payment_method',
            'amount',
            'tenor',
            'due_date',
            'category_id',
            'account_id',
            'description',
            'is_item_financing',
            'is_deposit',
            'deposit_target_name',
            'item_name',
            'reference_url',
            'tag_ids',
        ]);

        $result = $this->debtService->update(Helper::decrypt($id), $data)->getResult();
        $targetUrl = $result['redirect'] ?? route('debts.index');

        return redirect()->to($targetUrl)->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function detail($id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data['debt'] = $id
            ? $this->debtService->findOrFail(Helper::decrypt($id))->getResult()
            : null;

        // Eager load kontak agar data nomor HP tersedia di halaman detail
        if ($data['debt']) {
            $data['debt']->load('contact');
        }

        return Inertia::render('debt/detail', [
            'debt' => $data['debt'] ? new DebtResource($data['debt']) : null,
        ]);
    }

    /**
     * fungsi untuk menghapus data
     *
     * @return RedirectResponse
     */
    public function delete(Request $request, $id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $result = $this->debtService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Data transaksi berhasil dihapus.');
    }

    /**
     * Hapus banyak karyawan sekaligus.
     *
     * Route: DELETE /debts/bulk-destroy
     * Body : { ids: number[] }
     */
    public function bulkDestroy(BulkActionDebtRequest $request)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $this->debtService->bulkDelete($request->ids)->getResult();

        return redirect()->back()->with('success', count($request->ids).' data transaksi berhasil dihapus.');
    }

    /**
     * @return RedirectResponse
     */
    public function restore($id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $this->debtService->restore($id)->getResult();

        return redirect()->back()->with('success', 'Data transaksi berhasil dipulihkan.');
    }

    // ── Force Delete ──────────────────────────────────────────────────────────

    /**
     * @return RedirectResponse
     */
    public function forceDelete($id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $this->debtService->forceDelete($id)->getResult();

        return redirect()->back()->with('success', 'transaksi dihapus permanen.');
    }

    /**
     * @return RedirectResponse
     */
    public function bulkRestore(BulkActionDebtRequest $request)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $this->debtService->bulkRestore($request->ids)->getResult();

        return redirect()->back()->with(
            'success',
            count($request->ids).' transaksi berhasil dipulihkan.'
        );
    }

    /**
     * @return RedirectResponse
     */
    public function bulkForceDelete(BulkActionDebtRequest $request)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $this->debtService->bulkForceDelete($request->ids)->getResult();

        return redirect()->back()->with(
            'success',
            count($request->ids).' transaksi dihapus permanen.'
        );
    }

    public function createPayment(DebtPaymentRequest $request)
    {
        $validatedData = $request->validated();
        $response = $this->debtPaymentService->create($validatedData);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => $response->getStatus(),
                'message' => $response->getMessage(),
                'result' => $response->getResult(),
            ], $response->getCode());
        }

        return redirect($response->getResult()['redirect'])
            ->with('success', $response->getMessage());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 🌟 INTEGRASI WA GATEWAY: ENDPOINT TOMBOL SAKTI PENAGIHAN
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Mengirim pesan tagihan via WhatsApp ke kontak terkait (ASYNCHRONOUS)
     */
    public function sendWaReminder($id)
    {
        if (! auth()->user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $debtResult = $this->debtService->findOrFail(Helper::decrypt($id));

        if ($debtResult->getCode() != 200) {
            return redirect()->back()->with('error', 'Data hutang tidak ditemukan.');
        }

        $debt = $debtResult->getResult();

        // Validasi apakah kontak dan nomor HP tersedia
        if (! $debt->contact || empty($debt->contact->phone_number)) {
            return redirect()->back()->with('error', 'Gagal mengirim pesan. Kontak ini tidak memiliki nomor WhatsApp yang terdaftar.');
        }

        // ─── SUSUN PESAN PENGINGAT (REMINDER) ───
        $sisaHutang = number_format($debt->remaining_amount, 0, ',', '.');
        $jatuhTempo = $debt->due_date ? Carbon::parse($debt->due_date)->translatedFormat('d F Y') : 'Tanpa Tenggat Waktu';
        $judulKontrak = $debt->title ?? 'Tagihan';

        // 🌟 Penanganan item_name (Berikan fallback jika null/kosong)
        $namaItem = ! empty($debt->item_name) ? $debt->item_name : 'Paket/Layanan (Sesuai Tagihan)';

        // Sesuaikan nada bahasa berdasarkan siapa yang berhutang
        if ($debt->type === 'debt') {
            $intro = 'Pesan ini adalah notifikasi otomatis untuk menginformasikan status *Kewajiban Pembayaran (Hutang)* kami kepada Anda yang masih berjalan.';
            $penutup = 'Sistem kami akan terus memantau jadwal ini agar pelunasan tidak terlewat dari tanggal jatuh tempo. Terima kasih atas kerja samanya!';
            $labelNominal = 'Sisa Kewajiban Kami';
        } else {
            $intro = 'Pesan ini adalah pengingat ramah (*friendly reminder*) mengenai *Tagihan (Piutang)* yang belum terselesaikan di sistem kami.';
            $penutup = 'Mohon untuk dapat melakukan pelunasan sebelum atau pada tanggal jatuh tempo. Apabila pembayaran telah dilakukan, mohon abaikan pesan ini. Terima kasih! 🙏';
            $labelNominal = 'Sisa Tagihan Anda';
        }

        // ── RAKIT PESAN WA ──
        $message = "Halo *{$debt->contact->name}*,\n\n";
        $message .= "{$intro}\n\n";

        $message .= "🔔 *Rincian Status Saat Ini:*\n";
        $message .= "▪️ *Keterangan:* {$judulKontrak}\n";
        $message .= "▪️ *Item:* {$namaItem}\n"; // 🌟 INI INTINYA

        // Tampilkan deskripsi tambahan jika ada
        if (! empty($debt->description)) {
            $message .= "▪️ *Detail:* _{$debt->description}_\n";
        }

        $message .= "▪️ *{$labelNominal}:* Rp {$sisaHutang}\n";
        $message .= "▪️ *Jatuh Tempo:* {$jatuhTempo}\n\n";

        $message .= "{$penutup}\n\n";
        $message .= '_(Ini adalah pengingat digital yang dikirim otomatis oleh sistem)_';

        // 🚀 LOGIKA BARU: Lempar tugas ke Latar Belakang (Queue)
        $currentSessionId = 'user_'.auth()->id();

        // Catatan: Pastikan nama Job sesuai dengan yang Anda gunakan
        SendWaReceiptJob::dispatch($debt->contact->phone_number, $message, $currentSessionId);

        // Langsung catat waktu pengingat tanpa menunggu WA terkirim (karena pasti akan dikerjakan Queue)
        $debt->update(['last_reminded_at' => now()]);

        // Langsung kembalikan response sukses ke user dalam 0.1 detik!
        return redirect()->back()->with('success', 'Perintah pengiriman tagihan WA sedang diproses di latar belakang!');
    }
}
