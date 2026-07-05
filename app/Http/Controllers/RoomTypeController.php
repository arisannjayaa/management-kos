<?php

namespace App\Http\Controllers;

use App\DataTables\PropertyDataTable;
use App\DataTables\RoomTypeDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionRoomTypeRequest;
use App\Http\Requests\RoomTypeRequest;
use App\Http\Resources\PropertyResource;
use App\Services\Property\PropertyService;
use App\Services\RoomType\RoomTypeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomTypeController extends Controller
{
    protected RoomTypeService $roomTypeService;

    protected PropertyService $propertyService;

    public function __construct(RoomTypeService $roomTypeService, PropertyService $propertyService)
    {
        $this->roomTypeService = $roomTypeService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin untuk melihat halaman ini.');
        }

        // Ambil properti aktif untuk dropdown di halaman tipe kamar
        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();
        $dataTable = new RoomTypeDataTable;

        return $dataTable->render('room-type/index', 'room_types', [
            'properties' => $properties ? PropertyResource::collection($properties) : null,
        ]);
    }

    public function create(RoomTypeRequest $request)
    {
        $data = $request->only(['name', 'description', 'base_price', 'pricing_tiers', 'property_id']);

        $result = $this->roomTypeService->create($data)->getResult();
        $targetUrl = $result['redirect'] ?? route('room-types.index');

        return redirect()->to($targetUrl)->with('success', 'Tipe kamar dan skema tarif berhasil disimpan!');
    }

    public function update(RoomTypeRequest $request, $id)
    {
        $data = $request->only(['name', 'description', 'base_price', 'pricing_tiers']);

        $result = $this->roomTypeService->update(Helper::decrypt($id), $data)->getResult();
        $targetUrl = $result['redirect'] ?? route('rooms.index');

        return redirect()->to($targetUrl)->with('success', 'Spesifikasi tipe kamar berhasil diperbarui!');
    }

    public function delete(Request $request, $id)
    {
        $this->roomTypeService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Kategori tipe kamar berhasil dihapus.');
    }

    // ─── SOFT DELETE EXTENSIONS (Sesuai Rute Web) ───

    public function restore($id)
    {
        // Memanggil repositori via service untuk mengembalikan data dari soft delete
        $this->propertyService->restore(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Properti berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->propertyService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Properti dihapus secara permanen.');
    }

    // ─── BULK ACTIONS ───

    public function bulkDestroy(BulkActionRoomTypeRequest $request)
    {
        $this->propertyService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti berhasil dihapus.');
    }

    public function bulkForceDelete(BulkActionRoomTypeRequest $request)
    {
        $this->propertyService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti dihapus permanen.');
    }

    public function bulkRestore(BulkActionRoomTypeRequest $request)
    {
        $this->propertyService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' properti berhasil dipulihkan.');
    }
}
