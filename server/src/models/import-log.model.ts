import mongoose, { Schema, Document } from 'mongoose'

export interface IImportLog extends Document {
    timestamp: Date
    fileName: string
    totalFetched: number
    totalImported: number
    newJobs: number
    updatedJobs: number
    failedJobs: number
    failures: Array<{ jobId: string; reason: string }>
    duration: number
}

const importLogSchema = new Schema<IImportLog>(
    {
        timestamp: { type: Date, required: true, index: true },
        fileName: { type: String, required: true, index: true },
        totalFetched: { type: Number, default: 0 },
        totalImported: { type: Number, default: 0 },
        newJobs: { type: Number, default: 0 },
        updatedJobs: { type: Number, default: 0 },
        failedJobs: { type: Number, default: 0 },
        failures: [{ jobId: String, reason: String }],
        duration: { type: Number, default: 0 },
    },
    { timestamps: true, collection: 'import_logs' },
)

importLogSchema.index({ timestamp: -1 })

export const ImportLog = mongoose.model<IImportLog>('ImportLog', importLogSchema)
