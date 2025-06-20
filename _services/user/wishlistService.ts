import { MongoId } from "../../_Types/MongoId";
import Wishlist from "../../models/wishlistModel";


export async function deleteProductFromWishList(product:MongoId, user:MongoId) {
    await Wishlist.deleteOne({user, product});
}