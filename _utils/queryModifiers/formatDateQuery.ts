import { endOfDay, endOfMonth, endOfWeek, formatISO, isValid, parse, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { SUPPORTED_DATE_FORMATS } from "../../_constants/dataStructures";

function getParsedDate(date: string): Date | null {
  for (const format of SUPPORTED_DATE_FORMATS) {
    const parsedDate = parse(date, format, new Date());
    if (isValid(parsedDate)) return parsedDate;
  }
  return null;
}

export function buildDateFilter(dates: Array<string>) {
  // STEP 1) validate the format and the type:
  const validDates = dates.map(getParsedDate).filter((date): date is Date => date !== null);
  // NOTE: I could have done it without the filter(). However, using it saves a lot of time because I would not have to narrowing the type and ensuring the element is a Date. it guarantees the remaining items' types and telling TS that they are real Date objects.

  if (validDates.length === 0) return null;

  //  STEP 2) set the start and the end:
  let start: Date, end: Date;

  // a) if the array has only one date:
  if (validDates.length === 1) {
    start = validDates[0];
    end = validDates[0];
  }

  // b) if there are two or more dates, order them, take the first and the last:
  else {
    const sorted = validDates.sort((a, b) => a.getTime() - b.getTime());
    start = sorted[0];
    end = sorted[sorted.length - 1];
  }

  const firstDate = startOfDay(start);
  const lastDate = endOfDay(end);

  const filter = {
    date: {
      $gte: firstDate,
      $lte: lastDate,
    },
  };

  return filter;
}

/* OLD CODE (kept for reference): 
export function buildDateFilter(dates: Array<string>, dateType: "day" | "week" | "month") {
  // STEP 1) validate the format and the type:
  const validDates = dates.map(getParsedDate).filter((date): date is Date => date !== null); 
  // NOTE: I could have done it without the filter(). However, using it saves a lot of time because I would not have to narrowing the type and ensuring the element is a Date. it guarantees the remaining items' types and telling TS that they are real Date objects.
  
  if (validDates.length === 0) return null;

  //  STEP 2) set the start and the end:
  let start: Date, end: Date;
  
  // a) if the array has only one date:
  if (validDates.length === 1) {
    start = validDates[0];
    end = validDates[0];
  }
  
  // b) if there are two or more dates, order them, take the first and the last:
  else {
    const sorted = validDates.sort((a, b) => a.getTime() - b.getTime());
  start = sorted[0];
  end = sorted[sorted.length - 1];
}

let firstDate:Date, lastDate:Date;

switch (dateType) {
  case "day":
    firstDate = startOfDay(start);
    lastDate = endOfDay(end);
    break;
    
    case "week":
      firstDate = startOfWeek(start);
      lastDate = endOfWeek(end);
      break;
      
      case "month":
        firstDate = startOfMonth(start);
        lastDate = endOfMonth(end);
        break;
        
      }
      
  const filter = {
    date: {
      $gte: firstDate,
      $lte: lastDate,
    },
  }

  return filter;
}

*/
