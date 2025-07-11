import { createAssistant, deleteAssistant } from "../../_services/assistant/assistantService";
import { getOneDocByFindOne, getOneDocById } from "../../_services/global";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import StoreAssistant from "../../models/storeAssistantModel";
import Store from "../../models/storeModel";

export const createAssistantController = catchAsync(async (request, response, next) => {
  console.log("create Assistant Controller");
  const { permissions } = request.body;
  if (!permissions) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const storeId = request.store; // there is no storeId in the request.params for this route, these controllers are only for storeOwner uses, so the store id is available inside request.user.myStore

  const data = { ...request.body, permissions, storeId };

  const assistant = await createAssistant(data);

  response.status(201).json({
    success: true,
    assistant,
  });
});

export const getAllAssistantsController = catchAsync(async (request, response, next) => {
  const storeId = request.store; // NOTE: myStore property is only available for the storeOwner. Only the owner who can view all the assistants
  if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  const assistants = await getOneDocById(Store, storeId, { select: ["storeAssistants"] });

  if (!assistants?.storeAssistants?.length) return next(new AppError(404, "لا يوجد مساعدين في هذا المتجر"));

  response.status(200).json({
    success: true,
    assistants,
  });
});

export const getOneAssistantController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  const assistantId = request.params.id;
  if (!assistantId) return next(new AppError(400, "لابد من توفير معرف المستخدم"));

  const assistant = await getOneDocByFindOne(StoreAssistant, { condition: { assistant: assistantId } });

  if (!assistant) return next(new AppError(404, "لا يوجد مستخدم بهذا المعرف"));

  response.status(200).json({
    success: true,
    assistant,
  });
});

export const deleteAssistantController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  const assistantId = request.params.id;
  if (!assistantId) return next(new AppError(400, "لابد من توفير معرف المستخدم"));

  await deleteAssistant(storeId, assistantId);

  response.status(204).json({
    success: true,
  });
});
