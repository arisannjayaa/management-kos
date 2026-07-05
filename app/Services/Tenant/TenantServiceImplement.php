<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\TenantRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use LaravelEasyRepository\ServiceApi;

class TenantServiceImplement extends ServiceApi implements TenantService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Penyewa';
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
    protected TenantRepository $mainRepository;

    public function __construct(TenantRepository $mainRepository)
    {
        $this->mainRepository = $mainRepository;
    }

    /**
     * Saring hanya tenant berstatus 'active' milik owner untuk dropdown check-in
     */
    public function allActiveByOwner($ownerId): mixed
    {
        try {
            // Memanggil query builder dari repository bawaan
            $result = $this->mainRepository->getByOwner($ownerId);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }

    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            $result = $this->mainRepository->create($data);
            DB::commit();

            return $this->setStatus(true)
                ->setCode(201)
                ->setResult($result);
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    public function update($id, array $data): mixed
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->update($id, $data);
            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setMessage('Profil penyewa berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }

    public function delete($id): mixed
    {
        DB::beginTransaction();
        try {
            $this->mainRepository->delete($id);
            DB::commit();

            return $this->setStatus(true)->setCode(200);
        } catch (Exception $e) {
            DB::rollBack();

            return $this->exceptionResponse($e);
        }
    }
}
