import deleteUserCartProducts from "@services/auth/usersServices/cartServices/deleteUserCartProducts";
import deleteUserWishlist from "@services/auth/usersServices/wishlistServices/deleteUserWishlist";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { startSession } from "mongoose";

async function deleteRegularUserRelatedResourcesConsumer(event: UserDeletedEvent) {
  const { userType, usersId } = event.payload;
  if (userType !== "user") return new Success({ serviceName: "regularUserRelatedResources", ack: true });

  const session = await startSession();
  const {wishlistResult, cartResult} = await session.withTransaction(async () => {
    const wishlistResult = await deleteUserWishlist(usersId[0], session);
    const cartResult = await deleteUserCartProducts(usersId[0], session);

    return {wishlistResult, cartResult}
  });

  await session.endSession();

  const bothOK = wishlistResult.ok && cartResult.ok
  if(bothOK) return new Success({ serviceName: "regularUserRelatedResources", ack: true });

  const wishlistNotFound = !wishlistResult.ok && wishlistResult.reason === "not-found";
  const cartNotFound = !cartResult.ok && cartResult.reason === "not-found";
  if(wishlistNotFound && cartNotFound) return new Success({ serviceName: "regularUserRelatedResources", ack: true });

  const wishlistErrorMessage = !wishlistResult.ok ? wishlistResult.message : "";
  const cartErrorMessage = !cartResult.ok ? cartResult.message: "";

  return new Failure(wishlistErrorMessage || cartErrorMessage, { serviceName: "regularUserRelatedResources", ack: false });
}

export default deleteRegularUserRelatedResourcesConsumer;
