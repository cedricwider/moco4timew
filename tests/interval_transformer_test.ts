import { assertEquals } from "@std/assert";
import { IntervalTransformer } from "../src/interval_transformer.ts";
import { MocoProject } from "../src/moco/types.ts";

Deno.test(
  "IntervalTransformer - transforms timewarrior intervals to moco activities",
  () => {
    // Sample interval from intervals.json
    const interval = {
      id: 6,
      start: "20250228T063000Z",
      end: "20250228T070000Z",
      project: "sugb",
      description: "Get all tests running again!",
      tags: [],
    };

    // Relevant subset of projects.json
    const projects = JSON.parse(
      Deno.readTextFileSync("tests/fixtures/projects.json"),
    ) as MocoProject[];

    const transformer = new IntervalTransformer(projects);
    const result = transformer.toActivity(interval);

    assertEquals(result, {
      project_id: 944934716,
      task_id: 3281058, // Should match "Software Engineering" as default technical task
      date: "2025-02-28",
      seconds: 1800, // 30 minutes
      description: "Get all tests running again!",
    });
  },
);

Deno.test(
  "IntervalTransformer - matches projects with different casing and special chars",
  () => {
    const interval = {
      id: 3,
      start: "20250228T123000Z",
      end: "20250228T124500Z",
      project: "laufbahndiagnostik",
      description: "Fix .pdf canvas width issue",
      tags: ["support"],
    };

    const projects = JSON.parse(
      Deno.readTextFileSync("tests/fixtures/projects.json"),
    ) as MocoProject[];

    const transformer = new IntervalTransformer(projects);
    const result = transformer.toActivity(interval);

    assertEquals(result, {
      project_id: 944959964,
      task_id: 3492148,
      date: "2025-02-28",
      seconds: 900, // 15 minutes
      description: "Fix .pdf canvas width issue",
    });
  },
);
