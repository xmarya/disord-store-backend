import { UploadFileData } from "@Types/helperTypes/Files";
import { catchAsync } from "@utils/catchAsync";
import uploadFilesAndMergeIntoBodyData from "@utils/files/uploadFilesAndMergeIntoBodyData";
import returnError from "@utils/returnError";
import { format } from "date-fns";

const handleParsedFiles = (fileDirectory: UploadFileData["fileDirectory"]) => catchAsync(async (request, response, next) => {
  console.log("handleParsedFiles", !request.parsedFile);
    if (!request.parsedFile) return next();

    let id:string;

    if(fileDirectory === "users") id = request.user.id;
    else id = request.store?.toString() ?? format(new Date(), "yyMMdd-HHmmssSSS");
    
    const result = await uploadFilesAndMergeIntoBodyData(fileDirectory, id, request.parsedFile, request.body);

    if (!result.ok) return next(returnError(result));
    const { result: body } = result;

    request.body = body;
    return next();
  });

export default handleParsedFiles;
