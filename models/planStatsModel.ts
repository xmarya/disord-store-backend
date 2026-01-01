import { model, Schema, Model } from "mongoose";
import { PlanStatsDocument } from "@Types/Schema/Plan";

type PlanStatsModel = Model<PlanStatsDocument>
const planStatsSchema = new Schema<PlanStatsDocument>(
  {
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
      newSubscribers: {
        type: Number,
        default: 0,
      },
      renewals: {
        type: Number,
        default: 0,
      },
      upgrades: {
        type: Number,
        default: 0,
      },
      downgrades: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const PlanStats = model<PlanStatsDocument, PlanStatsModel>("PlanStats", planStatsSchema);
export default PlanStats;

/*NOTE:
  this model is responsible about storing the annual Subscribers
  when a new year starts the last year's Subscriber is going to be transferred here after that
  the storeStates collection data will be reset.
*/
