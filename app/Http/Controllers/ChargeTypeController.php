<?php

namespace App\Http\Controllers;

use App\DataTables\ChargeTypeDataTable;
use App\Helpers\Helper;
use App\Http\Requests\ChargeTypeRequest;
use App\Http\Resources\PropertyResource;
use App\Services\ChargeType\ChargeTypeService;
use App\Services\Property\PropertyService;
use Illuminate\Http\Request;

class ChargeTypeController extends Controller
{
    protected ChargeTypeService $chargeTypeService;
    protected PropertyService $propertyService;

    public function __construct(ChargeTypeService $chargeTypeService, PropertyService $propertyService)
    {
        $this->chargeTypeService = $chargeTypeService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin mengelola master biaya.');
        }

        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();

        $dataTable = new ChargeTypeDataTable;
        return $dataTable->render('charge-type/index', 'chargeTypes', [
            'properties' => $properties ? PropertyResource::collection($properties) : [],
        ]);
    }

    public function store(ChargeTypeRequest $request)
    {
        $data = $request->validated();

        $response = $this->chargeTypeService->create($data);
        if (!$response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', 'Komponen master biaya berhasil ditambahkan.');
    }

    public function update(ChargeTypeRequest $request, $id)
    {
        $data = $request->validated();

        $response = $this->chargeTypeService->update(Helper::decrypt($id), $data);
        if (!$response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', 'Komponen master biaya berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $response = $this->chargeTypeService->delete(Helper::decrypt($id));
        if (!$response->getStatus()) {
            return redirect()->back()->withErrors(['error' => $response->getMessage()]);
        }

        return redirect()->back()->with('success', 'Komponen master biaya berhasil dihapus.');
    }
}
