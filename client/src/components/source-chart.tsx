'use client'

import { SourceBreakdown } from '@/lib/api'

interface SourceChartProps {
    data: SourceBreakdown[]
}

const BAR_COLORS = [
    'bg-[#a371f7]',
    'bg-[#39d0d8]',
    'bg-[#f778ba]',
    'bg-emerald-400',
    'bg-amber-400',
    'bg-rose-400',
    'bg-sky-400',
    'bg-violet-400',
    'bg-orange-400',
]

function extractDomain(url: string): string {
    try {
        const domain = new URL(url).hostname.replace('www.', '')
        return domain.length > 25 ? domain.slice(0, 22) + '...' : domain
    } catch {
        return url.length > 25 ? url.slice(0, 22) + '...' : url
    }
}

export function SourceChart({ data }: SourceChartProps) {
    if (data.length === 0) {
        return (
            <div className='glass rounded-2xl p-8 text-center'>
                <p style={{ color: 'var(--color-text-muted)' }} className='text-sm'>
                    No source data yet.
                </p>
            </div>
        )
    }

    const maxCount = Math.max(...data.map((s) => s.count), 1)

    return (
        <div className='glass-elevated rounded-2xl overflow-hidden'>
            <div className='px-6 py-4' style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h3 className='text-sm font-semibold' style={{ color: 'var(--color-text-secondary)' }}>
                    Jobs by Source
                </h3>
            </div>
            <div className='p-6 space-y-4'>
                {data.map((source, idx) => {
                    const pct = Math.round((source.count / maxCount) * 100)
                    const color = BAR_COLORS[idx % BAR_COLORS.length]

                    return (
                        <div key={source.source}>
                            <div className='flex items-center justify-between mb-1.5'>
                                <span
                                    className='text-xs font-mono truncate max-w-[200px]'
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {extractDomain(source.source)}
                                </span>
                                <span
                                    className='text-xs font-mono font-medium ml-3'
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {source.count.toLocaleString()}
                                </span>
                            </div>
                            <div className='progress-bar'>
                                <div
                                    className={`progress-fill ${color}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
