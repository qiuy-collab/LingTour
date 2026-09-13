const twoDigits = (value: number) => String(value).padStart(2, "0");

export function getCalendarDateKey(year: number, zeroBasedMonth: number, day: number) {
  return `${year}-${twoDigits(zeroBasedMonth + 1)}-${twoDigits(day)}`;
}

export function getLocalDateKey(date = new Date()) {
  return getCalendarDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}
