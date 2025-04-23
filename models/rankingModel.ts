import { ProductDocument } from "../_Types/Product";
import { RankingDocument } from "../_Types/Ranking";
import { StoreDocument } from "../_Types/Store";
import { Query, Schema } from "mongoose";

// type RankingModel = Model<RankingDocument>;

//NOTE: this schema is going to be shared between the RankingStores -future feature- and RankingProduct-${storeId}
export const rankingSchema = new Schema<RankingDocument>(
  {
    // ranking for the store and the products
    modelId: { // which is going to be either storeId or productId
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
  // modelId: StoreBasic | ProductBasic;
  modelId: StoreDocument | ProductDocument;
}

rankingSchema.index({ rank: -1, modelId: 1 });

rankingSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.populate<{ modelId: PopulateRanking }>("modelId");
  next();
});

// the problem => https://github.com/Automattic/mongoose/issues/14025#issuecomment-1789479261
// the solution => function(this: Query<any,any>, next)

// const Ranking =
//   model<RankingDocument, RankingModel>("Ranking", rankingSchema);

// export default Ranking;
