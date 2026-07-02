<?php

namespace App\Repositories\Employee;

use App\Models\Employee;
use LaravelEasyRepository\Implementations\Eloquent;

class EmployeeRepositoryImplement extends Eloquent implements EmployeeRepository
{
    /**
     * Model class to be used in this repository for the common methods inside Eloquent
     * Don't remove or change $this->model variable name
     *
     * @property Model|mixed $model;
     */
    protected Employee $model;

    public function __construct(Employee $model)
    {
        $this->model = $model;
    }

    /**
     * @return Employee|\Illuminate\Database\Eloquent\Model
     */
    public function findByUserId($userId)
    {
        return $this->model->query()
            ->with(['user', 'letters', 'statement_letters'])
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * @return mixed
     */
    public function findWithTrashed($id)
    {
        return $this->model->query()
            ->onlyTrashed()
            ->where('id', $id)
            ->first();
    }

    /**
     * @return mixed
     */
    public function restore($id)
    {
        return $this->model->query()
            ->onlyTrashed()
            ->where('id', $id)
            ->restore();
    }

    public function find($id)
    {
        return $this->model->query()
            ->with(['user'])
            ->where('id', $id)
            ->first();
    }

    public function findOrFail($id)
    {
        return $this->model->query()
            ->with(['user'])
            ->findOrFail($id);
    }
}
