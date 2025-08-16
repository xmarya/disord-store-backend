import { addProductToCart, deleteProductFromCart, getUserCart } from "../../_repositories/cart/cartRepo";
import { CartDataBody } from "../../_Types/Cart";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";


export const addToCartController = catchAsync(async (request, response, next) => {
  const {store, product, quantity} = request.body;
  if(!store?.trim() || !product?.trim() || !quantity) return next(new AppError(400, "some cart data are missing"));

  const user = request.user.id;
  const data: CartDataBody = {user, store, product, quantity}
  const cart = await addProductToCart(data);
  // await addJob("Cart", user, data);

  response.status(203).json({
    success: true,
    cart
  });
});

export const getMyCartController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const cart = await getUserCart(user);

  if(!cart?.length) return next(new AppError(404, "no cart found for the user"));

  response.status(200).json({
    success: true,
    cart
  });
});

export const deleteFromCart = catchAsync(async (request, response, next) => {
  const {productId} = request.params;
  const user = request.user.id

  await deleteProductFromCart(user, productId);

  response.status(204).json({
    success: true,
  });
});
