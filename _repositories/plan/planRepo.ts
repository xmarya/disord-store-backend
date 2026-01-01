import { endOfMonth, startOfMonth } from "date-fns";
import mongoose from "mongoose";
import { PlansNames, SubscriptionTypes, UnlimitedPlanDataBody } from "@Types/Schema/Plan";
import Plan from "@models/planModel";
import PlanStats from "@models/planStatsModel";
import { MongoId } from "@Types/Schema/MongoId";
import { endOfYear, startOfYear } from "date-fns";

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

export async function getAnnualStatsReport(sortBy: "year" | "profits" | "subscribers" = "year", sortOrder: "desc" | "asc" = "desc", year?: string) {
  // aggregate, group them by the planName-year, return them as an array of years objects
  // [2024: { planName1: {subscribers, profits}, planName2: {subscribers, profits} },
  // 2025: { planName1: {subscribers, profits}, planName2: {subscribers, profits} }]
  // if the specificYear was provided, return only its data
  const sortByProperty = sortBy?.trim() !== "year" ? sortBy : "_id.year";
  const yearStage = year?.trim()
    ? {
        $match: {
          date: {
            $gte: startOfYear(new Date(+year, 0, 1)),
            $lte: endOfYear(new Date(+year, 0, 1)),
          },
        },
      }
    : null;

    const results = await PlanStats.aggregate([
    /* Since the object aren't iterable, how could I spread it? the way to get around this
          is by wrapping the object by [] and spreading it
          🧠 Rule of Thumb 👍🏻: Want to conditionally include an object in an array? → Wrap it in an array before spreading.
          ...{} ❌
          ...[{}] ✅
          */
    ...(yearStage ? [yearStage] : []), // [] because the aggregation is an array of stages, each stage is an object.
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          planName: "$planName",
        },
        subscribers: { $sum: "$monthly.subscribers" },
        profits: { $sum: "$monthly.profits" },
        newSubscribers: { $sum: "$monthly.newSubscribers" },
        renewals: { $sum: "$monthly.renewals" },
        upgrades: { $sum: "$monthly.upgrades" },
        downgrades: { $sum: "$monthly.downgrades" },
      },
    },
    {
      $sort: {
        // [sortBy]: sortOrder === "desc" ? -1 : 1,//✅
        // "_id.year": sortOrder === "desc" ? -1 : 1
        [sortByProperty]: sortOrder === "desc" ? -1 : 1,
      },
    },
    {
      $group: {
        _id: "$_id.year",
        plans: {
          $push: {
            // these should be k,v. mongoose threw an error when they was key,value.
            k: "$_id.planName",
            v: {
              subscribers: "$subscribers",
              profits: "$profits",
              newSubscribers: "$newSubscribers",
              renewals: "$renewals",
              upgrades: "$upgrades",
              downgrades: "$downgrades",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id",
        plans: {
          $arrayToObject: "$plans",
        },
      },
    },
  ]);
  if (year) {
    const match = results.find((res) => res.year === +year); // this condition had a bug resulted in an empty data because I was doing a comparison between a string and a number
     return match || { [year]: {} };
  } 
    return results.reduce((acc, item) => {
      acc[item.year] = item.plans;
      return acc;
    }, {});
}
export async function getPlansTotalsReport() {
// aggregate, group them by the planName, return as an object {planName: {subscribers, profits}}
  const pipeline = [
    {
      $group: {
        _id: "$planName",
        subscribers: { $sum: "$monthly.subscribers" },
        profits: { $sum: "$monthly.profits" },
        newSubscribers: { $sum: "$monthly.newSubscribers" },
        renewals: { $sum: "$monthly.renewals" },
        upgrades: { $sum: "$monthly.upgrades" },
        downgrades: { $sum: "$monthly.downgrades" },
      },
    },
    {
      $project: {
        _id: 0,
        planName: "$_id",
        subscribers: 1,
        profits: 1,
        newSubscribers: 1,
        renewals: 1,
        upgrades: 1,
        downgrades: 1,
      },
    },
  ];

  const results = await PlanStats.aggregate(pipeline);

  return results.reduce((acc, item) => {
    acc[item.planName] = {
      subscribers: item.subscribers,
      profits: item.profits,
      newSubscribers: item.newSubscribers,
      renewals: item.renewals,
      upgrades: item.upgrades,
      downgrades: item.downgrades,
    };
    return acc;
  }, {});
}

export async function updatePlanMonthlyStats(planName: PlansNames, profit: number, operationType: SubscriptionTypes | "cancellation" /*session: mongoose.ClientSession*/) {
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

  return await PlanStats.findOneAndUpdate(
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
  ) /*.session(session)*/;
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
