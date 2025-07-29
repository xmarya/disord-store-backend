import { endOfYear, startOfYear } from "date-fns";
import { model, Schema } from "mongoose";
import { PlanStatsDocument, PlanStatsModel } from "../_Types/Plan";

const planStatsSchema = new Schema<PlanStatsDocument>(
  {
    planName: {
      type: String,
      enum: ["basic", "plus", "unlimited"],
      required: [true, "the name field is required"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    monthly: {
      subscribers: {
        type: Number,
        default: 0,
      },
      profits: {
        type: Number,
        default: 0,
      },
      newSubscribers: {
        type: Number,
        default: 0,
      },
      renewals: {
        type: Number,
        default: 0,
      },
      upgrades: {
        type: Number,
        default: 0,
      },
      downgrades: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

planStatsSchema.statics.getAnnualStatsReport = async function (sortBy: "year" | "profits" | "subscribers", sortOrder: "desc" | "asc", specificYear?: number) {
  /*REQUIRES TESTING*/
  // aggregate, group them by the planName-year, return them as an array of years objects
  // [2024: { planName1: {subscribers, profits}, planName2: {subscribers, profits} },
  // 2025: { planName1: {subscribers, profits}, planName2: {subscribers, profits} }]
  // if the specificYear was provided, return only its data

  const yearStage = specificYear
    ? {
        $match: {
          date: {
            $gte: startOfYear(new Date(specificYear, 0, 1)),
            $lte: endOfYear(new Date(specificYear, 0, 1)),
          },
        },
      }
    : null;

  const results = await this.aggregate([
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
    {
      $sort: {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
      },
    },
  ]);

  if (specificYear) {
    const match = results.find((res) => res.year === +(specificYear)); // this condition had a bug resulted in an empty data because I was doing a comparison between a string and a number
    return match || { [specificYear]: {} };
  }

  return results.reduce((acc, item) => {
    acc[item.year] = item.plans;
    return acc;
  }, {});
};

planStatsSchema.statics.getPlansTotalsReport = async function () {

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
        upgrades:1,
        downgrades:1
      },
    },
  ];

  const results = await this.aggregate(pipeline);

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
};

const PlanStats = model<PlanStatsDocument, PlanStatsModel>("PlanStats", planStatsSchema);
export default PlanStats;

/*NOTE:
  this model is responsible about storing the annual Subscribers
  when a new year starts the last year's Subscriber is going to be transferred here after that
  the storeStates collection data will be reset.
*/
