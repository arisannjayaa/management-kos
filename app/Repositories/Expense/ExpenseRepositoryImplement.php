<?php

namespace App\Repositories\Expense;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\Expense;

class ExpenseRepositoryImplement extends Eloquent implements ExpenseRepository
{

    /**
     * Model class to be used in this repository for the common methods inside Eloquent
     * Don't remove or change $this->model variable name
     * @property Model|mixed $model;
     */
    protected Expense $model;

    public function __construct(Expense $model)
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
