'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchJobs, JobListing, PaginatedJobs } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import { Pagination } from './pagination'

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '')
    } catch {
        return url
    }
}

export function JobBrowser() {
    const [data, setData] = useState<PaginatedJobs | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(timer)
    }, [search])

    const loadJobs = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await fetchJobs({
                page,
                limit: 15,
                search: debouncedSearch || undefined,
            })
            setData(result)
        } catch (err) {
            console.error('Failed to load jobs:', err)
        } finally {
            setIsLoading(false)
        }
    }, [page, debouncedSearch])

    useEffect(() => {
        loadJobs()
    }, [loadJobs])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    return (
        <div className='space-y-6'>
            {/* Search bar */}
            <div className='glass rounded-2xl p-4'>
                <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-text-muted)' }}>
                        🔍
                    </span>
                    <input
                        type='text'
                        placeholder='Search jobs by title, company, or location…'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='w-full pl-11 pr-4 py-3 rounded-xl
                            border text-sm focus:outline-none
                            transition-all'
                        style={{
                            background: 'var(--color-input-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    {data && (
                        <span
                            className='absolute right-4 top-1/2 -translate-y-1/2
                                text-xs font-mono'
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {data.total.toLocaleString()} jobs
                        </span>
                    )}
                </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && !data && (
                <div className='space-y-3'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className='glass rounded-2xl p-5'>
                            <div className='skeleton h-5 w-3/5 mb-3' />
                            <div className='skeleton h-4 w-2/5 mb-2' />
                            <div className='skeleton h-3 w-1/4' />
                        </div>
                    ))}
                </div>
            )}

            {/* Job cards */}
            {data && (
                <div className='space-y-3'>
                    {data.jobs.length === 0 ? (
                        <div className='glass rounded-2xl p-12 text-center'>
                            <p className='text-4xl mb-3'>🔎</p>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                {search
                                    ? `No jobs found for "${search}"`
                                    : 'No jobs imported yet. Trigger an import to get started.'}
                            </p>
                        </div>
                    ) : (
                        data.jobs.map((job: JobListing) => (
                            <JobCard key={job._id} job={job} />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    )
}

function JobCard({ job }: { job: JobListing }) {
    return (
        <a
            href={job.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block glass rounded-2xl p-5 group
                transition-all duration-300 hover:translate-x-1'
        >
            <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                    <h3
                        className='text-sm font-semibold transition-colors truncate'
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {job.title}
                    </h3>
                    <div className='flex items-center gap-3 mt-1.5'>
                        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
                            {job.company}
                        </span>
                        {job.location && (
                            <>
                                <span style={{ color: 'var(--color-border-strong)' }}>·</span>
                                <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
                                    📍 {job.location}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className='flex-shrink-0 text-right'>
                    <span
                        className='inline-block px-2.5 py-1 text-[10px] font-mono
                            rounded-full border'
                        style={{
                            background: 'rgba(163, 113, 247, 0.10)',
                            color: 'var(--color-accent)',
                            borderColor: 'rgba(163, 113, 247, 0.20)',
                        }}
                    >
                        {extractDomain(job.source)}
                    </span>
                    <p
                        className='text-[11px] mt-1.5'
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {timeAgo(job.publishedDate)}
                    </p>
                </div>
            </div>
        </a>
    )
}
