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


/*NOTE:
    this model is responsible about storing the annual Subscribers
    when a new year starts the last year's Subscriber is going to be transferred here after that
    the storeStates collection data will be reset.

    TL;DR annualSubscriber => record for all the years ONLY,
        storeState => record for the current year's (days, weeks, months,)
*/
