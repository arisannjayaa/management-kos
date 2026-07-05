<?php

namespace App\Services\Room;

use LaravelEasyRepository\BaseService;

interface RoomService extends BaseService
{
    public function findRoomsByProperty(string $propertyId, array $filters = []);

    public function changeStatus(string $id, string $status);

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
