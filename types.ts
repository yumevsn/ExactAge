
export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export interface BirthdayCountdown {
  months: number;
  days: number;
  isToday: boolean;
}

export interface ZodiacInfo {
  sign: string;
  symbol: string;
  element: string;
}
