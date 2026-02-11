import { parseStringPromise } from 'xml2js'
import { NormalizedJob } from '../types/job.types'

/**
 * Extract a scalar string from an XML-parsed value.
 * xml2js wraps values in arrays by default and guid
 * can be an object with _ (text) and $ (attributes).
 */
function extractText(val: unknown): string {
    if (val == null) return ''
    if (Array.isArray(val)) {
        const first = val[0]
        if (first != null && typeof first === 'object' && '_' in first) {
            return String(first._ ?? '')
        }
        return String(first ?? '')
    }
    if (typeof val === 'object' && val !== null && '_' in val) {
        return String((val as Record<string, unknown>)._ ?? '')
    }
    if (typeof val === 'string') return val
    return ''
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim()
}

/**
 * Parse an RSS/XML feed and return normalised job objects.
 * Uses strict:false to handle feeds with malformed HTML (e.g. HigherEdJobs).
 */
export async function parseJobFeed(
    xml: string,
    sourceUrl: string,
): Promise<NormalizedJob[]> {
    const result = await parseStringPromise(xml, {
        explicitArray: true,
        strict: false,
        normalizeTags: true,
    })

    // RSS feeds: rss > channel > item
    const channel = result?.rss?.channel?.[0] ?? result?.RSS?.CHANNEL?.[0]
    const items: unknown[] = channel?.item ?? channel?.ITEM ?? []

    const jobs: NormalizedJob[] = []

    for (const item of items as Record<string, unknown>[]) {
        try {
            const guid =
                extractText(item.guid) || extractText(item.GUID) ||
                extractText(item.link) || extractText(item.LINK)
            const title = stripHtml(
                extractText(item.title) || extractText(item.TITLE),
            )
            const link =
                extractText(item.link) || extractText(item.LINK)

            if (!guid || !title || !link) continue

            const rawDesc =
                extractText(item.description) || extractText(item.DESCRIPTION) ||
                extractText(item['content:encoded']) || ''

            jobs.push({
                guid,
                title,
                company:
                    extractText(item['dc:creator']) ||
                    extractText(item.company) ||
                    extractText(item.COMPANY) ||
                    'Unknown',
                location:
                    extractText(item.location) ||
                    extractText(item.LOCATION) ||
                    'Remote',
                description: stripHtml(rawDesc).slice(0, 5000),
                url: link,
                publishedDate: item.pubdate || item.pubDate || item.PUBDATE
                    ? new Date(
                        extractText(item.pubdate) ||
                        extractText(item.pubDate) ||
                        extractText(item.PUBDATE),
                    )
                    : new Date(),
                source: sourceUrl,
            })
        } catch {
            continue
        }
    }

    return jobs
}
