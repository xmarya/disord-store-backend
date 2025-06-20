import { lightFormat } from "date-fns";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { buildDateFilter } from "./formatDateQuery";
import { SUPPORTED_DATE_FORMATS } from "../../_data/constants";

const getDateQuery = catchAsync(async (request, response, next) => {
  const { dates, sortBy, sortOrder } = request.body;
  if (dates.constructor !== Array) return next(new AppError(400, "the dates should be inside an array"));

  // const filter:string[] = dates.length > 0 ? dates : [
  //     lightFormat(startOfMonth(now), "yyyy-MM-dd"),
  //     lightFormat(endOfMonth(now), "yyyy-MM-dd")
  // ]
  const filter: string[] = dates.length > 0 ? dates : [lightFormat(new Date(), "yyyy-MM-dd")];
  const dateFilter = buildDateFilter(filter);
  if (!dateFilter) return next(new AppError(400, `Please provide a date with one of these format: ${SUPPORTED_DATE_FORMATS.join(", ")}`));

  request.dateQuery = { dateFilter, sortBy, sortOrder };

  next();
});

export default getDateQuery;
