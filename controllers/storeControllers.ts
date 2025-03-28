import { createOne, getAll, getOne } from "./global";


export const getAllStores = getAll("Store"); // admin only
export const getStore = getOne("Store");

// protected routes
export const createStore = createOne("Store");
export const updateStore = getOne("Store");
export const deleteStore = getOne("Store");