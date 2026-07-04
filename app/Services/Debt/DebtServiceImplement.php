<?php

namespace App\Services\Debt;

use App\Helpers\Helper;
use App\Models\Account;
use App\Models\Contact;
use App\Models\DebtPayment;
use App\Models\Transaction;
use App\Repositories\Debt\DebtRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;

class DebtServiceImplement extends ServiceApi implements DebtService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = '';
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
    protected DebtRepository $mainRepository;

    public function __construct(DebtRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    public function findAllByUserId($userId)
    {
        try {

            $result = $this->mainRepository->findAllByUserId($userId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function bulkDelete($ids)
    {
        DB::beginTransaction();
        try {

            $decryptedIds = collect($ids)->map(function ($encryptedId) {
                return Helper::decrypt($encryptedId);
            })->filter()->toArray();

            if (empty($decryptedIds)) {
                return redirect()->back()->withErrors(['ids' => 'Data ID tidak valid.']);
            }

            $this->mainRepository->bulkDelete($decryptedIds);

            $redirect = redirect()->intended(route('accounts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rekening berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function forceDelete($id)
    {
        DB::beginTransaction();
        try {

            $this->mainRepository->forceDelete(Helper::decrypt($id));

            $redirect = redirect()->intended(route('accounts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rekening berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function bulkForceDelete($ids)
    {
        DB::beginTransaction();
        try {

            $decryptedIds = collect($ids)->map(function ($encryptedId) {
                return Helper::decrypt($encryptedId);
            })->filter()->toArray();

            if (empty($decryptedIds)) {
                return redirect()->back()->withErrors(['ids' => 'Data ID tidak valid.']);
            }

            $this->mainRepository->bulkForceDelete($decryptedIds);

            $redirect = redirect()->intended(route('accounts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rekening berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function restore($id)
    {
        DB::beginTransaction();
        try {

            $this->mainRepository->restore(Helper::decrypt($id));

            $redirect = redirect()->intended(route('accounts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rekening berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * @return mixed
     */
    public function bulkRestore($ids)
    {
        DB::beginTransaction();
        try {

            $decryptedIds = collect($ids)->map(function ($encryptedId) {
                return Helper::decrypt($encryptedId);
            })->filter()->toArray();

            if (empty($decryptedIds)) {
                return redirect()->back()->withErrors(['ids' => 'Data ID tidak valid.']);
            }

            $this->mainRepository->bulkRestore($decryptedIds);

            $redirect = redirect()->intended(route('accounts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rekening berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mencatat Hutang / Piutang Baru beserta Pembagian Jadwal Adaptif Kasus
     */
    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            $data['user_id'] = auth()->id();
            $data['amount'] = (int) $data['amount'];
            $data['remaining_amount'] = $data['amount'];
            $data['status'] = 'unpaid';

            // Tentukan metode pengembalian dana
            $isLumpSum = ($data['payment_method'] ?? 'lump_sum') === 'lump_sum';

            // Jika Lump Sum (Talangan/Titipan), paksa tenor bernilai 1 kali bayar penuh
            $tenor = $isLumpSum ? 1 : (isset($data['tenor']) ? (int) $data['tenor'] : 1);

            $transactionId = null;

            // 🌟 RESOLVE CONTACT NAME: Ambil nama yang valid untuk histori transaksi
            $contactName = 'Seseorang';
            if (! empty($data['contact_id'])) {
                $contact = Contact::find($data['contact_id']);
                if ($contact) {
                    $contactName = $contact->name;
                }
            } elseif (! empty($data['contact_name'])) {
                $contactName = $data['contact_name'];
            }

            $data['contact_name'] = $contactName;

            // ─── AUTOMATION: MUTASI KAS AWAL ───
            if (! empty($data['account_id'])) {
                // Alur Uang: Hutang = Kas Masuk (income), Piutang = Kas Keluar (expense)
                $txType = $data['type'] === 'debt' ? 'income' : 'expense';

                $isItemFinancing = ! empty($data['is_item_financing']) && ! empty($data['item_name']);
                $itemName = $data['item_name'] ?? '';
                $isDeposit = ! empty($data['is_deposit']);

                if ($data['type'] === 'debt') {
                    if ($isDeposit) {
                        $txTitle = "Terima Dana Titipan dari: {$contactName}";
                    } elseif ($isItemFinancing) {
                        $txTitle = "Hutang/Cicilan Barang: {$itemName} ({$contactName})";
                    } else {
                        $txTitle = "Terima Pinjaman (Hutang) dari: {$contactName}";
                    }
                } else {
                    // type === 'receivables'
                    if ($isDeposit) {
                        $txTitle = "Penyerahan Dana Titipan ke: {$contactName}";
                    } elseif ($isItemFinancing) {
                        $txTitle = "Memberi Cicilan Barang: {$itemName} ke {$contactName}";
                    } else {
                        $txTitle = "Memberi Pinjaman (Piutang) ke: {$contactName}";
                    }
                }

                // Keterangan cerdas untuk mempermudah audit mutasi kas
                if ($isDeposit) {
                    $txNotes = 'Penerimaan dana titipan transit sementara.';
                } elseif ($isItemFinancing) {
                    $txNotes = "Pencatatan kas untuk pembiayaan kepemilikan barang: {$itemName}.";
                } elseif ($isLumpSum && empty($data['due_date'])) {
                    $txNotes = 'Pencatatan kas pinjaman tanpa batas waktu kaku.';
                } else {
                    $txNotes = 'Pencatatan mutasi pokok otomatis dari modul Hutang Piutang.';
                }

                $transaction = Transaction::create([
                    'user_id' => $data['user_id'],
                    'account_id' => $data['account_id'],
                    'category_id' => $data['category_id'] ?? null,
                    'type' => $txType,
                    'title' => $txTitle,
                    'amount' => $data['amount'],
                    'transaction_date' => now(),
                    'is_reconciled' => true,
                    'notes' => $data['description'] ?? $txNotes,
                ]);

                $transactionId = $transaction->id;

                $account = Account::findOrFail($data['account_id']);
                if ($txType === 'income') {
                    $account->increment('balance', $data['amount']);
                } else {
                    $account->decrement('balance', $data['amount']);
                }
            }

            // Bind transaction_id awal ke data induk hutang
            $data['transaction_id'] = $transactionId;

            // Simpan data induk tagihan utama via repository
            $debt = $this->mainRepository->create($data);

            // ─── SINKRONISASI POLYMORPHIC TAG/LABEL ───
            if (! empty($data['tag_ids']) && is_array($data['tag_ids'])) {
                $decryptedTagIds = array_map(function ($encryptedId) {
                    return Helper::decrypt($encryptedId) ?? $encryptedId;
                }, $data['tag_ids']);

                $debt->tags()->sync($decryptedTagIds);
            }

            // ─── LOGIKA OTOMATIS MEMECAH JADWAL ADAPTIF (DEBT_PAYMENTS) ───
            $nominalPerCicilan = (int) floor($data['amount'] / $tenor);
            $selisihPembulatan = $data['amount'] - ($nominalPerCicilan * $tenor);

            // Mengatur fondasi tanggal awal jatuh tempo
            $startDate = ! empty($data['due_date']) ? Carbon::parse($data['due_date']) : null;

            for ($i = 1; $i <= $tenor; $i++) {
                $nominalFix = $nominalPerCicilan;

                if ($i === $tenor) {
                    $nominalFix += $selisihPembulatan; // Atasi sen selisih pembagian angka ganjil
                }

                // PROTEKSI: Jika Lump Sum tanpa tanggal tenggat, biarkan jatuh temponya NULL
                $dueDatePerInstallment = null;
                if ($startDate) {
                    $dueDatePerInstallment = $startDate->copy()->addMonths($i - 1)->format('Y-m-d');
                } elseif (! $isLumpSum) {
                    // Jika bertipe cicilan tapi user lupa isi tanggal awal, pasang default bulan ini
                    $dueDatePerInstallment = Carbon::now()->addMonths($i - 1)->format('Y-m-d');
                }

                DebtPayment::create([
                    'debt_id' => $debt->id,
                    'transaction_id' => null,
                    'account_id' => null,
                    'amount_paid' => $nominalFix,
                    'payment_date' => null,
                    'due_date' => $dueDatePerInstallment,
                    'status' => 'unpaid',
                    'installment_no' => $i,
                    'notes' => null,
                ]);
            }

            $redirect = redirect()->intended(route('debts.index'));

            DB::commit();

            $successMessage = $isLumpSum
                ? 'Catatan baru (bayar penuh) berhasil dibuat!'
                : "Catatan cicilan berhasil dibuat dengan {$tenor} tahapan bayar!";

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage($successMessage);

        } catch (Exception $e) {
            DB::rollBack();
            if (config('app.debug')) {
                throw $e;
            }

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Memperbarui Data Utama & Sinkronisasi Ulang Batas Waktu Jadwal
     */
    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            // Lindungi parameter finansial kaku agar tidak bisa dimanipulasi saat proses edit info biasa
            unset(
                $data['amount'],
                $data['remaining_amount'],
                $data['type'],
                $data['payment_method'],
                $data['account_id'],
                $data['tenor']
            );

            if (isset($data['is_deposit']) && ! $data['is_deposit']) {
                $data['deposit_target_name'] = null;
            }

            if (!empty($data['contact_id'])) {
                $contact = Contact::find($data['contact_id']);
                if ($contact) {
                    $data['contact_name'] = $contact->name;
                }
            } elseif (empty($data['contact_name'])) {
                // Jika user entah bagaimana mengosongkan keduanya (fallback aman)
                $data['contact_name'] = 'Seseorang';
            }

            $debt = $this->mainRepository->find($id);

            $oldDueDate = $debt->due_date ? Carbon::parse($debt->due_date) : null;
            $newDueDate = ! empty($data['due_date']) ? Carbon::parse($data['due_date']) : null;

            // Jalankan update teks data dasar via repository
            $this->mainRepository->update($id, $data);

            // SINKRONISASI UPDATE TAG/LABEL
            if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
                $decryptedTagIds = array_map(function ($encryptedId) {
                    return Helper::decrypt($encryptedId) ?? $encryptedId;
                }, $data['tag_ids']);

                $debt->tags()->sync($decryptedTagIds);
            }

            // ─── LOGIKA SINKRONISASI JADWAL (RE-SCHEDULE ADAPTIF TANGGAL) ───
            if ($newDueDate && (! $oldDueDate || ! $newDueDate->isSameDay($oldDueDate))) {
                $unpaidSchedules = DebtPayment::where('debt_id', $id)
                    ->where('status', 'unpaid')
                    ->get();

                foreach ($unpaidSchedules as $schedule) {
                    if ($schedule->due_date || $debt->payment_method === 'installment') {
                        $shiftedDate = $newDueDate->copy()->addMonths($schedule->installment_no - 1)->format('Y-m-d');
                        $schedule->update([
                            'due_date' => $shiftedDate,
                        ]);
                    }
                }
            }

            $redirect = redirect()->intended(route('debts.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Rincian informasi catatan berhasil diperbarui!');

        } catch (Exception $e) {
            DB::rollBack();
            if (config('app.debug')) {
                throw $e;
            }

            return $this->exceptionResponse($e, 'Gagal memperbarui informasi catatan.');
        }
    }
}
