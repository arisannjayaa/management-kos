<?php

namespace App\Repositories\Property;

use LaravelEasyRepository\Repository;

interface PropertyRepository extends Repository{

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
    public function getByOwner(string $ownerId);
    public function findWithDetails(string $id);
}
