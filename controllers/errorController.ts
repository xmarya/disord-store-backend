import { ErrorRequestHandler } from "express";
import { AppError } from "@Types/ResultTypes/errors/AppError";

function formatErrorResponse(error: AppError & { code: number | undefined }): { statusCode: number; message: string } {
  const { name, statusCode, code } = error;
  if (code === 11000) return { statusCode: 400, message: `لا يمكن إضافة قيمة موجودة مسبقًا` };
  if (name === "CastError") return { statusCode: 400, message: "نوع المدخلات خاطئة" };
  if (name === "TokenExpiredError") return { statusCode: statusCode || 401, message: "انتهت مدة الجلسة. الرجاء تسجيل الدخول" };
  else return { statusCode: statusCode || 500, message: error.message || "حدث خطأ أثناء معالجة العملية. الرجاء المحاولة مجددًا" };
}

const errorController: ErrorRequestHandler = (error: AppError & { code: number | undefined }, request, response, next) => {
  //   const {name, message:errorMessage} = error;
  //   console.log(name, errorMessage, error?.code);
  const { message, statusCode } = formatErrorResponse(error);

  response.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorController;

/*
    errorResponse: {
    index: 0,
    code: 11000,
    errmsg: `E11000 duplicate key error collection: Discord-Store.categories index: name_1_store_1 dup key: { name: "books", store: ObjectId('687600d057acaf546ee48f2e') }`,
    keyPattern: { name: 1, store: 1 },
    keyValue: { name: 'books', store: new ObjectId('687600d057acaf546ee48f2e') }
  },
  index: 0,
  code: 11000,
  keyPattern: { name: 1, store: 1 },
  keyValue: { name: 'books', store: new ObjectId('687600d057acaf546ee48f2e') }
}
*/
