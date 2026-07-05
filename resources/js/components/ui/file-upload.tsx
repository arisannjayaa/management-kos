// resources/js/components/ui/file-upload.tsx

import { UploadCloud, FileText, X, Eye } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type FileUploadProps = {
    label: string;
    accept?: string;
    maxSizeMB?: number;
    existingFileUrl?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
};

export function FileUpload({
                               label,
                               accept = 'image/jpeg,image/png,image/jpg,application/pdf',
                               maxSizeMB = 2,
                               existingFileUrl = null,
                               onChange,
                               error,
                           }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFile = (file: File) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`Ukuran berkas terlalu besar! Maksimal batas ukuran adalah ${maxSizeMB}MB.`);
            return;
        }
        setSelectedFile(file);
        onChange(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const onDragLeave = () => {
        setIsDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        onChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-1.5 w-full">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">{label}</span>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center min-h-[110px] rounded-2xl border-2 border-dashed border-border bg-card p-4 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/10",
                    isDragActive && "border-primary bg-primary/5 scale-[0.99]",
                    error && "border-red-500 bg-red-50/10 hover:border-red-500"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={onFileSelect}
                    className="hidden"
                />

                {/* State A: Jika ada file baru dipilih */}
                {selectedFile ? (
                    <div className="flex w-full items-center justify-between rounded-xl border bg-background p-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <FileText size={16} />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                                <span className="truncate text-xs font-bold text-foreground max-w-[180px] sm:max-w-xs">{selectedFile.name}</span>
                                <span className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                        </div>
                        <button type="button" onClick={clearSelection} className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-red-500 rounded-lg hover:bg-secondary transition-colors"><X size={14} /></button>
                    </div>
                ) : existingFileUrl ? (
                    /* State B: Jika dalam mode Edit dan dokumen sudah ada di storage */
                    <div className="flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                                <FileText size={16} />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Dokumen_Tersimpan.pdf/Image</span>
                                <span className="text-[10px] text-muted-foreground/80">Klik "Pilih File" untuk memperbarui</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <a href={existingFileUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="h-7 w-7 flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"><Eye size={14} /></a>
                        </div>
                    </div>
                ) : (
                    /* State C: Kosong (Default View Dropzone) */
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-secondary/60 text-slate-400"><UploadCloud size={20} /></div>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-bold text-foreground">Tarik berkas ke sini atau <span className="text-primary hover:underline">Pilih File</span></p>
                            <p className="text-[10px] text-muted-foreground font-medium">Format PDF, JPG, atau PNG (Maks. {maxSizeMB}MB)</p>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 animate-in pl-0.5 text-xs font-semibold text-red-500 duration-150 fade-in-50">{error}</p>}
        </div>
    );
}
