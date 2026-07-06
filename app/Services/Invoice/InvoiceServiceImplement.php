<?php

namespace App\Services\Invoice;

use App\Models\ChargeMeterReading;
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
                $periodStart = Carbon::create($today->year, $today->month, $occupancy->billing_day);
                $periodEnd = $periodStart->copy()->addMonth()->subDay();
                $dueDate = $periodStart->copy()->addDays(3);

                // 2. ANTI-DUPLICATE GUARD
                $isExist = Invoice::where('occupancy_id', $occupancy->id)
                    ->where('period_start', $periodStart->format('Y-m-d'))
                    ->exists();

                if ($isExist) {
                    $skippedCount++;
                    DB::rollBack();

                    continue;
                }

                // 3. GENERATE NOMOR INVOICE UNIK
                $invoiceSequence = Invoice::whereYear('created_at', $today->year)
                    ->whereMonth('created_at', $today->month)
                    ->count() + 1;
                $invoiceNumber = 'INV/'.$today->format('Y/m').'/'.str_pad($invoiceSequence, 4, '0', STR_PAD_LEFT);

                // 4. BUAT INDUK DATA INVOICE
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

                // 6. ITEMISASI 2: Masukkan Biaya Tambahan Fleksibel Terdaftar (WiFi, Sampah bertipe Flat)
                foreach ($occupancy->occupancyCharges as $occCharge) {
                    // Hanya tarik iuran bulanan yang tipenya bukan 'metered' di looping ini
                    if ($occCharge->chargeType->billing_method === 'metered') {
                        continue;
                    }

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

                // 🌟 7. ITEMISASI 3 (BARU - FASE 4 SYNC): Tarik biaya variabel hasil catat meteran keliling
                $uninvoicedReadings = ChargeMeterReading::with('chargeType')
                    ->where('occupancy_id', $occupancy->id)
                    ->whereNull('invoice_id') // Mencari data meteran yang belum pernah ditagih
                    ->get();

                foreach ($uninvoicedReadings as $reading) {
                    $unitLabel = $reading->chargeType->unit_label ?? 'Unit';

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        // Info Transparan: Listrik (Kamar Meteran) [135.50 kWh]
                        'name' => ($reading->chargeType->name ?? 'Biaya Utilitas')." [{$reading->usage} {$unitLabel}]",
                        'qty' => 1,
                        'price' => $reading->amount,
                        'subtotal' => $reading->amount,
                    ]);
                    $totalGrossAmount += $reading->amount;

                    // 🔒 KUNCI REKAMAN METERAN: Amankan ID Invoice biar bulan depan tidak tertagih double!
                    $reading->update(['invoice_id' => $invoice->id]);
                }

                // 8. RE-UPDATE TOTAL AGREGAT FINANSIAL PADA INDUK INVOICE
                $invoice->update([
                    'amount' => $totalGrossAmount,
                    'final_amount' => $totalGrossAmount,
                ]);

                DB::commit();
                $generatedCount++;

            } catch (Exception $e) {
                DB::rollBack();

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
     */
    public function recordPayment($invoiceId, array $paymentData): mixed
    {
        DB::beginTransaction();
        try {
            $invoice = Invoice::findOrFail($invoiceId);

            if (in_array($invoice->status, ['paid', 'void'])) {
                return $this->setStatus(false)
                    ->setCode(422)
                    ->setMessage('Pembayaran ditolak. Invoice ini sudah berstatus '.strtoupper($invoice->status).'.');
            }

            $today = now();

            $paymentSequence = Payment::whereYear('created_at', $today->year)
                ->whereMonth('created_at', $today->month)
                ->count() + 1;
            $paymentNumber = 'PAY/'.$today->format('Y/m').'/'.str_pad($paymentSequence, 4, '0', STR_PAD_LEFT);

            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'receiver_id' => auth()->id(),
                'payment_number' => $paymentNumber,
                'amount_paid' => $paymentData['amount_paid'],
                'payment_date' => $paymentData['payment_date'] ?? $today,
                'payment_method' => $paymentData['payment_method'] ?? 'cash',
                'proof_attachment' => $paymentData['proof_attachment'] ?? null,
                'notes' => $paymentData['notes'] ?? null,
            ]);

            $totalPaidNow = $invoice->paid_amount + $paymentData['amount_paid'];

            if ($totalPaidNow >= $invoice->final_amount) {
                $newStatus = 'paid';
            } else {
                $newStatus = 'partially_paid';
            }

            $invoice->update([
                'paid_amount' => $totalPaidNow,
                'status' => $newStatus,
            ]);

            DB::commit();

            // 🌟 FIXED TYPO JEPANG: number_format sudah bersih kembali
            $formattedAmount = 'Rp '.number_format($paymentData['amount_paid'], 0, ',', '.');
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
