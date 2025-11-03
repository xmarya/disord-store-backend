import { ParsedFile } from "@Types/helperTypes/Files";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { catchAsync } from "@utils/catchAsync";
import filesValidator from "@utils/files/filesValidator";
import returnError from "@utils/returnError";
import busboy from "busboy";

const streamParser = catchAsync(async (request, response, next) => {
  //multipart/form-data
  if (!request.headers["content-type"]?.includes("multipart/form-data")) return next();

  let requestFiles: Array<ParsedFile> = [];
  let requestBody:Record<string, any> = {}
  const bbParser = busboy({ headers: request.headers });

  bbParser.on("field", (name, value, info) => {
    requestBody[name] = value;
  });

  bbParser.on("file", async (streamName, stream, streamInfo) => {
    let streamedHeaderBuffer = Buffer.alloc(0); // this creates an empty buffer.  it's equivalent to const array = [];
    stream.on("data", (fileChunk: Buffer) => (streamedHeaderBuffer = Buffer.concat([streamedHeaderBuffer, fileChunk])));

    stream.on("end", () => {
      console.log("end");
      // end event used when the upload file (single stream) was done
      const result = filesValidator(streamName, streamInfo, streamedHeaderBuffer);
      if (!result.ok) return next(returnError(result));
      const { result: parsedFile } = result;

      requestFiles.push(parsedFile);
    });

    stream.once("error", (error) => next(returnError(new Failure(error.message))));
  });

  bbParser.on("finish", () => {
    // finish event used when the entire process of parsing multipart/form-data using bb was completed
    console.log("finish");
    request.body = requestBody;
    request.parsedFile = requestFiles;
    return next();
  });

  bbParser.once("error", (error) => {
    request.unpipe(bbParser);
    bbParser.removeAllListeners();

    return next(returnError(new Failure((error as Error).message)));
  });

  // NOTE TTR: pipe() is a CONNECTOR; it connects readable stream from one side, into the writable stream on the other side
  request.pipe(bbParser); // request.pipe() here, streams the multipart/form-data to the parser
});

export default streamParser;
