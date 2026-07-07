<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan Kos</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #1e293b; font-size: 20px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
        .summary-box { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .summary-box td { padding: 15px; text-align: center; border: 1px solid #e2e8f0; width: 33.33%; background: #f8fafc; }
        .summary-box .val { font-size: 18px; font-weight: bold; display: block; margin-top: 5px; }
        .text-green { color: #10b981; } .text-red { color: #ef4444; } .text-blue { color: #3b82f6; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1e293b; text-transform: uppercase; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        table.data-table th { background-color: #f1f5f9; font-weight: bold; color: #475569; }
        table.data-table td.money { text-align: right; font-family: monospace; font-weight: bold; }
        .total-row td { background-color: #f8fafc; font-weight: bold; }
    </style>
</head>
<body>

<div class="header">
    <h1>Buku Laporan Keuangan Kos</h1>
    <p><strong>Periode:</strong> {{ $period }} | <strong>Lokasi:</strong> {{ $property_name }}</p>
</div>

<table class="summary-box">
    <tr>
        <td>
            Total Pemasukan
            <span class="val text-green">Rp {{ number_format($summary['income'], 0, ',', '.') }}</span>
        </td>
        <td>
            Total Pengeluaran
            <span class="val text-red">Rp {{ number_format($summary['expense'], 0, ',', '.') }}</span>
        </td>
        <td>
            Laba Bersih (Net Profit)
            <span class="val text-blue">Rp {{ number_format($summary['profit'], 0, ',', '.') }}</span>
        </td>
    </tr>
</table>

<div class="section-title">1. Rincian Pendapatan (Incomes)</div>
<table class="data-table">
    <thead>
    <tr>
        <th width="5%">No</th>
        <th width="15%">Tanggal</th>
        <th width="15%">Kuitansi</th>
        <th width="20%">Penyewa</th>
        <th width="25%">Unit Kamar</th>
        <th width="20%" style="text-align: right;">Nominal Masuk</th>
    </tr>
    </thead>
    <tbody>
    @forelse ($incomes as $index => $inc)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $inc->payment_date->format('d/m/Y') }}</td>
            <td>{{ $inc->payment_number }}</td>
            <td>{{ $inc->invoice->tenant->name ?? '-' }}</td>
            <td>{{ $inc->invoice->property->name ?? '' }} - Kamar {{ $inc->invoice->room->room_number ?? '' }}</td>
            <td class="money text-green">Rp {{ number_format($inc->amount_paid, 0, ',', '.') }}</td>
        </tr>
    @empty
        <tr><td colspan="6" style="text-align:center; color:#94a3b8;">Belum ada pemasukan di periode ini.</td></tr>
    @endforelse
    @if(count($incomes) > 0)
        <tr class="total-row">
            <td colspan="5" style="text-align: right;">Subtotal Pemasukan:</td>
            <td class="money text-green">Rp {{ number_format($summary['income'], 0, ',', '.') }}</td>
        </tr>
    @endif
    </tbody>
</table>

<div class="section-title">2. Rincian Pengeluaran Operasional (Expenses)</div>
<table class="data-table">
    <thead>
    <tr>
        <th width="5%">No</th>
        <th width="15%">Tanggal</th>
        <th width="20%">Kategori</th>
        <th width="25%">Gedung</th>
        <th width="15%">Keterangan</th>
        <th width="20%" style="text-align: right;">Nominal Keluar</th>
    </tr>
    </thead>
    <tbody>
    @forelse ($expenses as $index => $exp)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $exp->expense_date->format('d/m/Y') }}</td>
            <td>{{ $exp->category->name ?? '-' }}</td>
            <td>{{ $exp->property->name ?? '-' }}</td>
            <td>{{ $exp->notes ?? '-' }}</td>
            <td class="money text-red">Rp {{ number_format($exp->amount, 0, ',', '.') }}</td>
        </tr>
    @empty
        <tr><td colspan="6" style="text-align:center; color:#94a3b8;">Tidak ada catatan pengeluaran di periode ini.</td></tr>
    @endforelse
    @if(count($expenses) > 0)
        <tr class="total-row">
            <td colspan="5" style="text-align: right;">Subtotal Pengeluaran:</td>
            <td class="money text-red">Rp {{ number_format($summary['expense'], 0, ',', '.') }}</td>
        </tr>
    @endif
    </tbody>
</table>

</body>
</html>
