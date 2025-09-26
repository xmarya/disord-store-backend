import Product from "@models/productModel";
import { getAllDocs } from "@repositories/global";
import { QueryResultsFetchedEvent } from "@Types/events/QueryResultsFetchedEvent";
import { MongoId } from "@Types/Schema/MongoId";
import { ProductDocument } from "@Types/Schema/Product";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { QueryParams } from "@Types/helperTypes/Request";
import eventBus from "@config/EventBus";

async function getAllProductsForPublic(query: QueryParams, storeId?: MongoId) {
  const fields: QueryOptions<ProductDocument>["select"] = ["name", "description","stock", "price", "image", "ratingsAverage", "ratingsQuantity", "ranking", "productType"];

  const safeGetProducts = safeThrowable(
    () => getAllDocs(Product, query, { select: fields, ...(storeId && { condition: { store: storeId } }) }),
    (error) => new Failure((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => safeGetProducts);
  if (result.ok) {
    const queryPart = storeId ? JSON.stringify({ store: storeId, ...query }) : JSON.stringify(query);
    const event: QueryResultsFetchedEvent = {
      type: "queryResults-fetched",
      payload: {
        key: `Products:${queryPart}`,
        queryResults: result.result,
      },

    };

  eventBus.publish(event);
  }

  return result;
}

export default getAllProductsForPublic;
