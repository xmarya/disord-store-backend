import { updateDoc } from "../../../_services/global";
import { getStoreWithProducts } from "../../../_services/store/storeService";
import { getAllStoresStats, getOneStoreStats } from "../../../_services/store/storeStatsService";
import { AppError } from "../../../_utils/AppError";
import { catchAsync } from "../../../_utils/catchAsync";
import Store from "../../../models/storeModel";
import { deleteStorePermanently } from "../storeControllers";

export const getAllStoresInfo = catchAsync(async (request, response, next) => {
  const {sortBy, sortOrder, plan, verified} = request.body;
  // returns the store names, logo, owners, in which plan, verified, total profit??
  const storesStats = await getAllStoresStats(sortBy, sortOrder, {plan, verified});
  if (!storesStats) return next(new AppError(500, "couldn't fetch stores data, try again later."));

  response.status(200).json({
    success: true,
    result: storesStats.length,
    storesStats,
  });
});

export const getOneStoreInfo = catchAsync(async (request, response, next) => {

  const {dateFilter, sortBy, sortOrder} = request.dateQuery;
  const { storeId } = request.params;
  // const store = await getOneDocByFindOne(StoreStats, {field: "store", value: storeId}); //BUG this query returns only the first match

  const [{store, products}, stats] = await Promise.all([
    await getStoreWithProducts(storeId),
    await getOneStoreStats(storeId, dateFilter, sortBy, sortOrder),
  ]);

  response.status(200).json({
    success: true,
    store,
    products,
    stats
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
  const deletedStore = await deleteStorePermanently(request.params.storeId);
  //TODO: create a new adminLog
  response.status(204).json({
    success: true,
    deletedStore,
  });
});
