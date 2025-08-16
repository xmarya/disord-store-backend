import { MongoId } from "../../_Types/MongoId";
import Wishlist from "../../models/wishlistModel";

export async function updateWishlist(products: Array<MongoId>, user: MongoId) {
  const bulkOps: any[] = [];
  products.forEach((product) => {
    bulkOps.push({
      updateOne: {
        filter: { user, product },
        update: { user, product },
        upsert: true,
      },
    });
  });

  // STEP 2) Remove doc NOT in the products list
  bulkOps.push({
    deleteMany: {
      filter: { user, product: { $nin: products } },
    },
  });
  const wishlist = await Wishlist.bulkWrite(bulkOps);

}

export async function deleteWishlist(user: MongoId) {
  await Wishlist.deleteMany({ user });
}
