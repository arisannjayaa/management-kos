import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"


const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()
    const isMobile = useIsMobile()

    return (
        <Sonner
            position={isMobile ? "top-center" : "bottom-right"}
            theme={theme as ToasterProps["theme"]}
            richColors
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",

                    // Success
                    "--success-bg": "var(--color-green-50)",
                    "--success-text": "var(--color-green-900)",
                    "--success-border": "var(--color-green-200)",

                    // Error
                    "--error-bg": "var(--color-red-50)",
                    "--error-text": "var(--color-red-900)",
                    "--error-border": "var(--color-red-200)",

                    // Warning
                    "--warning-bg": "var(--color-amber-50)",
                    "--warning-text": "var(--color-amber-900)",
                    "--warning-border": "var(--color-amber-200)",

                    // Info
                    "--info-bg": "var(--color-blue-50)",
                    "--info-text": "var(--color-blue-900)",
                    "--info-border": "var(--color-blue-200)",
                } as React.CSSProperties
            }
            {...props}
        />
    )
}

export { Toaster }
