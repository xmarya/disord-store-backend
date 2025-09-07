import "./storeModel"; // ✅ Make sure Store is registered before User
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { formatDistanceStrict, lightFormat } from "date-fns";
import mongoose, { Schema } from "mongoose";
import { arSA } from "date-fns/locale/ar-SA";


interface StoreOwnerVirtual {
  planExpiresInDays: string;
}
type StoreOwnerModel = mongoose.Model<StoreOwnerDocument, {}, {}, StoreOwnerVirtual>;

const storeOwnerSchema = new Schema<StoreOwnerDocument, {}, {}, StoreOwnerVirtual>(
  {
    myStore: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: undefined,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "the email field is required"],
    },
    firstName: String,
    lastName: String,
    phoneNumber: {
      type: String,
      // the format must be +9665xxxxxxxx
      minlength: [13, "the phone number should start with +966"],
      maxlength: [13, "the phone number should start with +966"],
      default: undefined,
      validate: {
        validator: function (value: string) {
          return value.startsWith("+966");
        },
        message: (props) => `${props.value} isn't a valid phone number. it must starts with +966`,
      },
    },
    userType: {
      type: String,
      enum: ["admin", "storeOwner", "storeAssistant", "user"] /* SOLILOQUY: what if the user can be both an owner and an assistant? in this case the type should be [String] */,
      required: [true, "the userType field is required"],
    },
    image: String,
    defaultAddressId: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress",
      select: false, // NOTE: not sure about setting it to false
      default: undefined,
    },
    defaultCreditCardId: {
      type: Schema.Types.ObjectId,
      ref: "UserCreditCard",
      select: false,
      default: undefined,
    },
    subscribedPlanDetails: {
      planId: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
        default: undefined,
      },
      planName: {
        type: String,
        enum: ["basic", "plus", "unlimited"],
        default: undefined,
      },
      paidPrice: { type: Number, default: undefined },
      paid: {
        type: Boolean,
        default: undefined,
      },
      subscribeStarts: { type: Date, default: undefined },
      subscribeEnds: { type: Date, default: undefined },
    },
    subscriptionsLog: {
      type: Map,
      of: new Schema(
        {
          planName: String,
          price: Number,
        },
        { _id: false }
      ),
      default: () => new Map(), // this is a must; since mongoose doesn't add and undefined field and empty Maps
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// this pre(findOneAndUpdate) for accumulating the count in subscriptionsLog whenever the subscribeStarts field has been modified during a new/renewal subscribing process
storeOwnerSchema.pre("findOneAndUpdate", async function (next) {
  // STEP 1) get the original doc in order to access the userType and its subscriptionsLog field:
  const doc: StoreOwnerDocument = await this.model.findOne(this.getFilter()).select("userType subscriptionsLog");

  // STEP 2) get the to-be-updated fields:
  /*✅*/ const updatedFields = this.getUpdate() as mongoose.UpdateQuery<StoreOwnerDocument>;

  if (doc?.userType !== "storeOwner" || !updatedFields?.subscribedPlanDetails?.subscribeStarts) return next(); // don't enter if the updated fields has nothing to do with the subscription

  const { subscribeStarts, planName, paidPrice } = updatedFields.subscribedPlanDetails;
  const logsMap = doc.subscriptionsLog;

  //STEP 3) insert the new log data:
  const key = lightFormat(subscribeStarts, "yyyy-MM-dd");
  logsMap.set(key, { planName, price: paidPrice }); // JavaScript Map enforces uniqueness of keys, not values.

  // updatedFields.$set = updatedFields.$set ?? {}; need for this line; since it now behaves as UpdateQuery<T>, not as aggregation pipeline
  updatedFields.$set.subscriptionsLog = logsMap;
  next();
});

// I decided to make this a virtual field, so it will be created and recalculated each time
// the data is retrieved which maintains the accuracy of how many days exactly are left.
storeOwnerSchema.virtual("planExpiresInDays").get(function () {
  if (!this.subscribedPlanDetails.subscribeStarts) return undefined; // the return 0 causes the planExpiresInDays field to be returned in the doc. using undefined prevents this.

  const days = formatDistanceStrict(this.subscribedPlanDetails.subscribeEnds, new Date(), { locale: arSA, unit: "day" });
  return days;
  /* OLD CODE (kept for reference): 
  const ms = this.subscribeEnds.getTime() - this.subscribeStarts.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
  */

  // NOTE: this.subscribeEnds and this.subscribeStarts are Date objects, not numbers.
  // TypeScript does not allow arithmetic (-) directly between Date objects.
  // so, we'll convert them to a number by using getTime(), the result is going to be a timestamp in milliseconds
  // we'll take it and convert it into a day by dividing by dividing by (1000 * 60 * 60 * 24) .
});

const StoreOwner = mongoose.model<StoreOwnerDocument, StoreOwnerModel>("StoreOwner", storeOwnerSchema);

export default StoreOwner;
