import { lightFormat } from "date-fns";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import { buildDateFilter } from "@utils/queryModifiers/formatDateQuery";
import { SUPPORTED_DATE_FORMATS } from "../_constants/dataStructures";

const getDateQuery = catchAsync(async (request, response, next) => {
  const { dateFrom, dateTo, sortBy, sortOrder } = request.query as { dateFrom: string; dateTo: string; sortBy: string; sortOrder: "desc" | "asc" };

  const filter: string[] = [dateFrom, dateTo].map((date) => {
    if (!date || date.toString().trim() === "") return lightFormat(new Date(), "yyyy-MM-dd");
    return date.toString();
  });

  const dateFilter = buildDateFilter(filter);
  if (!dateFilter) return next(new AppError(400, `Please provide a date with one of these format: ${SUPPORTED_DATE_FORMATS.join(", ")}`));

  request.dateQuery = { dateFilter, sortBy, sortOrder };

  next();
});

export default getDateQuery;
