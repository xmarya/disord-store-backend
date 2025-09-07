import Store from "@models/storeModel";
import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { err } from "neverthrow";

const allowedStatuses = ["active", "maintenance"];
async function updateStoreStatus(storeId: MongoId, status: string) {
  if (!allowedStatuses.includes(status)) return err("the status must be active or maintenance");

  const safeUpdatedStoreStatus = safeThrowable(
    () => updateDoc(Store, storeId, { status }),
    (error) => new Failure((error as Error).message)
  );
  return await extractSafeThrowableResult(() => safeUpdatedStoreStatus);
}

export default updateStoreStatus;
