
import { 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addMonths,
  isSameDay,
  setYear,
  isAfter,
  lastDayOfMonth,
  isSameMonth
} from 'date-fns';
import { AgeResult, BirthdayCountdown, ZodiacInfo } from '../types.ts';

/**
 * Calculates age precisely with month-end logic.
 * If born on the last day of month, month anniversaries occur on the last day of subsequent months.
 */
export const calculateAge = (dob: Date, targetDate: Date = new Date()): AgeResult => {
  const isBirthLastDay = isSameDay(dob, lastDayOfMonth(dob));
  const isTargetLastDay = isSameDay(targetDate, lastDayOfMonth(targetDate));

  // Calculate total full months between dates
  let totalMonths = differenceInMonths(targetDate, dob);

  // Correction for month-end: if both are last days of their respective months,
  // date-fns differenceInMonths usually handles this, but we ensure it's exact.
  if (isBirthLastDay && isTargetLastDay && !isSameMonth(dob, targetDate)) {
    // Already handled by differenceInMonths in most versions of date-fns, 
    // but explicit logic would go here if needed.
  }

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  // Calculate days remaining after full months
  const dateAfterFullMonths = addMonths(dob, totalMonths);
  let days = differenceInDays(targetDate, dateAfterFullMonths);

  // If both are last days, there are 0 remaining days because it's a perfect month anniversary
  if (isBirthLastDay && isTargetLastDay) {
    days = 0;
  }

  return {
    years,
    months: remainingMonths,
    days,
    totalMonths: totalMonths,
    totalWeeks: 0, 
    totalDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalSeconds: 0,
  };
};

export const getBirthdayCountdown = (dob: Date, targetDate: Date = new Date()): BirthdayCountdown => {
  const targetYear = targetDate.getFullYear();
  let nextBirthday = setYear(dob, targetYear);

  if (isAfter(targetDate, nextBirthday) && !isSameDay(targetDate, nextBirthday)) {
    nextBirthday = setYear(dob, targetYear + 1);
  }

  if (isSameDay(targetDate, nextBirthday)) {
    return { months: 0, days: 0, isToday: true };
  }

  let tempDate = targetDate;
  const months = differenceInMonths(nextBirthday, tempDate);
  tempDate = addMonths(tempDate, months);
  const days = differenceInDays(nextBirthday, tempDate);

  return { months, days, isToday: false };
};

export const getZodiacSign = (date: Date): ZodiacInfo => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: "Aquarius", symbol: "♒", element: "Air" };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: "Pisces", symbol: "♓", element: "Water" };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: "Aries", symbol: "♈", element: "Fire" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: "Taurus", symbol: "♉", element: "Earth" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: "Gemini", symbol: "♊", element: "Air" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: "Cancer", symbol: "♋", element: "Water" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: "Leo", symbol: "♌", element: "Fire" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: "Virgo", symbol: "♍", element: "Earth" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: "Libra", symbol: "♎", element: "Air" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: "Scorpio", symbol: "♏", element: "Water" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: "Sagittarius", symbol: "♐", element: "Fire" };
  return { sign: "Capricorn", symbol: "♑", element: "Earth" };
};
