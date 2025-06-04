import { catchAsync } from "./catchAsync";

/* SOLILOQUY: what about making the function accepts the job itself? 
I mean, inside the store router this will be the top of the stack and 
I'll pass the updateStoreStats controller, the same thing applies for the plan inside the admin router.
all is left is to pass that controller to the three job starters
*/
const jobSchedule = catchAsync(async (request, response, next) => {
    await Promise.all([
        dailyJob(),
        monthlyJob(),
        yearlyJob()
    ]);
  next();
});

async function dailyJob() {
  const newDay = "00 00 00 * * *"; // starts at midnight
  // TODO: call the stats controller of the store and the plan
}

async function monthlyJob() {
  const newMonth = "0 0 0 1 * *";
  // TODO: call the stats controller of the store and the plan
}

async function yearlyJob() {
  const newYear = "0 0 0 1 1 *";
  // TODO: call the stats controller of the store and the plan
}

export default jobSchedule;
