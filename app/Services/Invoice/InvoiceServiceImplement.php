<?php

namespace App\Services\Invoice;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Occupancy;
use App\Models\Payment;
use App\Repositories\Invoice\InvoiceRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;

class InvoiceServiceImplement extends ServiceApi implements InvoiceService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Sistem Tagihan';
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
    protected InvoiceRepository $mainRepository;

    public function __construct(InvoiceRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    /**
     * Mesin Otomatis Generator Tagihan Bulanan (Ditargetkan untuk Cron Job / Scheduler)
     */
    public function generateAutomaticBilling(): array
    {
        $today = Carbon::today();
        $currentDay = $today->day;

        // 1. Tarik seluruh kontrak hunian yang berstatus aktif huni beserta biaya tambahannya
        $activeOccupancies = Occupancy::with(['occupancyCharges.chargeType', 'room', 'property'])
            ->where('status', 'active')
            ->where('billing_day', $currentDay)
            ->get();

        $generatedCount = 0;
        $skippedCount = 0;

        foreach ($activeOccupancies as $occupancy) {
            DB::beginTransaction();
            try {
                // Tentukan jangkauan periode sewa bulan ini (Cth: 6 Juli s/d 6 Agustus)
                $periodStart = Carbon::create($today->year, $today->month, $occupancy->billing_day);
                $periodEnd = $periodStart->copy()->addMonth()->subDay();
                $dueDate = $periodStart->copy()->addDays(3); // Toleransi bayar 3 hari semenjak tagihan terbit

                // 2. ANTI-DUPLICATE GUARD: Cegah penerbitan ulang jika invoice untuk periode ini sudah pernah dibuat
                $isExist = Invoice::where('occupancy_id', $occupancy->id)
                    ->where('period_start', $periodStart->format('Y-m-d'))
                    ->exists();

                if ($isExist) {
                    $skippedCount++;
                    DB::rollBack();

                    continue;
                }

                // 3. GENERATE NOMOR INVOICE UNIK (Format: INV/Tahun/Bulan/Sequence)
                $invoiceSequence = Invoice::whereYear('created_at', $today->year)
                    ->whereMonth('created_at', $today->month)
                    ->count() + 1;
                $invoiceNumber = 'INV/'.$today->format('Y/m').'/'.str_pad($invoiceSequence, 4, '0', STR_PAD_LEFT);

                // 4. BUAT INDUK DATA INVOICE (Simpan sementara dengan amount = 0, nanti diupdate setelah item dihitung)
                $invoice = Invoice::create([
                    'property_id' => $occupancy->property_id,
                    'room_id' => $occupancy->room_id,
                    'tenant_id' => $occupancy->tenant_id,
                    'occupancy_id' => $occupancy->id,
                    'invoice_number' => $invoiceNumber,
                    'period_start' => $periodStart->format('Y-m-d'),
                    'period_end' => $periodEnd->format('Y-m-d'),
                    'due_date' => $dueDate->format('Y-m-d'),
                    'amount' => 0,
                    'discount_amount' => 0,
                    'final_amount' => 0,
                    'paid_amount' => 0,
                    'status' => 'unpaid',
                ]);

                $totalGrossAmount = 0;

                // 5. ITEMISASI 1: Masukkan Biaya Pokok Sewa Kamar Kos
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'name' => 'Biaya Sewa Pokok Kamar '.($occupancy->room->room_number ?? ''),
                    'qty' => 1,
                    'price' => $occupancy->price,
                    'subtotal' => $occupancy->price,
                ]);
                $totalGrossAmount += $occupancy->price;

                // 6. ITEMISASI 2: Masukkan Biaya Tambahan Fleksibel (Dari tabel occupancy_charges hasil sinkronisasi migrasi Anda)
                foreach ($occupancy->occupancyCharges as $occCharge) {
                    // 🌟 SEKARANG MENGIKUTI: default_amount dari skema aslimu
                    $chargePrice = $occCharge->amount ?? $occCharge->chargeType->default_amount ?? 0;

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'name' => $occCharge->chargeType->name ?? 'Biaya Tambahan',
                        'qty' => 1,
                        'price' => $chargePrice,
                        'subtotal' => $chargePrice,
                    ]);
                    $totalGrossAmount += $chargePrice;
                }

                // 7. RE-UPDATE TOTAL AGREGAT FINANSIAL PADA INDUK INVOICE
                $invoice->update([
                    'amount' => $totalGrossAmount,
                    'final_amount' => $totalGrossAmount, // Masih tanpa potongan diskon bawaan
                ]);

                DB::commit();
                $generatedCount++;

            } catch (Exception $e) {
                DB::rollBack();

                // Tetap lanjutkan perulangan kontrak lain meskipun salah satu kontrak mengalami kegagalan
                continue;
            }
        }

        return [
            'success' => true,
            'generated' => $generatedCount,
            'skipped' => $skippedCount,
        ];
    }

    /**
     * Memproses Catatan Pembayaran Masuk (Cicilan / Pelunasan)
     *
     * * @param string $invoiceId
     */
    public function recordPayment($invoiceId, array $paymentData): mixed
    {
        DB::beginTransaction();
        try {
            // 1. Ambil data induk invoice yang dituju
            $invoice = Invoice::findOrFail($invoiceId);

            // Validasi: Jika invoice sudah lunas atau dibatalkan, tolak pembayaran baru
            if (in_array($invoice->status, ['paid', 'void'])) {
                return $this->setStatus(false)
                    ->setCode(422)
                    ->setMessage('Pembayaran ditolak. Invoice ini sudah berstatus '.strtoupper($invoice->status).'.');
            }

            $today = now();

            // 2. GENERATE NOMOR TANDA TERIMA / KUITANSI (Format: PAY/Tahun/Bulan/Sequence)
            $paymentSequence = Payment::whereYear('created_at', $today->year)
                ->whereMonth('created_at', $today->month)
                ->count() + 1;
            $paymentNumber = 'PAY/'.$today->format('Y/m').'/'.str_pad($paymentSequence, 4, '0', STR_PAD_LEFT);

            // 3. AMANKAN PAYLOAD LOG PEMBAYARAN MASUK
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'receiver_id' => auth()->id(), // Mencatat ID staff/owner yang sedang login sebagai penerima
                'payment_number' => $paymentNumber,
                'amount_paid' => $paymentData['amount_paid'],
                'payment_date' => $paymentData['payment_date'] ?? $today,
                'payment_method' => $paymentData['payment_method'] ?? 'cash',
                'proof_attachment' => $paymentData['proof_attachment'] ?? null, // Path file upload kuitansi/struk jika ada
                'notes' => $paymentData['notes'] ?? null,
            ]);

            // 4. KALKULASI AKUMULASI DANA YANG SUDAH MASUK
            $totalPaidNow = $invoice->paid_amount + $paymentData['amount_paid'];

            // 5. AUTOMATION STATE: Tentukan status invoice baru secara dinamis
            if ($totalPaidNow >= $invoice->final_amount) {
                $newStatus = 'paid'; // Lunas
            } else {
                $newStatus = 'partially_paid'; // Dicicil / Belum Lunas
            }

            // 6. UPDATE CACHED AGREGAT DI INDUK INVOICE
            $invoice->update([
                'paid_amount' => $totalPaidNow,
                'status' => $newStatus,
            ]);

            DB::commit();

            $formattedAmount = 'Rp '.number_録_format($paymentData['amount_paid'], 0, ',', '.');
            $msg = $newStatus === 'paid'
                ? "Pembayaran sebesar {$formattedAmount} berhasil diverifikasi. Invoice resmi LUNAS!"
                : "Pembayaran cicilan sebesar {$formattedAmount} berhasil dicatat. Status tagihan kini: Dicicil.";

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($payment)
                ->setMessage($msg);

        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }
}
