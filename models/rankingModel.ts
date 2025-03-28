import { ProductBasic } from "../_Types/Product";
import { RankingDocument } from "../_Types/Ranking";
import { StoreBasic } from "../_Types/Store";
import { Model, Query, Schema, model, models } from "mongoose";

type RankingModel = Model<RankingDocument>;
const rankingSchema = new Schema<RankingDocument>(
  {
    // ranking for the store and the products
    modelId: {
      type: Schema.Types.ObjectId,
      required: [true, "the modelId field is required"],
    },
    model: {
      type: String,
      enum: ["Store", "Product"],
      required: [true, "the model field is required"],
    },
    rank: {
      type: Number,
      required: [true, "the rank field is required"],
      default: 0,
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
  modelId: StoreBasic | ProductBasic;
}

rankingSchema.index({ rank: -1, model: 1 });

rankingSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.populate<{ modelId: PopulateRanking }>("modelId");
  next();
});

// the problem => https://github.com/Automattic/mongoose/issues/14025#issuecomment-1789479261
// the solution => function(this: Query<any,any>, next)

const Ranking =
  models?.Ranking ||
  model<RankingDocument, RankingModel>("Ranking", rankingSchema);

export default Ranking;
