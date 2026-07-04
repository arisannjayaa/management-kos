<?php

namespace App\Http\Controllers;

use App\DataTables\RoomDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionRoomTypeRequest;
use App\Http\Requests\RoomRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\RoomTypeResource;
use App\Services\Property\PropertyService;
use App\Services\Room\RoomService;
use App\Services\RoomType\RoomTypeService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    protected RoomService $roomService;

    protected RoomTypeService $roomTypeService;

    protected PropertyService $propertyService;

    public function __construct(RoomService $roomService, RoomTypeService $roomTypeService, PropertyService $propertyService)
    {
        $this->roomService = $roomService;
        $this->roomTypeService = $roomTypeService;
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        if (! auth()->user()->hasRole(['super_admin', 'owner', 'staff'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin untuk mengelola data kamar.');
        }

        // Siapkan master data tipe kamar untuk form dropdown input di React
        $roomTypes = $this->roomTypeService->all()->getResult();
        $properties = $this->propertyService->findAllByOwnerId(auth()->id())->getResult();

        $dataTable = new RoomDataTable;

        return $dataTable->render('room/index', 'rooms', [
            'room_types' => $roomTypes ? RoomTypeResource::collection($roomTypes) : null,
            'properties' => $properties ? PropertyResource::collection($properties) : null,
        ]);
    }

    public function create(RoomRequest $request)
    {
        $data = $request->only(['room_number', 'status', 'property_id', 'room_type_id']);

        $result = $this->roomService->create($data)->getResult();
        $targetUrl = $result['redirect'] ?? route('rooms.index');

        return redirect()->to($targetUrl)->with('success', 'Unit kamar fisik baru berhasil ditambahkan!');
    }

    public function update(RoomRequest $request, $id)
    {
        $data = [
            'room_type_id' => Helper::decrypt($request->room_type_id),
            'room_number' => $request->room_number,
            'status' => $request->status,
        ];

        $result = $this->roomService->update(Helper::decrypt($id), $data)->getResult();
        $targetUrl = $result['redirect'] ?? route('rooms.index');

        return redirect()->to($targetUrl)->with('success', 'Rincian data kamar berhasil diperbarui!');
    }

    public function delete(Request $request, $id)
    {
        $this->roomService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Data kamar berhasil dihapus.');
    }

    // ─── SOFT DELETE EXTENSIONS ───

    public function restore($id)
    {
        $this->roomService->restore($id);

        return redirect()->back()->with('success', 'Unit kamar berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->roomService->forceDelete($id);

        return redirect()->back()->with('success', 'Kamar dihapus secara permanen dari sistem.');
    }

    // ─── BULK ACTIONS ───

    public function bulkDestroy(BulkActionRoomTypeRequest $request)
    {
        $this->roomService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' unit kamar berhasil dihapus.');
    }

    public function bulkForceDelete(BulkActionRoomTypeRequest $request)
    {
        $this->roomService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' data kamar dihapus permanen.');
    }

    public function bulkRestore(BulkActionRoomTypeRequest $request)
    {
        $this->roomService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' unit kamar berhasil dipulihkan.');
    }
}
