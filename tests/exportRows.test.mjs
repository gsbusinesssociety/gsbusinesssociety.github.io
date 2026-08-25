/**
 * Unit tests for spreadsheet export. Applications contain free-text essays, so
 * quotes, commas, newlines and leading operators all reach this code for real.
 *
 *   npm run test:unit
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../app/lib/exportRows.ts";

describe("toCsv", () => {
  it("escapes embedded quotes by doubling them", () => {
    const csv = toCsv([{ Name: 'Sam "Sammy" O\'Brien' }]);
    assert.equal(csv, '"Name"\r\n"Sam ""Sammy"" O\'Brien"');
  });

  it("keeps commas and newlines inside a single quoted field", () => {
    const csv = toCsv([{ Answer: "One, two\nthree" }]);
    assert.equal(csv, '"Answer"\r\n"One, two\nthree"');
    // One header row plus one record, despite the newline in the value.
    assert.equal(csv.split("\r\n").length, 2);
  });

  it("defuses values a spreadsheet would execute as a formula", () => {
    for (const dangerous of ['=cmd|"/c calc"!A1', "+1+1", "-2+3", "@SUM(A1)"]) {
      const csv = toCsv([{ Field: dangerous }]);
      assert.ok(
        csv.includes(`"'${dangerous.replace(/"/g, '""')}"`),
        `expected ${dangerous} to be prefixed with an apostrophe`
      );
    }
  });

  it("leaves ordinary text alone", () => {
    assert.equal(toCsv([{ Major: "Economics" }]), '"Major"\r\n"Economics"');
  });

  it("returns an empty string rather than a stray header for no rows", () => {
    assert.equal(toCsv([]), "");
  });

  it("keeps columns aligned when later rows omit a key", () => {
    const csv = toCsv([
      { A: "1", B: "2" },
      { A: "3" },
    ]);
    assert.equal(csv, '"A","B"\r\n"1","2"\r\n"3",""');
  });
});
