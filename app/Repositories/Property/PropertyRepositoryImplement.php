<?php

namespace App\Repositories\Property;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Property;

class PropertyRepositoryImplement extends Eloquent implements PropertyRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected Property $model;

    public function __construct(Property $model)
    {
        $this->model = $model;
    }

    /**
     * @param $ids
     * @return mixed
     */
    public function bulkDelete($ids)
    {
        return $this->model->query()
            ->whereIn('id', $ids)->delete();
    }

    /**
     * @param $id
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
     * @param $ids
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
     * @param $id
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
     * @param $ids
     * @return mixed
     */
    public function bulkRestore($ids)
    {
        return $this->model->query()
            ->withTrashed()
            ->whereIn('id', $ids)
            ->restore();
    }

    public function getByOwner(string $ownerId)
    {
        return $this->model::where('owner_id', $ownerId)->latest()->get();
    }

    public function findWithDetails(string $id)
    {
        return $this->model::with(['roomTypes.pricingTiers', 'rooms'])->findOrFail($id);
    }
}
