import { createOne, getAll, getOne } from "../global";


export const getAllProducts = getAll("Product"); // of a store
export const getProduct = getOne("Product");

// protected routes
export const createProduct = createOne("Product"); //NOTE: needs storeId
export const updateProduct = getOne("Product");
export const deleteProduct = getOne("Product");