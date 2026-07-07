<?php

namespace App\Http\Controllers;

use App\DataTables\ExpenseCategoryDataTable;
use App\Helpers\Helper;
use App\Http\Requests\BulkActionExpenseCategoryRequest;
use App\Http\Requests\ExpenseCategoryRequest;
use App\Services\ExpenseCategory\ExpenseCategoryService;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    protected ExpenseCategoryService $expenseCategoryService;

    public function __construct(ExpenseCategoryService $expenseCategoryService)
    {
        $this->expenseCategoryService = $expenseCategoryService;
    }

    public function index(Request $request)
    {
        $dataTable = new ExpenseCategoryDataTable;

        return $dataTable->render('expense-category/index', 'expense_categories');
    }

    public function create(ExpenseCategoryRequest $request)
    {
        $data = $request->only(['name', 'description']); // Controller hanya only() field dari Request lalu panggil Service[cite: 3]
        $result = $this->expenseCategoryService->create($data)->getResult();

        return redirect()->to($result['redirect'] ?? route('expense_categories.index'))->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(ExpenseCategoryRequest $request, $id)
    {
        $data = $request->only(['name', 'description']);
        $result = $this->expenseCategoryService->update(Helper::decrypt($id), $data)->getResult();

        return redirect()->to($result['redirect'] ?? route('expense_categories.index'))->with('success', 'Kategori berhasil diperbarui.');
    }

    public function delete(Request $request, $id)
    {
        $this->expenseCategoryService->delete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    public function restore($id)
    {
        $this->expenseCategoryService->restore(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Kategori dipulihkan.');
    }

    public function forceDelete($id)
    {
        $this->expenseCategoryService->forceDelete(Helper::decrypt($id));

        return redirect()->back()->with('success', 'Kategori dihapus permanen.');
    }

    public function bulkDestroy(BulkActionExpenseCategoryRequest $request)
    {
        $this->expenseCategoryService->bulkDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' kategori dihapus.');
    }

    public function bulkForceDelete(BulkActionExpenseCategoryRequest $request)
    {
        $this->expenseCategoryService->bulkForceDelete($request->ids);

        return redirect()->back()->with('success', count($request->ids).' kategori dihapus permanen.');
    }

    public function bulkRestore(BulkActionExpenseCategoryRequest $request)
    {
        $this->expenseCategoryService->bulkRestore($request->ids);

        return redirect()->back()->with('success', count($request->ids).' kategori dipulihkan.');
    }
}
