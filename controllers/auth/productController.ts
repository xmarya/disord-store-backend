import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import Product from "../../models/productModel";
import { deleteOne, getOne, updateOne } from "../global";

// protected routes
export const createProduct = catchAsync(async (request, response, next) => {
    sanitisedData(request, next);

    const newProd = await Product.create({ 
        ...request.body,
        store: request.params.storeId
     });

    response.status(201).json({
      status: "success",
      newProd,
    });
});

export const getAllProducts = catchAsync(async (request, response, next) => {
    const products = await Product.find({store: request.params.storeId});

    if(!products) return next(new AppError(400, "لا يوجد منتجات في هذا المتجر"));

    response.status(200).json({
        status: "success",
        products
    });
});

export const getProduct = getOne("Product");
export const updateProduct = updateOne("Product");
export const deleteProduct = deleteOne("Product");