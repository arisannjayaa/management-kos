<?php

namespace App\Services\ChargeMeterReading;

use LaravelEasyRepository\BaseService;

interface ChargeMeterReadingService extends BaseService
{
    public function getPreviousReadingValue($occupancyId, $chargeTypeId): float;

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
