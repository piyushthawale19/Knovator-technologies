'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
    fetchImportLogs,
    fetchDashboardStats,
    fetchQueueStatus,
    triggerImport,
    PaginatedLogs,
    DashboardStats,
    QueueStatus,
} from '@/lib/api'
import { ImportHistoryTable } from '@/components/import-history-table'
import { Pagination } from '@/components/pagination'
import { StatCard } from '@/components/ui/stat-card'
import { SourceChart } from '@/components/source-chart'
import { ActivityFeed } from '@/components/activity-feed'
import { JobBrowser } from '@/components/job-browser'
import { ThemeSwitch } from '@/components/ui/theme-switch'

type TabId = 'dashboard' | 'jobs' | 'imports'

/**
 * Main JobFeed Admin Dashboard Page
 */
export default function HomePage() {
    const hasMounted = useRef(false)
    const [activeTab, setActiveTab] = useState<TabId>('imports')
    const [logData, setLogData] = useState<PaginatedLogs | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
    const [logPage, setLogPage] = useState(1)
    const [logSearch, setLogSearch] = useState('')
    const [debouncedLogSearch, setDebouncedLogSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isImporting, setIsImporting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Use refs to avoid stale closures in loadData
    const pageRef = useRef(logPage)
    const searchRef = useRef(debouncedLogSearch)
    pageRef.current = logPage
    searchRef.current = debouncedLogSearch

    // Debounce import search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLogSearch(logSearch), 400)
        return () => clearTimeout(timer)
    }, [logSearch])

    // Reset page when search changes
    useEffect(() => {
        setLogPage(1)
    }, [debouncedLogSearch])

    // Stable loadData function — never changes reference
    const loadData = useCallback(async () => {
        if (!hasMounted.current) setIsLoading(true)
        setIsRefreshing(true)
        setError(null)
        try {
            const [statsRes, logsRes, queueRes] = await Promise.allSettled([
                fetchDashboardStats(),
                fetchImportLogs({
                    page: pageRef.current,
                    limit: 10,
                    search: searchRef.current || undefined,
                }),
                fetchQueueStatus(),
            ])
            if (statsRes.status === 'fulfilled') setStats(statsRes.value)
            if (logsRes.status === 'fulfilled') setLogData(logsRes.value)
            if (queueRes.status === 'fulfilled') setQueueStatus(queueRes.value)

            if (statsRes.status === 'rejected' && logsRes.status === 'rejected') {
                setError('Could not connect to the backend. Is the server running?')
            }
        } catch (err) {
            setError('Could not connect to the backend. Is the server running?')
            console.error(err)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
            hasMounted.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Load data once on mount
    useEffect(() => {
        loadData()
    }, [loadData])

    // Re-fetch when page or search changes
    useEffect(() => {
        if (hasMounted.current) loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logPage, debouncedLogSearch])

    const handleTriggerImport = async () => {
        setIsImporting(true)
        try {
            await triggerImport()
            setTimeout(() => {
                loadData()
                setIsImporting(false)
            }, 2000)
        } catch {
            setIsImporting(false)
        }
    }

    const tabs: { id: TabId; label: string; icon: string }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'imports', label: 'Import Logs', icon: '📋' },
        { id: 'jobs', label: 'Jobs', icon: '💼' },
    ]

    // Calculate totals for the current page of import logs
    const logTotals = logData?.logs.reduce(
        (acc, log) => ({
            fetched: acc.fetched + log.totalFetched,
            newJobs: acc.newJobs + log.newJobs,
            updated: acc.updated + log.updatedJobs,
            failed: acc.failed + log.failedJobs,
        }),
        { fetched: 0, newJobs: 0, updated: 0, failed: 0 },
    ) ?? { fetched: 0, newJobs: 0, updated: 0, failed: 0 }

    // Pagination range text
    const showingFrom = logData ? (logData.page - 1) * 10 + 1 : 0
    const showingTo = logData ? Math.min(logData.page * 10, logData.total) : 0

    return (
        <div className='min-h-screen bg-grid relative' style={{ background: 'var(--color-bg)' }}>
            <div className='bg-glow' />

            <div className='relative z-10'>
                {/* ---- header ---- */}
                <header
                    className='border-b backdrop-blur-md sticky top-0 z-20'
                    style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-header-bg)',
                    }}
                >
                    <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div
                                className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#a371f7] to-[#39d0d8]
                                    flex items-center justify-center text-white font-bold text-sm shadow-lg
                                    shadow-[#a371f7]/20'
                            >
                                JF
                            </div>
                            <div>
                                <h1 className='text-xl font-bold gradient-text'>
                                    JobFlow AI
                                </h1>
                                <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
                                    Import History Tracking
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            {/* System status pill */}
                            {queueStatus && (
                                <div className='hidden md:flex status-pill mr-2' style={{ color: 'var(--color-text-muted)' }}>
                                    <span className='w-2 h-2 rounded-full bg-emerald-400 pulse-dot' />
                                    <span style={{ color: 'var(--color-text-primary)' }} className='font-medium'>
                                        Online
                                    </span>
                                    <span style={{ color: 'var(--color-border)' }}>|</span>
                                    <span>
                                        Redis: <span style={{ color: 'var(--color-accent-cyan)' }}>{queueStatus.redisLatency}ms</span>
                                    </span>
                                    <span style={{ color: 'var(--color-border)' }}>|</span>
                                    <span>
                                        Queue: <span style={{ color: 'var(--color-text-primary)' }}>{queueStatus.waiting}</span> waiting
                                    </span>
                                </div>
                            )}

                            {/* Theme Switch Component */}
                            <ThemeSwitch />

                            {/* Sync Now */}
                            <button
                                onClick={handleTriggerImport}
                                disabled={isImporting}
                                className='ml-2 px-4 py-2 text-sm rounded-xl font-medium
                                    bg-gradient-to-r from-[#a371f7] to-[#39d0d8]
                                    text-white shadow-lg shadow-[#a371f7]/20
                                    hover:shadow-[#a371f7]/30 hover:scale-[1.03]
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    disabled:hover:scale-100'
                            >
                                {isImporting ? '⏳ Syncing…' : '⚡ Sync Now'}
                            </button>

                            {/* Refresh button with spinning SVG */}
                            <button
                                onClick={loadData}
                                disabled={isRefreshing}
                                className={`refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
                                aria-label='Refresh data'
                            >
                                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                    <path d='M21 2v6h-6' />
                                    <path d='M3 12a9 9 0 0 1 15-6.7L21 8' />
                                    <path d='M3 22v-6h6' />
                                    <path d='M21 12a9 9 0 0 1-15 6.7L3 16' />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ---- tabs ---- */}
                    <div className='max-w-7xl mx-auto px-6'>
                        <nav className='flex gap-1'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                                        }`}
                                >
                                    <span className='mr-1.5'>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </header>

                <main className='max-w-7xl mx-auto px-6 py-8'>
                    {/* ---- error ---- */}
                    {error && (
                        <div
                            className='glass rounded-2xl p-4 text-rose-500 text-sm mb-6
                                flex items-center gap-3'
                            style={{
                                background: 'var(--color-error-bg)',
                                borderColor: 'var(--color-error-border)',
                            }}
                        >
                            <span className='text-lg'>⚠️</span>
                            <div>
                                <p className='font-medium'>Connection Error</p>
                                <p className='text-rose-400/70 text-xs mt-0.5'>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* ---- loading skeleton ---- */}
                    {isLoading && !stats && !logData && (
                        <div className='space-y-6'>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='glass rounded-2xl p-5'>
                                        <div className='skeleton w-10 h-10 rounded-xl mb-3' />
                                        <div className='skeleton h-3 w-20 mb-2' />
                                        <div className='skeleton h-7 w-16' />
                                    </div>
                                ))}
                            </div>
                            <div className='glass rounded-2xl p-8'>
                                <div className='skeleton h-4 w-32 mb-6' />
                                <div className='space-y-4'>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className='skeleton h-12 w-full' />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========== Dashboard Tab =========== */}
                    {activeTab === 'dashboard' && stats && (
                        <div className='space-y-8 animate-[fade-up_0.35s_ease-out_both]'>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                <StatCard label='Total Jobs' value={stats.totalJobs} accent='purple' icon='💼' subtitle='All time' />
                                <StatCard label='New Today' value={stats.jobsToday} accent='green' icon='✨' subtitle='Since midnight' />
                                <StatCard label='Active Feeds' value={stats.activeFeedCount} accent='cyan' icon='📡' subtitle='Unique sources' />
                                <StatCard
                                    label='Last Duration'
                                    value={stats.lastImportDuration}
                                    accent='pink'
                                    icon='⚡'
                                    subtitle={stats.lastImportDuration < 1000 ? 'ms' : `${(stats.lastImportDuration / 1000).toFixed(1)}s`}
                                />
                            </div>
                            <div className='grid md:grid-cols-2 gap-6'>
                                <SourceChart data={stats.sourceBreakdown} />
                                <ActivityFeed imports={stats.recentImports} />
                            </div>
                        </div>
                    )}

                    {/* =========== Import History Tab (Primary View) =========== */}
                    {activeTab === 'imports' && (
                        <div className='space-y-6 animate-[fade-up_0.35s_ease-out_both]'>
                            {/* Title + description */}
                            <div>
                                <h2 className='text-2xl font-bold' style={{ color: 'var(--color-text-primary)' }}>
                                    Import History Tracking
                                </h2>
                                <p className='text-sm mt-1' style={{ color: 'var(--color-text-muted)' }}>
                                    Real-time status of job data ingestion from connected API feeds.
                                </p>
                            </div>

                            {/* Search bar */}
                            <div className='glass rounded-2xl p-3'>
                                <div className='relative'>
                                    <span className='absolute left-4 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-text-muted)' }}>
                                        🔍
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search imports by feed URL…'
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-2.5 rounded-xl
                                            border text-sm focus:outline-none transition-all'
                                        style={{
                                            background: 'var(--color-input-bg)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Summary stat cards */}
                            {logData && (
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                    <StatCard label='Total Ingested' value={logTotals.fetched} accent='purple' icon='📥' />
                                    <StatCard label='New Records' value={logTotals.newJobs} accent='green' icon='🆕' />
                                    <StatCard label='Updates' value={logTotals.updated} accent='cyan' icon='🔄' />
                                    <StatCard label='Failed' value={logTotals.failed} accent='red' icon='❌' />
                                </div>
                            )}

                            {/* Import history table */}
                            {logData && (
                                <>
                                    <ImportHistoryTable logs={logData.logs} />

                                    {/* Pagination with entry count */}
                                    <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                                        <span
                                            className='text-xs uppercase tracking-wider font-medium'
                                            style={{ color: 'var(--color-text-muted)' }}
                                        >
                                            Showing {showingFrom} to {showingTo} of{' '}
                                            <span style={{ color: 'var(--color-text-primary)' }}>
                                                {logData.total.toLocaleString()}
                                            </span>{' '}
                                            entries
                                        </span>
                                        {logData.totalPages > 1 && (
                                            <Pagination
                                                currentPage={logData.page}
                                                totalPages={logData.totalPages}
                                                onPageChange={setLogPage}
                                            />
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Import Definitions + Queue Status */}
                            <div className='grid md:grid-cols-3 gap-6 mt-4'>
                                {/* Import Definitions */}
                                <div className='md:col-span-2 glass rounded-2xl p-6'>
                                    <h3 className='text-sm font-semibold mb-3 flex items-center gap-2' style={{ color: 'var(--color-text-primary)' }}>
                                        <span className='w-2 h-2 rounded-full bg-amber-400' />
                                        Import Definitions
                                    </h3>
                                    <div className='space-y-2 text-xs' style={{ color: 'var(--color-text-muted)' }}>
                                        <p>
                                            <span className='font-semibold' style={{ color: 'var(--color-text-primary)' }}>Total:</span>{' '}
                                            Number of total jobs detected in the source feed.
                                        </p>
                                        <p>
                                            <span className='font-semibold text-emerald-500'>New:</span>{' '}
                                            Successfully created new job listings in MongoDB.
                                        </p>
                                        <p>
                                            <span className='font-semibold text-amber-500'>Updated:</span>{' '}
                                            Existing listings refreshed with new data.
                                        </p>
                                        <p>
                                            <span className='font-semibold text-rose-500'>Failed:</span>{' '}
                                            Entries rejected due to schema mismatch or API errors.
                                        </p>
                                    </div>
                                </div>

                                {/* Queue Status Widget */}
                                <div className='glass rounded-2xl p-6'>
                                    <h3 className='text-xs font-bold uppercase tracking-widest mb-3'
                                        style={{ color: 'var(--color-accent)' }}>
                                        Queue Status
                                    </h3>
                                    {queueStatus ? (
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between text-xs'>
                                                <span style={{ color: 'var(--color-text-muted)' }}>Redis Latency</span>
                                                <span className='font-mono font-semibold' style={{ color: 'var(--color-text-primary)' }}>
                                                    {queueStatus.redisLatency}ms
                                                </span>
                                            </div>
                                            {/* Latency bar */}
                                            <div className='progress-bar'>
                                                <div
                                                    className='progress-fill bg-gradient-to-r from-emerald-400 to-[#39d0d8]'
                                                    style={{
                                                        width: `${Math.min(100, Math.max(5, (queueStatus.redisLatency / 200) * 100))}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className='grid grid-cols-2 gap-2 mt-2'>
                                                <div className='text-center p-2 rounded-lg' style={{ background: 'var(--color-surface-hover)' }}>
                                                    <p className='text-lg font-bold' style={{ color: 'var(--color-text-primary)' }}>
                                                        {queueStatus.waiting}
                                                    </p>
                                                    <p className='text-[10px]' style={{ color: 'var(--color-text-muted)' }}>Waiting</p>
                                                </div>
                                                <div className='text-center p-2 rounded-lg' style={{ background: 'var(--color-surface-hover)' }}>
                                                    <p className='text-lg font-bold text-emerald-500'>
                                                        {queueStatus.active}
                                                    </p>
                                                    <p className='text-[10px]' style={{ color: 'var(--color-text-muted)' }}>Active</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
                                            Connecting…
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========== Jobs Tab =========== */}
                    {activeTab === 'jobs' && (
                        <div className='animate-[fade-up_0.35s_ease-out_both]'>
                            <JobBrowser />
                        </div>
                    )}
                </main>

                {/* ---- footer ---- */}
                <footer className='mt-12' style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div
                        className='max-w-7xl mx-auto px-6 py-6 text-center text-xs'
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <span className='gradient-text font-semibold'>JobFeed Admin Portal</span>
                        {' '}— Next.js · Express · MongoDB · BullMQ
                    </div>
                </footer>
            </div>
        </div>
    )
}
