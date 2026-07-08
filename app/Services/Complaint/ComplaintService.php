<?php

namespace App\Services\Complaint;

use LaravelEasyRepository\BaseService;

interface ComplaintService extends BaseService
{

    public function bulkDelete($ids);

    public function forceDelete($id);

    public function bulkForceDelete($ids);

    public function restore($id);

    public function bulkRestore($ids);
}
