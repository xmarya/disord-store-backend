import eventBus from "@config/EventBus";
import Product from "@models/productModel";
import { getAllDocs } from "@repositories/global";
import { QueryResultsFetched } from "@Types/events/QueryResultsFetched";
import { ProductDocument } from "@Types/Product";
import { QueryOptions } from "@Types/QueryOptions";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllProductsForPublic(query: QueryParams) {
  const fields: QueryOptions<ProductDocument>["select"] = ["name", "description", "store", "stock", "price", "image", "ratingsAverage", "ratingsQuantity", "ranking", "productType"];
  const safeGetProducts = safeThrowable(
    () => getAllDocs(Product, query, { select: fields }),
    (error) => new Error((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => safeGetProducts);
  if (result.ok) {
    const event: QueryResultsFetched = {
      type: "queryResults-fetched",
      payload: {
        key: `Products:${JSON.stringify(query)}`,
        queryResults: result.result,
      },

      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }

  return result;
}

export default getAllProductsForPublic;
