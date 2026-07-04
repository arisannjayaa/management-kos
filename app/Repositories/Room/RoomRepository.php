<?php

namespace App\Repositories\Room;

use LaravelEasyRepository\Repository;

interface RoomRepository extends Repository
{
    public function getRoomsByProperty(string $propertyId, array $filters = []);

    public function updateStatus(string $id, string $status);

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
