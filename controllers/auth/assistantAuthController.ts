import { createAssistant, deleteAssistant, getAllAssistants, getOneAssistant } from "../../_services/assistant/assistantService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import validateNewUserData from "../../_utils/validateNewUserData";



export const createAssistantController = catchAsync(async (request, response, next) => {
  console.log("create Assistant Controller");
  sanitisedData(request, next);
  validateNewUserData(request, next);

  const {permissions} = request.body;

  if(!permissions) return next( new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const assistant = await createAssistant(request);

  response.status(201).json({
    status: "success",
    assistant
  });
});

export const getAllAssistantsController = catchAsync(async (request, response, next) => {
  const storeId = request.user.myStore;
  if(!storeId) return next(new AppError(400, "لا يوجد متجر"));

  const assistants = await getAllAssistants(storeId as string);

  if(!assistants) return next(new AppError(400, "لا يوجد مساعدين في هذا المتجر"));

  response.status(200).json({
    status: "success",
    assistants
  });
});

export const getOneAssistantController = catchAsync(async (request, response, next) => {
  const assistantId = request.params.id;

  const assistant = await getOneAssistant(assistantId);

  if(!assistant) return next(new AppError(400, "لا يوجد مستخدم بهذا المعرف"));

  response.status(200).json({
    status: "success",
    assistant
  })
});

export const deleteAssistantController = catchAsync(async (request, response, next) => {
  const assistant = await deleteAssistant(request.params.id);

  response.status(204).json({
    status: "success",
    assistant
  })
});
