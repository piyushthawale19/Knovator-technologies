'use client'

import { ImportLog } from '@/lib/api'
import { formatDateTime, formatDuration } from '@/lib/utils'

interface ImportHistoryTableProps {
    logs: ImportLog[]
}

export function ImportHistoryTable({ logs }: ImportHistoryTableProps) {
    if (logs.length === 0) {
        return (
            <div className='glass-elevated rounded-2xl p-12 text-center'>
                <p className='text-4xl mb-3'>📋</p>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    No import history yet. Imports will appear once the cron job runs.
                </p>
            </div>
        )
    }

    return (
        <div className='glass-elevated rounded-2xl overflow-hidden'>
            {/* header */}
            <div
                className='px-6 py-4 flex items-center justify-between'
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                <h2 className='text-sm font-semibold' style={{ color: 'var(--color-text-secondary)' }}>
                    📋 Import History Tracking
                </h2>
                <span className='text-xs font-mono' style={{ color: 'var(--color-text-muted)' }}>
                    {logs.length} entries
                </span>
            </div>

            {/* table */}
            <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {['Feed URL', 'Import Date', 'Total', 'New', 'Updated', 'Failed', 'Duration'].map(
                                (header, i) => (
                                    <th
                                        key={header}
                                        className={`${i < 2 ? 'text-left' : 'text-right'} px-6 py-3 font-medium text-[11px] uppercase tracking-wider`}
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        {header}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, idx) => (
                            <tr
                                key={log._id}
                                className='transition-colors'
                                style={{
                                    borderBottom: '1px solid var(--color-divider)',
                                    animation: `fade-up 0.3s ease-out both`,
                                    animationDelay: `${idx * 40}ms`,
                                }}
                            >
                                <td
                                    className='px-6 py-3.5 font-mono text-xs truncate max-w-[220px]'
                                    style={{ color: 'var(--color-accent-cyan)' }}
                                >
                                    {log.fileName}
                                </td>
                                <td
                                    className='px-6 py-3.5 whitespace-nowrap text-xs'
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {formatDateTime(log.timestamp)}
                                </td>
                                <td
                                    className='px-6 py-3.5 text-right font-mono font-medium text-xs'
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {log.totalFetched}
                                </td>
                                <td className='px-6 py-3.5 text-right font-mono font-medium text-emerald-500 text-xs'>
                                    {log.newJobs}
                                </td>
                                <td className='px-6 py-3.5 text-right font-mono font-medium text-amber-500 text-xs'>
                                    {log.updatedJobs}
                                </td>
                                <td className='px-6 py-3.5 text-right font-mono font-medium text-xs'>
                                    <span className={log.failedJobs > 0 ? 'text-rose-500' : ''}
                                        style={log.failedJobs === 0 ? { color: 'var(--color-text-muted)' } : {}}>
                                        {log.failedJobs}
                                    </span>
                                </td>
                                <td
                                    className='px-6 py-3.5 text-right text-xs font-mono'
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    {formatDuration(log.duration)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
