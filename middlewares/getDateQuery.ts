import { lightFormat } from "date-fns";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import { buildDateFilter } from "@utils/queryModifiers/formatDateQuery";
import { SUPPORTED_DATE_FORMATS } from "../_constants/dataStructures";

const getDateQuery = catchAsync(async (request, response, next) => {
  const { dates, sortBy, sortOrder } = request.body;

  // const filter:string[] = dates?.length > 0 ? dates : [
  //     lightFormat(startOfMonth(now), "yyyy-MM-dd"),
  //     lightFormat(endOfMonth(now), "yyyy-MM-dd")
  // ]
  const filter: string[] = dates?.length > 0 ? dates : [lightFormat(new Date(), "yyyy-MM-dd")]; // set today as the default value if there is no dates array
  const dateFilter = buildDateFilter(filter);
  if (!dateFilter) return next(new AppError(400, `Please provide a date with one of these format: ${SUPPORTED_DATE_FORMATS.join(", ")}`));

  request.dateQuery = { dateFilter, sortBy, sortOrder };

  next();
});

export default getDateQuery;
