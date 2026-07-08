<?php

namespace App\Repositories\Complaint;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Complaint;

class ComplaintRepositoryImplement extends Eloquent implements ComplaintRepository
{

    /**
     * Model class to be used in this repository for the common methods inside Eloquent
     * Don't remove or change $this->model variable name
     * @property Model|mixed $model;
     */
    protected Complaint $model;

    public function __construct(Complaint $model)
    {
        $this->model = $model;
    }

    public function bulkDelete($ids)
    {
        return $this->model->query()->whereIn('id', $ids)->delete();
    }

    public function forceDelete($id)
    {
        return $this->model->query()->withTrashed()->findOrFail($id)->forceDelete();
    }

    public function bulkForceDelete($ids)
    {
        return $this->model->query()->withTrashed()->whereIn('id', $ids)->forceDelete();
    }

    public function restore($id)
    {
        return $this->model->query()->withTrashed()->findOrFail($id)->restore();
    }

    public function bulkRestore($ids)
    {
        return $this->model->query()->withTrashed()->whereIn('id', $ids)->restore();
    }
}
