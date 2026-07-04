<?php

namespace App\Http\Controllers;

use App\Helpers\Helper;
use App\Http\Resources\PersonalFinancialSnapshotResource;
use App\Models\Account;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\PersonalFinancialSnapshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menyuplai data untuk halaman Dashboard & Stats Utama.
     */
    public function index(Request $request): Response
    {

        // ─── 3. LEMPAR DATA KE FRONTEND VIA INERTIA ───
        return Inertia::render('dashboard');
    }
}
