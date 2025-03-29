import { PlanDocument } from "../_Types/Plan";
import { Model, Schema, model } from "mongoose";

type PlanModel = Model<PlanDocument>;
const planSchema = new Schema({
  planName: {
    type: String,
    enum: ["basic", "plus", "unlimited"],
    required: [true, "the name field is required"],
  },
  price: {
    riyal: {
      type: Number,
      required: [true, "the price field is required"],
    },
    dollar: {
      type: Number,
      required: [true, "the price field is required"],
    },
  },
  features: [String],
  quota: {
    ofProducts: {
      type: Number,
    },
    ofCategories: {
      type: Number,
    },
    ofStoreAssistants: {
      type: Number,
    },
    ofColourThemes: {
      type: Number,
    },
    ofCommission: {
      type: Number, // in riyals
    },
  },
  discount: {
    type: Number,
    default: 0.0,
  },
  thisMonthSubscribers: {
    type: Number,
    default: 0,
  },
  lastMonthSubscribers: {
    type: Number,
    default: 0,
  },
});

const Plan = model<PlanDocument, PlanModel>("Plan", planSchema);

export default Plan;
