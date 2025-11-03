import deleteResourceFile from "@services/_sharedServices/fileServices/deleteResourceFile";
import uploadResourceFile from "@services/_sharedServices/fileServices/uploadResourceFile";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const uploadFile = catchAsync(async (request, response, next) => {
  const { parsedFile } = request;
//   const result = await uploadResourceFile(parsedFile);
});

export const deleteFile = catchAsync(async (request, response, next) => {
  const { fileUrl } = request.params;

  const result = await deleteResourceFile(fileUrl);
  if (!result.ok) return next(returnError(result));

  const { result: updatedResource } = result;

  response.status(203).json({
    success: true,
    data: updatedResource,
  });
});
