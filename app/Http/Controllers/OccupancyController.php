<?php

namespace App\Http\Controllers;

use App\DataTables\OccupancyDataTable;
use App\Helpers\Helper;
use App\Http\Requests\OccupancyRequest;
use App\Http\Resources\ChargeTypeResource;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\TenantResource;
use App\Models\ChargeType;
use App\Services\Occupancy\OccupancyService;
use App\Services\Property\PropertyService;
use App\Services\Tenant\TenantService; // 🌟 IMPORT MASTER MODEL BIAYA
use Illuminate\Http\Request;

class OccupancyController extends Controller
{
    protected OccupancyService $occupancyService;

    protected PropertyService $propertyService;

    protected TenantService $tenantService;

    public function __construct(
        OccupancyService $occupancyService,
        PropertyService $propertyService,
        TenantService $tenantService
    ) {
        $this->occupancyService = $occupancyService;
        $this->propertyService = $propertyService;
        $this->tenantService = $tenantService;
    }

    // app/Http/Controllers/OccupancyController.php

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin mengelola okupansi sewa.');
        }

        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();
        $tenants = $this->tenantService->allActiveByOwner(auth()->id())->getResult();

        $propertyIds = $properties ? $properties->pluck('id')->toArray() : [];
        $chargeTypes = ChargeType::whereIn('property_id', $propertyIds)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        $dataTable = new OccupancyDataTable;

        return $dataTable->render('occupancy/index', 'occupancies', [
            'properties' => $properties ? PropertyResource::collection($properties) : null,
            'tenants' => $tenants ? TenantResource::collection($tenants) : null,

            // 🌟 PERBAIKAN DI SINI: Bungkus dengan Resource agar ID-nya ikut terenkripsi!
            'chargeTypes' => ChargeTypeResource::collection($chargeTypes),
        ]);
    }

    public function create(OccupancyRequest $request)
    {
        $data = $request->validated();

        // Array 'charges' otomatis ikut hanyut di sini pasca validasi request
        $response = $this->occupancyService->checkIn($data);
        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->to(route('occupancies.index'))->with('success', $response->getMessage());
    }

    public function checkOut(Request $request, $id)
    {
        $request->validate([
            'end_date' => 'required|date',
        ]);

        $response = $this->occupancyService->checkOut(Helper::decrypt($id), [
            'end_date' => $request->end_date,
        ]);

        if (! $response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->to(route('occupancies.index'))->with('success', $response->getMessage());
    }

    public function delete(Request $request, $id)
    {
        $this->occupancyService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Catatan log sewa berhasil dihapus.');
    }
}
