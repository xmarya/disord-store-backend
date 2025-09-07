import { HASHING_SALT } from "@constants/primitives";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

type StoreAssistantModel = Model<StoreAssistantDocument>;

const storeAssistantSchema = new Schema<StoreAssistantDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "the email field is required"],
    },
    firstName: { type: String, required: [true, "the firstName field is required"] },
    lastName: { type: String, required: [true, "the lastName field is required"] },
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
      default: "storeAssistant",
    },
    image: String,
    inStore: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    inPlan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
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
      updateStoreStatus: { type: Boolean, default: false },
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
      replyToCustomers: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
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

storeAssistantSchema.index({ inStore: 1 });

storeAssistantSchema.pre("save", async function (next) {
  // STEP 1) check if the user isNew and the signMethod is credentials: (the condition this.credentials is for getting rid ot possibly undefined error)
  if (this.isNew && this.credentials) {
    this.credentials.password = await bcrypt.hash(this.credentials.password, HASHING_SALT);
  }
  next();
});

// this pre hook for forget/rest or change password, it encrypts the password and sets the changeAt
storeAssistantSchema.pre("save", async function (next) {
  if (!this.isNew && this.credentials && this.isModified("credentials.password")) {
    this.credentials.password = await bcrypt.hash(this.credentials.password, HASHING_SALT);
    this.credentials.passwordChangedAt = new Date();
  }

  next();
});

const StoreAssistant = model<StoreAssistantDocument, StoreAssistantModel>("StoreAssistant", storeAssistantSchema);

export default StoreAssistant;
