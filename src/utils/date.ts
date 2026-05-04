const weekdayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getDateKey(date: Date): string {
  return getTodayDateKey(date);
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function formatChineseDate(date = new Date()): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdayNames[date.getDay()]}`;
}

export function formatChineseDateFromKey(dateKey: string): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return "今天";
  }

  const date = new Date(parsed.year, parsed.month - 1, parsed.day);
  return formatChineseDate(date);
}

export function formatFullChineseDate(dateKey: string): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return dateKey;
  }

  const weekday = new Date(parsed.year, parsed.month - 1, parsed.day).getDay();
  return `${parsed.year}年${parsed.month}月${parsed.day}日 ${weekdayNames[weekday]}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

export function formatDateWithWeekday(dateKey: string): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return dateKey;
  }

  const weekday = new Date(parsed.year, parsed.month - 1, parsed.day).getDay();
  return `${parsed.month}月${parsed.day}日 ${weekdayNames[weekday]}`;
}

export function formatShortMonthDay(dateKey: string): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return dateKey;
  }
  return `${parsed.month}/${parsed.day}`;
}

export function isDateInMonth(dateKey: string, year: number, month: number): boolean {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return false;
  }

  return parsed.year === year && parsed.month === month;
}

export type MonthGridCell = {
  dateKey: string | null;
  day: number | null;
  isCurrentMonth: boolean;
};

export function getMonthGridCells(year: number, month: number): MonthGridCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();
  const totalCells = Math.ceil((leadingEmptyDays + totalDays) / 7) * 7;
  const cells: MonthGridCell[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - leadingEmptyDays + 1;
    if (dayNumber < 1 || dayNumber > totalDays) {
      cells.push({ dateKey: null, day: null, isCurrentMonth: false });
      continue;
    }

    const monthText = String(month).padStart(2, "0");
    const dayText = String(dayNumber).padStart(2, "0");
    cells.push({
      dateKey: `${year}-${monthText}-${dayText}`,
      day: dayNumber,
      isCurrentMonth: true,
    });
  }

  return cells;
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
