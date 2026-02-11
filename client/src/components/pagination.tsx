'use client'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div className='flex items-center justify-between text-sm'>
            <span style={{ color: 'var(--color-text-muted)' }}>
                Page{' '}
                <span className='font-semibold' style={{ color: 'var(--color-text-primary)' }}>
                    {currentPage}
                </span>{' '}
                of{' '}
                <span className='font-semibold' style={{ color: 'var(--color-text-primary)' }}>
                    {totalPages}
                </span>
            </span>

            <div className='flex gap-2'>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className='px-3.5 py-1.5 rounded-xl border
                        disabled:opacity-30 disabled:cursor-not-allowed
                        transition-all duration-200 text-xs font-medium'
                    style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                    }}
                    aria-label='Previous page'
                >
                    ← Prev
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className='px-3.5 py-1.5 rounded-xl border
                        disabled:opacity-30 disabled:cursor-not-allowed
                        transition-all duration-200 text-xs font-medium'
                    style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                    }}
                    aria-label='Next page'
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
