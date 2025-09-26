import { RegularUserDocument } from "@Types/Schema/Users/RegularUser";
import mongoose, { Schema } from "mongoose";

// UserModel is only used when creating the Mongoose model at the last of the file (after creating the Schema).
type RegularUserModel = mongoose.Model<RegularUserDocument>;

// Schema<T> expects the first generic type to be an object containing ALL the schema fields.
// The first argument for Schema<> should be the document type, not the model type.
const userSchema = new Schema<RegularUserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "the email field is required"],
      sparse: true,
    },
    signMethod: {
      type: String,
      enum: ["credentials", "discord"],
      required: [true, " the signMethod field is required"],
    },
    discord: {
      discordId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      username: {
        type: String,
        trim: true,
      },
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
      default: "user",
    },
    status: {
      type:String,
      enum: ["active", "blocked", "deleted"],
      default: "active"
    },
    image: String,
    /* SOLILOQUY: 
        1- should I make it an array? because may be the user wants to add more than one card...?
        2- what about paypal/apple pay/google accounts? these shouldn't be saved in our side right?
          they should be dealt by the provider itself right?
     */
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

const User = mongoose.model<RegularUserDocument, RegularUserModel>("User", userSchema);

export default User;
