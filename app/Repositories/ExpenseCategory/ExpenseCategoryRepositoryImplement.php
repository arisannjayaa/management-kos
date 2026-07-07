<?php

namespace App\Repositories\ExpenseCategory;

use LaravelEasyRepository\Implementations\Eloquent;
use App\Models\ExpenseCategory;

class ExpenseCategoryRepositoryImplement extends Eloquent implements ExpenseCategoryRepository
{

    /**
     * Model class to be used in this repository for the common methods inside Eloquent
     * Don't remove or change $this->model variable name
     * @property Model|mixed $model;
     */
    protected ExpenseCategory $model;

    public function __construct(ExpenseCategory $model)
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
