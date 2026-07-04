<?php

namespace App\Http\Controllers;

use App\DataTables\RoleDataTable;
use App\Helpers\Helper;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\PermissionResource;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        // 1. Otorisasi (Sesuai pola yang Anda berikan)
        if (! auth()->user()->hasRole(['super_admin'])) {
            abort(403, 'Akses Dibatasi|Anda tidak memiliki izin untuk mengelola hak akses.');
        }

        // 2. Ambil master data permissions
        // Catatan: Karena kita menggunakan Spatie Permission yang bersifat sistemik,
        // kita ambil langsung dari modelnya.
        $permissions = Permission::orderBy('name')->get();

        // 3. Eksekusi DataTable
        $dataTable = new RoleDataTable;

        // Menggunakan method render milik BaseDataTable
        return $dataTable->render('role/index', 'roles', [
            'permissions' => $permissions ? PermissionResource::collection($permissions) : null,
        ]);
    }

    public function create(RoleRequest $request)
    {
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('success', 'Role berhasil ditambahkan.');
    }

    public function update(RoleRequest $request, $id)
    {
        $role = Role::findOrFail(Helper::decrypt($id));

        // Proteksi tingkat sistem: Super Admin tidak boleh diubah sembarangan
        if ($role->name === 'super_admin') {
            abort(403, 'Konfigurasi Role Super Admin dikunci dan tidak boleh diubah.');
        }

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('success', 'Role berhasil diperbarui.');
    }

    public function delete($id)
    {
        $role = Role::findOrFail(Helper::decrypt($id));

        if ($role->name === 'super_admin' || $role->name === 'owner') {
            abort(403, 'Role sistem inti tidak boleh dihapus.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role berhasil dihapus.');
    }
}
