import { PlanStatsDocument } from "../_Types/Plan";
import { Model, Schema, model } from "mongoose";

type PlanStatsModel = Model<PlanStatsDocument>;
const planStatsSchema = new Schema({
  planName: {
    type: String,
    enum: ["basic", "plus", "unlimited"],
    required: [true, "the name field is required"],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  monthly: {
    subscribers: {
      type: Number,
      default: 0,
    },
    profits: {
      type: Number,
      default: 0,
    },
  },
  annual: {
    subscribers: {
      type: Number,
      default: 0,
    },
    profits: {
      type: Number,
      default: 0,
    },
  },
  totalSubscribers: Number, // OAT
  totalProfits: Number, // OAT
});

const PlanStats = model<PlanStatsDocument, PlanStatsModel>("PlanStats", planStatsSchema);

export default PlanStats;
