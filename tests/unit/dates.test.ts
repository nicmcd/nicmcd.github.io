import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatMonthYear,
  formatPublicationDate,
  formatDateRange,
  formatIsoDate,
} from "../../src/utils/dates.ts";

describe("date formatting", () => {
  it("formats site dates as 'Jan 2, 2006'", () => {
    expect(formatDate(new Date("2012-08-22T00:00:00Z"))).toBe("Aug 22, 2012");
  });

  it("formats experience months as 'Jan 2006'", () => {
    expect(formatMonthYear(new Date("2021-02-01T00:00:00Z"))).toBe("Feb 2021");
  });

  it("formats publication dates as 'January 2006'", () => {
    expect(formatPublicationDate(new Date("2019-11-17T00:00:00Z"))).toBe(
      "November 2019",
    );
    expect(formatPublicationDate(new Date("2018-04-02T00:00:00Z"))).toBe("April 2018");
    expect(formatPublicationDate(new Date("2016-06-01T00:00:00Z"))).toBe("June 2016");
  });

  it("formats open-ended ranges with Present", () => {
    expect(formatDateRange(new Date("2021-02-01T00:00:00Z"))).toBe(
      "Feb 2021 –\nPresent",
    );
  });

  it("formats closed ranges", () => {
    expect(
      formatDateRange(
        new Date("2019-01-01T00:00:00Z"),
        new Date("2021-01-29T00:00:00Z"),
      ),
    ).toBe("Jan 2019 –\nJan 2021");
  });

  it("formats ISO dates", () => {
    expect(formatIsoDate(new Date("2019-11-17T00:00:00Z"))).toBe("2019-11-17");
  });
});
