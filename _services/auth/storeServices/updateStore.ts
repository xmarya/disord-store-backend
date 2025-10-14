import Store from "@models/storeModel";
import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { StoreDataBody } from "@Types/Schema/Store";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { ParsedFile } from "@Types/helperTypes/Files";
import uploadFileAndMergeIntoBodyData from "@utils/files/uploadFilesAndMergeIntoBodyData";

async function updateStore(storeId: MongoId, updatedData: Partial<StoreDataBody>, parsedFiles: Array<ParsedFile>) {

  const mergedDataResult = await uploadFileAndMergeIntoBodyData("stores", storeId, parsedFiles, updatedData);

  if (!mergedDataResult.ok) return mergedDataResult;
  const { result: mergedData } = mergedDataResult;

  const safeUpdateStore = safeThrowable(
    () => updateDoc(Store, storeId, mergedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdateStore);
}

export default updateStore;
