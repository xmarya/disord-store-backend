import cloudflareDeleteMultipleFiles from "@externals/cloudflare/cloudflareDeleteMultipleFiles";
import cloudflareRenameFile from "@externals/cloudflare/cloudflareRenameFile";
import updateOneProduct from "@services/auth/productServices/updateProduct";
import { ProductCreatedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import getFilesToRename from "@utils/files/getFilesToRename";

// what about digital product files?
async function renameProductFilesConsumer(event: ProductCreatedEvent) {
  const { product: { _id, store, coverImage, image }} = event.payload;
  const resourceId = (_id as string).toString();

  const toBeRenamedFiles = getFilesToRename(resourceId, [coverImage, ...image]);
  if (!toBeRenamedFiles.length) return new Success({ serviceName: "cloudflare", ack: true });

  const storeId = store.toString();
  const renameResult = await cloudflareRenameFile(toBeRenamedFiles, `stores/${storeId}/products/${resourceId}`); // in this format => stores/987654321/products/456718293/cover.jpeg
  if (!renameResult.ok) return new Failure(renameResult.message, { serviceName: "cloudflare", ack: false });

  const { toBeDeletedUrls, toBeUpdatedFields } = renameResult.result;

  const deleteResult = await cloudflareDeleteMultipleFiles(toBeDeletedUrls);
  if (!deleteResult.ok && deleteResult.reason === "error") return new Failure(deleteResult.message, { serviceName: "cloudflare", ack: false });

  const updateResult = await updateOneProduct(store, resourceId, toBeUpdatedFields);
  if (!updateResult.ok && updateResult.reason === "error") return new Failure(updateResult.message, { serviceName: "cloudflare", ack: false });
  
    return new Success({ serviceName: "cloudflare", ack: true });
}

export default renameProductFilesConsumer;
