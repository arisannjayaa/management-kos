
export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Menggunakan teks inisial JD sebagai pengganti icon SVG */}
                <span className="text-sm font-bold tracking-wide">SM</span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    SANJAYA KOS
                </span>
            </div>
        </>
    );
}
