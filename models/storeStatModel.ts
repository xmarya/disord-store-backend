import mongoose, { Schema } from "mongoose";
import { StoreStatsDocument } from "../_Types/StoreStats";

type StoreStatsModel = mongoose.Model<StoreStatsDocument>;

export const storeStatsSchema = new Schema<StoreStatsDocument>({
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "the store id is required"]
  },
  date: {
    /* OLD CODE (kept for reference): 
      type:Date.now(), is incorrect because Date.now() returns a timestamp immediately when the schema is loaded.
      Fix: Use default: Date.now without parentheses
    */
    type: Date,
    required: true,
    default: Date.now,
  },
  profits: Number,
  soldProducts:{
    type: Map,
    of: Number
  },
  numOfPurchases:Number,
  numOfCancellations:Number,
}, {
  timestamps: true,
  strict:true,
  strictQuery:true,
  toObject: {virtuals: true},
  toJSON: {virtuals: true}
});

storeStatsSchema.index({ store: 1, date: 1 });


storeStatsSchema.pre(/^find/, function(this:mongoose.Query<any, StoreStatsDocument>, next){
  // this.populate("store").select("storeName logo inPlan owner verified"); /*REQUIRES TESTING*/
  this.populate({
    path: "store", 
    options: {select: "storeName logo inPlan owner verified"} });
  next();
});

const StoreStats = mongoose.model<StoreStatsDocument, StoreStatsModel>("StoreStats", storeStatsSchema);

export default StoreStats;
