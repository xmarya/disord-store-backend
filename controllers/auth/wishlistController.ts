import { createDoc, getAllDocs } from "../../_services/global";
import { deleteProductFromWishList } from "../../_services/user/wishlistService";
import { WishlistDataBody } from "../../_Types/Wishlist";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Wishlist from "../../models/wishlistModel";

export const addProductToWishlistController = catchAsync(async (request, response, next) => {
  const { product } = request.body;
  if (!product?.trim()) return next(new AppError(400, "a product id is missing"));
  const user = request.user.id;
  const data: WishlistDataBody = { product, user };

  const wishlist = await createDoc(Wishlist, data);

  response.status(201).json({
    success: true,
    wishlist,
  });
});
export const getWishlistController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const wishlist = await getAllDocs(Wishlist, request, { condition: { user } });
  response.status(200).json({
    success: true,
    wishlist
  });
});
export const deleteProductFromWishlistController = catchAsync(async (request, response, next) => {
    const { product } = request.body;
  if (!product?.trim()) return next(new AppError(400, "a product id is missing"));
  const user = request.user.id;

  await deleteProductFromWishList(product, user);
  response.status(204).json({
    success: true,
  });
});
