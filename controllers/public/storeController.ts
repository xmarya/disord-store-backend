import { getAllDocs } from "../../_services/global";
import { getStoreWithProducts } from "../../_services/store/storeService";
import { catchAsync } from "../../_utils/catchAsync";
import Store from "../../models/storeModel";


export const getStoresList = catchAsync( async(request, response, next)=> {

    const storesList = await getAllDocs(Store, request, {select: ["storeName", "logo", "description"]});
    // NOTE: how to get the rating/ranking??

    response.status(200).json({
        success: true,
        result: storesList.length,
        storesList
    });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {
  console.log("GETSTOREWITHPRODUCTS");

  const { storeId } = request.params;

  const { store, products } = await getStoreWithProducts(storeId);
  // NOTE: how to get the ratings/rankings of all the products? + how to allow filtering them?

  response.status(200).json({
    success: true,
    store,
    products,
  });
});