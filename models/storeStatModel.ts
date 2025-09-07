import mongoose, { Schema } from "mongoose";
import { StoreStatsDocument } from "@Types/Schema/StoreStats";

type StoreStatsModel = mongoose.Model<StoreStatsDocument>;

export const storeStatsSchema = new Schema<StoreStatsDocument>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "the store id is required"],
    },
    date: {
      /* OLD CODE (kept for reference): 
      type:Date.now(), is incorrect because Date.now() returns a timestamp immediately when the schema is loaded.
      Fix: Use default: Date.now without parentheses
    */
      type: Date,
      required: true,
    },
    profits: {
      type: Number,
      set: (profit: number) => Math.round(profit * 10) / 10,
      required: [true, "the profits fields is required"],
    },
    soldProducts: {
      type: Map,
      of: Number,
      default: () => new Map(), // this is a must; since mongoose doesn't add and undefined field and empty Maps
      required: [true, "the data of soldProducts is required"],
    },
    numOfPurchases: { type: Number, required: [true, "the data of numOfPurchases is required"] },
    numOfCancellations: { type: Number, required: [true, "the data of numOfCancellations is required"] },
  },
  {
    // timestamps: true, it's a duplicated to the date
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

storeStatsSchema.index({ store: 1, date: 1 });
storeStatsSchema.index({ store: 1 });

storeStatsSchema.pre(/^find/, function (this: mongoose.Query<any, StoreStatsDocument>, next) {
  this.populate({
    path: "store",
    options: { select: "storeName logo inPlan owner verified" },
  });
  next();
});

const StoreStats = mongoose.model<StoreStatsDocument, StoreStatsModel>("StoreStats", storeStatsSchema);

export default StoreStats;
