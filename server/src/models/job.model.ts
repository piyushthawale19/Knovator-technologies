import mongoose, { Schema, Document } from 'mongoose'

export interface IJob extends Document {
    guid: string
    title: string
    company: string
    location: string
    description: string
    url: string
    publishedDate: Date
    source: string
    createdAt: Date
    updatedAt: Date
}

const jobSchema = new Schema<IJob>(
    {
        guid: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        description: { type: String, default: '' },
        url: { type: String, required: true },
        publishedDate: { type: Date, default: Date.now },
        source: { type: String, required: true, index: true },
    },
    { timestamps: true, collection: 'jobs' },
)

jobSchema.index({ source: 1, publishedDate: -1 })

export const Job = mongoose.model<IJob>('Job', jobSchema)
