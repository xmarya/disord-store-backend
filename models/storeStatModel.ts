import { StoreStateDocument } from "../_Types/StoreStat";
import { Model, Schema, model, models } from "mongoose";

type StoreStateModel = Model<StoreStateDocument>;

/* SOLILOQUY: should this be a separate collection ? since I would definitely do different CRUD and quires and something like statistics are frequently read/updated so it's better to be separated */
const storeStatSchema = new Schema<StoreStateDocument>({
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    // unique: true // prevent any redundancy
    /* SOLILOQUY: after rethinking, trying to avoid the redundancy will make all the 
                  data to be in on doc which is a real danger that causes the doc to hit the 16MB limit!
                  so, I decided to remove the uniqueness + array of stored data */
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
  daily: {
    type: Number,
    default: 0.0,
  },
  weekly: {
    /* SOLILOQUY: not sure about this property, when should the week start and when should end? 
                I'll set it so start on Sunday 00:00AM and ends on Saturday 11:59PM
    */
    type: Number,
    default: 0.0,
  },
  monthly: {
    type: Number,
    default: 0.0,
  },
  annual: {
    type: Number,
    default: 0.0,
  },
  totalProfit: {
    //NOTE: total profits THIS POINT OF THE YEAR SO FAR
    type: Number,
    default: 0.0,
  },
  // lastUpdated: {
  //   // Track last modification time
  //   type: Date,
  //   default: Date.now,
  // },
});

storeStatSchema.index({ store: 1, date: 1 });

const StoreStat =
  models?.StoreState ||
  model<StoreStateDocument, StoreStateModel>("StoreStat", storeStatSchema);

export default StoreStat;

/*TODO:
  1- the logic to handle the stores' profit is going to be inside invoiceModels's post middleware.
  so it will be automatic operation without the need
  to create middleware and a route to handle it after handling the invoice.
  also and the most important thing is TO BATCH the profits.

  2- Make a cron task to: 
    a) start a new day.
    b) start a new week.
    c) start a new month.
    d) start a new year.
    e) transfer/insert the totalProfits field to annualProfit Model (acts like an archive).
    f) reset/delete the whole records in storeState Model.

*/
