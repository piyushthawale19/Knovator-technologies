import { Job as JobModel } from '../models/job.model'
import { NormalizedJob } from '../types/job.types'

export interface UpsertResult {
    isNew: boolean
}


export async function upsertJob(data: NormalizedJob): Promise<UpsertResult> {
    const existing = await JobModel.findOne({ guid: data.guid })

    if (existing) {
        existing.title = data.title
        existing.company = data.company
        existing.location = data.location
        existing.description = data.description
        existing.url = data.url
        existing.publishedDate = data.publishedDate
        existing.source = data.source
        await existing.save()
        return { isNew: false }
    }

    await JobModel.create({
        guid: data.guid,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        url: data.url,
        publishedDate: data.publishedDate,
        source: data.source,
    })

    return { isNew: true }
}
