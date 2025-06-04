import "./storeModel"; // ✅ Make sure Store is registered before User
import bcrypt from "bcryptjs";
import { formatDistanceStrict, lightFormat } from "date-fns";
import mongoose, { Schema } from "mongoose";
import { HASHING_SALT } from "../_data/constants";
import { UserDocument } from "../_Types/User";
import { addressSchema } from "./userAddressModel";
import { bankAccountSchema } from "./userBankAccountModel";
import { arSA } from "date-fns/locale/ar-SA";

interface UserVirtual {planExpiresInDays:string};

// UserModel is only used when creating the Mongoose model at the last of the file (after creating the Schema).
type UserModel = mongoose.Model<UserDocument, {},{}, UserVirtual>;

// Schema<T> expects the first generic type to be an object containing ALL the schema fields.
// The first argument for Schema<> should be the document type, not the model type.
const userSchema = new Schema<UserDocument, {},{}, UserVirtual>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "the email field is required"],
    },
    signMethod: {
      type: String,
      enum: ["credentials", "discord"],
      required: [true, " the signMethod field is required"],
    },
    credentials: {
      password: {
        type: String,
        minLength: [8, "your password must be at least 8 characters"],
        select: false,
      },
      emailConfirmed: {
        type: Boolean,
        default: false,
      },
      // passwordConfirm: String, // NOTE: zod will be use to validate this filed
      // on the front-end + the field itself won't be saved in the db.
      // it's only use inside the pre hook to check the password
      passwordResetToken: String,
      passwordResetExpires: Date,
      passwordChangedAt: Date,
    },
    discord: {
      discordId: {
        type: String,
        unique: true,
        trim: true,
      },
      name: {
        type: String,
        unique: true,
        trim: true,
      },
      username: {
        type: String,
        unique: true,
        trim: true,
      },
    },
    firstName: String,
    lastName: String,
    phoneNumber: String, // TODO: pre save isModified() for validation
    userType: {
      type: String,
      enum: ["admin", "storeOwner", "storeAssistant", "user"] /* SOLILOQUY: what if the user can be both an owner and an assistant? in this case the type should be [String] */,
      required: [true, "the userType field is required"],
    },
    image: String,
    /* SOLILOQUY: 
        1- should I make it an array? because may be the user wants to add more than one card...?
        2- what about paypal/apple pay/google accounts? these shouldn't be saved in our side right?
          they should be dealt by the provider itself right?
     */
    addresses: [addressSchema],
    bankAccounts: [bankAccountSchema],
    defaultAddressId: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress",
    },
    defaultBankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "UserBankAccount",
    },
    subscribedPlanDetails: {
      planId: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
      planName: {
        type: String,
        enum: ["basic", "plus", "unlimited"],
        required: [true, "the planName field is required"],
      },
      paidPrice: Number,
      paid: {
        type: Boolean,
        default: undefined,
      },
      subscribeStarts: Date,
      subscribeEnds: Date,
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
    myStore: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required: true,
      select: false, // excluding this filed from the find* queries.
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

// this pre(findOneAndUpdate) for accumulating the count in subscriptionsLog whenever the subscribeStarts field has been modified during a new/renewal subscribing process
userSchema.pre("findOneAndUpdate", async function (next) {

  // STEP 1) get the original doc in order to access the userType and its subscriptionsLog field:
  const doc: UserDocument = await this.model.findOne(this.getFilter()).select("userType subscriptionsLog");

  // STEP 2) get the to-be-updated fields:
  /*✅*/ const updatedFields = this.getUpdate() as mongoose.UpdateQuery<UserDocument>;
  if (doc.userType !=="storeOwner" && !updatedFields?.subscribedPlanDetails?.subscribeStarts) return next();
  console.log("this pre(findOneAndUpdate) for accumulating the count in subscriptionsLog");

  const { subscribeStarts, planName, paidPrice } = updatedFields.subscribedPlanDetails;
  const logsMap = doc.subscriptionsLog;

  //STEP 3) insert the new log data:
  const key = lightFormat(subscribeStarts, "yyyy-MM-dd");
  logsMap.set(key, { planName, price: paidPrice });

  // updatedFields.$set = updatedFields.$set ?? {}; since it now behaves as UpdateQuery<T>, not as aggregation pipeline
  updatedFields.$set.subscriptionsLog = logsMap;
  next();
});
/* OLD CODE (kept for reference): 
userSchema.pre("findOneAndUpdate", async function (next) {
  const updatedFields = this.getUpdate();
  if(!updatedFields?.subscribedPlanDetails.subscribeStarts) return next();
  console.log("this pre(findOneAndUpdate) for accumulating the count in subscriptionsLog");
  // No need for populate at this step since the I'm passing the planName already from the controller
  // const planName = await this.populate({path: "planId", select: "planName"});
 
 const { subscribeStarts, planName, paidPrice } = updatedFields.subscribedPlanDetails;
 
 // STEP 2) get the original doc in order to access its subscriptionsLog field:
 const doc:UserDocument = await this.model.findOne(this.getFilter()).select("subscriptionsLog");
 console.log("after switching to getFilter for getting the doc");
 const logsMap = doc.subscriptionsLog;
 
 //STEP 3) insert the new log data:
 logsMap.set(planName, {count: 1, price:paidPrice, date: subscribeStarts});
 console.log(logsMap);
 // doc.subscriptionsLog = logsMap; DOESN'T WORK
 updatedFields.$set.subscriptionsLog = logsMap;
 console.log(updatedFields);
 console.log("DONE ✅");
 next();
});
*/

/*TRANSLATE:
  the above code is -almost- work as I want it However it has a core problem.
  Since I'm using a Map to store the log of users' subscriptions, 
  it doesn't accept multiple data for the same plan name.
  Therefore, I thought I'd make the key the date of subscribeStarts and 
  the values the paidPrice along with the planName, instead of the date.
  and for the count, it'll be calculated using aggregation, 
  but here I'm facing another problem which is that Maps doesn't accept 
  the date to be a key since it's an object; Maps are strict to have a string key
*/

userSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate("subscribedPlanDetails.planId").select("-planName -features -unlimitedUser");
  next();
});


// I decided to make this a virtual field, so it will be created and recalculated each time
// the data is retrieved which maintains the accuracy of how many days exactly are left.
userSchema.virtual("planExpiresInDays").get(function () {
  if (!this.subscribedPlanDetails.subscribeStarts) return 0;
  
  // TODO: corn job to reset subscribeStarts when the subscription ends
  const days = formatDistanceStrict(this.subscribedPlanDetails.subscribeEnds, this.subscribedPlanDetails.subscribeStarts, { locale: arSA, unit: "day" });
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

// userSchema.pre(/^find/, function (this: Query<any, any>, next) {
//   this.populate("myStore").select("_id");
//   next();
// });

/* OLD CODE (kept for reference): 
    userSchema.pre("save", function (next) {
      // mongoose documents require an explicit cast when dealing with nested objects (credential subdocument) inside hooks.
      // Explicitly Casts `this` as UserDocument → This tells TypeScript that this has the credentials and discord fields.
      const user = this as UserDocument;
      if (user.signMethod !== "credentials" && !user.credentials) return next();
      
      if (user?.credentials?.password !== user?.credentials?.passwordConfirm)
      return next(new Error("Passwords do not match"));
      
      next();
    });
*/

// this pre hook is for encrypting the pass before saving it for NEW USERS:
userSchema.pre("save", async function (next) {
  // STEP 1) check if the user isNew and the signMethod is credentials: (the condition this.credentials is for getting rid ot possibly undefined error)
  if (this.isNew && this.signMethod === "credentials" && this.credentials) {
    console.log("pre hook is for encrypting the pass before saving it for NEW USERS");
    console.log("this.credentials.password", this.credentials.password);
    this.credentials.password = await bcrypt.hash(this.credentials.password, HASHING_SALT);
    console.log("pre save hook for NEW USERS", this.credentials.password);
    console.log("DONE ✅");
  }
  next();
});

// this pre hook for forget/rest or change password, it encrypts the password and sets the changeAt
userSchema.pre("save", async function (next) {
  if (!this.isNew && this.credentials && this.isModified("credentials.password")) {
    this.credentials.password = await bcrypt.hash(this.credentials.password, HASHING_SALT);
    this.credentials.passwordChangedAt = new Date();
    console.log(`pre save hook if for forget/rest password`, this.credentials);
    console.log("DONE ✅");
  }

  next();
});

/* OLD CODE (kept for reference): 
userSchema.methods.comparePasswords = async function (providedPassword: string, userPassword: string) {
  instanced methods are available on the document, 
  so, `this` keyword points to the current document. then why we're not using this.password?
  actually in this case, since we have set the password to select false, 
  this.password will not be available. So we will pass it from the controllerAuth since we've got it there.
 const result = await bcrypt.compare(providedPassword, userPassword);
 console.log(result);
 return result;
};
*/

/* OLD CODE (kept for reference): 
userSchema.methods.generateRandomToken = async function () {
  //STEP 1) generate the token:
  const randomToken = crypto.randomBytes(32).toString("hex");
  
  //STEP 2) start an expiring time for the GRT:
  const tokenExpiresIn = new Date(Date.now() + 5 * 60 * 1000); // lasts for 5 minutes
  
  //STEP 3) store the token after hashing/expiring time in credentials:
  this.credentials.passwordResetToken = crypto.createHash("sha256").update(randomToken).digest("hex");
  this.credentials.passwordResetExpires = tokenExpiresIn;
  
  //STEP 4) saving the changes:
  await this.save({ validateBeforeSave: false });
  console.log({ randomToken }, this.credentials.passwordResetExpires);
  
  return randomToken;
};
*/

// model(Document, Model)
const User = mongoose.model<UserDocument, UserModel, UserVirtual>("User", userSchema);

export default User;
