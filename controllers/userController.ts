import { UserDocument } from "../_Types/User";
import { AppError } from "../_utils/AppError";
import { catchAsync } from "../_utils/catchAsync";
import sanitisedData from "../_utils/sanitisedData";
import User from "../models/userModel";


export const getUserByEmail = (email:string) => catchAsync(async (request, response, next) => {
  console.log("getUserByEmail");

  const user = await User.findOne({ email });
  if(!user) return next(new AppError(404, "الرجاء التحقق من البريد الإلكتروني"));

  response.status(200).json({
    status: "success",
    user
  });
});

export const getUserById = (id?:string) => catchAsync(async (request, response, next) => {
  console.log("getUserById");
  const userId = id ?? request.params.id;

  const user = await User.findById(userId);
  if(!user) return next(new AppError(404, "لايوجد مستخدم بهذا المعرف"));

  response.status(200).json({
    status: "success",
    user
  });
});

export const getUserStore = catchAsync(async (request, response, next) => {
    console.log("getUserStore");

    const userId = request.params.id;
    const userStore = await User.findById(userId).select("store");
    console.log("check if the condition in getUserStore is right", userStore);
    if(!userStore) return next(new AppError(404, "هذا المستخدم لا يملك متجرًا"));

    response.status(200).json({
      status: "success",
      userStore
    });

});

export const updateUserProfile = (id?:string) => catchAsync(async (request, response, next) => {
  sanitisedData(request.body, next);

  const userId = id ?? request.body.id
  const {email, username, image}:Partial<Pick<UserDocument, "email" | "username" | "image">> = request.body;

  if(email) {
    const isEmailExist = await User.findOne({email});
    if(isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني  للتسجيل"));
  }

  if(username) {
    const isUsernameExist = await User.findOne({username});
    if(isUsernameExist) return next(new AppError(400, "الرجاء اختيار اسم مستخدم آخر"));
  }

  const updatedUser = await User.findByIdAndUpdate(userId, request.body);

  response.status(201).json({
    status: "success",
    updatedUser
  });

});