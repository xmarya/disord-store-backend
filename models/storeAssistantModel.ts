import { StoreAssistantDocument } from "../_Types/StoreAssistant";
import { Model, Schema, model } from "mongoose";

type StoreAssistantModel = Model<StoreAssistantDocument>;

const storeAssistantSchema = new Schema<StoreAssistantDocument>(
  {
    assistant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inStore: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    /* OLD CODE (kept for reference): 
        chatGPT: permissions Structure (Inefficient Querying & Storage)
        Right now, permissions is stored as an array of objects where each object has a single key-value pair.
        This structure is inefficient because:
        Queries for specific permissions will be awkward (permissions.changePrice doesn’t exist directly, so you'd need $elemMatch or array filtering).
        Adding/removing permissions requires restructuring the array.
        Indexing specific permissions is difficult.

    permissions:[
        {changePrice: Boolean},
        {addProduct: Boolean},
        {editProduct: Boolean},
        {deleteProduct: Boolean},
        {addCategory: Boolean},
        {editCategory: Boolean},
        {deleteCategory: Boolean},
        {addDiscount: Boolean},
        {changeStoreSettings: Boolean}, // themeColours, storeName, bankAccount
        {previewStoreStats: Boolean},
    ]
    */

    permissions: {
      changePrice: { type: Boolean, default: false },
      addProduct: { type: Boolean, default: false },
      editProduct: { type: Boolean, default: false },
      deleteProduct: { type: Boolean, default: false },
      addCategory: { type: Boolean, default: false },
      editCategory: { type: Boolean, default: false },
      deleteCategory: { type: Boolean, default: false },
      addDiscount: { type: Boolean, default: false },
      previewStoreStats: { type: Boolean, default: false },
      addCoupon: { type: Boolean, default: false },
      deleteCoupon: { type: Boolean, default: false },
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

const StoreAssistant =
  model<StoreAssistantDocument, StoreAssistantModel>(
    "StoreAssistant",
    storeAssistantSchema
  );

export default StoreAssistant;
