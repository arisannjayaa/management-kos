<?php

namespace App\Repositories\ChargeMeterReading;

use LaravelEasyRepository\Repository;

interface ChargeMeterReadingRepository extends Repository{

    public function getLatestReading($occupancyId, $chargeTypeId): mixed;

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
