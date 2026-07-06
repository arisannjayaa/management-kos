<?php

namespace App\Repositories\ChargeMeterReading;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\ChargeMeterReading;

class ChargeMeterReadingRepositoryImplement extends Eloquent implements ChargeMeterReadingRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected ChargeMeterReading $model;

    public function __construct(ChargeMeterReading $model)
    {
        $this->model = $model;
    }

    /**
     * @return mixed
     */
    public function bulkDelete($ids)
    {
        return $this->model->query()
            ->whereIn('id', $ids)->delete();
    }

    /**
     * @return mixed
     */
    public function forceDelete($id)
    {
        return $this->model->query()
            ->withTrashed()
            ->findOrFail($id)
            ->forceDelete();
    }

    /**
     * @return mixed
     */
    public function bulkForceDelete($ids)
    {
        return $this->model->query()
            ->withTrashed()
            ->whereIn('id', $ids)
            ->forceDelete();
    }

    /**
     * @return mixed
     */
    public function restore($id)
    {

        return $this->model->query()
            ->withTrashed()
            ->findOrFail($id)
            ->restore();
    }

    /**
     * @return mixed
     */
    public function bulkRestore($ids)
    {
        return $this->model->query()
            ->withTrashed()
            ->whereIn('id', $ids)
            ->restore();
    }

    public function getLatestReading($occupancyId, $chargeTypeId): mixed
    {
        return $this->model::where('occupancy_id', $occupancyId)
            ->where('charge_type_id', $chargeTypeId)
            ->orderBy('reading_date', 'desc')
            ->first();
    }
}
