<?php

namespace App\Http\Controllers;

use App\DataTables\InvoiceDataTable;
use App\Helpers\Helper;
use App\Http\Requests\RecordPaymentRequest;
use App\Http\Resources\InvoiceItemResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\PropertyResource;
use App\Models\Invoice;
use App\Services\Invoice\InvoiceService;
use App\Services\Property\PropertyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    protected PropertyService $propertyService;

    public function __construct(InvoiceService $invoiceService, PropertyService $propertyService)
    {
        $this->invoiceService = $invoiceService;
        $this->propertyService = $propertyService;
    }

    /**
     * Merender Dashboard Meja Kasir Finansial (DataTable)
     */
    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin melihat pembukuan keuangan.');
        }

        // Ambil master properti milik owner untuk keperluan filter dropdown sidebar
        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();

        $dataTable = new InvoiceDataTable;

        return $dataTable->render('invoice/index', 'invoices', [
            'properties' => $properties ? PropertyResource::collection($properties) : null,
        ]);
    }

    /**
     * Endpoint API internal untuk memuat item breakdown tagihan & log pembayaran
     * 🌟 SEKARANG MENGGUNAKAN ECOSYSTEM API RESOURCE
     */
    public function details($id)
    {
        $invoice = Invoice::with(['items', 'payments.receiver'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', auth()->id()); // Proteksi Scoping data Owner
            })
            ->findOrFail(Helper::decrypt($id));

        return response()->json([
            'success' => true,
            'invoice_number' => $invoice->invoice_number,

            // 🌟 Transformasi data otomatis lewat Resource Class
            'items' => InvoiceItemResource::collection($invoice->items),
            'payments' => PaymentResource::collection($invoice->payments),
        ]);
    }

    /**
     * Mengeksekusi Transaksi Pembayaran Masuk (Kasir Pembayaran)
     */
    public function pay(RecordPaymentRequest $request, $id)
    {
        $data = $request->validated();
        $invoiceId = Helper::decrypt($id);

        // Upload berkas bukti transfer jika dilampirkan
        if ($request->hasFile('proof_attachment')) {
            $file = $request->file('proof_attachment');
            $path = $file->store('attachments/payments', 'public');
            $data['proof_attachment'] = $path;
        }

        $response = $this->invoiceService->recordPayment($invoiceId, $data);

        if (! $response->getStatus()) {
            // Bersihkan file upload jika database gagal menyimpan log transaksi
            if (isset($data['proof_attachment'])) {
                Storage::disk('public')->delete($data['proof_attachment']);
            }

            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', $response->getMessage());
    }

    /**
     * Membatalkan / Void Invoice Tagihan (Cth: salah input data meteran)
     */
    public function void($id)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner'])) {
            abort(403, 'Hanya Owner/Super Admin yang berhak membatalkan tagihan.');
        }

        $invoice = Invoice::findOrFail(Helper::decrypt($id));
        $invoice->update(['status' => 'void']);

        return redirect()->back()->with('success', "Invoice {$invoice->invoice_number} resmi dibatalkan (Void).");
    }
}
