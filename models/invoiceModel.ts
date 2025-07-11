import { Model, Schema, model } from "mongoose";
import { InvoiceDocument } from "../_Types/Invoice";

type InvoiceModel = Model<InvoiceDocument>;
export const invoiceSchema = new Schema<InvoiceDocument>(
  {
    orderId: Schema.Types.ObjectId, // no need to populate, its purpose is link between the invoice and the order

    invoiceId: {
      type: String,
      unique: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the buyer field is required"],
    },
    productsPerStore: {
      type: [
        {
          storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
          },
          products: {
            type: [
              {
                productId: {
                  type: Schema.Types.ObjectId,
                  ref: "Product",
                  required: [true, "the products field is required"],
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: [true, "the quantity of the product must be specified"] },
                productType: { type: String, enum: ["physical", "digital"], required: true },
                image: String,
                unitPrice: {
                  type: Number,
                  required: [true, "the unitPrice of the product must be specified"],
                },
                discountedPrice: Number,
                weight: Number,
                productTotal: {
                  type: Number,
                  required: [true, "productTotal is required"],
                },
                _id: false,
              },
            ],
          },
          _id: false,
          // storeTotal: { type: Number, required: [true, "the storeTotal of the product must be specified"] },
        },
      ],
      _id: false,
    },
    invoiceTotal: {
      type: Number,
      required: [true, "the invoiceTotal of the product must be specified"],
    },
    paymentMethod: {
      type: String,
      required: [true, "the paymentMethod field is required"],
    },
    status: {
      type: String,
      enum: ["successful", "cancelled", "processed", "refunded"],
      // NOTE: the "processed" is for dealing with the BATCH process of the profits,
      // it's for declaring that this invoice had been added to the store's profits. it's not for marking the payment process itself
      // we're not going to deal with the refund process, it is there to make the profits accurate by extracting the refunded amount if any happens
      required: [true, "the field is required"],
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress",
    },
    billingAddress: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress",
    },
    shippingCompany: String,
    shippingFees: Number,
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

invoiceSchema.index({ buyer: 1 });

/* OLD CODE (kept for reference): 
// this pre(save) hook is for generating the invoiceId
invoiceSchema.pre("save", function (next) { ✅
// 250601-153259999
// const [date, time] = format(new Date(), "yyMMdd Hmmss").split(" ");

this.invoiceId = format(new Date(), "yyMMdd-HHmmssSSS");  
next();
});
*/

// this pre(find) is for populating the purchased products list
invoiceSchema.pre("find", function (next) {
  this.populate({ path: "products", select: "name price store image" });
  next();
});

// this pre(findOne) hook is for populating the both the buyer and the products fields -used by the storeOwner and storeAssistants
invoiceSchema.pre("findOne", function (next) {
  this.populate({ path: "buyer", select: "firstName lastName image phoneNumber" });
  this.populate({ path: "products", select: "name price store image" });
  next();
});

const Invoice = model<InvoiceDocument, InvoiceModel>("Invoice", invoiceSchema);

export default Invoice;
