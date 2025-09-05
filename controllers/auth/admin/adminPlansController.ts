import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { getMonthlyPlansStats, getPlansStatsReport } from "@repositories/plan/planRepo";
import getOnePlan from "@services/auth/plan/getOnePlan";
import updatePlan from "@services/auth/plan/updatePlan";
import { PlanDataBody } from "@Types/Schema/Plan";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const getPlanController = catchAsync(async (request, response, next) => {
  const result = await getOnePlan(request.params.planId);

  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, result.message));
  }

  const { result: plan } = result;
  response.status(200).json({
    success: true,
    data: { plan },
  });
});

export const updatePlanController = catchAsync(async (request, response, next) => {
  //NOTE: what can be updated are: name, price, discount, quota, features
  const { planName, price, discount, features, quota }: PlanDataBody = request.body;
  if (!planName?.trim() && !price && !discount && !features.length && !quota) return next(new AppError(400, "no data was provided to update"));

  const result = await updatePlan(request.params.planId, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: updatedPlan } = result;
  response.status(201).json({
    success: true,
    data: { updatedPlan },
  });
});

export const getMonthlyPlansStatsController = catchAsync(async (request, response, next) => {
  const { dateFilter, sortBy, sortOrder } = request.dateQuery;

  const allPlansStats = await getMonthlyPlansStats(dateFilter, sortBy, sortOrder);
  if (!allPlansStats.length) return next(new AppError(404, "couldn't find data for the specific date"));

  response.status(200).json({
    success: true,
    data: { allPlansStats },
  });
});

export const getPlansStatsReportController = catchAsync(async (request, response, next) => {
  const { sortBy, sortOrder, year } = request.body;
  const reports = await getPlansStatsReport(sortBy, sortOrder, year);

  if (!reports) return next(new AppError(500, INTERNAL_ERROR_MESSAGE));

  response.status(200).json({
    success: true,
    data: { reports },
  });
});
