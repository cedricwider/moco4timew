import { assertEquals } from '@std/assert';
import { TimewarriorParser } from '../../src/timewarrior/parser.ts';

Deno.test('TimewarriorParser.parse', () => {
  const input = `temp.report.start: 20240228T000000Z
temp.report.end: 20240228T235959Z
debug: 0
verbose: 1

[
  {
    "id": 1,
    "start": "20240228T080000Z",
    "end": "20240228T120000Z",
    "tags": ["SUGB: Test description", "work", "project1"]
  },
  {
    "id": 2,
    "start": "20240228T130000Z",
    "end": "20240228T170000Z",
    "tags": ["SUBRIS: Add tests to project", "work", "project2"]
  }
]`;

  const result = TimewarriorParser.parse(input);

  const config = result.config;

  // Test config parsing
  assertEquals(config.temp?.report?.start, '20240228T000000Z');
  assertEquals(config.temp?.report?.end, '20240228T235959Z');
  assertEquals(result.config.debug, false);
  assertEquals(result.config.verbose, true);

  // Test intervals parsing
  assertEquals(result.intervals.length, 2);
  const interval = result.intervals[0];
  assertEquals(interval.id, 1);
  assertEquals(interval.project, 'sugb');
  assertEquals(interval.description, 'Test description');
  assertEquals(interval.start, '20240228T080000Z');
  assertEquals(interval.tags, ['work', 'project1']);
});
