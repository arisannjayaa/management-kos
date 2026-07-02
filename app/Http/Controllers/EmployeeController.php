<?php

namespace App\Http\Controllers;

use App\DataTables\EmployeeDataTable;
use App\Helpers\Helper;
use App\Http\Requests\EmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\Employee\EmployeeService;
use Illuminate\Contracts\View\Factory;
use Illuminate\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    protected EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function index(Request $request)
    {
        return (new EmployeeDataTable)->render('employee/index', 'employees');

    }

    public function form($id = null)
    {
        $data['employee'] = $id
            ? $this->employeeService->findOrFail(Helper::decrypt($id))->getResult()
            : null;

        return Inertia::render('employee/form', [
            'employee' => $data['employee'] ? (new EmployeeResource($data['employee']))->resolve() : null,
        ]);
    }

    /**
     * fungsi untuk menambahkan data pegawai (Murni Eloquent & Inertia)
     */
    public function create(EmployeeRequest $request)
    {
        if (! auth()->user()->hasRole('administrator')) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data = $request->only(['user_id', 'employee_code', 'division', 'level', 'status',
            'joined_at', 'id_card_number', 'telephone', 'address', 'name', 'email', 'password']);

        $result = $this->employeeService->create($data)->getResult();
        $targetUrl = $result['redirect'] ?? route('employee.index');

        return redirect()->to($targetUrl)->with('success', 'Pegawai baru berhasil didaftarkan!');
    }

    /**
     * fungsi untuk memperbaharui data
     *
     * @return RedirectResponse
     */
    public function update(EmployeeRequest $request)
    {
        if (! auth()->user()->hasRole('administrator')) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data = $request->only(['id',
            'user_id', 'employee_code', 'division', 'level', 'status',
            'joined_at', 'id_card_number', 'telephone', 'address', 'name', 'email', 'password']);

        $result = $this->employeeService->update($data['id'], $data)->getResult();
        $targetUrl = $result['redirect'] ?? route('employee.index');

        return redirect()->to($targetUrl)->with('success', 'Pegawai baru berhasil diperbaharui!');
    }

    /**
     * detail data
     *
     * @return Factory|\Illuminate\Contracts\View\View|Application|View|never|object
     */
    public function detail($id)
    {
        if (! auth()->user()->hasRole('administrator')) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $data['employee'] = $id
            ? $this->employeeService->findOrFail(Helper::decrypt($id))->getResult()
            : null;

        return Inertia::render('employee/detail', [
            'employee' => $data ? (new EmployeeResource($data['employee']))->resolve() : null,
        ]);
    }

    /**
     * fungsi untuk menghapus data
     *
     * @return RedirectResponse
     */
    public function delete(Request $request, $id)
    {
        // 1. Validasi Hak Akses (Administrator)
        if (! auth()->user()->hasRole('administrator')) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        $result = $this->employeeService->delete(Helper::decrypt($id));

        if (! $result->getStatus()) {
            return redirect()->back()->with('error', $result->getMessage());
        }

        return redirect()->back()->with('success', 'Data karyawan berhasil dihapus secara permanen.');
    }

    /**
     * @return never
     */
    public function restore(Request $request)
    {
        if (! auth()->user()->hasRole('administrator')) {
            abort(403, 'Akses Di Batasi|Anda tidak dapat mengakses halaman ini.');
        }

        return $this->employeeService->restore(Helper::decrypt($request->id))->toJson();
    }

    /**
     * Hapus banyak karyawan sekaligus.
     *
     * Route: DELETE /employees/bulk-destroy
     * Body : { ids: number[] }
     */
    public function bulkDestroy(Request $request)
    {
        // 1. Validasi awal: pastikan 'ids' adalah array dan tidak kosong
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
        ]);

        // 2. Dekripsi semua ID di dalam array
        // Menggunakan collect()->map() agar fungsi decrypt berjalan untuk setiap item
        $decryptedIds = collect($request->ids)->map(function ($encryptedId) {
            return Helper::decrypt($encryptedId);
        })->filter()->toArray(); // filter() untuk membuang hasil dekripsi yang gagal/null

        // 3. Pastikan ada ID yang valid setelah didekripsi
        if (empty($decryptedIds)) {
            return redirect()->back()->withErrors(['ids' => 'Data ID tidak valid.']);
        }

        // 4. Proses hapus dengan DB Transaction
        DB::transaction(function () use ($decryptedIds) {
            // Jika perlu memastikan data memang ada sebelum dihapus,
            // cukup jalankan delete dengan whereIn. Data yang tidak ada otomatis diabaikan.
            Employee::whereIn('id', $decryptedIds)->delete();
        });

        return redirect()->back()->with('success', count($decryptedIds) . ' karyawan berhasil dihapus.');
    }
}
