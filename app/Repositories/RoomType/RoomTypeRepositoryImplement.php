<?php

namespace App\Repositories\RoomType;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\RoomType;

class RoomTypeRepositoryImplement extends Eloquent implements RoomTypeRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected RoomType $model;

    public function __construct(RoomType $model)
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

    public function getByProperty(string $propertyId)
    {
        return $this->model::where('property_id', $propertyId)->with('pricingTiers')->get();
    }

    public function savePricingTiers(string $roomTypeId, array $tiers)
    {
        $roomType = $this->model::findOrFail($roomTypeId);

        // Hapus tier lama terlebih dahulu (Soft Delete aman karena tabel pakai soft deletes)
        $roomType->pricingTiers()->delete();

        // Simpan tier baru
        foreach ($tiers as $tier) {
            $roomType->pricingTiers()->create([
                'name' => $tier['name'],
                'price' => $tier['price'],
            ]);
        }
    }
}
