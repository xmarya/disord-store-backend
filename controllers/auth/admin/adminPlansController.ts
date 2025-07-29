import { getAllDocs, getOneDocById, updateDoc } from "../../../_services/global";
import { checkPlanName, getMonthlyPlansStats, getPlansStatsReport } from "../../../_services/plan/planService";
import { PlanDataBody } from "../../../_Types/Plan";
import { AppError } from "../../../_utils/AppError";
import { catchAsync } from "../../../_utils/catchAsync";
import Plan from "../../../models/planModel";

export const getAllPlanController = catchAsync(async (request, response, next) => {
  const plans = await getAllDocs(Plan, request);
  if (!plans) return next(new AppError(440, "no data was found"));

  response.status(200).json({
    success: true,
    plans,
  });
});

export const getPlanController = catchAsync(async (request, response, next) => {
  const plan = await getOneDocById(Plan, request.params.planId);

  if (!plan) return next(new AppError(404, "no plan was found with this id"));
  response.status(200).json({
    success: true,
    plan,
  });
});

export const updatePlanController = catchAsync(async (request, response, next) => {
  // const { planId } = request.params;
  // const isUnlimited = await checkPlanName(planId);
  // if (!isUnlimited) return next(new AppError(403, "this is unlimited plan, you cant edit its data"));

  //NOTE: what can be updated are: name, price, discount, quota, features
  const { planName, price, discount, features, quota }: PlanDataBody = request.body;
  if (!planName?.trim() && !price && !discount && !features.length && !quota) return next(new AppError(400, "no data was provided to update"));

  const updatedPlan = await updateDoc(Plan, request.params.planId, request.body);
  if (!updatedPlan) return next(new AppError(500, "something went wrong, pleas try again"));

  response.status(201).json({
    success: true,
    updatedPlan,
  });
});

export const getMonthlyPlansStatsController = catchAsync(async (request, response, next) => {
  const { dateFilter, sortBy, sortOrder } = request.dateQuery;

  const allPlansStats = await getMonthlyPlansStats(dateFilter, sortBy, sortOrder);
  if (!allPlansStats.length) return next(new AppError(404, "couldn't find data for the specific date"));

  response.status(200).json({
    success: true,
    allPlansStats,
  });
});

export const getPlansStatsReportController = catchAsync(async (request, response, next) => {
  const { sortBy, sortOrder, year } = request.body;
  const reports = await getPlansStatsReport(sortBy, sortOrder, year);

  if (!reports) return next(new AppError(500, "something went wrong, try again later"));

  response.status(200).json({
    success: true,
    reports,
  });
});
