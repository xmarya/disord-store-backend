import "./storeModel"; // ✅ Make sure Store is registered before User
import "./userAddressModel"; // ✅ Make sure Address is registered before User
import "./userBankAccount"; // ✅ Make sure BankAccount is registered before User
import { UserDocument } from "../_Types/User";
import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserBankAccount from "./userBankAccount";
import UserAddress from "./userAddressModel";

// UserModel is only used when creating the Mongoose model at the last of the file (after creating the Schema).
type UserModel = Model<UserDocument>;

// Schema<T> expects the first generic type to be an object containing ALL the schema fields.
// The first argument for Schema<> should be the document type, not the model type.
const userSchema = new Schema<UserDocument>(
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
        required: [true, "the discordId field is required"],
        unique: true,
        trim: true,
      },
      name: {
        type: String,
        required: [true, "the name field is required"],
        unique: true,
        trim: true,
      },
      username: {
        type: String,
        required: [true, "the username field is required"],
        unique: true,
        trim: true,
      },
    },
    firstName: {
      type:String,
    },
    lastName: {
      type:String,
    },
    phoneNumber: {
      type:String,
    },
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
    addresses: [UserAddress],
    bankAccounts: [UserBankAccount],
    defaultAddressId: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress"
    },
    defaultBankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "UserBankAccount"
    },
    subscribedPlanDetails: {
      planName: {
        type: String,
        enum: ["basic", "plus", "unlimited", "none"],
        required: [true, "the registeredPlan field is required"],
        // NOTE: I highly recommending this to be embeded document 1-1 relationship
        default: "none", // since the user first will signin using discord, the info of this field won't be available, so we'll set it to 'none' temporarily
      },
      price: {
        type: Number,
        required: [true, "the registeredPlan field is required"],
        default: 0,
      },
      paid: {
        type: Boolean,
        default: false,
      },
      subscribeStarts: {
        // TODO: pre("save") hook to set the start time
        type: Date,
      },
      subscribeEnds: {
        // TODO:this field should be calculated the moment the subscribeStarts field is initialised or updated
        // using pre(save/update) hook.
        // PLUS, it doesn't need any recalculation that's why I didn't make it a virtual filed
        type: Date,
      },
    },
    pastSubscriptions: [
      {
        // TODO: the logic of implementing this field and the filed that holds the time of subscribeStarts
        // it should be only updated by checking the plan name and making the count + 1
        //  once the subscribeStarts property updated
        plan: {
          type: String,
          enum: ["basic", "plus", "unlimited"],
          required: true,
        },
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        // select: false
      },
    ],
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

    // purchases: {
    //     // reference to the user
    //     // reference to the products (each of them has a reference to the user it belongs to)
    //NOTE: remove this filed from here, THIS WILL BE ACCESSIBLE BY QUERYING THE invoiceModel by userId
    // },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// I decided to make this a virtual field, so it will be created and recalculated each time
// the data is retrieved which maintains the accuracy of how many days exactly are left.
userSchema.virtual("planExpiresInDays").get(function () { /*REQUIRES TESTING*/
  if (!this.subscribeEnds || !this.subscribeStarts) return 0;

  const ms = this.subscribeEnds?.getTime() - this.subscribeStarts?.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
  /* CHANGE LATER: this must be changed to pre("save") hook since 
    I moved the subscribeEnds from Top-level field to be inside the planDetails object 
    OR MAYBE NOT??? LET'S TRY IT FIRST THEN DECIDE 👍🏻*/

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
    this.credentials.password = await bcrypt.hash(this.credentials.password, 13);
    console.log("pre save hook for NEW USERS", this.credentials.password);
    next();
  }
});

// this pre hook if for forget/rest password, it encrypts the password and set the changeAt
userSchema.pre("save", async function (next) {
  if (!this.isNew && this.credentials && this.isModified(this.credentials.password)) {
    this.credentials.password = await bcrypt.hash(this.credentials.password, 13);
    this.credentials.passwordChangedAt = new Date();
    console.log(`pre save hook if for forget/rest password`, this.credentials);
  }

  next();
});

userSchema.methods.comparePasswords = async function (providedPassword: string, userPassword: string) {
  /* 
    instanced methods are available on the document, 
    so, `this` keyword points to the current document. then why we're not using this.password?
    actually in this case, since we have set the password to select false, 
    this.password will not be available. So we will pass it from the controllerAuth since we've ot it there.
  */
  const result = await bcrypt.compare(providedPassword, userPassword);
  console.log(result);
  return result;
};

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

// model(Document, Model)
const User = model<UserDocument, UserModel>("User", userSchema);

export default User;
