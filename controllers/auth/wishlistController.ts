import { getAllDocs } from "../../_services/global";
import { deleteWishlist, updateWishlist } from "../../_services/wishlist/wishlistService";
import { WishlistDataBody } from "../../_Types/Wishlist";
import { catchAsync } from "../../_utils/catchAsync";
import Wishlist from "../../models/wishlistModel";

export const updateWishlistController = catchAsync(async (request, response, next) => {
  const { products }: WishlistDataBody = request.body;
  const user = request.user.id;
  if (!products?.length) await deleteWishlist(user);
  else await updateWishlist(products, user);

  response.status(203).json({
    success: true,
    wishlist:products
  });
});
export const getWishlistController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const wishlist = await getAllDocs(Wishlist, request, { condition: { user } });
  response.status(200).json({
    success: true,
    wishlist,
  });
});
