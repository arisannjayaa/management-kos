<?php

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use LaravelEasyRepository\Implementations\Eloquent;

class UserRepositoryImplement extends Eloquent implements UserRepository
{
    /**
     * Model class to be used in this repository for the common methods inside Eloquent
     * Don't remove or change $this->model variable name
     *
     * @property Model|mixed $model;
     */
    protected $model;

    public function __construct(User $model)
    {
        $this->model = $model;
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

    /**
     * @return User|Collection|\Illuminate\Database\Eloquent\Model|null
     */
    public function find($id)
    {
        return $this->model->query()
            ->with(['employee', 'role'])
            ->find($id);
    }

    /**
     * @return User|Collection|\Illuminate\Database\Eloquent\Model|mixed|null
     */
    public function findOrFail($id)
    {
        return $this->model->query()
            ->with(['employee', 'role'])
            ->findOrFail($id);
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
}
