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
      required: [true, "the quota ofProducts is required"],
    },
    ofCategories: {
      type: Number,
      required: [true, "the quota ofCategories is required"],
    },
    ofStoreAssistants: {
      type: Number,
      required: [true, "the quota ofStoreAssistants is required"],
    },
    ofColourThemes: {
      type: Number,
      required: [true, "the quota ofColourThemes is required"],
    },
    ofCommission: {
      type: Number, // in riyals
      required: [true, "the quota ofCommission is required"],
    },
    ofShipmentCompanies: {
      type: Number,
      required: [true, "the quota ofShipmentCompanies is required"],
    },
  },
  discount: {
    type: Number,
    default: 0.0,
  },
  unlimitedUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Plan = model<PlanDocument, PlanModel>("Plan", planSchema);

export default Plan;
