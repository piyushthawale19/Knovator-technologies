'use client'

interface StatCardProps {
    label: string
    value: number
    accent: 'purple' | 'cyan' | 'pink' | 'green' | 'yellow' | 'red'
    icon: string
    subtitle?: string
}

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string }> = {
    purple: {
        text: 'var(--color-accent)',
        bg: 'rgba(163, 113, 247, 0.10)',
        border: 'rgba(163, 113, 247, 0.20)',
    },
    cyan: {
        text: 'var(--color-accent-cyan)',
        bg: 'rgba(57, 208, 216, 0.10)',
        border: 'rgba(57, 208, 216, 0.20)',
    },
    pink: {
        text: 'var(--color-accent-pink)',
        bg: 'rgba(247, 120, 186, 0.10)',
        border: 'rgba(247, 120, 186, 0.20)',
    },
    green: {
        text: '#10b981',
        bg: 'rgba(16, 185, 129, 0.10)',
        border: 'rgba(16, 185, 129, 0.20)',
    },
    yellow: {
        text: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.10)',
        border: 'rgba(245, 158, 11, 0.20)',
    },
    red: {
        text: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.10)',
        border: 'rgba(244, 63, 94, 0.20)',
    },
}

export function StatCard({ label, value, accent, icon, subtitle }: StatCardProps) {
    const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.purple

    return (
        <div
            className='glass rounded-2xl p-5 transition-all duration-300
                hover:scale-[1.03] group cursor-default'
            style={{ borderColor: colors.border }}
        >
            <div className='flex items-start justify-between mb-3'>
                <div
                    className='w-10 h-10 rounded-xl flex items-center justify-center
                        text-lg transition-transform duration-300 group-hover:scale-110'
                    style={{ background: colors.bg }}
                >
                    {icon}
                </div>
            </div>

            <p
                className='text-xs font-medium uppercase tracking-wider mb-1'
                style={{ color: 'var(--color-text-muted)' }}
            >
                {label}
            </p>
            <p
                className='text-3xl font-bold tabular-nums'
                style={{ color: colors.text }}
            >
                {value.toLocaleString()}
            </p>
            {subtitle && (
                <p
                    className='text-xs mt-1.5'
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    )
}
