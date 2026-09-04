import { describe, expect, it } from "vitest";
import { parseLeadSearchParams } from "./search-params";

describe("parseLeadSearchParams", () => {
  it("uses safe defaults", () => {
    expect(parseLeadSearchParams({})).toEqual({
      sort: "score_desc",
      page: 1,
      pageSize: 25,
    });
  });

  it("parses supported filters and normalizes location", () => {
    expect(
      parseLeadSearchParams({
        q: " clínica ",
        stage: "PRIORITY",
        owner: "4a90b17c-76de-4854-93e7-e172a5952b91",
        state: "sp",
        city: " Mogi das Cruzes ",
        segment: "Odontologia",
        sort: "recent_desc",
        page: "3",
        pageSize: "50",
      }),
    ).toEqual({
      query: "clínica",
      stage: "PRIORITY",
      ownerId: "4a90b17c-76de-4854-93e7-e172a5952b91",
      stateCode: "SP",
      city: "Mogi das Cruzes",
      segment: "Odontologia",
      sort: "recent_desc",
      page: 3,
      pageSize: 50,
    });
  });

  it.each(["25", "50", "100"])("accepts supported page size %s", (pageSize) => {
    expect(parseLeadSearchParams({ pageSize }).pageSize).toBe(Number(pageSize));
  });

  it("falls back for invalid sorting and pagination values", () => {
    expect(parseLeadSearchParams({ sort: "unknown", page: "-2", pageSize: "999" })).toMatchObject({
      sort: "score_desc",
      page: 1,
      pageSize: 25,
    });
  });

  it("ignores invalid stage, owner and state instead of querying them", () => {
    expect(
      parseLeadSearchParams({ stage: "INVALID", owner: "not-uuid", state: "São Paulo" }),
    ).toEqual({ sort: "score_desc", page: 1, pageSize: 25 });
  });
});
