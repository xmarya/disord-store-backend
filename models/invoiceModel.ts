import { InvoiceDocument } from "../_Types/Invoice";
import { Model, Schema, model, models } from "mongoose";

type InvoiceModel = Model<InvoiceDocument>;
const invoiceSchema = new Schema<InvoiceDocument>(
  {
    purchaseId: {
      type: String,
      required: [true, "the purchaseId field is required"],
      unique: true,
      default:
        crypto.randomUUID() /* SOLILOQUY:  I think it's better to move this calculation to the mongoose query pre("save") instead*/,
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
      required: [true, "the purchasedAt field is required"],
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

const Invoice =
  models?.Invoice ||
  model<InvoiceDocument, InvoiceModel>("Invoice", invoiceSchema);

export default Invoice;
