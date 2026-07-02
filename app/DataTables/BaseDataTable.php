<?php

namespace App\DataTables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

abstract class BaseDataTable
{
    protected Request $request;

    public function __construct()
    {
        $this->request = request();
    }

    // Abstract method yang wajib diisi oleh class anaknya (modul spesifik)
    abstract public function query(): Builder;
    abstract public function search(Builder $query, string $keyword): void;
    abstract public function filter(Builder $query, Request $request): void;
    abstract public function sort(Builder $query, string $field, string $direction): void;
    abstract public function map($row): array;

    /**
     * Fungsi utama untuk mengeksekusi query dan melempar ke Inertia
     */
    public function render(string $component, string $propName = 'data', array $extraProps = [])
    {
        $query = $this->query();

        // 1. Eksekusi Search
        if ($search = $this->request->get('search')) {
            $this->search($query, $search);
        }

        // 2. Eksekusi Filter Dropdown
        $this->filter($query, $this->request);

        // 3. Eksekusi Sorting
        $sortField = $this->request->get('sort', 'created_at');
        $sortDir = in_array(strtolower($this->request->get('direction', 'desc')), ['asc', 'desc'])
            ? $this->request->get('direction', 'desc')
            : 'desc';

        $this->sort($query, $sortField, $sortDir);

        // 4. Eksekusi Pagination
        $perPage = in_array((int) $this->request->get('per_page', 10), [10, 25, 50, 100])
            ? (int) $this->request->get('per_page', 10)
            : 10;

        $paginator = $query->paginate($perPage)->withQueryString();

        // 5. Transformasi Data
        $paginator->through(fn ($row) => $this->map($row));

        // Gabungkan props Inertia
        $props = array_merge([
            $propName => $paginator,
            'filters' => $this->request->all(),
        ], $extraProps);

        return Inertia::render($component, $props);
    }
}
