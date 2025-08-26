import { endOfMonth, startOfMonth } from "date-fns";
import mongoose from "mongoose";
import { PlansNames, SubscriptionTypes, UnlimitedPlanDataBody } from "@Types/Plan";
import Plan from "@models/planModel";
import PlanStats from "@models/planStatsModel";
import { MongoId } from "@Types/MongoId";

export async function createUnlimitedPlan(data: UnlimitedPlanDataBody, session: mongoose.ClientSession) {
  /*✅*/
  const newPlan = await Plan.create([data], { session });

  return newPlan[0];
}

export async function checkPlanName(id: MongoId): Promise<boolean> {
  const isUnlimited = await Plan.exists({ _id: id, planName: "unlimited" });

  return !!isUnlimited;
}

export async function getMonthlyPlansStats(dateFilter: { date: { $gte: Date; $lte: Date } }, sortBy: "subscribers" | "profits" = "profits", sortOrder: "asc" | "desc" = "desc") {
  /*✅*/
  const monthlyStats = await PlanStats.aggregate([
    {
      $match: {
        ...dateFilter, // this breaks the monthly part of the logic. it's now similar to getAnnualStatsReport. how to change this to only
      },
    },
    {
      $group: {
        _id: "$planName",
        subscribers: { $sum: "$monthly.subscribers" },
        profits: { $sum: "$monthly.profits" },
      },
    },
    { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
    {
      $project: {
        _id: 0,
        planName: "$_id",
        subscribers: 1,
        profits: 1,
      },
    },
  ]);

  return monthlyStats;
}
export async function getPlansStatsReport(sortBy: "year" | "profits" | "subscribers" = "year", sortOrder: "desc" | "asc" = "desc", specificYear?: number) {
  /*✅*/
  const annualReport = await PlanStats.getAnnualStatsReport(sortBy, sortOrder, specificYear);
  const totalsReport = await PlanStats.getPlansTotalsReport();
  return { annualReport, totalsReport };
}

export async function updatePlanMonthlyStats(planName: PlansNames, profit: number, operationType: SubscriptionTypes | "cancellation", /*session: mongoose.ClientSession*/) {
  /*✅*/
  /* OLD CODE (kept for reference): 
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1); // =< year-month-1st day
        const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Here’s the key trick: In JavaScript, when you pass 0 as the day of the month,
        // it gives you the last day of the previous month. So, new Date(2025, 5, 0) → 2025-05-31
    */
  const now = new Date();
  const firstDayOfCurrentMonth = startOfMonth(now);
  const lastDayOfCurrentMonth = endOfMonth(now);

  const isIncrement = operationType !== "cancellation";
  const subscribers = isIncrement ? 1 : -1;
  const profits = isIncrement ? profit : -profit;

  const isNew = operationType === "new" ? 1 : 0;
  const isRenewal = operationType === "renewal" ? 1 : 0;
  const isUpgrade = operationType === "upgrade" ? 1 : 0;
  const isDowngrade = operationType === "downgrade" ? 1 : 0;

  await PlanStats.findOneAndUpdate(
    { planName, date: { $gte: firstDayOfCurrentMonth, $lte: lastDayOfCurrentMonth } }, // condition
    {
      // update data
      $inc: {
        "monthly.subscribers": subscribers,
        "monthly.profits": profits,
        "monthly.newSubscribers": isNew,
        "monthly.renewals": isRenewal,
        "monthly.upgrades": isUpgrade,
        "monthly.downgrades": isDowngrade,
      },
      $setOnInsert: {
        planName,
        date: now,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true } // options
  )/*.session(session)*/;
}

// subscription Timeline:
// 1- the user subscribes (new one)
// 2- fill out user's subscribedPlanDetails & pastSubscriptions fields
// 3- get the current month
// 4- (by using aggregate? or a simple findOne?) check if the PlanStats of the subscribed-to plan has a document with this date (year-month)
// 5- it has ? increment the monthly field. it hasn't? create a new doc with the current year-month and value of 1 in the monthly field
// 6- at the beginning of a new month, increment the annual/totalSubscribers field value by the last month record

// the problems:
// 1- how to distinguish between the new subscription and the renewal one?
//   is it by checking if the user is existing in the db? but that user maybe a regular user without subscription and they decided to subscribe now ..?
// 2- should the annual and totalSubscribers records be virtual fields ? or keep the annual as it's -a static field-
//   to make calculating the totalSubscribers much easier as a virtual field?
// 3- in case I kept the annual as it is, I think it's best to only increment it before resetting the monthly field
// 4- but keeping it as a static, means that it would be a repetitive in all the docs that is purpose is to act as a record for tracking the monthly subscriptions
