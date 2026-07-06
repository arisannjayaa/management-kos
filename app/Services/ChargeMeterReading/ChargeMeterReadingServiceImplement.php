<?php

namespace App\Services\ChargeMeterReading;

use App\Helpers\Helper;
use App\Models\ChargeType;
use App\Repositories\ChargeMeterReading\ChargeMeterReadingRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelEasyRepository\ServiceApi;
use Exception;

class ChargeMeterReadingServiceImplement extends ServiceApi implements ChargeMeterReadingService
{
    /**
     * set title message api for CRUD
     *
     * @param  string  $title
     */
    protected string $title = 'Pencatatan Meteran Utilitas';
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
    protected ChargeMeterReadingRepository $mainRepository;

    public function __construct(ChargeMeterReadingRepository $mainRepository)
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

            $redirect = redirect()->intended(route('meter-readings.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Meteran Utilitas berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('meter-readings.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Meteran Utilitas berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('meter-readings.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Meteran Utilitas berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('meter-readings.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Meteran Utilitas berhasil ditambahkan');
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

            $redirect = redirect()->intended(route('meter-readings.index'));

            DB::commit();

            return $this->setStatus(true)
                ->setCode(200)
                ->setResult(['redirect' => $redirect->getTargetUrl()])
                ->setMessage('Meteran Utilitas berhasil ditambahkan');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);

            return $this->exceptionResponse($e);
        }
    }

    public function getPreviousReadingValue($occupancyId, $chargeTypeId): float
    {
        $latest = $this->mainRepository->getLatestReading($occupancyId, $chargeTypeId);

        return $latest ? (float) $latest->current_reading : 0.0;
    }

    /**
     * Override Method Create: Menyisipkan Logika Otomatisasi Selisih & Perkalian Tarif Pokok
     */
    public function create($data): mixed
    {
        try {
            // 1. Dapatkan otomatisasi posisi angka meteran terakhir
            $data['previous_reading'] = $this->getPreviousReadingValue($data['occupancy_id'], $data['charge_type_id']);

            // 2. Hitung selisih pemakaian bersih
            $data['usage'] = (float) $data['current_reading'] - (float) $data['previous_reading'];

            // 3. Tarik tarif harga per unit dari master biaya
            $chargeType = ChargeType::findOrFail($data['charge_type_id']);
            $unitPrice = $chargeType->unit_price ?? 0;

            // 4. Finalisasi total nominal beban rupiah
            $data['amount'] = $data['usage'] * $unitPrice;

            $result = $this->mainRepository->create($data);

            return $this->setStatus(true)->setCode(201)->setResult($result);
        } catch (Exception $e) {
            return $this->setStatus(false)->setCode(500)->setMessage($e->getMessage());
        }
    }
}
