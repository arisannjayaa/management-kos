<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Repositories\Payment\PaymentRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;

class PaymentServiceImplement extends ServiceApi implements PaymentService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Sistem Kuitansi Pembayaran';
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
    protected PaymentRepository $mainRepository;

    public function __construct(PaymentRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    public function annulPayment($id): mixed
    {
        DB::beginTransaction();
        try {
            $payment = Payment::with('invoice')->findOrFail($id);
            $invoice = $payment->invoice;

            if ($invoice->status === 'void') {
                return $this->setStatus(false)->setMessage('Gagal menganulir, invoice dari kuitansi ini sudah berstatus VOID.');
            }

            // Hitung balik pengurangan kas terbayar di induk nota
            $newPaidAmount = max(0, $invoice->paid_amount - $payment->amount_paid);
            $newStatus = $newPaidAmount <= 0 ? 'unpaid' : 'partially_paid';

            $invoice->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newStatus,
            ]);

            $payment->delete(); // Pembuangan ke keranjang sampah (Soft Delete)

            DB::commit();

            return $this->setStatus(true)->setMessage('Kuitansi resmi dianjulir. Saldo tagihan invoice otomatis disesuaikan.');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->setStatus(false)->setMessage($e->getMessage());
        }
    }

    public function bulkAnnul(array $ids): mixed
    {
        DB::beginTransaction();
        try {
            foreach ($ids as $id) {
                $payment = Payment::with('invoice')->find($id);
                if ($payment && $payment->invoice->status !== 'void') {
                    $invoice = $payment->invoice;
                    $newPaidAmount = max(0, $invoice->paid_amount - $payment->amount_paid);
                    $newStatus = $newPaidAmount <= 0 ? 'unpaid' : 'partially_paid';

                    $invoice->update([
                        'paid_amount' => $newPaidAmount,
                        'status' => $newStatus,
                    ]);
                    $payment->delete();
                }
            }
            DB::commit();

            return $this->setStatus(true)->setMessage('Kumpulan kuitansi pembayaran terpilih berhasil dianjulir massal.');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->setStatus(false)->setMessage($e->getMessage());
        }
    }
}
