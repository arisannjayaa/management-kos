<?php

namespace App\Http\Controllers;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SecureFileController extends Controller
{
    /**
     * Menampilkan berkas secara inline (Stream Preview)
     */
    public function index($path)
    {
        try {
            $decrypted = Helper::decrypt($path);
            $newPath = storage_path('app/public/' . $decrypted);

            // Pengaman jika file fisik tidak ditemukan di disk
            abort_if(!File::exists($newPath), 404, 'Berkas dokumen tidak ditemukan.');

            return response()->file($newPath);
        } catch (\Exception $e) {
            abort(404, 'Gagal memproses dokumen.');
        }
    }

    /**
     * Memaksa browser melakukan unduh berkas (Force Download)
     */
    public function download($path)
    {
        try {
            $decrypted = Helper::decrypt($path);
            $newPath = storage_path('app/public/' . $decrypted);

            abort_if(!File::exists($newPath), 404, 'Berkas tidak ditemukan untuk diunduh.');

            return response()->download($newPath, basename($newPath));
        } catch (\Exception $e) {
            abort(404, 'Gagal mengunduh dokumen.');
        }
    }

    /**
     * Penyelaras Meta Data untuk komponen upload jika diperlukan
     */
    public function filepond($path)
    {
        try {
            $realDir = Helper::decrypt($path);
            $newPath = storage_path('app/public/' . $realDir);

            if (File::exists($newPath)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'file_name' => basename($newPath),
                        'url' => route('secure.file.download', ['path' => Helper::encrypt($realDir)]),
                    ]
                ], 200);
            }

            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'File error'], 404);
        }
    }
}
