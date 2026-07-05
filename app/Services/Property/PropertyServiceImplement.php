<?php

namespace App\Services\Property;

use App\Helpers\Helper;
use App\Repositories\Property\PropertyRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class PropertyServiceImplement extends ServiceApi implements PropertyService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Properti';
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
    protected PropertyRepository $mainRepository;

    public function __construct(PropertyRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
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

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

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

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

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

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

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

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

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

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengambil daftar semua properti berdasarkan Owner ID
     */
    public function findAllByOwnerId($ownerId): mixed
    {
        try {
            $result = $this->mainRepository->getByOwner($ownerId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Membuat data Properti baru
     */
    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            // Pasang owner_id dari user yang sedang login jika belum diset
            if (! isset($data['owner_id'])) {
                $data['owner_id'] = auth()->id();
            }

            // Set default value sesuai Database Architecture jika kosong
            $data['billing_cycle_days'] = $data['billing_cycle_days'] ?? 30;
            $data['billing_grace_period_days'] = $data['billing_grace_period_days'] ?? 0;
            $data['wa_reminder_enabled'] = $data['wa_reminder_enabled'] ?? true;
            $data['is_active'] = $data['is_active'] ?? true;

            $result = $this->mainRepository->create($data);

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(201)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti kos baru berhasil didaftarkan!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Memperbarui data informasi Properti
     */
    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            // Proteksi data owner agar tidak berpindah tangan tidak sengaja saat edit biasa
            unset($data['owner_id']);

            $this->mainRepository->update($id, $data);

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Informasi properti berhasil diperbarui!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Menghapus rekaman Properti kos (Soft Delete)
     */
    public function delete($id): mixed
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->delete($id);

            $redirect = redirect()->intended(route('properties.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Properti kos berhasil dihapus!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }
}
