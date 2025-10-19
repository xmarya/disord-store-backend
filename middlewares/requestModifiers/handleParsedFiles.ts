import { UploadFileData } from "@Types/helperTypes/Files";
import { catchAsync } from "@utils/catchAsync";
import uploadFilesAndMergeIntoBodyData from "@utils/files/uploadFilesAndMergeIntoBodyData";
import returnError from "@utils/returnError";
import { format } from "date-fns";

const handleParsedFiles = (fileDirectory: UploadFileData["fileDirectory"]) => catchAsync(async (request, response, next) => {
    if (!request.parsedFile.length) return next();

    const id:string = fileDirectory === "users" ? request.user.id : fileDirectory === "stores" ? request.store.toString() : format(new Date(), "yyMMdd-HHmmssSSS");
    const result = await uploadFilesAndMergeIntoBodyData(fileDirectory, id, request.parsedFile, request.body);

    if (!result.ok) return next(returnError(result));
    const { result: body } = result;

    request.body = body;
    return next();
  });

export default handleParsedFiles;
