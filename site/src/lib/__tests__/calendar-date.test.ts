import { describe, expect, it } from "vitest";

import { getCalendarDateKey, getLocalDateKey } from "@/lib/calendar-date";

describe("calendar date keys", () => {
  it("keeps the calendar day selected in the user's local timezone", () => {
    expect(getLocalDateKey(new Date(2026, 7, 12))).toBe("2026-08-12");
  });

  it("pads single-digit months and days", () => {
    expect(getCalendarDateKey(2027, 0, 4)).toBe("2027-01-04");
  });
});
