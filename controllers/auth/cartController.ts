import { addProductToCart, deleteProductFromCart, getUserCart } from "@repositories/cart/cartRepo";
import { CartDataBody } from "@Types/Schema/Cart";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import { getOneDocById } from "@repositories/global";
import Product from "@models/productModel";
import mongoose from "mongoose";

export const addToCartController = catchAsync(async (request, response, next) => {
  const { store, product, quantity } = request.body;
  if (!store?.trim() || !product?.trim() || !quantity) return next(new AppError(400, "some cart data are missing"));
  const productId = new mongoose.Types.ObjectId(product as string);
  const {limitPerCart} = await getOneDocById(Product,productId, {select: ["limitPerCart"]}) ?? {};

  if(limitPerCart && quantity > limitPerCart) return next(new AppError(400, `لايمكنك إضافة أكثر من ${limitPerCart} من هذا المنتج`));
  const user = request.user.id;
  const data: CartDataBody = { user, store, product, quantity };
  const cart = await addProductToCart(data);
  // await addJob("Cart", user, data);

  response.status(203).json({
    success: true,
    data: { cart },
  });
});

export const getMyCartController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const cart = await getUserCart(user);

  if (!cart?.length) return next(new AppError(404, "no cart found for the user"));

  response.status(200).json({
    success: true,
    data: { cart },
  });
});

export const deleteFromCart = catchAsync(async (request, response, next) => {
  const { productId } = request.params;
  const user = request.user.id;

  await deleteProductFromCart(user, productId);

  response.status(204).json({
    success: true,
  });
});
