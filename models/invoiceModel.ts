import { format, getMonth, getYear } from "date-fns";
import { InvoiceDocument } from "../_Types/Invoice";
import { Model, Schema, model } from "mongoose";

type InvoiceModel = Model<InvoiceDocument>;
export const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceId: {
      type: String,
      unique: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the buyer field is required"],
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "the products field is required"],
      },
    ],
    /*ENHANCE: as the same as the cartModel, I removed the store from here because 
        I have the access to it from the products filed, ALSO and the main reason, there will be product from various stores for sure
        then the store filed should be an array as well, so to avoid storing many things that are not necessary required
        I removed it.
    store: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "the store field is required"]
    },*/
    total: {
      // NOTE: this filed is fixed unlike the total field from the cart, so there is no need to make it virtual.
      type: Number,
      required: [true, "the total field is required"],
    },
    paymentMethod: {
      type: String,
      required: [true, "the paymentMethod field is required"],
    },
    purchasedAt: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ["successful", "cancelled", "processed", "refunded"],
      // NOTE: the "processed" is for dealing with the BATCH process of the profits,
      // it's for declaring that this invoice had been added to the store's profits. it's not for marking the payment process itself
      // we're not going to deal with the refund process, it is there to make the profits accurate by extracting the refunded amount if any happens
      required: [true, "the field is required"],
    },
    notes: {
      type: String,
      trim: true,
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

invoiceSchema.index({ user: 1 });

// this pre(save) hook is for generating the invoiceId
invoiceSchema.pre("save", function (next) {
  // 250601-153259999
  // const [date, time] = format(new Date(), "yyMMdd Hmmss").split(" ");

  this.invoiceId = format(new Date(), "yyMMdd-HHmmssSSS");
  
  console.log(this.invoiceId);
  next();
});

// this pre(find) is for populating the purchased products list
invoiceSchema.pre("find", function(next) {
  this.populate({path: "products", select: "name price store image"});
  next();
});

const Invoice = model<InvoiceDocument, InvoiceModel>("Invoice", invoiceSchema);

export default Invoice;
