import axios from 'axios'

// Ensure the API URL always ends with /api to avoid double slashes or missing paths
const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1)
    }
    // Append /api if not present
    if (!url.endsWith('/api')) {
        url += '/api'
    }
    return url
}

const API = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15_000,
})

/* ---- Import Logs ---- */

export interface ImportLog {
    _id: string
    timestamp: string
    fileName: string
    totalFetched: number
    totalImported: number
    newJobs: number
    updatedJobs: number
    failedJobs: number
    duration: number
}

export interface PaginatedLogs {
    logs: ImportLog[]
    total: number
    page: number
    totalPages: number
}

export async function fetchImportLogs(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    search?: string
}): Promise<PaginatedLogs> {
    const { data } = await API.get('/import-logs', { params })
    return data.data
}

/* ---- Dashboard Stats ---- */

export interface SourceBreakdown {
    source: string
    count: number
    latestJob: string | null
}

export interface DashboardStats {
    totalJobs: number
    jobsToday: number
    activeFeedCount: number
    lastImportAt: string | null
    lastImportDuration: number
    recentImports: ImportLog[]
    sourceBreakdown: SourceBreakdown[]
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const { data } = await API.get('/jobs/dashboard')
    return data.data
}

/* ---- Queue Status ---- */

export interface QueueStatus {
    redisLatency: number
    waiting: number
    active: number
    completed: number
    failed: number
}

export async function fetchQueueStatus(): Promise<QueueStatus> {
    const { data } = await API.get('/jobs/queue')
    return data.data
}

/* ---- Jobs ---- */

export interface JobListing {
    _id: string
    guid: string
    title: string
    company: string
    location: string
    url: string
    publishedDate: string
    source: string
    createdAt: string
    updatedAt: string
}

export interface PaginatedJobs {
    jobs: JobListing[]
    total: number
    page: number
    totalPages: number
}

export async function fetchJobs(params?: {
    page?: number
    limit?: number
    search?: string
    source?: string
}): Promise<PaginatedJobs> {
    const { data } = await API.get('/jobs', { params })
    return data.data
}

/* ---- Trigger Import ---- */

export async function triggerImport(): Promise<{ success: boolean; message: string }> {
    const { data } = await API.post('/import/trigger')
    return data
}
