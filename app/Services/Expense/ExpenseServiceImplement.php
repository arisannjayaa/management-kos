<?php

namespace App\Services\Expense;

use App\Repositories\Expense\ExpenseRepository;
use LaravelEasyRepository\ServiceApi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;
use App\Helpers\Helper;

class ExpenseServiceImplement extends ServiceApi implements ExpenseService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Transaksi Pengeluaran';
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
    protected ExpenseRepository $mainRepository;

    public function __construct(ExpenseRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            // Decrypt Foreign Keys dari Frontend
            $data['property_id'] = Helper::decrypt($data['property_id']);
            $data['expense_category_id'] = Helper::decrypt($data['expense_category_id']);

            if (isset($data['receipt_attachment']) && $data['receipt_attachment'] instanceof UploadedFile) {
                $data['receipt_attachment'] = $data['receipt_attachment']->store('attachments/expenses', 'public');
            } else {
                unset($data['receipt_attachment']);
            }

            $result = $this->mainRepository->create($data);
            $redirect = redirect()->intended(route('expenses.index'));
            DB::commit();

            return $this->setStatus(true)->setCode(201)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Log pengeluaran operasional berhasil dibukukan.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function update($id, $data): mixed
    {
        DB::beginTransaction();
        try {
            unset($data['property_id']); // Cegah pindah kepemilikan
            $data['expense_category_id'] = Helper::decrypt($data['expense_category_id']);

            if (isset($data['receipt_attachment']) && $data['receipt_attachment'] instanceof UploadedFile) {
                $data['receipt_attachment'] = $data['receipt_attachment']->store('attachments/expenses', 'public');
            } else {
                unset($data['receipt_attachment']);
            }

            $result = $this->mainRepository->update($id, $data);
            $redirect = redirect()->intended(route('expenses.index'));
            DB::commit();

            return $this->setStatus(true)->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Catatan pengeluaran operasional diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->delete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkDelete($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkDelete($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Berhasil dihapus massal.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function forceDelete($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->forceDelete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Dihapus permanen.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkForceDelete($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkForceDelete($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Dihapus permanen massal.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function restore($id)
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->restore($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Berhasil dipulihkan.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function bulkRestore($ids)
    {
        DB::beginTransaction();
        try {
            $decryptedIds = collect($ids)->map(fn ($i) => Helper::decrypt($i))->filter()->toArray();
            $this->mainRepository->bulkRestore($decryptedIds);
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setMessage('Berhasil dipulihkan massal.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }
}
