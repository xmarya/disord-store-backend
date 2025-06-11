import { getAllDocs } from "../../_services/global";
import { getStoreWithProducts } from "../../_services/store/storeService";
import { ProductDocument } from "../../_Types/Product";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel } from "../../_utils/dynamicMongoModel";
import Store from "../../models/storeModel";


export const getStoresList = catchAsync( async(request, response, next)=> {

    const storesList = await getAllDocs(Store, request, {select: ["storeName", "logo", "description"]});
    // NOTE: how to get the rating/ranking??

    response.status(200).json({
        success: true,
        storesList
    });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {
  console.log("GETSTOREWITHPRODUCTS");

  const { storeId } = request.params;
  const ProductModel = await getDynamicModel<ProductDocument>("Product", storeId);

  const { store, products } = await getStoreWithProducts(storeId, ProductModel);
  // NOTE: how to get the ratings/rankings of all the products? + how to allow filtering them?

  response.status(200).json({
    success: true,
    store,
    products,
  });
});