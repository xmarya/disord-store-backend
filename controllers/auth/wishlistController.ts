import { getAllDocs } from "@repositories/global";
import { deleteWishlist, updateWishlist } from "@repositories/wishlist/wishlistRepo";
import { WishlistDataBody } from "@Types/Schema/Wishlist";
import { catchAsync } from "@utils/catchAsync";
import Wishlist from "@models/wishlistModel";

export const updateWishlistController = catchAsync(async (request, response, next) => {
  const { products }: WishlistDataBody = request.body;
  const user = request.user.id;
  if (!products?.length) await deleteWishlist(user);
  else await updateWishlist(products, user);

  response.status(203).json({
    success: true,
    data: { products },
  });
});
export const getWishlistController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const wishlist = await getAllDocs(Wishlist, request.query, { condition: { user } });
  response.status(200).json({
    success: true,
    data: { wishlist },
  });
});
