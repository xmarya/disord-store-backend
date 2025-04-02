import { createStore } from "../../_services/store/storeService";
import { StoreDocument } from "../../_Types/Store";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import { deleteOne, getOne, updateOne } from "../global";


export const createStoreController = catchAsync(async (request, response, next) => {
    sanitisedData(request, next);

    const {storeName} = request.body;
    const owner = request.user.id;

    if(!storeName || !owner) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));
    const data = {...request.body, owner}
    const newStore = await createStore(data);

    response.status(201).json({
        status: "success",
        newStore
    });
});

export const getMyStoreController = getOne("Store");
export const updateStoreController = updateOne("Store");
export const deleteStoreController = deleteOne("Store");
