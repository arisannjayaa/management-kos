<?php

namespace App\Services\Room;

use App\Helpers\Helper;
use App\Repositories\Room\RoomRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;

class RoomServiceImplement extends ServiceApi implements RoomService
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
    protected RoomRepository $mainRepository;

    public function __construct(RoomRepository $mainRepository)
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

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kamar berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Kamar berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengambil daftar kamar per properti dengan dukungan Live Search & Filter Status
     */
    public function findRoomsByProperty($propertyId, array $filters = []): mixed
    {
        try {
            $result = $this->mainRepository->getRoomsByProperty($propertyId, $filters);

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult($result);
        } catch (Exception $e) {
            return $this->exceptionResponse($e);
        }
    }

    /**
     * Menambahkan unit Kamar fisik baru
     */
    public function create($data): mixed
    {
        DB::beginTransaction();
        try {
            $data['status'] = $data['status'] ?? 'available';

            $this->mainRepository->create($data);

            $redirect = redirect()->intended(route('rooms.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(201)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Unit kamar fisik baru berhasil ditambahkan!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function update($id, array $data)
    {
        DB::beginTransaction();
        try {

            $allowedStatuses = ['available', 'occupied', 'maintenance'];
            if (! in_array($data['status'], $allowedStatuses)) {
                return $this->setStatus(false)
                    ->setCode(422)
                    ->setMessage('Status kamar tidak dikenali oleh sistem.');
            }

            $this->mainRepository->update($id, $data);

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setMessage('Kamar berhasil diperbarui!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    /**
     * Mengubah status operasional hunian unit kamar (available, occupied, maintenance)
     */
    public function changeStatus($id, $status): mixed
    {
        DB::beginTransaction();
        try {
            $allowedStatuses = ['available', 'occupied', 'maintenance'];
            if (! in_array($status, $allowedStatuses)) {
                return $this->setStatus(false)
                    ->setCode(422)
                    ->setMessage('Status kamar tidak dikenali oleh sistem.');
            }

            $this->mainRepository->updateStatus($id, $status);

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setMessage("Status kamar berhasil diubah menjadi {$status}!");
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }
}
