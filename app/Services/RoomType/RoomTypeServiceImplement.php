<?php

namespace App\Services\RoomType;

use App\Helpers\Helper;
use App\Repositories\RoomType\RoomTypeRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;

class RoomTypeServiceImplement extends ServiceApi implements RoomTypeService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Tipe Kamar';
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
    protected RoomTypeRepository $mainRepository;

    public function __construct(RoomTypeRepository $mainRepository)
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

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Tipe kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Tipe kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Tipe kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Tipe kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Tipe kamar berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengambil seluruh tipe kamar berdasarkan properti ID
     */
    public function findAllByPropertyId($propertyId): mixed
    {
        try {
            $result = $this->mainRepository->getByProperty($propertyId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }

    /**
     * Membuat Tipe Kamar Baru beserta pemecahan multi tarif berjenjang (Pricing Tiers)
     */
    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            // 1. Simpan Informasi Tipe Kamar Utama
            $roomType = $this->mainRepository->create([
                'property_id' => $data['property_id'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_price' => (int) ($data['base_price'] ?? 0),
            ]);

            // 2. Simpan Pricing Tiers anak jika dilampirkan dari Form React
            if (! empty($data['pricing_tiers']) && is_array($data['pricing_tiers'])) {
                $this->mainRepository->savePricingTiers($roomType->id, $data['pricing_tiers']);
            }

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(21)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kategori tipe kamar beserta konfigurasi tarif berhasil disimpan!');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Memperbarui rincian tipe kamar dan melakukan sinkronisasi ulang skema tarif berjenjang
     */
    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            // Update entitas Tipe Kamar induk
            $this->mainRepository->update($id, [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_price' => (int) ($data['base_price'] ?? 0),
            ]);

            // Sinkronisasi data array pricing tiers (Hapus lama, timpa baru secara atomik)
            if (isset($data['pricing_tiers']) && is_array($data['pricing_tiers'])) {
                $this->mainRepository->savePricingTiers($id, $data['pricing_tiers']);
            }

            $redirect = redirect()->intended(route('room-types.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Spesifikasi tipe kamar dan rincian tarif berhasil diperbarui!');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }
}
