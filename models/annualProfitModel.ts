import { AnnualProfitDocument } from "../_Types/AnnualProfit";
import { Model, Schema, model } from "mongoose";

type AnnualProfitModel = Model<AnnualProfitDocument>;
const annualProfitSchema = new Schema<AnnualProfitDocument>({
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    // unique: true
  },
  year: {
    type: String,
    required: true,
  },
  totalProfit: {
    //NOTE: the total of store's profit from establishing it (of all the years)
    type: Number,
    required: true,
  },
});

annualProfitSchema.index({ store: 1, year: 1 });

const AnnualProfit =

  model<AnnualProfitDocument, AnnualProfitModel>(
    "AnnualProfit",
    annualProfitSchema
  );

export default AnnualProfit;

/*NOTE:
    this model is responsible about storing the annual profits
    when a new year starts the last year's profit is going to be transferred here after that
    the storeStates collection data will be reset.

    TL;DR annualProfit => record for all the years ONLY,
          storeState => record for the current year's (days, weeks, months,)
*/
