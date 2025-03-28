import { AnnualSubscribersDocument } from "../_Types/AnnualSubscribers";
import { Model, Schema, model, models } from "mongoose";

type AnnualSubscribersModel = Model<AnnualSubscribersDocument>;

const annualSubscriberSchema = new Schema<AnnualSubscribersDocument>({
  plan: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
  },
  year: {
    type: String,
    required: true,
  },
  totalSubscribers: {
    type: Number,
    required: true,
  },
});

annualSubscriberSchema.index({ store: 1, year: 1 });

const AnnualSubscriber =
  models?.AnnualSubscribers ||
  model<AnnualSubscribersDocument, AnnualSubscribersModel>(
    "AnnualSubscriber",
    annualSubscriberSchema
  );

export default AnnualSubscriber;

/*NOTE:
    this model is responsible about storing the annual Subscribers
    when a new year starts the last year's Subscriber is going to be transferred here after that
    the storeStates collection data will be reset.

    TL;DR annualSubscriber => record for all the years ONLY,
        storeState => record for the current year's (days, weeks, months,)
*/
