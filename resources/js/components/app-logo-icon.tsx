import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 220 42" xmlns="http://www.w3.org/2000/svg">
            <text
                x="0"
                y="30"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="24"
                fontWeight="800"
                letterSpacing="0.05em"
            >
                <tspan fill="#393939">Sanjaya </tspan>{' '}
                {/* Ubah hex color sesuai tema Anda (contoh ini biru Tailwind) */}
                <tspan fill="#fd8932">Kost</tspan>
            </text>
        </svg>
    );
}
