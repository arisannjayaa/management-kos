<?php

namespace App\Http\Controllers;

use App\DataTables\ExpenseDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionExpenseRequest;
use App\Http\Requests\ExpenseRequest;
use App\Http\Resources\ExpenseCategoryResource;
use App\Http\Resources\PropertyResource;
use App\Models\ExpenseCategory;
use App\Models\Property;
use App\Models\User;
use App\Services\Expense\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    protected ExpenseService $expenseService;

    public function __construct(ExpenseService $expenseService)
    {
        $this->expenseService = $expenseService;
    }

    public function index(Request $request)
    {
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        $properties = Property::where('owner_id', $ownerId)->get();
        $categories = ExpenseCategory::where('owner_id', $ownerId)->get();

        $dataTable = new ExpenseDataTable;

        return $dataTable->render('expense/index', 'expenses', [
            'properties' => PropertyResource::collection($properties),
            'categories' => ExpenseCategoryResource::collection($categories),
        ]);
    }

    public function create(ExpenseRequest $request)
    {
        $data = $request->only(['property_id', 'expense_category_id', 'amount', 'expense_date', 'notes', 'receipt_attachment']);
        $result = $this->expenseService->create($data)->getResult();

        return redirect()->to($result['redirect'] ?? route('expenses.index'))->with('success', 'Catatan pengeluaran berhasil dibukukan.');
    }

    public function update(ExpenseRequest $request, $id)
    {
        $data = $request->only(['expense_category_id', 'amount', 'expense_date', 'notes', 'receipt_attachment']);
        $result = $this->expenseService->update(Helper::decrypt($id), $data)->getResult();

        return redirect()->to($result['redirect'] ?? route('expenses.index'))->with('success', 'Catatan pengeluaran berhasil diperbarui.');
    }

    public function delete(Request $request, $id)
    {
        $this->expenseService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Catatan dipindah ke tempat sampah.');
    }

    public function restore($id)
    {
        $this->expenseService->restore(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Catatan dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->expenseService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Catatan dihapus permanen.');
    }

    public function bulkDestroy(BulkActionExpenseRequest $request)
    {
        $this->expenseService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan dihapus.');
    }

    public function bulkForceDelete(BulkActionExpenseRequest $request)
    {
        $this->expenseService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan dihapus permanen.');
    }

    public function bulkRestore(BulkActionExpenseRequest $request)
    {
        $this->expenseService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' catatan dipulihkan.');
    }
}
