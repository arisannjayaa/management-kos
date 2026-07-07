<?php

namespace App\Services\ExpenseCategory;

use App\Helpers\Helper;
use App\Models\User;
use App\Repositories\ExpenseCategory\ExpenseCategoryRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class ExpenseCategoryServiceImplement extends ServiceApi implements ExpenseCategoryService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Kategori Pengeluaran';
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
    protected ExpenseCategoryRepository $mainRepository;

    public function __construct(ExpenseCategoryRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    public function create($data): mixed
    {
        DB::beginTransaction(); // Try-catch + transaksi wajib ada[cite: 3]
        try {
            // Relasi induk dari context jika belum ada[cite: 3]
            $data['owner_id'] = auth()->user()->hasRole('staff')
                ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
                : auth()->id();

            $result = $this->mainRepository->create($data);
            $redirect = redirect()->intended(route('expense_categories.index'));
            DB::commit();

            return $this->setStatus(true)->setCode(201)->setResult(['redirect' => $redirect->getTargetUrl()])->setMessage('Kategori pengeluaran berhasil dibuat.');
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
            unset($data['owner_id']); // Field kepemilikan di-unset[cite: 3]
            $result = $this->mainRepository->update($id, $data);
            $redirect = redirect()->intended(route('expense_categories.index'));
            DB::commit();

            return $this->setStatus(true)->setCode(200)->setResult(['redirect' => $redirect->getTargetUrl()])->setMessage('Kategori pengeluaran diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    // Seluruh bulk method disesuaikan dengan pola DB::beginTransaction() sesuai pedoman[cite: 3]
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
