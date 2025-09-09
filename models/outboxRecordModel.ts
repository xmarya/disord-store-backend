import { OutboxRecordDocument } from "@Types/Schema/OutboxRecord";
import mongoose, { Schema } from "mongoose";

type OutboxRecordModel = mongoose.Model<OutboxRecordDocument>
const outboxRecordSchema = new Schema<OutboxRecordDocument>({
    type :{
        type:String,
        required:true
    },
    payload:{
        type: Schema.Types.Mixed,
        required:true
    },
    status: {
        type:String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    retryCount: {
        type:Number,
        default:0
    }
});

const OutboxRecord = mongoose.model<OutboxRecordDocument, OutboxRecordModel>("OutboxRecord", outboxRecordSchema, "outbox-records");

export default OutboxRecord