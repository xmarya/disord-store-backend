import { addProductToCart } from "../../_services/cart/cartServices";
import { getOneDocByFindOne } from "../../_services/global";
import { CartDataBody } from "../../_Types/Cart";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Cart from "../../models/cartModel";

export const addToCartController = catchAsync(async (request, response, next) => {
  const { productsPerStore, countOfCartProducts, totalOfDiscounts, cartTotal, cartTotalWight, shippingFees } = request.body as CartDataBody;
  if ( productsPerStore.constructor !== Array || !productsPerStore.length) return next(new AppError(400, "can't create a cart with empty array"));
  if(!cartTotal || !totalOfDiscounts || !countOfCartProducts) return next(new AppError(400, "some data are missing"));

  const user = request.user.id;
  const data = {user, productsPerStore, countOfCartProducts, totalOfDiscounts, cartTotal, cartTotalWight ,shippingFees};
  const newCart = await addProductToCart(data);

  response.status(201).json({
    success: true,
    newCart
  });

});

export const getMyCartController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  const cart = await getOneDocByFindOne(Cart, user);

  if(!cart?.id) return next(new AppError(400, "no cart found for the user"));

  response.status(200).json({
    success: true,
    cart
  });
});

export const updateCartController = catchAsync(async (request, response, next) => {
  const user = request.user.id;
  // the update here is going to be similar to categories,
  // I'm gonna use $set to update whatever are there in the cart,
  // for empty the cart functionality, it is gonna be like this:
  // 1- the front end removes all the data immediately
  // send a patch request to the back-end with products is an empty array []
  const data = {user, ...request.body};
  const updatedCart = await addProductToCart(data);

  response.status(201).json({
    success: true,
    updatedCart
  });
});
