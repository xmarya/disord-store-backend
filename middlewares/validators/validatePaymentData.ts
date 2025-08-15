/*
    I have to :
    1- validate the card number, expiring date (valid year and valid month), CVV (must be exactly 3? digits) ✅
    2- encryption for the name on the card, card number before saving it
    3- middleware before payment ✅
    4- monitor(?) like hook to for expiring date (in the front-end)
    5- if not possible, add the logic of checking in the middleware that is going to be placed before the payment ✅
    6- check if the user has a card already, if not, then make it default
*/

import { isPast, isValid } from "date-fns";
import { UserCreditCardDataBody } from "../../_Types/UserCreditCard";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";

const validatePaymentData = catchAsync(async (request, response, next) => {
  const { cardName, cardNumber, cardExpireIn, CVV } = request.body as UserCreditCardDataBody;

  if (!cardName?.trim() || !isValidLuhn(cardNumber) || !isStillValid(cardExpireIn) || CVV.length !== 3) return next(new AppError(400, "make sure the payment card details are valid."));

  //   next();

  response.status(200).json({
    success: true,
    message: "congrats!",
  });
});

/* Luhn algorithm explained: https://www.youtube.com/watch?v=wsphC8V36i0

    1- IT treats the card number as a string
    2- IT needs the string to be reversed before doing any checking
    3- IT starts with something known as "sum of number in odd places". 
        in this stage, whenever It came across an odd INDEX -not number- IT sums the numbers that are existing
        inside that odd index all together.
    4- For the remaining numbers, It says DOUBLE every second digit from the right. 
        However, this step doesn't stop here. when the number is 9, 
        the double of 9 is 18, IT will split it to be 1 + 8, which is going to result 9 again.
        the exact same thing applied to the 8, its double is 16 => 1 + 6 => 7.
        NOTE that: 18 - 9 = 9 and 16 - 9 = 7. so I can make use of this info
    5- after all of that, IT sums them all together
    6- Here is comes the check, if the sum of the odd + even will result in a value that its divide to 10 is going to be 0, then the card number is VALID

*/

function isValidLuhn(cardNumber: string): boolean {
  /* OLD CODE (kept for reference): 
        const digits = cardNumber.split("").reverse().map(Number);
        the above line is full of vulnerabilities; it doesn't clean up any spaces, letters, hyphens. it assumes that the string is 100% only numbers
    */
  const digits = cardNumber.replace(/\D/g, "").split("").reverse().map(Number);
  //   if (digits.length !== 16) return false; NOTE: I'm not sure of what length the card number should be
  console.log(digits);
  const result = digits.reduce((lastIterationSum, currentDigit, currentIndex) => {
    if (currentIndex % 2 === 1) {
      // because the array is reversed, the logic should double the odd indices in order to ignore the check digit (check digit is the last digit in the original number)
      let digitDoubled = currentDigit * 2;
      return digitDoubled > 9 ? (lastIterationSum += digitDoubled - 9) : (lastIterationSum += digitDoubled);
    } else return (lastIterationSum += currentDigit);
  }, 0);
  console.log(result, "=>", result % 10);
  return result % 10 === 0;
}

function isStillValid(expDate: string): boolean {
  const splitBy = expDate.includes("-") ? "-" : "/";

  let [month, year] = expDate.split(splitBy).map(Number);
  if (!month || !year || month < 1 || month > 12) return false;

  if (year < 100) year += 2000; // since I assume the coming format is two-two (05-29); I used this condition

  // Expiry should be the **last day** of the month
  const cardFullDate = new Date(year, month, 0); // Day 0 of next month = last day of this month (the JS months are 0-based)

  console.log(isPast(cardFullDate));
  return isValid(cardFullDate) && !isPast(cardFullDate);
}

export default validatePaymentData;
