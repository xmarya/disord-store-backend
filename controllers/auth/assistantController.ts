import { createAssistant, deleteAssistant } from "@repositories/assistant/assistantRepo";
import { getAllDocs, getOneDocByFindOne, getOneDocById, isExist, updateDoc } from "@repositories/global";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import novuCreateAssistantSubscriber from "../../externals/novu/subscribers/createSubscriber";
import StoreAssistant from "@models/storeAssistantModel";
import User from "@models/userModel";

export const createAssistantController = catchAsync(async (request, response, next) => {
  const { permissions } = request.body;
  if (!permissions) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const storeId = request.store; // there is no storeId in the request.params for this route, these controllers are only for storeOwner uses, so the store id is available inside request.user.myStore

  const data = { ...request.body, permissions, storeId };

  const { assistant, user } = await createAssistant(data);

  /* CHANGE LATER: publish an event */
  await novuCreateAssistantSubscriber(user, assistant.inStore, assistant.permissions);

  response.status(201).json({
    success: true,
    data: {assistant},
  });
});

export const getAllAssistantsController = catchAsync(async (request, response, next) => {
  const storeId = request.store; // NOTE: myStore property is only available for the storeOwner. Only the owner who can view all the assistants

  const assistants = await getAllDocs(StoreAssistant, request.query, { condition: { inStore: storeId } });

  if (!assistants?.length) return next(new AppError(404, "لا يوجد مساعدين في هذا المتجر"));

  response.status(200).json({
    success: true,
    data: {assistants},
  });
});

export const getOneAssistantController = catchAsync(async (request, response, next) => {
  const { assistantId } = request.params;
  if (!assistantId) return next(new AppError(400, "لابد من توفير معرف المستخدم"));

  const assistant = await getOneDocByFindOne(StoreAssistant, { condition: { assistant: assistantId } });

  if (!assistant) return next(new AppError(404, "لا يوجد مستخدم بهذا المعرف"));

  response.status(200).json({
    success: true,
    data: {assistant},
  });
});

export const updateAssistantController = catchAsync(async (request, response, next) => {
  if (!Object.keys(request.body).length) return next(new AppError(400, "no data was provided in the request.body"));
  const { assistantId } = request.params;
  const { permissions } = request.body;
  if (permissions) await updateDoc(StoreAssistant, assistantId, permissions);

  const otherData: Record<string, any> = {};
  for (const [key, value] of Object.entries(request.body)) {
    if (typeof value === "string" && value.trim()) otherData[key] = value.trim();
  }

  Object.keys(otherData).length && (await updateDoc(User, assistantId, otherData));
  response.status(203).json({
    success: true,
  });
});

export const deleteAssistantController = catchAsync(async (request, response, next) => {
  const storeId = request.store;

  const { assistantId } = request.params;
  if (!assistantId) return next(new AppError(400, "لابد من توفير معرف المستخدم"));

  await deleteAssistant(storeId, assistantId);

  response.status(204).json({
    success: true,
  });
});
