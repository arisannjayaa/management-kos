<?php

namespace App\Repositories\Complaint;

use LaravelEasyRepository\Repository;

interface ComplaintRepository extends Repository{

    public function bulkDelete($ids);
    public function forceDelete($id);
    public function bulkForceDelete($ids);
    public function restore($id);
    public function bulkRestore($ids);
}
