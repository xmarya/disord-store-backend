import { ReviewDocument, ReviewModel } from "../_Types/Review";
import mongoose from "mongoose";
import { DynamicModel } from "../_Types/Model";
import { updateModelRatingController } from "../controllers/auth/reviewController";

export const reviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the user filed is required"],
    },
    reviewBody: {
      type: String,
      required: [true, "the reviewBody filed is required"],
    },
    rating: {
      type: Number,
      required: [true, "you must rate with a number between 1 to 5"],
      min: 1,
      max: 5,
    },
    wroteAt: {
      type: Date,
      required: [true, "the wroteAt filed is required"],
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//this pre(findOneAndUpdate) is for setting the updatedAt field:
reviewSchema.pre("findOneAndUpdate", async function(next) {
  //NOTE: it is a must to get the document that is being queried first:
  const Model:mongoose.Model<ReviewDocument> = this.model;
  const doc = await Model.findOne(this.getQuery());
  if(doc) doc.updatedAt = new Date();
  next();
});


reviewSchema.post(/^findOneAnd/, async function(this:ReviewDocument) {
  //STEP 1) check if the query operation ($op) includes the word (Delete):
  const isDelete = this.$op?.includes("Delete");
  console.log("this.$op?.includes(Delete)",isDelete);

  //STEP 2) calling calculateRatingsAverage through the model:
  const modelId = this.$locals.modelId as string;
  const Review = this.constructor as ReviewModel;
  Review.calculateRatingsAverage(modelId, isDelete);

});

// this post("save") hook is for NEW REVIEWS:
reviewSchema.post("save", function() {
  const modelId = this.$locals.modelId as string;
  const Review = this.constructor as ReviewModel; // the only way to access the Model -and its statics- from the document hook
  Review.calculateRatingsAverage(modelId);

});

reviewSchema.statics.calculateRatingsAverage = async function(modelId:string, isDelete = false) {
  // NOTE: this is a schema.statics, which means `this` keyword references the current model. (Review-resourceNAme-resourceId).

  /* SOLILOQUY: 
    1- the Model has all the reviews-ratings info 
      BUT NOTHING about the ratingsAverage piece of data which lives inside the RESOURCE MODEL THAT IS BEING REVIEWED
      which means I'll have to repeat the calculations EACH TIME there is a new review-rating instead of just getting the 
      current ratingsAverage value and add the new rating to it!

    2- there is also the ratingsQuantity! it lives inside the RESOURCE MODEL THAT IS BEING REVIEWED!
      how to increment it from here?

    3- there is the ranking part, it must be set to the actual RESOURCE MODEL THAT IS BEING REVIEWED

    4- how to get RESOURCE MODEL THAT IS BEING REVIEWED ?
      even in the controller where the logic/operations starts doesn't know it.
      WAIT! I could get it from the request.originalUrl?
      but I think it's silly to pass this piece of data through controller => service => reviewSchema.statics.calculateRatingsAverage
    
    5- should I make calculateRatingsAverage a utility function instead of being a schema statics?
      maybe it's better since it is going to deal with there different resources (dynamic Review, Ranking and the RESOURCE THAT IS BEING REVIEWED)

    6- but then I'm gonna lose the `this` keyword and all its feature, using a util function instead of schema.statics
      mean I must pass the rating value from the newly created review in order to do my logic of calculation

    7- also and the most important thing, what about the cases of updating/deleting reviews?
      should I keep it as schema.statics and adding a field called reviewedModel?
      so I would know then the name of the RESOURCE MODEL THAT IS BEING REVIEWED and the id is available withing the Model name (Review-resourceId).
      also I prefer this option since it abstracts the logic and I wouldn't have to call the function in case
      of updating/deleting a review
  */

  // STEP 1) extract the resourceName and th resourceId: // e.g. Review-product-${productId} OR Review-store-${storeId}
  const [_, resourceName, resourceId] = this.modelName.split("-");
  /* SOLILOQUY: but where to look for? how to get the right model name to perform a query?
              I know which resource the review does belong to whether a store or a product
              and yes I have the id of that resource from the dynamic model name which is Review-${productId} OR Review-${storeId},
              */
  console.log("this.modelName.split(-);", resourceName, resourceId, isDelete);
 
  /* NOTE: in case of a product, remember that it is going to by dynamic using the STORE's id,
     so, all the products of a store are going to be in the same collection that is named products-${storeId}
     which means the logic here requires the productId itself and that's a crucial to access that specific
     product's ratingsAverage/ratingsQuantity.
      1- Create A New Store's Product: on the route api/v1/dashboard/:storeId/products.

      2- Create A New Product's Review: on the route api/v1/reviews/product,
        submit a request body contains modelId of the store that the product belongs to
        the created dynamic model/collection named products-modelId.
      
      3- 

  */

  // STEP 2) use aggregate on the current Review model (this), calculate all the reviews ratings:
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      }
    }
  ]);

  console.log("stats", stats);
  
  //  STEP 3) get the actual modelName e.g. Product-${modelId}, Store-${modelId}
  const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1) as DynamicModel;
  await updateModelRatingController(modelName, modelId, resourceId, stats, isDelete);
}