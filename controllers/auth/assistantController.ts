import { createAssistant, deleteAssistant, getAllAssistants, getOneAssistant } from "../../_services/assistant/assistantService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import validateNewUserData from "../../_utils/validateNewUserData";



export const createAssistantController = catchAsync(async (request, response, next) => {
  console.log("create Assistant Controller");
  //TODO: check the plan before proceeding
  sanitisedData(request, next);
  validateNewUserData(request, next);

  const {permissions} = request.body;
  if(!permissions) return next( new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const storeId = request.params.storeId;

  const data = {...request.body, permissions, storeId}

  const assistant = await createAssistant(data);

  response.status(201).json({
    status: "success",
    assistant
  });
});

export const getAllAssistantsController = catchAsync(async (request, response, next) => {
  const storeId = request.user.myStore; // NOTE: myStore property is only available for the storeOwner. Only the owner who can view all the assistants 
  if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));


  const assistants = await getAllAssistants(storeId);

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
