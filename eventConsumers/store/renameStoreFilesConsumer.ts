import cloudflareDeleteMultipleFiles from "@externals/cloudflare/cloudflareDeleteMultipleFiles";
import cloudflareRenameFile from "@externals/cloudflare/cloudflareRenameFile";
import updateStore from "@services/auth/storeServices/updateStore";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import getFilesToRename from "@utils/files/getFilesToRename";

/*
    example:
    old => stores/20250903-14280658/logo.svg
    new => stores/1234567890/logo.svg

    what to do if
    - multiple files to rename ✅loop
    - product case ??
*/


async function renameStoreFilesConsumer(event: StoreCreatedEvent) {
  const {store: { _id, logo },} = event.payload;

  const resourceId = (_id as MongoId).toString();

  const toBeRenamedFiles = getFilesToRename(resourceId, [logo]);
  if (!toBeRenamedFiles.length) return new Success({ serviceName: "cloudflare", ack: true });

  const renameResult = await cloudflareRenameFile(toBeRenamedFiles, resourceId);
  if (!renameResult.ok) return new Failure(renameResult.message, { serviceName: "cloudflare", ack: false });

  const { toBeDeletedUrls, toBeUpdatedFields } = renameResult.result;

  const deleteResult = await cloudflareDeleteMultipleFiles(toBeDeletedUrls);
  if (!deleteResult.ok && deleteResult.reason === "error") return new Failure(deleteResult.message, { serviceName: "cloudflare", ack: false });

  const updateResult = await updateStore(resourceId, toBeUpdatedFields);
  if (!updateResult.ok && updateResult.reason === "error") return new Failure(updateResult.message, { serviceName: "cloudflare", ack: false });

  return new Success({ serviceName: "cloudflare", ack: true });
}

export default renameStoreFilesConsumer;
