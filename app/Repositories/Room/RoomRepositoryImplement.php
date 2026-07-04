<?php

namespace App\Repositories\Room;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Room;

class RoomRepositoryImplement extends Eloquent implements RoomRepository{

    /**
    * Model class to be used in this repository for the common methods inside Eloquent
    * Don't remove or change $this->model variable name
    * @property Model|mixed $model;
    */
    protected Room $model;

    public function __construct(Room $model)
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

    public function getRoomsByProperty(string $propertyId, array $filters = [])
    {
        return $this->model::where('property_id', $propertyId)
            ->with('roomType')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('room_number', 'like', "%{$search}%");
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
            })
            ->orderBy('room_number', 'asc')
            ->get();
    }

    public function updateStatus(string $id, string $status)
    {
        return $this->model::where('id', $id)->update(['status' => $status]);
    }
}
