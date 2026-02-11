/**
 * Format a date string for display.
 */
export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso))
}

/**
 * Format a duration in ms to a readable string.
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60
    return `${minutes}m ${remaining}s`
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}
