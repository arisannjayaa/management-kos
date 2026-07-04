// resources/js/components/wysiwyg-editor.tsx

import { useEditor, EditorContent  } from '@tiptap/react';
import type {Editor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Eraser } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button'; // Pastikan path Button Shadcn Anda benar
import { cn } from '@/lib/utils';

interface WysiwygEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// ─── Komponen Toolbar Atas ────────────────────────────────────────────────
const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
return null;
}

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/50">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn('h-8 w-8', editor.isActive('bold') && 'bg-slate-200 dark:bg-slate-800')}
            >
                <Bold className="size-4" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn('h-8 w-8', editor.isActive('italic') && 'bg-slate-200 dark:bg-slate-800')}
            >
                <Italic className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn('h-8 w-8', editor.isActive('bulletList') && 'bg-slate-200 dark:bg-slate-800')}
            >
                <List className="size-4" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn('h-8 w-8', editor.isActive('orderedList') && 'bg-slate-200 dark:bg-slate-800')}
            >
                <ListOrdered className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                title="Hapus Format"
            >
                <Eraser className="size-4" />
            </Button>
        </div>
    );
};

// ─── Komponen Utama Editor ────────────────────────────────────────────────
export function WysiwygEditor({ value, onChange, placeholder, className }: WysiwygEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        onUpdate: ({ editor }) => {
            // [BARU] Tiptap akan otomatis mengecek apakah isinya benar-benar kosong
            // (walaupun ada <p></p> di HTML-nya).
            if (editor.isEmpty) {
                onChange(''); // Jika kosong, paksa kirim string kosong (nanti jadi null di backend)
            } else {
                onChange(editor.getHTML()); // Jika ada teks, kirim HTML-nya
            }
        },
        editorProps: {
            attributes: {
                // Class Tailwind untuk merapikan teks di dalam editor
                class: cn(
                    'prose prose-sm dark:prose-invert min-h-[120px] max-w-none p-3 focus:outline-none',
                    // Memaksa list (bullet) agar terlihat saat diketik di Tiptap
                    '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5',
                    '[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5',
                    '[&_p]:my-1',
                ),
            },
        },
    });

    // Menjaga agar editor tetap sinkron jika value direset dari luar (misal saat form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-md border border-[var(--border)] bg-transparent',
                // Cincin fokus Shadcn UI
                'focus-within:ring-1 focus-within:ring-[var(--ring)]',
                className
            )}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
}
