import { getOneStoreStats } from "@repositories/store/storeStatsRepo";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";


export const getStoreStatsController = catchAsync(async (request, response, next) => {
  /* BUG: 
  const { dates } = request.body;
    this condition WOULD NEVER be wrong, the .length property doesn't assure that the dates is an ARRAY,
    there is a possibility for it be a string and it has .length property too.
    if(!dates.length) return next(new AppError(400, "specify the dates inside an array"));
  */
  const { dateFilter, sortBy, sortOrder } = request.dateQuery;
  const storeId = request.store;
  const stats = await getOneStoreStats(storeId, dateFilter, sortBy, sortOrder);
  if (!stats) return next(new AppError(404, "no stats were found for this store"));

  response.status(200).json({
    success: true,
    data: stats
  });

  /* the response => 
  {
    "success": true,
    "stats": [
        {
            "date": "2025-07-03T08:17:18.354Z",
            "totalSoldProducts": {
                "684ac4c648085d1348231248": 6,
                "684ac6ed0d7b4453cf566bc5": 12,
                "684ac76f9e4ba6351f4fa887": 12
            }
        }
    ]
}
  
  */
});
