import createNewAssistantInStore from "@services/auth/storeOwnerServices/storeAssistant/createNewAssistantInStore";
import deleteStoreAssistant from "@services/auth/storeOwnerServices/storeAssistant/deleteStoreAssistantAccount";
import getAllStoreAssistants from "@services/auth/storeOwnerServices/storeAssistant/getAllStoreAssistants";
import getOneAssistant from "@services/auth/storeOwnerServices/storeAssistant/getAssistantProfile";
import updateStoreAssistant from "@services/auth/storeOwnerServices/storeAssistant/updateStoreAssistant";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createAssistantController = catchAsync(async (request, response, next) => {
  const result = await createNewAssistantInStore(request.store, request.body, request.plan);

  if (!result.ok) return next(returnError(result));

  const { result: newAssistant } = result;

  response.status(201).json({
    success: true,
    data: { newAssistant },
  });
});

export const getAllAssistantsController = catchAsync(async (request, response, next) => {
  const storeId = request.store;

  const result = await getAllStoreAssistants(storeId, request.query);
  if (!result.ok) return next(returnError(result));

  const { result: assistants } = result;

  response.status(200).json({
    success: true,
    data: { assistants },
  });
});

export const getOneAssistantController = catchAsync(async (request, response, next) => {
  const { assistantId } = request.params;

  const result = await getOneAssistant(assistantId, request.store);

  if (!result.ok) return next(returnError(result));

  const { result: assistant } = result;
  response.status(200).json({
    success: true,
    data: { assistant },
  });
});

export const updateAssistantController = catchAsync(async (request, response, next) => {
  const assistantId = request.params.assistantId;
  const storeId = request.store;
  const result = await updateStoreAssistant(assistantId, storeId, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: assistant } = result;
  response.status(203).json({
    success: true,
    data: {
      assistant,
    },
  });
});

export const deleteAssistantController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  const { assistantId } = request.params;

  const result = await deleteStoreAssistant(assistantId, storeId);

  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "assistant was deleted successfully",
  });
});
