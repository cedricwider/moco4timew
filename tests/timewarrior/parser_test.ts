import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TimewarriorParser } from "../../src/timewarrior/parser.ts";

Deno.test("TimewarriorParser.parse", () => {
  const input = `temp.report.start: 20240228T000000Z
temp.report.end: 20240228T235959Z
debug: 0
verbose: 1

[
  {
    "id": 1,
    "start": "20240228T080000Z",
    "end": "20240228T120000Z",
    "tags": ["work", "project1"]
  },
  {
    "id": 2,
    "start": "20240228T130000Z",
    "end": "20240228T170000Z",
    "tags": ["work", "project2"]
  }
]`;

  const result = TimewarriorParser.parse(input);

  // Test config parsing
  assertEquals(result.config["temp.report.start"], "20240228T000000Z");
  assertEquals(result.config["temp.report.end"], "20240228T235959Z");
  assertEquals(result.config["debug"], "0");
  assertEquals(result.config["verbose"], "1");

  // Test intervals parsing
  assertEquals(result.intervals.length, 2);
  assertEquals(result.intervals[0].id, 1);
  assertEquals(result.intervals[0].start, "20240228T080000Z");
  assertEquals(result.intervals[0].tags, ["work", "project1"]);
});
