import { createOne, getOne } from "../global";


// protected ,restricted routes
export const getMyStore = getOne("Store");
export const createStore = createOne("Store");
export const updateStore = getOne("Store");
export const deleteStore = getOne("Store");
