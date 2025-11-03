import { startSession } from "mongoose";
import { getAllDocs, getOneDocById, updateDoc } from "@repositories/global";
import { getAllStoresStats, getOneStoreStats } from "@repositories/store/storeStatsRepo";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import Store from "@models/storeModel";
import Product from "@models/productModel";
import deleteStoreByAdmin from "@services/auth/adminServices/store/deleteStoreByAdmin";
import returnError from "@utils/returnError";

export const getAllStoresInfo = catchAsync(async (request, response, next) => {
  const { sortBy, sortOrder, plan, verified } = request.body;
  // returns the store names, logo, owners, in which plan, verified, total profit??
  const storesStats = await getAllStoresStats(sortBy, sortOrder, { plan, verified });
  if (!storesStats) return next(new AppError(500, "couldn't fetch stores data, try again later."));

  response.status(200).json({
    success: true,
    result: storesStats.length,
    data: storesStats
  });
});

export const getOneStoreInfo = catchAsync(async (request, response, next) => {
  const { dateFilter, sortBy, sortOrder } = request.dateQuery;
  const { storeId } = request.params;
  // const store = await getOneDocByFindOne(StoreStats, {field: "store", value: storeId}); //BUG this query returns only the first match

  const session = await startSession();
  const { store, products, stats } = await session.withTransaction(async () => {
    const store = await getOneDocById(Store, storeId, { session });
    const products = await getAllDocs(Product, request, { condition: { store: storeId } });
    const stats = await getOneStoreStats(storeId, dateFilter, sortBy, sortOrder);

    return { store, products, stats };
  });

  await session.endSession();

  response.status(200).json({
    success: true,
    data: {
      store,
      products,
      stats,
    },
  });
});

export const suspendStore = catchAsync(async (request, response, next) => {
  await updateDoc(Store, request.params.storeId, { status: "suspended" });
  //TODO: create a new adminLog
  response.status(201).json({
    success: true,
  });
});

export const deleteStore = catchAsync(async (request, response, next) => {
  
  const result = await deleteStoreByAdmin(request.params.storeId);
  if(!result.ok) return next(returnError(result));

  //TODO: create a new adminLog
  response.status(204).json({
    success: true,
    message: "تم حذف المتجر و جميع ملحاقته بنجاح",
  });
});
