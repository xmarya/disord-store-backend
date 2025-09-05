import { createNewAdmin } from "@repositories/admin/adminRepo";
import { createNewRegularUser, createNewStoreOwner } from "@repositories/user/userRepo";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";

function getSignupFunctionOf(userType: UserTypes) {
  switch (userType) {
    case "storeOwner":
      return createNewStoreOwner;
    case "admin":
      return createNewAdmin;

    default:
      return createNewRegularUser;

    /* 
    default:
    return new Failure();
        This expression is not callable. 
        Not all constituents … are callable.
        Type 'Failure' has no call signatures.
        so I had to replace it with an async function that returns the Failure
        return () => {
            return new Failure();
        }
        */
  }
}

export default getSignupFunctionOf;
