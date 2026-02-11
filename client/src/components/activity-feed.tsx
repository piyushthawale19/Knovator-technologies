'use client'

import { ImportLog } from '@/lib/api'
import { formatDateTime, formatDuration } from '@/lib/utils'

interface ActivityFeedProps {
    imports: ImportLog[]
}

export function ActivityFeed({ imports }: ActivityFeedProps) {
    if (imports.length === 0) {
        return (
            <div className='glass-elevated rounded-2xl p-8 text-center'>
                <p style={{ color: 'var(--color-text-muted)' }} className='text-sm'>
                    No recent activity.
                </p>
            </div>
        )
    }

    return (
        <div className='glass-elevated rounded-2xl overflow-hidden'>
            <div className='px-6 py-4' style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h3 className='text-sm font-semibold' style={{ color: 'var(--color-text-secondary)' }}>
                    Recent Imports
                </h3>
            </div>
            <div>
                {imports.map((log, idx) => {
                    const hasFailures = log.failedJobs > 0
                    const statusColor = hasFailures
                        ? 'bg-rose-400'
                        : 'bg-emerald-400'

                    return (
                        <div
                            key={log._id}
                            className='px-6 py-3.5 flex items-center gap-4 transition-colors'
                            style={{
                                borderBottom: idx < imports.length - 1
                                    ? '1px solid var(--color-divider)'
                                    : 'none',
                            }}
                        >
                            <div className='flex-shrink-0'>
                                <div
                                    className={`w-2.5 h-2.5 rounded-full ${statusColor} ${hasFailures ? '' : 'pulse-dot'
                                        }`}
                                />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p
                                    className='text-xs font-mono truncate'
                                    style={{ color: 'var(--color-accent-cyan)' }}
                                >
                                    {log.fileName}
                                </p>
                                <p
                                    className='text-[11px] mt-0.5'
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {formatDateTime(log.timestamp)}
                                </p>
                            </div>
                            <div className='flex-shrink-0 text-right'>
                                <p
                                    className='text-xs font-mono'
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {log.totalFetched} fetched
                                </p>
                                <p
                                    className='text-[11px]'
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {formatDuration(log.duration)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
