import { ProductDocument } from "../_Types/Product";
import { RankingDocument } from "../_Types/Ranking";
import { StoreDocument } from "../_Types/Store";
import mongoose, { Schema } from "mongoose";

type RankingModel = mongoose.Model<RankingDocument>;

const rankingSchema = new Schema<RankingDocument>(
  {
    // ranking for the stores and the products
    resourceId: {
      // which is going to be either storeId or productId
      type: Schema.Types.ObjectId,
      required: [true, "the modelId field is required"],
    },
    rank: {
      type: Number,
      required: [true, "the rank field is required"],
      default: null,
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

interface PopulateRanking {
  resourceId: StoreDocument | ProductDocument;
}

rankingSchema.index({ rank: -1, modelId: 1 });

rankingSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate<{ modelId: PopulateRanking }>("resourceId");
  next();
});

// the problem => https://github.com/Automattic/mongoose/issues/14025#issuecomment-1789479261
// the solution => function(this: Query<any,any>, next)

const Ranking = mongoose.model<RankingDocument, RankingModel>("Ranking", rankingSchema);

export default Ranking;
